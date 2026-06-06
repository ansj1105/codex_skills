---
name: fox-coin-ssh-deploy-runbook
description: Use when working on Fox Coin servers over SSH, especially for repo sync, docker-compose redeploys, hot-wallet env verification, or when remote git pull and docker permissions behave differently from local assumptions.
---

# Fox Coin SSH Deploy Runbook

Use this skill when the user asks to deploy, inspect logs, sync a repo, or check server state on the known Fox Coin SSH hosts.

## SSH map

- `fox_coin deploy server` -> `ssh -i /home/ubuntu/.ssh/korion.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin`
- `coin_front deploy server` -> `ssh -i /home/ubuntu/.ssh/korion.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin_frontend`
- `foxya cluster db server` -> `ssh -i /home/ubuntu/.ssh/korion.pem ubuntu@52.204.57.80`
  Role: cluster DB host
- `coin_manage server` -> `ssh -i /home/ubuntu/.ssh/korion.pem ubuntu@54.83.183.123`
  Repo: `/var/www/korion`

The PEM path for this Codex workspace is `/home/ubuntu/.ssh/korion.pem`. Do not copy the key into `/home/ubuntu/work` or commit it to any repo.

## Current topology

- `52.200.97.155` is the Foxya app host and current primary app/DB node.
- The Foxya app stack runs `nginx -> app + app2`, plus `tron-service`, `tron-service-2`, `tron-worker`, `redis`, `postgres`, and `db-proxy`.
- `https://api.korion.io.kr` currently terminates on `52.200.97.155`; `curl http://127.0.0.1:8080/health` returns an auth-protected app response, so this host is the right place to validate internal deposit APIs.
- Foxya app containers must talk to PostgreSQL through `db-proxy`, not directly.
- `foxya-db-proxy` currently publishes `0.0.0.0:15432 -> 5432`, while `foxya-postgres` stays on `127.0.0.1:5432`.
- The documented standby DB target is `172.31.31.109:15432`, but during the March 17, 2026 incident check both `52.200.97.155` and `54.83.183.123` timed out to that host.
- `52.204.57.80` (`172.31.31.109`) exposed `15432` but PostgreSQL was still in `startup recovering`, so treat it as a failover candidate or recovery target, not an assumed live dependency.
- `54.83.183.123` currently serves the KORION stack from `/var/www/korion`, not `/var/www/coin_manage`.
- KORION currently reaches foxya through `https://api.korion.io.kr/api/v1/internal/deposits` and foxya DB through `172.31.36.110:15432`.

## First checks

Run these before changing anything on the remote host:

1. `cd` into the target repo and check `git status --short`.
2. Check the current commit with `git rev-parse --short HEAD`.
3. Check running containers with `sudo docker ps`.
4. If the task is config-related, inspect the effective container env with `sudo docker inspect <container>`.
5. If the target is `coin_front`, compare `git rev-parse HEAD` with `git rev-parse origin/develop` after fetch or pull so you know whether the server is already on the intended frontend commit.

## Docker permission rule

- On the Fox Coin deploy hosts, plain `docker` may fail with a socket permission error.
- Prefer `sudo docker ...` and `sudo docker-compose ...` for remote container work unless the host clearly grants docker-group access.

## Production disk cleanup rule

- Before and after repeated builds or deploys, inspect capacity with:
  - `df -hT / /var/lib/docker /var/www`
  - `sudo docker system df -v`
  - targeted `sudo du -sh /var/lib/docker /var/www/<repo>`
- Use these thresholds:
  - 70% root usage: warning, plan cleanup.
  - 80% root usage: cleanup required before more build churn.
  - 85% root usage: urgent cleanup.
  - 90%+ root usage: block deploy until space is recovered.
- On small 48G hosts such as `korion_offline`, treat 70% as the cleanup planning threshold even if containers are healthy.
- Safe first-pass cleanup:
  - `sudo docker image prune -f`
  - `sudo docker builder prune -f --filter until=168h`
- Do not prune Docker volumes and do not run `docker system prune --volumes` unless the user explicitly approves DB/volume impact.
- On `/var/www/fox_coin_frontend`, keep only the latest 3 `dist.__backup__*` directories after deploy churn, and remove older backups only after confirming current `dist` exists.
- Cleanup triggers: Docker build cache >= 5G, `/var/lib/docker` >= 15G on 48G hosts, frontend backup dirs > 1G, or root filesystem >= 70%.
- After cleanup, verify `sudo docker ps` and `sudo docker system df`; normal cache/image cleanup should not restart app containers.

## Remote git rule

- Do not assume `git pull` works on the server.
- Check the remote URL first if pull fails. A server clone that uses HTTPS may not have interactive GitHub credentials configured.
- On `52.200.97.155`, `/var/www/fox_coin_frontend` uses an SSH remote and the GitHub deploy key is configured for the root account.
- Non-sudo `git pull` as `ubuntu` can fail with `Permission denied (publickey)` even when `sudo git pull origin develop` works. Do not try non-sudo pull/deploy first for this private/root-owned frontend repo.
- `sudo git pull` uses the root account context. Root also needs GitHub `known_hosts` and a usable deploy key when the remote is SSH.
- On this host, prefer a `sudo git pull` against the server worktree's configured upstream before falling back to rsync when the user asks for a normal deploy/update flow. Check `git branch --show-current`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`, and `git remote -v`; do not assume every deploy repo tracks `develop`.
- For `coin_csms` on `52.200.97.155:/var/www/coin_csms`, production git/build/docker state is root-owned. Do not try a non-sudo pull/build first. Verify the server branch/upstream, run the upstream-based `sudo git pull`, then `sudo ./gradlew shadowJar --no-daemon -x test`, and `sudo docker compose -f docker-compose.yml up -d --build`.
- For `kori_hompage` / `korion.network` on `100.50.107.232:/var/www/korion`, Docker access requires sudo. Do not try a non-sudo deploy script first. Verify the server branch/upstream, run the upstream-based `sudo git pull`, then `sudo ./scripts/deploy-compose.sh`.
- `sudo git pull` is only a valid path when both conditions hold:
  - the worktree is clean
  - the remote host can authenticate to GitHub
- If the user specifically says `sudo git pull`, try it once. If the worktree is dirty or auth still fails, do not keep retrying blindly.
- If the worktree is dirty and the server-side edits are not meant to be preserved as the new source of truth, stash them before pull instead of forcing checkout:
  - `sudo git stash push -u -m "codex-pre-deploy-YYYYMMDD-context"`
  - upstream-based `sudo git pull`
- After deploy, if the goal is a clean server state, explicitly verify:
  - `git status --short` is empty
  - `git rev-parse HEAD` equals the intended remote branch tip
- If you create temporary stashes only to unblock deploy, clean them up after the server is confirmed healthy and the user wants the remote repo fully tidy.

## Rsync fallback

When remote git pull cannot be used but the local workspace is already at the desired state:

1. Sync the local repo to the remote repo with `rsync -a`.
2. Exclude `.git`, `.env`, `.gradle`, `build`, `logs`, `storage`, `bin`, and editor cruft.
3. Call out that this updates the working tree contents without moving remote `HEAD`.
4. Deploy from the synced tree with `sudo docker-compose`.
5. Explicitly state that the remote `.git` metadata and `HEAD` did not move.

Recommended pattern:

```bash
rsync -a \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.gradle' \
  --exclude='build' \
  --exclude='logs' \
  --exclude='storage' \
  --exclude='bin' \
  -e 'ssh -i /home/ubuntu/.ssh/korion.pem' \
  /local/repo/ ubuntu@host:/var/www/repo/
```

Keep the PEM under `/home/ubuntu/.ssh`; do not place it in repo or worktree directories.

## Fox Coin app redeploy

For `/var/www/fox_coin`:

1. `sudo docker-compose -f docker-compose.prod.yml build app`
2. Do not build `app app2` together. Both services share `foxya-api:${APP_VERSION:-latest}`, and parallel export to the same image tag can fail.
3. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app`
4. Wait and health-check `http://localhost:8080/health`
5. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app2`
6. Re-check health on `http://localhost:8080/health` or `http://localhost/health`

## coin_front deploy rule

For `/var/www/fox_coin_frontend`:

1. `cd /var/www/fox_coin_frontend`
2. Check the current server branch/upstream with `git branch --show-current` and `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
3. Always run the upstream-based `sudo git pull` first, preferably `sudo git pull --ff-only` when upstream is configured
4. Only after the sudo pull succeeds, run `sudo ./deploy-docker.sh --auto`
5. Verify the served `index.html` points at the newly built hashed asset.

When the host nginx serves `/var/www/fox_coin_frontend/dist` directly, treat `sudo ./deploy-docker.sh --auto` as the canonical frontend deploy path. Do not replace it with ad-hoc manual build/copy steps unless the script is unavailable. Running it without sudo can fail during `dist` ownership cleanup.

If SSH agent forwarding is empty and the host requires a local PEM, prefer explicit key usage:

```bash
ssh -i /home/ubuntu/.ssh/korion.pem -o StrictHostKeyChecking=no ubuntu@52.200.97.155
```

On this host, repeated frontend incidents showed that local operator machines may have an empty SSH agent even while the PEM file exists. In that situation, do not assume plain `ssh ubuntu@52.200.97.155` will work.

## DB routing rules

- App runtime DB access should stay on `DB_HOST=db-proxy`.
- `DB_PROXY_STANDBY_FALLBACK_ENABLED=false` is the default write-path safety setting.
- Keep `DB_PRIMARY_HOST`, `DB_STANDBY_HOST`, and `DB_ADMIN_HOST` aligned with the documented active-standby topology before a DB failover deploy.
- Verify actual reachability before changing KORION or app envs to point at the cluster DB host directly; the documented standby can exist while being unreachable from app hosts.
- When the DB is accidentally in read-only mode, signup and other inserts can fail repeatedly. Treat that as infra state first, not as an app bug.

## KORION deposit monitor rule

- When KORION deposit monitor errors with `fetch failed`, check `FOXYA_INTERNAL_API_URL` on `54.83.183.123` first.
- Prefer `https://api.korion.io.kr/api/v1/internal/deposits` over legacy direct IP targets such as `http://54.210.92.221:8080/...`.
- Validate from the KORION host with:
  - `curl -s http://127.0.0.1:3000/api/system/deposit-monitor`
  - `curl -s -X POST http://127.0.0.1:3000/api/system/deposit-monitor/run`

## TRON hot-wallet verification

If TRON seed login, wallet binding, or legacy recovery is involved:

1. Check whether `/var/www/fox_coin/.env` contains `TRON_HOT_WALLET_ADDRESS`.
2. Check whether `docker-compose.prod.yml` passes `TRON_HOT_WALLET_ADDRESS` into both `app` and `app2`.
3. After redeploy, verify it reached the containers:
   - `sudo docker inspect foxya-api --format '{{range .Config.Env}}{{println .}}{{end}}'`
   - `sudo docker inspect foxya-api-2 --format '{{range .Config.Env}}{{println .}}{{end}}'`
4. Search recent logs for:
   - `TRON 핫월렛 설정이 없습니다`
   - `Failed to bind TRON virtual wallet mapping`
5. If the value exists in `.env` but not in the container env, inspect `docker-compose.prod.yml` before debugging application logic.

## Output expectations

When using this skill, summarize:

- Which SSH host and repo path were used
- Whether remote git pull worked or rsync fallback was used
- Which containers were rebuilt or restarted
- Whether health checks passed
- Whether critical env values were confirmed inside the running containers

---
name: fox-coin-ssh-deploy-runbook
description: Use when working on Fox Coin servers over SSH, especially for repo sync, docker-compose redeploys, hot-wallet env verification, or when remote git pull and docker permissions behave differently from local assumptions.
---

# Fox Coin SSH Deploy Runbook

Use this skill when the user asks to deploy, inspect logs, sync a repo, or check server state on the known Fox Coin SSH hosts.

## SSH map

- `fox_coin deploy server` -> `ssh -i /path/to/your/operator-key.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin`
- `coin_front deploy server` -> `ssh -i /path/to/your/operator-key.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin_frontend`
- `foxya cluster db server` -> `ssh -i /path/to/your/operator-key.pem ubuntu@52.204.57.80`
  Role: cluster DB host
- `coin_manage server` -> `ssh -i /path/to/your/operator-key.pem ubuntu@54.83.183.123`
  Repo: `/var/www/korion`

The PEM path above is an example only. Operators may keep PEM files in different local paths, so always replace it with the actual path for the current user environment.

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

## Remote git rule

- Do not assume `git pull` works on the server.
- Check the remote URL first if pull fails. A server clone that uses HTTPS may not have interactive GitHub credentials configured.
- On `52.200.97.155`, the repo currently uses an HTTPS remote and `~/.ssh` does not have a GitHub deploy key configured.
- `sudo git pull` uses the root account context. Root also needs GitHub `known_hosts` and a usable deploy key if the remote is switched to SSH.
- On this host, prefer `sudo git pull --rebase origin <branch>` before falling back to rsync when the user asks for a normal deploy/update flow.
- `sudo git pull` is only a valid path when both conditions hold:
  - the worktree is clean
  - the remote host can authenticate to GitHub
- If the user specifically says `sudo git pull`, try it once. If the worktree is dirty or auth still fails, do not keep retrying blindly.
- If the worktree is dirty and the server-side edits are not meant to be preserved as the new source of truth, stash them before pull instead of forcing checkout:
  - `sudo git stash push -u -m "codex-pre-deploy-YYYYMMDD-context"`
  - `sudo git pull origin <branch>`
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
  -e 'ssh -i /path/to/your/operator-key.pem' \
  /local/repo/ ubuntu@host:/var/www/repo/
```

Again, the PEM path in the example is user-specific and must be replaced per operator machine.

## Fox Coin app redeploy

For `/var/www/fox_coin`:

1. `sudo docker-compose -f docker-compose.prod.yml build app`
2. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app`
3. Wait and health-check `http://localhost:8080/health`
4. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app2`
5. Re-check health on `http://localhost:8080/health` or `http://localhost/health`

## coin_front deploy rule

For `/var/www/fox_coin_frontend`:

1. `cd /var/www/fox_coin_frontend`
2. Prefer `sudo git pull origin develop`
3. `sudo ./deploy-docker.sh --auto`
4. Verify the served `index.html` points at the newly built hashed asset.

When the host nginx serves `/var/www/fox_coin_frontend/dist` directly, treat `./deploy-docker.sh --auto` as the canonical frontend deploy path. Do not replace it with ad-hoc manual build/copy steps unless the script is unavailable.

If SSH agent forwarding is empty and the host requires a local PEM, prefer explicit key usage:

```bash
ssh -i /path/to/your/operator-key.pem -o StrictHostKeyChecking=no ubuntu@52.200.97.155
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

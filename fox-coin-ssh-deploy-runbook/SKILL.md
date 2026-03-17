---
name: fox-coin-ssh-deploy-runbook
description: Use when working on Fox Coin servers over SSH, especially for repo sync, docker-compose redeploys, hot-wallet env verification, or when remote git pull and docker permissions behave differently from local assumptions.
---

# Fox Coin SSH Deploy Runbook

Use this skill when the user asks to deploy, inspect logs, sync a repo, or check server state on the known Fox Coin SSH hosts.

## SSH map

- `fox_coin deploy server` -> `ssh -i /Users/an/Downloads/korion.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin`
- `coin_manage server` -> `ssh -i /Users/an/Downloads/korion.pem ubuntu@54.83.183.123`
  Repo: `/var/www/coin_manage`

## First checks

Run these before changing anything on the remote host:

1. `cd` into the target repo and check `git status --short`.
2. Check the current commit with `git rev-parse --short HEAD`.
3. Check running containers with `sudo docker ps`.
4. If the task is config-related, inspect the effective container env with `sudo docker inspect <container>`.

## Docker permission rule

- On the Fox Coin deploy hosts, plain `docker` may fail with a socket permission error.
- Prefer `sudo docker ...` and `sudo docker-compose ...` for remote container work unless the host clearly grants docker-group access.

## Remote git rule

- Do not assume `git pull` works on the server.
- Check the remote URL first if pull fails. A server clone that uses HTTPS may not have interactive GitHub credentials configured.
- If the user specifically says `sudo git pull`, try it once. If the worktree is dirty or auth still fails, do not keep retrying blindly.

## Rsync fallback

When remote git pull cannot be used but the local workspace is already at the desired state:

1. Sync the local repo to the remote repo with `rsync -a`.
2. Exclude `.git`, `.env`, `.gradle`, `build`, `logs`, `storage`, `bin`, and editor cruft.
3. Call out that this updates the working tree contents without moving remote `HEAD`.
4. Deploy from the synced tree with `sudo docker-compose`.

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
  -e 'ssh -i /Users/an/Downloads/korion.pem' \
  /local/repo/ ubuntu@host:/var/www/repo/
```

## Fox Coin app redeploy

For `/var/www/fox_coin`:

1. `sudo docker-compose -f docker-compose.prod.yml build app`
2. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app`
3. Wait and health-check `http://localhost:8080/health`
4. `sudo docker-compose -f docker-compose.prod.yml up -d --no-deps app2`
5. Re-check health on `http://localhost:8080/health` or `http://localhost/health`

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

## Output expectations

When using this skill, summarize:

- Which SSH host and repo path were used
- Whether remote git pull worked or rsync fallback was used
- Which containers were rebuilt or restarted
- Whether health checks passed
- Whether critical env values were confirmed inside the running containers

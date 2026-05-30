# SSH And Deploy

This file captures the operator's recurring SSH and deployment workflow. Hostnames and repo roots are reusable. PEM paths are examples and must be adjusted per machine.

## Production hosts

- Foxya backend host
  - Host: `52.200.97.155`
  - Repo root: `/var/www/fox_coin`
  - Current frontend dist path: `/var/www/fox_coin_frontend/dist`

- `offline_pay` host
  - Host: `98.91.96.182`
  - Repo root: `/var/www/korion_offline`

- `coin_manage` host
  - Host: `54.83.183.123`
  - Repo root: `/var/www/korion`

- `coin_csms` admin API host
  - Host: `52.200.97.155`
  - Repo root: `/var/www/coin_csms`
  - Container: `csms-api`
  - Use sudo for pull, Gradle build, and Docker Compose deploy.

- `kori_hompage` / `korion.network` host
  - Host: `100.50.107.232`
  - Repo root: `/var/www/korion`
  - Containers: `korion-web`, `korion-partner-api`
  - Use sudo for pull and `./scripts/deploy-compose.sh`.

## Key usage pattern

- Do not assume the same PEM file exists on every workstation.
- Use explicit `ssh -i /path/to/key.pem ...` when plain SSH fails.
- Current-user examples discovered on one workstation:
  - Foxya/frontend host example: `bmbit.pem`
  - `offline_pay` host example: `korion.pem`
- These filenames are operator-local examples, not global rules.

## Deploy sequence

### Frontend (`coin_front`)

1. Verify locally with `npm run build`.
2. Commit and push `develop`.
3. SSH to `52.200.97.155` and `cd /var/www/fox_coin_frontend`.
4. Run `sudo git pull origin develop`.
5. Run `sudo ./deploy-docker.sh --auto`.
6. Verify:
   - file timestamp on `dist/index.html`
   - `curl -I http://localhost`

The frontend server's GitHub deploy key is configured for the root account. Non-sudo `git pull` as `ubuntu` can fail with `Permission denied (publickey)`. Use `sudo` for both the pull and deploy script because the deploy script also performs `dist` ownership cleanup.

### `coin_csms`

1. Verify locally with `./gradlew compileJava` or the relevant targeted test.
2. Commit and push `main`.
3. SSH to `52.200.97.155` and `cd /var/www/coin_csms`.
4. Run `sudo git pull --rebase origin main`.
5. Run `sudo ./gradlew shadowJar --no-daemon -x test`.
6. Run `sudo docker compose -f docker-compose.yml up -d --build`.
7. Verify `sudo docker ps --filter name=csms-api` and the touched API endpoint.

Do not first try non-sudo git/build/docker commands for this repo; the production worktree/build outputs/Docker socket are root-owned.

### `kori_hompage` / `korion.network`

1. Verify locally with `npm run build`.
2. Commit and push `main`.
3. SSH to `100.50.107.232` and `cd /var/www/korion`.
4. Run `sudo git pull --rebase origin main`.
5. Run `sudo ./scripts/deploy-compose.sh`.
6. Verify `korion-web` and `korion-partner-api` are healthy and that the served `index.html` references the new hashed asset.

Do not first try a non-sudo deploy script for this host; Docker socket access requires sudo.

### `offline_pay`

1. Verify locally with targeted Gradle tests.
2. Commit and push `main`.
3. SSH to `98.91.96.182`.
4. `cd /var/www/korion_offline`
5. `git pull origin main`
6. `sudo docker compose up -d --build app-api app-worker`
7. Verify:
   - `docker ps`
   - app health inside container if needed
   - nginx health path such as `http://localhost/health`

### Foxya backend

1. Verify locally with the repo's Gradle or test target.
2. Commit and push the intended branch, usually `develop` if that repo uses it.
3. SSH to `52.200.97.155`.
4. Pull in `/var/www/fox_coin` if Git auth works.
5. If needed, follow the known compose-based restart flow for app/app2.
6. Check health and container status.

## Remote check list

- `git status --short`
- `git rev-parse --short HEAD`
- `docker ps`
- exact health path used by that service

## Operational habits

- If the first post-deploy check returns `502`, wait for the app container to finish booting before assuming deploy failure.
- If the app listens on a non-default internal port, verify the container's direct health path before blaming nginx.
- When a remote repo has dirty changes you did not create, do not reset it blindly.

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
3. Try remote update if the server repo can authenticate to GitHub.
4. If server-side Git auth is broken, upload local `dist/` to `/var/www/fox_coin_frontend/dist/`.
5. Verify:
   - file timestamp on `dist/index.html`
   - `curl -I http://localhost`

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


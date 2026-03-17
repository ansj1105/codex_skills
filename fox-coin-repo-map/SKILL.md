---
name: fox-coin-repo-map
description: Map the local Fox Coin repositories, their roles, and the known SSH targets. Use when a user refers to the coin server, coin app backend, admin backend, coin app frontend, admin frontend, coin issuing and transfer legacy repo, Flyway DB repo, or the named Fox Coin SSH hosts and you need the correct local path or server access target before reading, editing, building, reviewing, deploying, or checking logs.
---

# Fox Coin Repo Map

Use this skill whenever the user refers to one of the Fox Coin or KORION codebases by product name instead of filesystem path.

## Repository map

- `coin server` / `코인서버`: `/Users/anseojeong/work/coin_manage`
- `coin app backend` / `코인어플 백엔드`: `/Users/anseojeong/IdeaProjects/fox_coin`
- `admin backend` / `관리자백엔드`: `/Users/anseojeong/IdeaProjects/coin_csms`
- `coin app frontend` / `코인어플 프론트`: `/Users/anseojeong/work/fox_coin_frontend`
- `admin frontend` / `어드민프론드`: `/Users/anseojeong/work/fox_coin_frontend`
- `coin issuing and transfer legacy` / `코인 발행및 전송 레거시`: `/Users/anseojeong/work/coin_publish`
- `db flyway` / `DB플라이웨이`: `/Users/anseojeong/IdeaProjects/coin_system_flyway`
- `korion website` / `코리온 웹사이트` / `korion frontend`: `/Users/an/Downloads/korion 2`

## SSH map

- `coin service ssh` / `코인서비스 SSH`: `ssh -i /Users/anseojeong/Downloads/bmbit.pem ubuntu@54.210.92.221`
- `admin csms frontend ssh` / `관리자 CSMS 프론트 SSH`: `ssh -i /Users/anseojeong/Downloads/bmbit.pem ubuntu@54.210.92.221`
- `flyway ssh` / `플라이웨이 SSH`: `ssh -i /Users/anseojeong/Downloads/bmbit.pem ubuntu@54.210.92.221`
- `coin legacy ssh` / `코인레거시 SSH`: `ssh -i /Users/anseojeong/Downloads/bmbit.pem ubuntu@54.210.92.221`
- `coin service new ssh` / `코인 서비스 뉴 SSH`: `ssh -i /Users/anseojeong/Downloads/korion.pem ubuntu@54.83.183.123`
- `korion frontend ssh` / `코리온 프론트 SSH`: `ssh -i /Users/an/Downloads/korion.pem ubuntu@100.50.107.232`

## Server notes

- The `bmbit.pem` host is the SSH target the user uses for coin service, admin CSMS frontend, Flyway, and coin legacy work.
- `54.83.183.123` with `korion.pem` is a backend/sandbox host that redirects root traffic to `/sandbox/`.
- `100.50.107.232` with `korion.pem` is the KORION frontend host. The site repo lives at `/var/www/korion`, and the running container is `korion-web` on `127.0.0.1:8080`.
- On the frontend host, `docker compose` and `docker-compose` may both be unavailable. If so, redeploy by rebuilding `korion-web:latest` with `docker build` and replacing the `korion-web` container manually with the same `127.0.0.1:8080` port binding and `unless-stopped` restart policy.
- On `54.210.92.221`, PostgreSQL is bound on `127.0.0.1:5432` and the DB proxy is exposed on `0.0.0.0:15432 -> 5432`.
- Treat these SSH commands as local-only operator knowledge. Do not sync them to a shared public document outside this skills repo unless the user explicitly asks again.

## Working rules

- Resolve user shorthand to these exact paths before opening files or running commands.
- Treat `coin app frontend` and `admin frontend` as the same repository unless the user later says they were split.
- Resolve server shorthand to these exact SSH commands before remote inspection work.
- If the user mentions only a product area, restate the resolved repository path in your working notes before editing.
- If the user asks for remote logs or server checks, restate the resolved SSH target in your working notes before connecting.
- If a task spans multiple Fox Coin repositories, list the affected repositories explicitly before making changes.

## Expected behavior

- Prefer these paths over guessing from the current working directory.
- Prefer these SSH targets over reconstructing server access from memory.
- When summarizing work, mention both the product label and the repository path if there is any ambiguity.

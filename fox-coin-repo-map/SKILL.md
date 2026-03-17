---
name: fox-coin-repo-map
description: Map the current local Fox Coin and KORION repositories, their roles, and the known SSH targets. Use when a user refers to foxya backend, KORION coin-service, admin API, frontend, legacy coin repo, Flyway repo, or the named SSH hosts and you need the correct local path or server access target before reading, editing, building, deploying, or checking logs.
---

# Fox Coin Repo Map

Use this skill whenever the user refers to one of the Fox Coin or KORION codebases by product name instead of filesystem path.

## Repository map

- `foxya backend` / `fox_coin backend` / `관리자 백엔드` / `관리자 api`: `/Users/an/work/foxya_coin_service`
- `korion coin-service` / `coin_manage` / `코인서비스`: `/Users/an/work/coin_manage`
- `coin legacy` / `coin_publish` / `코인 레거시`: `/Users/an/work/coin_publish`
- `db flyway` / `coin_system_flyway` / `플라이웨이` / `스케줄러`: `/Users/an/work/coin_system_flyway`
- `frontend` / `앱프론트`: `/Users/an/work/coin_front`
- `admin api` / `coin_csms`: `/Users/an/IdeaProjects/coin_csms`

## SSH map

- `foxya deploy ssh` / `fox_coin ssh`: `ssh -i /Users/an/Downloads/korion.pem ubuntu@52.200.97.155`
  Repo: `/var/www/fox_coin`
- `korion service ssh` / `coin_manage ssh`: `ssh -i /Users/an/Downloads/korion.pem ubuntu@54.83.183.123`
  Repo: `/var/www/korion`

## Server notes

- `52.200.97.155` currently runs `foxya-nginx`, `foxya-api`, `foxya-api-2`, `foxya-tron-service`, `foxya-tron-service-2`, `foxya-tron-worker`, `foxya-db-proxy`, `foxya-postgres`, `foxya-redis`, and monitoring containers.
- `54.83.183.123` currently runs the KORION stack from `/var/www/korion` on branch `main` with `korion-app-api`, `korion-app-withdraw-worker`, `korion-app-ops`, `korion-postgres`, and `korion-redis`.
- On `52.200.97.155`, the repo remote is still `https://github.com/ansj1105/fox_coin.git`, so remote `git pull` can fail without GitHub credentials.
- On `54.83.183.123`, the repo remote is `https://github.com/ansj1105/coin_manage.git`.
- Treat these SSH commands and paths as operator knowledge. Do not paste private key contents or secrets into docs.

## Working rules

- Resolve user shorthand to these exact paths before opening files or running commands.
- Resolve server shorthand to these exact SSH commands before remote inspection work.
- If the user mentions only a product area, restate the resolved repository path in your working notes before editing.
- If the user asks for remote logs or server checks, restate the resolved SSH target in your working notes before connecting.
- If a task spans multiple Fox Coin repositories, list the affected repositories explicitly before making changes.

## Expected behavior

- Prefer these paths over guessing from the current working directory.
- Prefer these SSH targets over reconstructing server access from memory.
- When summarizing work, mention both the product label and the repository path if there is any ambiguity.

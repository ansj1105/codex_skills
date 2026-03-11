---
name: fox-coin-repo-map
description: Map the local Fox Coin repositories and their roles. Use when a user refers to the coin server, coin app backend, admin backend, coin app frontend, admin frontend, coin issuing and transfer legacy repo, or Flyway DB repo and you need the correct local path before reading, editing, building, reviewing, or deploying code.
---

# Fox Coin Repo Map

Use this skill whenever the user refers to one of the Fox Coin codebases by product name instead of filesystem path.

## Repository map

- `coin server` / `코인서버`: `/Users/anseojeong/work/coin_manage`
- `coin app backend` / `코인어플 백엔드`: `/Users/anseojeong/IdeaProjects/fox_coin`
- `admin backend` / `관리자백엔드`: `/Users/anseojeong/IdeaProjects/coin_csms`
- `coin app frontend` / `코인어플 프론트`: `/Users/anseojeong/work/fox_coin_frontend`
- `admin frontend` / `어드민프론드`: `/Users/anseojeong/work/fox_coin_frontend`
- `coin issuing and transfer legacy` / `코인 발행및 전송 레거시`: `/Users/anseojeong/work/coin_publish`
- `db flyway` / `DB플라이웨이`: `/Users/anseojeong/IdeaProjects/coin_system_flyway`

## Working rules

- Resolve user shorthand to these exact paths before opening files or running commands.
- Treat `coin app frontend` and `admin frontend` as the same repository unless the user later says they were split.
- If the user mentions only a product area, restate the resolved repository path in your working notes before editing.
- If a task spans multiple Fox Coin repositories, list the affected repositories explicitly before making changes.

## Expected behavior

- Prefer these paths over guessing from the current working directory.
- When summarizing work, mention both the product label and the repository path if there is any ambiguity.

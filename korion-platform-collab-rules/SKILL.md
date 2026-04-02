---
name: korion-platform-collab-rules
description: Capture the recurring collaboration rules for the KORION and Foxya platform repos, including repo resolution, SSH and deployment habits, persistence-layer expectations, adapter boundaries, and backend architecture rules discovered during ongoing offline-pay and ledger work.
---

# KORION Platform Collaboration Rules

Use this skill when working across the KORION, Foxya, offline-pay, and related platform repositories and you need to follow the established repo, deployment, and code-structure rules instead of re-deriving them from scratch.

## Repo map

- `offline_pay`: `/Users/an/work/offline_pay`
- `coin_manage`: `/Users/an/work/coin_manage`
- `foxya backend` / `fox_coin`: `/Users/an/work/foxya_coin_service`
- `frontend` / `coin_front`: `/Users/an/work/coin_front`
- `coin legacy` / `coin_publish`: `/Users/an/work/coin_publish`
- `flyway` / `coin_system_flyway`: `/Users/an/work/coin_system_flyway`

## SSH and deploy rules

- Known hosts may include:
  - Foxya app host
  - coin_front host on the same Foxya app server
  - KORION coin_manage host
  - offline_pay host
- SSH commands often use a PEM file, but the PEM path is user-specific.
- Do not hardcode `/Users/<name>/Downloads/*.pem` as a universal truth.
- If you document an SSH command, explicitly note that the PEM location must be replaced per operator environment.
- When deploying, prefer:
  1. local commit and push
  2. remote `git pull` from the repo under `/var/www/...`
  3. container rebuild or restart
  4. health check and log verification
- If the server worktree is dirty or remote auth is broken, do not force pull blindly. Use a controlled sync fallback.
- For `coin_front`, prefer the repo's own deploy script as the canonical path:
  - `/var/www/fox_coin_frontend`
  - `sudo git pull origin develop`
  - `sudo ./deploy-docker.sh --auto`
- When `coin_front` server worktree is dirty, prefer:
  - `sudo git stash push -u -m "codex-pre-deploy-YYYYMMDD-context"`
  - `sudo git pull origin develop`
  - `sudo ./deploy-docker.sh --auto`
  - then verify `git status --short` is empty and `git rev-parse HEAD` matches `origin/develop`
- Remote docker commands may require `sudo`.

## Remote repo expectations

- `offline_pay` deploy path has been operated from `/var/www/korion_offline`
- `coin_manage` deploy path has been operated from `/var/www/korion`
- `fox_coin` deploy path has been operated from `/var/www/fox_coin`
- `coin_front` deploy path has been operated from `/var/www/fox_coin_frontend`
- On remote hosts, verify:
  - `git status --short`
  - current branch
  - current commit
  - running containers
  - health endpoint

## Backend architecture rules

1. Keep layered structure explicit:
   - `domain`
   - `application`
   - `infrastructure`
   - `interfaces`
   - `config`
2. Do not instantiate production collaborators directly inside application services.
3. External systems must sit behind ports and adapters.
4. If an external service grows in responsibility, split one gateway into multiple focused ports.
   - Example: collateral lock, settlement finalize, history sync
5. Prefer factory pattern when object creation logic has domain or integration meaning.
6. Controllers should not assemble complex domain results directly.
7. Keep worker execution and API submission concerns separate.

## Persistence rules

1. In persistence layers, prefer the project query builder over raw SQL string assembly when the repository already follows that style.
2. Do not scatter operators like `=`, `>=`, or SQL fragments inline when a query builder abstraction or operator enum can express them.
3. If row mapping grows, split mappers into dedicated classes instead of keeping all result parsing inline.
4. If the repo pattern already uses helpers such as `updated_at` touch methods, reuse them instead of duplicating raw expressions.

## Integration rules

- `offline_pay` must not treat local mobile success as final settlement.
- Offline requests are queued locally first, then uploaded asynchronously when connectivity returns.
- Server-side settlement success must still be followed by worker-side ledger or transfer execution.
- `coin_manage` is the canonical ledger owner for settlement-side effects.
- `fox_coin` is the user-facing history owner.
- Do not let frontend-only state become the source of truth for final asset state.

## Safety rules

- For user classes such as test users, enforce network restrictions at execution time, not just request time.
- If a rule prevents real withdrawals, validate it again in worker or broadcast paths so DB or queue manipulation cannot bypass it.
- Shared or external user metadata should come from the source-of-truth DB or service, not from assumptions cached only in the local service.

## Documentation rules

- Keep flow docs in Markdown when the behavior is subtle or safety-sensitive.
- When documenting SSH commands, use example commands but explicitly label host, repo path, and PEM path as environment-specific operator inputs.
- When behavior depends on offline vs online phases, document both:
  - local queue state
  - server validation state
  - worker execution state

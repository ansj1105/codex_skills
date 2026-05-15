# Codex Skills / Operator Notes

## Behavioral Guidelines To Reduce Common LLM Coding Mistakes

Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## KORION WSL Workspace Policy

- Primary Codex work should run inside WSL2 Ubuntu, not Windows PowerShell or Git Bash.
- Clone repositories into the Linux filesystem under `~/work`; do not work from `/mnt/c/...` except for one-off file reads or migration of old local changes.
- Use Windows paths only as legacy/source references while migrating old working trees.

## Canonical WSL Paths

- Foxya backend: `~/work/fox_coin`
- Flyway migrations: `~/work/coin_system_flyway`
- KORION offline-pay backend: `~/work/korion_offline`
- KORION coin/manage backend: `~/work/coin_manage`
- KORION frontend: `~/work/fox_coin_frontend`
- SSH key: `~/.ssh/korion.pem`

## Legacy Windows Paths

- Foxya backend: `C:\Users\msi\IdeaProjects\fox_coin`
- Flyway migrations: `C:\Users\msi\IdeaProjects\coin_system_flyway`
- Offline-pay backend: `C:\work\korion_offline`
- Coin/manage backend: `C:\work\coin_manage`
- Frontend: `C:\work\fox_coin_frontend`
- SSH key source: `C:\work\korion.pem`

## WSL Bootstrap

```bash
sudo apt update
sudo apt install -y git openssh-client ripgrep curl unzip build-essential ca-certificates
mkdir -p ~/work ~/.ssh
cp /mnt/c/work/korion.pem ~/.ssh/korion.pem
chmod 600 ~/.ssh/korion.pem
```

## Git Defaults In WSL

```bash
git config --global core.autocrlf input
git config --global core.eol lf
git config --global pull.rebase false
git config --global init.defaultBranch main
```

## Repository Migration Rules

- Before replacing a Windows working tree with a WSL clone, check for uncommitted work in the Windows repo.
- If Windows Git is slow or hanging, do not force repeated `git status`; migrate only known required files manually or use a fresh WSL clone from the remote branch.
- Already pushed changes should be recovered by cloning/pulling in WSL.
- Uncommitted but required changes should be copied file-by-file into the WSL clone.
- Temporary SQL/log/image files should not be migrated unless explicitly needed.

## Deployment Targets

- `fox_coin` production host: `52.200.97.155`, path `/var/www/fox_coin`.
  - Production API containers are `foxya-api` and `foxya-api-2`.
  - Production API image name is `foxya-api:${APP_VERSION:-latest}`.
  - Build only `app` once, then restart `app` and `app2` sequentially. Do not run `docker compose build app app2` because both services export to the same image tag.
- `fox_coin_frontend` production host: `52.200.97.155`, path `/var/www/fox_coin_frontend`, deploy with `sudo git pull origin develop` then `sudo ./deploy-docker.sh --auto`.
  - The GitHub deploy key is configured for the root account on the production host. Non-sudo `git pull` as `ubuntu` can fail with `Permission denied (publickey)`.
  - Run the deploy script with sudo because non-sudo deploy can fail during `dist` ownership cleanup.
- `coin_manage` production host: `54.83.183.123`, path `/var/www/korion`, deploy with `sudo git pull origin main` then Docker Compose rebuild/up as documented by the repo.
- `korion_offline` production host: `98.91.96.182`, path `/var/www/korion_offline`.

## Offline Pay Incident Notes

- `coin_manage` ledger journal string columns were widened to avoid offline-pay compensation/finalize failures caused by long reference/journal type values.
- If `offline_pay -> foxya` reports `value too long for type character varying(36)`, the remaining fix belongs to Foxya/Flyway history or transaction columns, not `coin_manage`.
- Dead-letter replay should be selective: retry transport/system/partial sync failures only after the underlying schema/service issue is fixed. Do not bulk retry business, proof-invalid, expired-collateral, or conflict failures.

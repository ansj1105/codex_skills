# Codex Skills / Operator Notes

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

- `fox_coin_frontend` production host: `52.200.97.155`, path `/var/www/fox_coin_frontend`, deploy with `sudo git pull origin develop` then `sudo ./deploy-docker.sh --auto`.
- `coin_manage` production host: `54.83.183.123`, path `/var/www/korion`, deploy with `sudo git pull origin main` then Docker Compose rebuild/up as documented by the repo.
- `korion_offline` production host: `98.91.96.182`, path `/var/www/korion_offline`.

## Offline Pay Incident Notes

- `coin_manage` ledger journal string columns were widened to avoid offline-pay compensation/finalize failures caused by long reference/journal type values.
- If `offline_pay -> foxya` reports `value too long for type character varying(36)`, the remaining fix belongs to Foxya/Flyway history or transaction columns, not `coin_manage`.
- Dead-letter replay should be selective: retry transport/system/partial sync failures only after the underlying schema/service issue is fixed. Do not bulk retry business, proof-invalid, expired-collateral, or conflict failures.

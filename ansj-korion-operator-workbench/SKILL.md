---
name: ansj-korion-operator-workbench
description: Use when working in the ansj KORION and Foxya environment across coin_front, offline_pay, coin_manage, foxya_coin_service, coin_publish, coin_system_flyway, or coin_csms, especially when you need the established repo map, branch habits, SSH targets, deploy flow, validation order, or operator-specific working style for multi-repo changes and production checks.
---

# Ansj KORION Operator Workbench

Use this skill when the task depends on the user's established workstation layout, repo shorthand, deploy habits, or SSH workflow.

## When to use

- The user refers to a repo by product role instead of filesystem path.
- The task spans `coin_front`, `offline_pay`, `coin_manage`, `foxya_coin_service`, or related repos.
- The user asks to deploy, SSH, check a server, or verify health after release.
- The task needs the user's recurring work style instead of generic Git or Docker advice.

## Core operating rules

- Before editing, resolve the exact target repo and branch. Do not guess from memory if the task could touch multiple repos.
- Before large changes or deploys, check `git status --short` to see whether the user is already changing the same worktree.
- Keep write scopes narrow when the tree is dirty. Do not revert unrelated drift.
- Prefer end-to-end handling:
  - local fix
  - targeted verification
  - commit
  - push
  - remote update
  - health check
- If a frontend or backend bug crosses service boundaries, inspect both the app layer and the server-side contract before deciding the fix scope.

## Repo and branch habits

- Read [references/repo-matrix.md](references/repo-matrix.md) when you need the local path, role, deploy root, or usual branch for a repository.
- Use the repo matrix first if the user says things like `앱프론트`, `오프라인페이`, `코인서비스`, `foxya`, `플라이웨이`, or `관리자 api`.

## SSH and deploy habits

- Read [references/ssh-and-deploy.md](references/ssh-and-deploy.md) before remote work.
- Treat host IPs and repo roots as stable operator knowledge, but treat PEM file paths as environment-specific.
- On these servers, always verify:
  - current branch and commit
  - worktree cleanliness
  - container state
  - health endpoint after restart
- If remote `git pull` fails because GitHub auth is missing, use the repo's established fallback instead of forcing random ad-hoc steps.

## Validation order

- Frontend:
  - targeted `vitest` if relevant
  - `npm run build`
- `offline_pay`:
  - targeted `./gradlew test --tests ...`
  - then remote `docker compose up -d --build`
- Foxya or `coin_manage`:
  - prefer targeted Gradle tests or compile checks before deploy
  - validate the exposed health or the exact endpoint touched by the change

## Collaboration style to preserve

- Be direct and concise.
- State resolved repo paths and SSH targets before acting when there is ambiguity.
- Call out absolute facts separately from inference.
- If the issue is partly app-state illusion and partly backend policy, say so explicitly instead of collapsing them into one bug.


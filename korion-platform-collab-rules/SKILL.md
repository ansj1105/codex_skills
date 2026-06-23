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

## Pull Before Editing Rule

A collaborator works on the same repos. Before editing any file in any KORION/Foxya repo, sync with remote first:

- `fox_coin_frontend`: `git -C /mnt/c/work/fox_coin_frontend pull --rebase origin develop`
- `korion_offline`: `git -C /home/ubuntu/work/korion_offline pull --rebase origin main`
- Other repos: `git -C /home/ubuntu/work/<repo> pull --rebase origin <branch>`

If a conflict occurs, report to the user and wait for direction. Never force-push to resolve conflicts silently. This rule applies before the first file edit in any session working on shared repos.

## SSH and deploy rules

- Treat the user's latest explicit operational instruction as the working policy for this workspace. If it conflicts with an older memo, skill, or habitual runbook, follow the newest user direction within system/developer/security constraints.
- If following the newest user direction would violate a higher-priority constraint, create safety risk, or materially conflict with a repo invariant, stop and ask the user before proceeding instead of silently enforcing the older local policy.
- When the user changes an operating rule, update the workspace memo and relevant repo skill source so future turns do not repeat the stale rule.
- Commit, push, remote pull, branch propagation, service restart, and deploy are one-message opt-in actions. Do not perform them unless the newest user message explicitly asks for that exact publish/deploy action.
- A previous `커밋/푸시/배포` instruction does not carry forward after a new user question, explanation request, bug report, or task redirect. In those cases, stop at local changes and verification.
- Before any publish/deploy action, re-read the latest user message. If the action is not explicitly requested there, report that publishing was not performed.
- WSL validation/build hygiene: Node, Gradle, Java, Android, and Capacitor checks must not inherit Windows PATH. If verification fails with `spawn`, `EINVAL`, path parsing, or Windows paths with spaces, rerun with `env -i` and explicit Linux-only `PATH`, `HOME`, `JAVA_HOME`, `ANDROID_HOME`, and repo-local cache variables before treating it as a project failure.

- Known hosts may include:
  - Foxya app host
  - coin_front host on the same Foxya app server
  - KORION coin_manage host
  - offline_pay host
- SSH commands often use a PEM file, but the PEM path is user-specific.
- In this Codex workspace, the actual PEM path is `/home/ubuntu/.ssh/korion.pem`.
- Do not hardcode `/Users/<name>/Downloads/*.pem` as a universal truth, and do not search `/home/ubuntu/work` for PEM files.
- Do not copy PEM files into `/home/ubuntu/work` or any repository.
- If you document an SSH command for this workspace, use `/home/ubuntu/.ssh/korion.pem`; for other operator machines, explicitly note that the PEM location must be replaced.
- When deploying, prefer:
  1. local commit and push
  2. remote `git pull` from the repo under `/var/www/...`
  3. container rebuild or restart
  4. health check and log verification
- If the server worktree is dirty or remote auth is broken, do not force pull blindly. Use a controlled sync fallback.
- For `coin_front`, prefer the repo's own deploy script as the canonical path:
  - `/var/www/fox_coin_frontend`
  - check `git branch --show-current`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`, and `git remote -v`
  - pull with `sudo` from the configured server upstream, preferably `sudo git pull --ff-only`
  - `sudo ./deploy-docker.sh --auto`
- For `coin_front` / `fox_coin_frontend` implementation work, check `develop` and `ios` together before editing. Shared frontend/native changes must be applied and verified in both branches/worktrees before any explicitly requested commit, push, or deploy.
- For `coin_front` production deploy, do not try non-sudo pull/deploy first. The production repo uses private/root-owned GitHub auth; run the upstream-based `sudo git pull` before `sudo ./deploy-docker.sh --auto`.
- For `coin_front` / `fox_coin_frontend` Android release builds, use the user's workstation flow, not ad-hoc Gradle or WSL ADB:
  - Build/install/log details live in `ansj-korion-operator-workbench` and `fox_coin_frontend/AGENTS.md`.
  - Canonical build source is Windows `C:\work\fox_coin_frontend` after `git pull --ff-only`, then `npm run android:release` via `powershell.exe -NoProfile`.
  - Connected-device install/log/DB inspection uses Windows ADB at `C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe`.
  - WSL `adb` and stdout SQLite dumps are not valid for this workstation; use `run-as cp` plus `adb pull` for DB files.
- When `coin_front` server worktree is dirty, prefer:
  - `sudo git stash push -u -m "codex-pre-deploy-YYYYMMDD-context"`
  - upstream-based `sudo git pull`
  - `sudo ./deploy-docker.sh --auto`
  - then verify `git status --short` is empty and `git rev-parse HEAD` matches the configured upstream tip
- Remote docker commands may require `sudo`.
- For nginx/LB incidents on `korion.io.kr`, treat redirect loops as ingress config first. If the HTTPS `korion.io.kr` server block redirects to `https://korion.io.kr$request_uri`, remove that self-redirect and keep only HTTP-to-HTTPS or non-self redirects.
- If `korion.io.kr` has multiple A records by design, apply nginx/LB changes to every active node or the real LB layer and verify each target when possible. A single-node fix can leave intermittent public failures.
- Keep web and API health checks split: `https://korion.io.kr/health` for frontend/web, `https://api.korion.io.kr/health` for API. Do not point API monitors at `https://korion.io.kr/api/health` when the web nginx can proxy or redirect it into a loop.
- Security header, CORS, `/openapi.yaml`, and `/api-docs` restrictions belong on the server block that serves the affected hostname. Verify the public host with `curl -I`, not only container-local health.

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

- Preserve existing product IA, route ownership, and page ownership unless the user explicitly asks for a redesign. When fixing a broken route, form, API binding, or admin ingestion path, restore the established owner rather than inventing a new primary UI path.
- Preserve tab-specific UI ownership. A data/model change for one tab is not permission to alter labels, cards, classes, or visible balance structure in sibling tabs unless the user explicitly asks for that tab too.
- For `coin_front` `/offline-pay/hub`, keep `SENT` and `RECEIVED` balance surfaces separate. `SENT` is the sender collateral view and should keep online/offline collateral display unless explicitly changed; `RECEIVED` can show pending settlement/unsettled received breakdowns when requested. Gate any shared component change by `tab` and verify both tabs.
- For `kori_hompage`, `/partner` is the legacy marketing/business partnership application page and `/partners/apply` is the official KORION PAY partner/merchant application flow. Do not merge, replace, or repoint these flows based on inferred UX. Compatibility aliases may exist only as aliases.
- `offline_pay` must not treat local mobile success as final settlement.
- Offline requests are queued locally first, then uploaded asynchronously when connectivity returns.
- Server-side settlement success must still be followed by worker-side ledger or transfer execution.
- `coin_manage` is the canonical ledger owner for settlement-side effects.
- `fox_coin` is the user-facing history owner.
- Do not let frontend-only state become the source of truth for final asset state.
- Do not hide transport or settlement invariant failures with UI-side fallbacks. For BLE/NFC, a route must come from verified native discovery or NFC bootstrap metadata, not from labels, recent-peer cache, list order, or single-candidate guessing.
- When a route, ACK, proof, or correlation is missing, preserve the failure, add narrow trace evidence, and fix the owning layer: native plugin, JS session route, saga reducer, backend contract, or DB state.
- For repeated BLE/NFC/offline-pay regressions, compare against the last known-good flow before editing. Do not patch only the newest symptom if the underlying discovery, route, saga, ACK, or cleanup invariant is broken.
- A transport fix must preserve the full path: discovery/bootstrap -> session route -> REQUEST/ACK -> APPROVE -> sender auth -> COMPLETE/CANCEL -> cleanup. If the change only handles one trace while weakening another step, it is not complete.
- Fallback routing is valid only when the mapping is produced by a verified discovery/NFC bootstrap contract and stored as an explicit session route. Guesses from app suffixes, labels, aliases, recent cache, or single-candidate matching are invalid.
- Treat the current BLE manual path as a protected baseline once discovery, REQUEST ACK, receiver approval, sender PIN/biometric auth, COMPLETE ACK, and both completion screens pass. NFC changes should add trace evidence and route fixes without weakening that path.
- NFC and BLE manual may share ledger/settlement proof handling after sender authorization, but they must not share the same user flow or be reclassified into each other. NFC flow is two-device tag -> bootstrap -> receiver amount request -> sender amount confirmation -> sender biometric/PIN -> verification -> completion. BLE manual flow is Nearby Send entry -> sender selects receiver from BLE list -> send form amount request -> receiver request view -> receiver approval -> sender biometric/PIN -> verification -> completion.
- NFC work should be traced by boundary: tag start, native payload exchange/read/write, peer parse, authenticated peer commit, BLE bridge discovery/resolution, form transition, amount draft, actual REQUEST, sender confirm/auth, COMPLETE delivery, and scoped cleanup.
- Current offline-pay compact contract:
  - BLE/NFC required path is discovery/bootstrap -> session route -> REQUEST/ACK -> APPROVE -> sender auth -> COMPLETE/CANCEL/FAILED/REJECT -> scoped cleanup.
  - Session route is the transport source of truth; connection pool is only discovery/list/busy UI. Never guess native peers from labels, suffixes, recent cache, list order, or single-candidate matching.
  - BLE incoming request-view UI should be exposed from full durable handoff readiness, not partial payload presence. Partial `REQUEST` messages can merge state, but matching `incomingRequest` + `requestSession` must be ready before a user-visible request-view action is considered usable.
  - All `요청보기` entry points must share one incoming-confirm helper. If an early click is persisted, full/duplicate/same-active-session `REQUEST` merge paths must dispatch pending confirm consume so the user does not need a second tap.
  - Fresh transactions must break old saga/session/draft/pending action/transport state. Role swap between the same two devices is a required regression case.
  - Home/terminal exit must clear overlays, chrome locks, request session, local saga, pending confirm action, connection pool, and native BLE/NFC session, scoped by old `sessionId`.
  - Topbar QR/menu, notifications, hub/store/settings pages, and multi-modal overlays are valid user navigation. Recovery watchdogs must not close explicit user-opened overlays or replace valid offline-pay subroutes.
  - If topbar/bottom nav/multi-modal seems unresponsive but Android `ViewPostIme` or MainActivity focus logs exist, debug stale overlay/chrome lock/watchdog or BLE/NFC cleanup residue before treating it as OS touch failure.
  - NFC authenticated BLE bridge routes are temporary. On concrete `req_*` request creation, release/hand off `NFC_AUTHENTICATED` bridge route ownership to the request session route while preserving pending COMPLETE durable outbox evidence.
  - NFC may use BLE transport after bootstrap, but it is not the BLE manual user flow. First amount editor is receiver/requester; opposite device is sender. `AMOUNT_DRAFT` messages are hints only.
  - QR is online-only and 1:N; QR must not acquire BLE/NFC locks.
  - Durable BLE outbox dead-letter rows are diagnostic evidence, not retry targets; keep bounded retention and prune stale rows.

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

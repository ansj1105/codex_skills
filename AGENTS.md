# Workspace Agent Repo Memo

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

### 3.1 No Patchwork Or Heuristic Masking
For fragile protocol, payment, ledger, auth, BLE/NFC, or deployment bugs, do not hide a missing invariant with a fallback that guesses.

- Do not substitute identifiers by display name, latest cache entry, single nearby candidate, or unrelated fallback unless the protocol explicitly defines that mapping.
- If a required identifier, route, ACK, proof, or correlation is missing, preserve the failure, add targeted trace fields, and fix the source that should produce that value.
- Before coding, name the invariant being restored and the owner of that invariant: native discovery, JS route binding, saga reducer, backend contract, DB state, or deploy config.
- Prefer one source-of-truth fix plus a regression test/trace over multiple UI-side bypasses.
- Do not solve repeated regressions by patching only the newest symptom. First compare against the last known-good behavior, identify the first broken invariant, and fix the owning layer.
- For BLE/NFC/offline-pay flow bugs, avoid "make this one case pass" changes. The fix must preserve the full protocol path: discovery/bootstrap -> session route -> REQUEST/ACK -> APPROVE -> sender auth -> COMPLETE/CANCEL -> cleanup.
- If the fix adds a fallback, explicitly prove why the fallback is part of the contract. Otherwise remove it and repair the missing producer of the canonical value.

### 3.2 Preserve Existing Product Structure
Do not redesign navigation, routing, page ownership, labels, or UI hierarchy just because it seems clearer.

- Do not implement imagined adjacent work. A request to implement or fix one route, API, page, form, policy, or backend flow is not permission to add surrounding product behavior, new entry points, new menu exposure, new roles, new dashboard sections, extra copy, extra settings, or alternate UX that the user did not explicitly ask for.
- Before adding any user-visible surface outside the named target, ask: "Did the user explicitly request this exact surface?" If not, leave it unchanged and mention the possible follow-up instead of implementing it.
- Do not infer business intent from what seems useful. Preserve the current product owner, IA, labels, data model, API contract, and visibility rules unless the user explicitly instructs a change.
- When the user asks to fix a broken route, form, dropdown, API binding, or submission flow, first identify the existing intended structure from current code and recent known-good commits.
- Do not add new tabs, merge pages, move routes, rename menus, or change user-facing IA unless the user explicitly asks for that structural change.
- Do not expose hidden, internal, admin, partner, distributor, or experimental pages in app menus, bottom sheets, sidebars, or public navigation unless the user explicitly requested that exact menu exposure. A route/API implementation request is not permission to add a visible navigation entry.
- If a feature page exists but the requested scope was backend/API/admin-only, keep it unlinked from ordinary user navigation and call out the access path separately.
- If two existing pages/routes serve different business purposes, preserve that split. For example, in `kori_hompage`, `/partner` is the legacy marketing/business partnership application and `/partners/apply` is the official KORION PAY partner/merchant application. Do not collapse or replace one with the other.
- Prefer restoring the broken owner/link/API connection over inventing a new UI path. If a new alias is needed for compatibility, keep it as an alias only and do not point primary navigation away from the established route.
- Before editing public navigation or route manifests, compare with recent history and state the exact invariant being preserved.
- For existing tabbed product pages, treat each tab's layout as a separate owned surface. Do not apply a useful change from one tab to another tab unless the user explicitly asks for both. Example: in `fox_coin_frontend` `/offline-pay/hub`, `SENT` and `RECEIVED` balance cards have different product meanings; a received-settlement/unsettled UI change must not alter the sent-collateral UI unless requested.

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

## Local Repository Map
- `fox_coin`: Foxya backend, remote `https://github.com/ansj1105/fox_coin.git`.
- `coin_system_flyway`: shared production Flyway migrations, remote `https://github.com/ansj1105/coin_system_flyway.git`.
- `coin_manage`: KORION ledger and settlement service.
- `korion_offline`: offline_pay service.
- `fox_coin_frontend`: Fox Coin/KORION frontend working clone.
- `kori_hompage`: KORION public Vite React website, remote `https://github.com/ansj1105/kori_hompage.git`.
- `coin_csms`: admin API bridge for `coin_front` admin routes, remote `https://github.com/ansj1105/coin_csms.git`.
- `alarm_service`: Python Telegram external monitor for KORION web/API/PostgreSQL health, remote `https://github.com/ansj1105/alarm_service.git`.

## Cross Repo Rules
- Default execution stops at local fix, verification, and review. Do not commit, push, deploy, remote pull, restart services, or propagate branches unless the user explicitly asks for that publishing action in the current user message.
- Publishing permission does not carry over from an earlier message. If the newest user request asks for investigation, explanation, confirmation, or another code change without saying `커밋`, `푸시`, or `배포`, do not publish even if a previous turn included those words.
- Before any commit/push/deploy, re-read the latest user message and confirm it explicitly requests that exact action. If it does not, stop after local changes and verification and report that publishing was not performed.
- Incident note 2026-06-01: after an offline-pay NFC/BLE fix, Codex incorrectly continued into commit/push/deploy from an older permission. Treat this as a hard regression to avoid: latest-message explicit publish permission is mandatory every time.
- For `fox_coin_frontend`, work `develop` and `ios` together during local implementation. Before editing, check whether the same change must land in both branches/worktrees; apply relevant frontend/native changes to both and verify both before any explicitly requested commit, push, or deploy.
- For `fox_coin_frontend` Android release validation/builds, use the repo script `npm run android:release` when the user asks for an Android release build. Run it with Linux-only environment hygiene if needed (`env -i ...`) so Node/Gradle/Android tooling does not inherit Windows PATH.
- DB schema changes for `fox_coin`, `coin_manage`, `coin_csms`, or `korion_offline` must be reflected in `coin_system_flyway`.
- Browser admin frontend must not call `coin_manage` or `fox_coin` admin internals directly; route admin data through `coin_csms`.
- Keep Telegram tokens, API keys, DB passwords, and server `.env` values out of commits.
- Local Codex sandbox blocks direct GitHub network/DNS in normal command execution. For GitHub `fetch`, `push`, `pull`, and branch propagation, use the approved escalated `git -C <repo> ...` command prefixes instead of retrying inside the sandbox. This is an environment permission boundary, not a repo/auth failure.
- WSL validation and build commands must not inherit Windows PATH. If `npm`, `npx`, Gradle, Java, Android, or Capacitor checks fail with path/spawn errors that mention Windows paths or spaces, rerun with `env -i` and an explicit Linux-only `PATH`, `HOME`, `JAVA_HOME`, `ANDROID_HOME`, and repo-local cache as needed. Treat this as environment hygiene, not a code failure.
- Current workspace SSH PEM path is `/home/ubuntu/.ssh/korion.pem`. Use this explicit key for production SSH/SCP checks instead of searching Downloads, repo folders, or `/home/ubuntu/work`. Do not copy PEM files into the worktree or any repository.
- Production deploy pulls must follow the server worktree's current branch and configured upstream remote, because some deploy repos track `main` while others track `develop` or private remotes. On the server, check `git branch --show-current`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`, and `git remote -v`; then run the pull with `sudo` against that upstream, preferably `sudo git pull --ff-only` when upstream is configured.
- `fox_coin_frontend` production deploy on `52.200.97.155` uses a root-owned/private GitHub deploy key. Always run the upstream-based `sudo git pull` from `/var/www/fox_coin_frontend` first, and only then run `sudo ./deploy-docker.sh --auto`. Do not try non-sudo `git pull`/deploy first; private repositories and root-owned deploy keys fail as `ubuntu` with `Permission denied (publickey)`.
- `coin_csms` production deploy on `52.200.97.155` uses root-owned git/build/docker state in `/var/www/coin_csms`. When the user explicitly asks to deploy it, do not waste a non-sudo pull/build attempt. Verify the server branch/upstream first, run the upstream-based `sudo git pull`, then `sudo ./gradlew shadowJar --no-daemon -x test`, then `sudo docker compose -f docker-compose.yml up -d --build`; verify `csms-api`.
- `kori_hompage` / `korion.network` production deploy on `100.50.107.232` uses `/var/www/korion` and Docker requires sudo. When the user explicitly asks to deploy it, verify the server branch/upstream first, run the upstream-based `sudo git pull` if the repo is not already current, then `sudo ./scripts/deploy-compose.sh`; verify `korion-web` and `korion-partner-api`.
- For `korion.io.kr` nginx/LB issues, use the KORION deploy runbooks as the source of truth. Key invariants: redirect loops are ingress config first, web health is `https://korion.io.kr/health`, API health is `https://api.korion.io.kr/health`, and `https://korion.io.kr/api/health` must not be used for API monitoring.

## Production Disk And Docker Cleanup Policy
- Check production capacity with `df -hT / /var/lib/docker /var/www`, `sudo docker system df -v`, and targeted `sudo du -sh` before and after heavy build/deploy sessions.
- Treat disk usage at 70% as warning, 80% as cleanup required, 85% as urgent cleanup, and 90%+ as deploy-blocking until space is recovered. On small 48G hosts such as `korion_offline`, start cleanup planning at 70% even when services are healthy.
- Safe first-pass Docker cleanup is limited to unused images and old build cache: `sudo docker image prune -f` and `sudo docker builder prune -f --filter until=168h`. Do not prune volumes or run `docker system prune --volumes` unless the user explicitly approves DB/volume impact.
- For `/var/www/fox_coin_frontend`, keep only the latest 3 `dist.__backup__*` directories after deploy churn. Remove older frontend backup dirs only after confirming current `dist` exists.
- Cleanup trigger guidelines: Docker build cache >= 5G, `/var/lib/docker` >= 15G on 48G hosts, frontend backup dirs > 1G, or root filesystem >= 70%.
- After cleanup, verify running containers with `sudo docker ps` and re-check `sudo docker system df`; cleanup should not restart app containers.

## Offline Pay Proof Issuance Policy
- `coin_manage` is the canonical owner for collateral lock/release and internal ledger finalization. It must not issue offline spending proofs.
- `korion_offline` is the only service that issues and verifies `issued_offline_proofs`.
- Issued proofs must be bound to user, asset, device id, device public key, collateral lock ids, usable amount, nonce, issuer key id, issue time, and expiry.
- `korion_offline` must canonicalize the issued payload, sign it, self-verify before saving, and verify it again before serving it in snapshots or accepting settlement.
- A previously issued proof remains usable only while `ACTIVE`, not expired, signature-valid, and bound to the same sender device and asset. Invalid, expired, revoked, consumed, or mismatched proofs must not be reused.
- `fox_coin_frontend` is a proof consumer/cache only. Online send flows should request a fresh proof; offline send flows may use a cached proof only after local signature/status/expiry validation.
- Foxya offline-pay history sync is not the canonical settlement gate. `OFFLINE_PAY_SETTLEMENT` must not debit the sender Foxya wallet again after collateral settlement; `OFFLINE_PAY_RECEIVE` may credit the receiver projection without requiring hot-wallet balance. Do not reintroduce a live Foxya wallet balance check for already-settled offline collateral.
- NFC receive-request creation must not be blocked by the receiver's collateral/proof. The sender's proof and collateral are required only when the sender confirms and signs the transfer.
- Frontend readiness must distinguish "can open transport" from "can send value". Cached user/device/security/collateral can allow Nearby Send or Simple Pay entry, but sender settlement must be blocked unless a usable issued proof is present or can be refreshed online.
- Do not enqueue sender settlement or build a spending proof with `issuedProof=null`. If the app is offline and no usable local proof exists, show a sync-required message and stop before local queue creation.
- Online proof refresh should run at app/session restore, dashboard/offline-pay entry, and just before sender confirmation when possible. On transient refresh failure, do not mark the proof key as permanently ensured; allow retry on focus, online, or re-entry.

## Offline Pay Transport Rules
- BLE/NFC is a 1:1 transport. Session route, not discovery list/cache, is the source of truth for REQUEST/APPROVE/COMPLETE/CANCEL/FAILED/REJECT.
- Never guess native peers from labels, aliases, app suffixes, recent cache, list order, or single-candidate matching. Missing route means fix discovery/bootstrap/session-route production and add trace.
- Protected protocol path: discovery/bootstrap -> session route -> REQUEST/ACK -> APPROVE -> sender auth -> COMPLETE/CANCEL/FAILED/REJECT -> scoped cleanup.
- BLE baseline: verified peer selection, REQUEST ACK, receiver confirm, APPROVE, sender biometric/PIN, COMPLETE ACK, sent/received completion screens.
- NFC only bootstraps/authenticates the peer and then uses BLE. First amount editor is receiver/requester; the opposite device is sender and should route to sender confirm/auth, not a generic BLE receive modal.
- `AMOUNT_DRAFT`/`AMOUNT_DRAFT_CLEAR` are best-effort amount-entry hints only. They must not create sessions, block required messages, or surface as payment failures.
- Message direction follows payment role. For NFC receiver-created requests, final `COMPLETE`/`FAILED` flows sender device (`receiverDeviceId`) -> requester/receiver device (`requesterDeviceId`).
- Duplicate `sessionId` is not automatically stale. Within TTL, a more complete payload should upsert/merge request state and wake confirm routing; terminal/tombstoned sessions must reject stale messages.
- BLE incoming request UI must be driven by full durable handoff readiness, not partial payload presence. Partial `REQUEST` payloads may update/merge state, but should not surface a usable request-view modal before matching `incomingRequest` + `requestSession` are ready.
- All `요청보기` entry points must use the same incoming-confirm route helper. If a user click is captured before full payload readiness, persist the pending intent and dispatch/consume it immediately after the fuller duplicate/full `REQUEST` merge commits; do not require a second tap.
- Full/deduped `REQUEST` paths include normal inbound, duplicate-message, and same-active-session merge branches. All branches that make `isOfflinePayIncomingConfirmReady()` true must dispatch the pending confirm consume event and write durable trace for missing pending action.
- New transactions must break the previous saga. Fresh SEND/RECEIVE/BLE/NFC form entry must clear stale flow draft, amount draft, incoming request, request session, local saga, pending confirm action, connection pool, and native session for old `sessionId`.
- Terminal/home exit must converge to: no chrome lock, no overlay, no active session, no stale pending action, clean topbar/bottom nav, and no BLE/NFC transport alive except durable COMPLETE retry policy.
- Offline-pay topbar, QR, menu, notifications, and multi-modal overlays are user navigation surfaces. Home recovery/watchdog and transient cleanup must not immediately close user-opened overlays or replace valid subroutes such as `/offline-pay/scan-qr`, notifications, hub, store, or settings. Use preserve-user-overlay guards when cleanup runs after explicit topbar/menu/QR actions.
- If topbar/bottom nav/multi-modal appears unresponsive after a transaction, first distinguish OS input from app state. If `ViewPostIme`/MainActivity focus exists, treat it as stale overlay/chrome lock/cleanup/watchdog or BLE/NFC transport residue, not a device touch failure.
- Cleanup must be scoped by original `sessionId`; delayed cleanup from old cancel/reject/failure/success must never clear a newer transaction.
- NFC authenticated BLE bridge routes are bootstrap routes, not final payment session owners. When the concrete `req_*` REQUEST session is created, hand off/release the `NFC_AUTHENTICATED` bridge route and bind the real request route. Keep pending COMPLETE durable outbox evidence, but do not let old bridge/terminal routes block a new request.
- Offline BLE outbox dead-letter rows are diagnostic evidence. Keep bounded retention, prune stale rows, and do not let old failures block new sessions.
- QR is online-only and 1:N. QR scan/direct QR pay/top-bar receiving QR must not acquire BLE/NFC locks.
- Offline UI success, local COMPLETE, COMPLETE_ACK, and server settlement are different states. Server/ledger settlement is canonical and must be idempotent by session/proof/nonce.
- Profile images are metadata/cache only. Do not enlarge BLE/NFC payloads with image binaries.

## Production Container Map
- `fox_coin` on `52.200.97.155`: `foxya-api`, `foxya-api-2`, `foxya-db-proxy`, `foxya-postgres`, `foxya-redis`, `foxya-nginx`, `foxya-pgbouncer`, `foxya-tron-service`, `foxya-tron-service-2`, `foxya-tron-worker`, `foxya-prometheus`, `foxya-grafana`.
- `coin_csms` on `52.200.97.155`: `csms-api`.
- `alarm_service` on `52.200.97.155`: `fox-coin-alarm-service`.
- `coin_manage` on `54.83.183.123`: `korion-app-api-1`, `korion-app-ops-1`, `korion-app-signer-1`, `korion-app-withdraw-worker-1`, `korion-postgres`, `korion-redis`, `ledger-signer`.
- `korion_offline` on `98.91.96.182`: `korion_offline-app-api-1`, `korion_offline-app-worker-1`, `korion_offline-nginx-1`, `korion_offline-postgres-1`, `korion_offline-redis-1`.
- Do not monitor or deploy against stale Foxya default-compose names `foxya-coin-api`, `foxya-coin-postgres`, or `foxya-coin-redis` in production. The production stack uses `docker-compose.prod.yml` names above.
- Foxya production API image name is `foxya-api:${APP_VERSION:-latest}` and both `foxya-api`/`foxya-api-2` containers run that same image. Build only the `app` service once, then restart `app` and `app2` sequentially; do not run `docker compose build app app2` because both services export to the same image tag and can conflict.

## New Repo Notes
- `kori_hompage` runs with `npm run dev`; `npm run build` generates sitemap first and then Vite output. Production Docker uses `docker-compose.prod.yml`.
- `coin_csms` uses Gradle (`./gradlew build`, `./gradlew run`, `./gradlew shadowJar`) and Redis Cluster support. Update `src/main/resources/openapi.yaml` when adding admin ops endpoints.
- `alarm_service` uses `requirements.txt` and `src/main.py`. It checks web/API health, primary DB, optional standby DB, and sends Telegram alerts after consecutive failures.

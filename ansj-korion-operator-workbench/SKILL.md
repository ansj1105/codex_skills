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

- Treat the user's latest explicit operational instruction as the working policy for this workspace. If it conflicts with an older memo, skill, or habitual runbook, follow the newest user direction within system/developer/security constraints.
- If following the newest user direction would violate a higher-priority constraint, create safety risk, or materially conflict with a repo invariant, stop and ask the user before proceeding instead of silently enforcing the older local policy.
- When the user changes an operating rule, update the workspace memo and relevant repo skill source so future turns do not repeat the stale rule.
- Before editing, resolve the exact target repo and branch. Do not guess from memory if the task could touch multiple repos.
- Before large changes or deploys, check `git status --short` to see whether the user is already changing the same worktree.
- Keep write scopes narrow when the tree is dirty. Do not revert unrelated drift.
- Do not implement imagined adjacent work. A request to implement or fix one route, API, page, form, policy, or backend flow is not permission to add surrounding product behavior, new entry points, menu exposure, roles, dashboard sections, extra copy, settings, or alternate UX that the user did not explicitly ask for.
- Before adding any user-visible surface outside the named target, confirm the user explicitly requested that exact surface. Otherwise leave it unchanged and mention it as a possible follow-up.
- Do not infer business intent from what seems useful. Preserve the current product owner, IA, labels, data model, API contract, and visibility rules unless the user explicitly instructs a change.
- Preserve existing product IA, route ownership, and page ownership unless the user explicitly asks to redesign them. For `kori_hompage`, `/partner` is the legacy marketing/business partnership application and `/partners/apply` is the official KORION PAY partner/merchant application; do not merge, replace, or repoint these flows based on inferred UX.
- Do not expose hidden, internal, admin, partner, distributor, or experimental pages in user-facing menus, bottom sheets, sidebars, or public navigation unless the user explicitly requested that exact menu exposure. A route/API/page implementation request is not permission to add a visible navigation entry.
- Do not commit, push, deploy, or propagate branches unless the user explicitly asks for those publishing actions in the current user message. Treat the workflow below as opt-in delivery, not as an automatic default after local fixes.
- Publishing permission is one-message scoped. A previous `커밋/푸시/배포` instruction expires when the user asks a new question, asks for explanation, reports a new symptom, or redirects the task without repeating the publishing action.
- Before any publish action, re-read the newest user message. If it does not explicitly request that exact action, stop at local fix/verification and report that publishing was intentionally not performed.
- For `fox_coin_frontend`, check `develop` and `ios` together before editing. Apply relevant frontend/native changes to both branches/worktrees and verify both before any explicitly requested publish action.
- For fragile protocol or settlement bugs, do not mask a missing invariant with a heuristic fallback. If a native peer id, session route, ACK, proof, or correlation is missing, keep the failure visible, add targeted trace fields, and fix the layer that should produce it.
- For offline-pay cleanup/session bugs, treat "home screen visible" as insufficient. Verify that overlays/chrome locks, pending confirm actions, request session, local saga, connection pool, and native BLE/NFC session are all cleared or explicitly preserved by `sessionId`.
- Fresh offline-pay transactions must not inherit previous saga, amount draft, request session, incoming request, pending action, or transport route. Role swaps between the same two devices are a required regression scenario.
- **`fox_coin_frontend` Android 빌드 및 설치 — 항상 이 순서로**:
  1. **빌드 기준은 Windows clone `C:\work\fox_coin_frontend`와 원격 브랜치**:
     ```bash
     powershell.exe -NoProfile -Command "Set-Location 'C:\work\fox_coin_frontend'; git pull --ff-only; npm run android:release"
     ```
     - WSL clone에서 바로 Android 빌드하지 말 것. 사용자가 말하는 "우리 방식"은 Windows clone pull 후 `npm run android:release`.
     - `npm run android:release` = build + cap sync + `gradlew.bat assembleRelease -PkorionDebuggableRelease=true` 한 번에 실행
     - `-PkorionDebuggableRelease=true`가 자동 포함 → WebView JS console이 logcat에 나옴
     - **cmd.exe 방식 금지**: `cmd.exe /c "cd /d C:\..."` 는 느리고 output이 비어 나오는 문제 있음
  2. APK 경로: `C:\work\fox_coin_frontend\android\app\build\outputs\apk\release\app-release.apk`
  3. **설치 (WSL에서 PowerShell로 Windows ADB 호출)**:
     ```bash
     powershell.exe -NoProfile -Command '
       $apk="C:\work\fox_coin_frontend\android\app\build\outputs\apk\release\app-release.apk";
       $adb="C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe";
       $job1 = Start-Job { & $using:adb -s R3CWC06MHFP install -r $using:apk };
       $job2 = Start-Job { & $using:adb -s R3CT501EJHV install -r $using:apk };
       Wait-Job $job1,$job2; Receive-Job $job1; Receive-Job $job2
     '
     ```
  - 기기 시리얼: S23=`R3CWC06MHFP`, Flip=`R3CT501EJHV`
  - **기기 확인**: `powershell.exe -NoProfile -Command "& 'C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe' devices -l"`
  - **PowerShell quoting guard**: WSL/bash에서 `-Command` 안에 `$adb`, `$apk`, `$job1`, `$using:adb` 같은 PowerShell 변수가 있으면 `-Command` 전체를 작은따옴표로 감싸거나 모든 `$`를 이스케이프한다. 큰따옴표로 감싸면 bash가 `$adb`를 먼저 확장해서 `=C:\...\adb.exe` 형태로 깨진다.
  - **기기 설치는 항상 최신 빌드 완료 후 수행**. `git pull` 없이 빌드하거나, 빌드 없이 install하면 이전 버전 설치됨.
- **ADB logcat 캡처/분석 — Windows ADB만 사용**:
  - WSL `adb devices`는 보통 비어 있다. 연결 기기 작업은 항상 `powershell.exe` + `C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe`.
  - 테스트 직전 버퍼 클리어:
    ```bash
    powershell.exe -NoProfile -Command '
      $adb="C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe";
      & $adb -s R3CWC06MHFP logcat -G 64M -c;
      & $adb -s R3CT501EJHV logcat -G 64M -c
    '
    ```
  - 테스트 후 필터링 덤프:
    ```bash
    powershell.exe -NoProfile -Command '
      $adb="C:\Users\msi\AppData\Local\Android\Sdk\platform-tools\adb.exe";
      & $adb -s R3CWC06MHFP logcat -d -v time | Select-String "chromium|Capacitor/Console|OfflineBluetooth|OfflinePay|KORION|ReactNativeJS|AndroidRuntime|Minified React error|SETTLEMENT|outbox|ledger|snapshot|hub" | Set-Content C:\Temp\korion-s23-log.txt;
      & $adb -s R3CT501EJHV logcat -d -v time | Select-String "chromium|Capacitor/Console|OfflineBluetooth|OfflinePay|KORION|ReactNativeJS|AndroidRuntime|Minified React error|SETTLEMENT|outbox|ledger|snapshot|hub" | Set-Content C:\Temp\korion-flip-log.txt
    '
    ```
  - 앱 로컬 SQLite 확인은 `exec-out cat` stdout을 쓰지 말 것. PowerShell/WSL stdout 경유로 SQLite가 깨지거나 WSL `UtilBindVsockAnyPort` 오류가 난다. 안전 경로는 `run-as cp databases/offline_pay.db /sdcard/Android/data/com.korion.wallet/files/debug_export/<name>.db` 후 `adb pull`.
  - pull 받은 앱 로컬 DB를 조회할 때 `sqlite3` CLI와 Node 내장 SQLite가 없으면 Python 표준 `sqlite3` 모듈을 read-only로 사용한다. 예: `sqlite3.connect("file:/mnt/c/Temp/korion-db-check/s23-offline_pay.db?mode=ro", uri=True)`. 파일을 write/repair/vacuum 하지 말고, 결과 보고 시 read-only 조회였음을 명시한다.
- Offline-pay request-view regressions usually involve partial BLE `REQUEST` payloads. Do not surface/consume request-view UX from partial payload alone; ensure all incoming-confirm entry points share the same helper, persist early click intent, and wake it after full/duplicate/same-active-session `REQUEST` merge commits a ready handoff.
- Offline-pay topbar, QR, settings menu, notifications, hub/store pages, and multi-modal overlays are valid user navigation. Home recovery/watchdog cleanup must preserve explicit user-opened overlays and valid offline-pay subroutes; if touch logs reach MainActivity, debug stale overlay/chrome lock or BLE/NFC cleanup residue before blaming OS input.
- NFC authenticated BLE bridge routes are temporary bootstrap routes. On concrete `req_*` request creation, hand off/release the `NFC_AUTHENTICATED` bridge route and bind the request session route while preserving pending COMPLETE durable outbox evidence.
- When the user explicitly asks for delivery, prefer end-to-end handling:
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
- Treat host IPs and repo roots as stable operator knowledge. In this Codex workspace, the actual operator PEM is `/home/ubuntu/.ssh/korion.pem`; do not search random download/worktree paths or copy the PEM into a repo.
- On these servers, always verify:
  - current branch and commit
  - worktree cleanliness
  - container state
  - health endpoint after restart
- If remote `git pull` fails because GitHub auth is missing, use the repo's established fallback instead of forcing random ad-hoc steps.

## Validation order

- WSL validation/build hygiene: do not inherit Windows PATH for `npm`, `npx`, Gradle, Java, Android, or Capacitor checks. If a command fails with `spawn`, `EINVAL`, path parsing, or Windows paths with spaces, rerun with `env -i` and explicit Linux-only `PATH`, `HOME`, `JAVA_HOME`, `ANDROID_HOME`, and repo-local cache variables. Treat this as environment hygiene, not a code failure.
- Gradle/JDK hygiene: backend Gradle checks in WSL should pin the workspace JDK explicitly:
  ```bash
  env PATH=/home/ubuntu/work/jdk-21.0.7+6/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    JAVA_HOME=/home/ubuntu/work/jdk-21.0.7+6 \
    ./gradlew test --tests <ClassOrPattern> --no-daemon
  ```
  If Android SDK tools are needed, add `/home/ubuntu/work/android-sdk/platform-tools:/home/ubuntu/work/android-sdk/cmdline-tools/latest/bin` to the front of `PATH`. A `java` not found error is an environment command issue first, not a source failure.

- Frontend:
  - targeted `vitest` if relevant
  - `npm run build`
  - for `fox_coin_frontend`, verify the corresponding `ios` branch/worktree when the change affects shared frontend or native app behavior
  - for Android app release validation/builds in `fox_coin_frontend`, `npm run android:release`
- `offline_pay`:
  - targeted `./gradlew test --tests ...`
  - then remote `docker compose up -d --build`
- Foxya or `coin_manage`:
  - prefer targeted Gradle tests or compile checks before deploy
  - validate the exposed health or the exact endpoint touched by the change

## Scheduler and job map

- `korion_offline`: Spring scheduling is enabled by `OfflinePayBackendApplication`. Main scheduled workers are settlement stream processing, settlement external sync, collateral external sync, reconciliation follow-up, workflow projection, direct local evidence reconciliation, event-log maintenance, post-final proof conflict scan, collateral balance reconciliation, issued-proof collateral-device sync, and orphan received-unsettled cleanup. Defaults live under `offline-pay.worker.*`; orphan cleanup defaults to `0 20 4 * * *` UTC.
- `coin_manage`: `app-withdraw-worker` owns BullMQ withdrawal jobs (`dispatch`, `reconcile`, `external_sync`). `app-ops` owns singleton operational workers: deposit monitor, sweep bot, monitoring, alert worker, outbox publisher, offline-pay ledger reconciliation, activation grant/reclaim, and resource delegation.
- `coin_manage` operator-triggered scheduler routes live under `/api/scheduler`; use `POST /api/scheduler/process-withdraw-queue` and `POST /api/scheduler/retry-pending` for recovery before writing ad-hoc scripts.
- `fox_coin_frontend`: mobile offline-pay retry state is `offline_pay_sync_outbox`; legacy `offline_pay_queue` is compatibility/protocol recovery state only and should not own server upload/retry.
- `alarm_service`: Python monitor loop driven by `POLL_INTERVAL_SECONDS` with Telegram after consecutive failures. It observes services and logs; it does not process settlement business state.

## Collaboration style to preserve

- Be direct and concise.
- State resolved repo paths and SSH targets before acting when there is ambiguity.
- Call out absolute facts separately from inference.
- If the issue is partly app-state illusion and partly backend policy, say so explicitly instead of collapsing them into one bug.

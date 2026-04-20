# Repo Matrix

This file captures the recurring repo map for the user's current workstation and the usual branch and deploy assumptions discovered during ongoing work.

## Local repositories

- `coin_front`
  - Role: app frontend / mobile-capacitor frontend
  - Local path: `/Users/an/work/coin_front`
  - Usual working branch: `develop`
  - Typical verification: `npm run build`, selective `vitest`
  - Typical production target: frontend assets served from `/var/www/fox_coin_frontend/dist`

- `offline_pay`
  - Role: KORION offline payment backend
  - Local path: `/Users/an/work/offline_pay`
  - Usual working branch: `main`
  - Typical verification: `./gradlew test --tests ...`
  - Typical production target: `/var/www/korion_offline`

- `coin_manage`
  - Role: canonical KORION ledger/service backend
  - Local path: `/Users/an/work/coin_manage`
  - Typical production target: `/var/www/korion`

- `foxya_coin_service`
  - Role: foxya backend / app-service / user-facing history side
  - Local path: `/Users/an/work/foxya_coin_service`
  - Typical production target: `/var/www/fox_coin`

- `coin_publish`
  - Role: legacy coin repo
  - Local path: `/Users/an/work/coin_publish`

- `coin_system_flyway`
  - Role: flyway / migration repo
  - Local path: `/Users/an/work/coin_system_flyway`

- `coin_csms`
  - Role: admin API / related backoffice service
  - Local path: `/Users/an/IdeaProjects/coin_csms`

## Common shorthand mapping

- `앱프론트`, `frontend`, `coin_front` -> `/Users/an/work/coin_front`
- `오프라인페이`, `offline_pay`, `korion pay` -> `/Users/an/work/offline_pay`
- `코인서비스`, `coin_manage`, `korion service` -> `/Users/an/work/coin_manage`
- `foxya`, `fox coin backend`, `앱서비스` -> `/Users/an/work/foxya_coin_service`
- `플라이웨이`, `flyway` -> `/Users/an/work/coin_system_flyway`
- `레거시`, `coin_publish` -> `/Users/an/work/coin_publish`
- `관리자 api`, `coin_csms` -> `/Users/an/IdeaProjects/coin_csms`

## Cross-repo rules

- `offline_pay` feature work often affects:
  - `coin_front`
  - `coin_manage`
  - sometimes `foxya_coin_service`
- If a change touches API contract, settlement state, device registration, or status display, check whether frontend and backend are both involved.
- If the bug is visible in the app but controlled by backend policy, split the analysis into:
  - frontend display/state issue
  - backend business rule issue


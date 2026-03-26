---
name: korion-cross-service-communication-contract
description: Use when working across offline_pay, coin_manage, foxya, coin_publish, coin_csms, and coin_front and you need the fixed aliases, canonical balance basis, workflow terminology, and sync expectations to stay consistent during discussion, design, or implementation.
---

# KORION Cross-Service Communication Contract

Use this skill when referring to the KORION platform repos by shorthand, when discussing canonical balances or offline-pay sync behavior, or when aligning workflow/saga terms across backend, admin, and frontend work.

## Repo aliases

- `오프페`
  - `offline_pay`
- `원장`
  - `coin_manage`
- `폭시`
  - `foxya_coin_service`
- `퍼블리셔`
  - `coin_publish`
- `관리브리지`
  - `coin_csms`
- `앱`
  - `coin_front`
- `ios브랜치`
  - `coin_front` `ios`
- `develop프론트`
  - `coin_front` `develop`

## Responsibility map

- `foxya`
  - user-visible total asset basis
  - history / projection owner
  - canonical `total KORI` snapshot source
- `coin_manage`
  - canonical ledger owner
  - `available`, `offline_pay_pending`, `withdraw_pending`
  - collateral lock/release, settlement, reverse posting
- `offline_pay`
  - offline snapshot, queue, saga orchestration
  - final consistency verdict after reconnect
- `coin_publish`
  - chain scan / publish / worker side effects
- `coin_csms`
  - admin bridge and summary surface
- `coin_front`
  - UI, local queue, local projection

## Canonical money terms

- `총 자산`
  - `foxya total KORI`
- `총담보금`
  - server-approved offline collateral total
- `추가 담보 전환 가능 금액`
  - `총 자산 - 총담보금`
- `오프라인 결제 가능 금액`
  - remaining spendable collateral after usage and local pending usage
- `락원장`
  - `coin_manage available / offline_pay_pending / withdraw_pending`

## Workflow aliases

- `로컬적재`
  - `LOCAL_QUEUED`
- `서버접수`
  - `SERVER_ACCEPTED`
- `정산접수`
  - `SETTLEMENT_ACCEPTED`
- `원장락완료`
  - `COLLATERAL_LOCKED`
- `담보해제완료`
  - `COLLATERAL_RELEASED`
- `원장반영완료`
  - `LEDGER_SYNCED`
- `히스토리반영완료`
  - `HISTORY_SYNCED`
- `실패`
  - `FAILED`
- `데드레터`
  - `DEAD_LETTERED`

## Saga aliases

- `접수`
  - `ACCEPTED`
- `처리중`
  - `PROCESSING`
- `부분적용`
  - `PARTIALLY_APPLIED`
- `완료`
  - `COMPLETED`
- `보상필요`
  - `COMPENSATION_REQUIRED`
- `보상중`
  - `COMPENSATING`
- `보상완료`
  - `COMPENSATED`

## Offline sync expectation

- Offline mode uses the last online `foxya total KORI` snapshot.
- `topup / release / send / receive` are stored in the local queue first.
- Online recovery uploads the queue to the server.
- `offline_pay -> coin_manage -> foxya` saga decides final consistency.
- Success is confirmed after server-side processing, not at local queue time.

## Online expectation

- Online requests should refresh server-confirmed values immediately.
- If `foxya total KORI` changes, `offline_pay` should refresh its snapshot as well.
- Event-driven refresh is preferred over long-lived stale polling when possible.

## Discussion examples

- `오프페 스냅샷 기준 다시 봐줘`
- `원장 락원장하고 폭시 총자산 gap 확인해줘`
- `퍼블리셔 워커 사가 상태 확인해줘`
- `앱 허브에서 총담보금/오프결제가용 문구 손봐줘`


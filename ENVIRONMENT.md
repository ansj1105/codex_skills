# .env Required Settings

`KORION KORI Backend` 환경변수 정의입니다.

## Core
| Key | Required (dev) | Required (prod) | Default | Description |
|---|---|---|---|---|
| `NODE_ENV` | No | Yes | `development` | 런타임 환경 (`development`, `test`, `production`) |
| `PORT` | No | Yes | `3000` | API 서버 포트 |
| `APP_PORT` | No | Yes | `3000` | Docker 호스트 바인딩 포트 (`APP_PORT:3000`) |
| `APP_BIND_ADDRESS` | No | Yes | `0.0.0.0` | Docker 앱 컨테이너 포트 바인딩 주소 |
| `LEDGER_PROVIDER` | No | Yes | `memory` | 로컬 앱 실행용 Ledger 저장소 선택 |
| `APP_LEDGER_PROVIDER` | No | Yes | `postgres` | Docker 앱 컨테이너용 Ledger 저장소 선택 |
| `TRON_GATEWAY_MODE` | No | Yes | `mock` | 로컬 앱 실행용 TRON 게이트웨이 모드 |
| `APP_TRON_GATEWAY_MODE` | No | Yes | `mock` | Docker 앱 컨테이너용 TRON 게이트웨이 모드 |
| `ALLOW_RUNTIME_PROFILE_SWITCHING` | No | No | `true` in dev, `false` in prod when unset | 로컬 앱에서 sandbox contract profile 전환 허용 여부 |
| `APP_ALLOW_RUNTIME_PROFILE_SWITCHING` | No | No | unset | Docker 앱 컨테이너에서 sandbox contract profile 전환 허용 여부 |
| `ALLOW_SANDBOX_DIRECT_ONCHAIN_SEND` | No | No | `true` in dev, `false` in prod when unset | 로컬 sandbox의 직접 on-chain hot wallet 전송 허용 여부 |
| `APP_ALLOW_SANDBOX_DIRECT_ONCHAIN_SEND` | No | No | unset | Docker 앱 컨테이너 sandbox의 직접 on-chain hot wallet 전송 허용 여부 |
| `ALLOW_MAINNET_SANDBOX_DIRECT_ONCHAIN_SEND` | No | No | `false` | 로컬 sandbox에서 mainnet 직접 전송 허용 여부 |
| `APP_ALLOW_MAINNET_SANDBOX_DIRECT_ONCHAIN_SEND` | No | No | unset | Docker 앱 컨테이너 sandbox에서 mainnet 직접 전송 허용 여부 |
| `WALLET_MONITOR_ENABLED` | No | No | `true` | 로컬 앱에서 지갑 모니터링 worker 활성화 여부 |
| `APP_WALLET_MONITOR_ENABLED` | No | No | `true` | Docker 앱 컨테이너에서 지갑 모니터링 worker 활성화 여부 |
| `WALLET_MONITOR_INTERVAL_SEC` | No | No | `20` | 로컬 앱 지갑 모니터링 수집 주기(초) |
| `APP_WALLET_MONITOR_INTERVAL_SEC` | No | No | `20` | Docker 앱 지갑 모니터링 수집 주기(초) |
| `WALLET_MONITOR_REQUEST_GAP_MS` | No | No | `1500` | 로컬 앱 지갑별 조회 간격(ms) |
| `APP_WALLET_MONITOR_REQUEST_GAP_MS` | No | No | `1500` | Docker 앱 지갑별 조회 간격(ms) |
| `JWT_SECRET` | No | Yes | `dev-only-secret-change-me` | 인증 토큰 서명 키 |

## TRON / Wallet
| Key | Required (dev) | Required (prod) | Default | Description |
|---|---|---|---|---|
| `TRON_API_URL` | No | Yes | `https://api.trongrid.io` | TRON 노드/게이트웨이 URL |
| `MAINNET_TRON_API_URL` | No | Recommended | `https://api.trongrid.io` | sandbox mainnet 탭과 mainnet preset이 사용하는 TRON 노드 URL |
| `TESTNET_TRON_API_URL` | No | Recommended | `https://nile.trongrid.io` | sandbox testnet 탭과 testnet preset이 사용하는 TRON 노드 URL |
| `TRON_API_KEY` | No | Recommended | empty | Trongrid/Tronscan 계열 API key. 설정 시 `TRON-PRO-API-KEY` 헤더로 전송. 지갑 모니터링과 TRC20 호출 모두에 사용 |
| `KORI_TOKEN_CONTRACT_ADDRESS` | No | Yes when `*_TRON_GATEWAY_MODE=trc20` | `TPKZnRjJngnxVgxw52pMPSrCp2wGm7iT9W` | KORI TRC20 컨트랙트 주소 (현재 예제는 테스트넷) |
| `MAINNET_KORI_TOKEN_CONTRACT_ADDRESS` | No | Recommended | `TBJZD8RwQ1JcQvEP9BTbPbgBCGxUjxSXnn` | 메인넷 KORI 컨트랙트 preset |
| `TESTNET_KORI_TOKEN_CONTRACT_ADDRESS` | No | Recommended | `TPKZnRjJngnxVgxw52pMPSrCp2wGm7iT9W` | 테스트넷 KORI 컨트랙트 preset |
| `TRON_FEE_LIMIT_SUN` | No | Yes | `100000000` | TRON 스마트컨트랙트 호출 feeLimit |
| `TREASURY_WALLET_ADDRESS` | No | Yes | `TSM7ocJQHigW9jhk5yFQKrUmBAXz2FFapa` | 재단(트레저리) 지갑 주소 |
| `DEPOSIT_WALLET_ADDRESSES` | No | Yes | `TWbuSkkRid1st9gSMy1NhpK1KwJMebHNwh,TLkgBr1vwpkdenM3LZq2hzb33TbCzBYDE3,TCFD5eZAXGdA8ud4ZH2Dt6cZdeGRFYSiaH,TMCUdq7BfaTRCdzUvYmuVoKnjZssYqnJ3s` | 입금 감지 대상 지갑 목록(콤마 구분) |
| `HOT_WALLET_ADDRESS` | No | Yes | `TYKL8DPoR99bccujHXxcyBewCV1NimdRc8` | 핫월렛 주소 |
| `HOT_WALLET_PRIVATE_KEY` | No | Yes | `dev-only-private-key-change-me` | 핫월렛 개인키 (로그 출력 금지) |

주의:
프로덕션에서는 placeholder 값(`replace-with-*`, `dev-only-*`)으로 기동되지 않도록 검증합니다.
`TRON_GATEWAY_MODE=trc20` 또는 `APP_TRON_GATEWAY_MODE=trc20`이면 `KORI_TOKEN_CONTRACT_ADDRESS`가 반드시 필요합니다.
현재 예제값은 테스트넷 기준이며, 운영 메인넷 주소는 별도로 관리해야 합니다.
`ALLOW_RUNTIME_PROFILE_SWITCHING=true` 또는 `APP_ALLOW_RUNTIME_PROFILE_SWITCHING=true`면 sandbox에서 mainnet/testnet/custom contract preset 전환이 가능합니다.
unset이면 기본값은 `development/test=true`, `production=false`입니다.
운영에서 이 기능을 열면 mainnet/testnet 전환 API가 노출되므로 관리자 접근 제어가 없는 현재 구조에서는 신중히 써야 합니다.
`ALLOW_SANDBOX_DIRECT_ONCHAIN_SEND=true`면 sandbox에서 핫월렛 직접 전송 API가 열립니다.
mainnet 직접 전송은 `ALLOW_MAINNET_SANDBOX_DIRECT_ONCHAIN_SEND=true`가 추가로 필요합니다.
지갑 모니터링은 백그라운드 worker가 주기적으로 수집해 DB에 저장하고, `/api/system/status`는 저장된 최신 스냅샷만 읽습니다.

## PostgreSQL / Flyway
| Key | Required (dev) | Required (prod) | Default | Description |
|---|---|---|---|---|
| `DB_HOST` | No | Yes | `127.0.0.1` | DB 호스트 |
| `DB_PORT` | No | Yes | `5432` | DB 포트 |
| `DB_HOST_PORT` | No | No | `15432` | Docker PostgreSQL 호스트 공개 포트 |
| `DB_BIND_ADDRESS` | No | Yes | `127.0.0.1` | Docker PostgreSQL 호스트 바인딩 주소 |
| `DB_NAME` | No | Yes | `korion` | DB 이름 |
| `DB_USER` | No | Yes | `korion` | DB 사용자 |
| `DB_PASSWORD` | No | Yes | `korion` | DB 비밀번호 |
| `DB_SCHEMA` | No | Yes | `public` | Flyway 대상 스키마 |

## Risk Control / Scheduler
| Key | Required (dev) | Required (prod) | Default | Description |
|---|---|---|---|---|
| `WITHDRAW_SINGLE_LIMIT_KORI` | No | Yes | `10000` | 1회 출금 한도 (KORI) |
| `WITHDRAW_DAILY_LIMIT_KORI` | No | Yes | `50000` | 1일 출금 누적 한도 (KORI) |
| `SCHEDULER_PENDING_TIMEOUT_SEC` | No | Yes | `60` | pending 재처리 기준 시간(초) |

## Example
```bash
cp .env.example .env
```

운영 권장:
- `APP_BIND_ADDRESS=0.0.0.0`
  - ALB 또는 reverse proxy가 EC2 인스턴스 포트로 접근해야 하는 경우
- `DB_BIND_ADDRESS=127.0.0.1`
  - PostgreSQL은 기본적으로 외부 공개하지 않음

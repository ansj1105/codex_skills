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
| `JWT_SECRET` | No | Yes | `dev-only-secret-change-me` | 인증 토큰 서명 키 |

## TRON / Wallet
| Key | Required (dev) | Required (prod) | Default | Description |
|---|---|---|---|---|
| `TRON_API_URL` | No | Yes | `https://api.trongrid.io` | TRON 노드/게이트웨이 URL |
| `TRON_API_KEY` | No | Recommended | empty | Trongrid/Tronscan 계열 API key. 설정 시 `TRON-PRO-API-KEY` 헤더로 전송 |
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
로컬 `sandbox`에서는 mainnet/testnet/custom contract preset 전환이 가능합니다. 다만 프로덕션 런타임에서는 hot swap을 막습니다.

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

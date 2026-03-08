# KORION KORI Backend (Node.js)

`개발.md` 기반으로 만든 KORI 입금/내부원장/출금 백엔드 스캐폴드입니다.

## 아키텍처 (Clean Architecture)
- `src/domain`: 도메인 규칙, 에러, 값 객체
- `src/application`: 유스케이스 서비스 + 포트 인터페이스
- `src/container`: 의존성 조립, factory/container
- `src/infrastructure`: 인메모리 Ledger, TRON 게이트웨이, 이벤트 퍼블리셔
- `src/interfaces`: HTTP 라우트/미들웨어
- `src/app.ts`: Express 앱 조립

프로젝트 기능 정의서는 [DEVELOPMENT_FUNCTION_SPEC.md](/Users/an/work/coin_manage/DEVELOPMENT_FUNCTION_SPEC.md) 참고.

## 포함된 코어 기능
- Deposit Core: 입금 감지 반영 + `txHash` idempotency
- Wallet Core: 잔액 조회, 내부 이체
- Withdraw Core: 출금 요청/승인/브로드캐스트/확정
- Risk Control: 1회/1일 출금 한도
- Scheduler: pending 재처리, broadcast 상태 reconcile
- 주소 필터: 지정된 재단/입금/핫 지갑 주소로만 입금 반영

## 빠른 시작
```bash
npm install
cp .env.example .env
npm run dev
```

## Flyway + PostgreSQL
```bash
npm run db:up
npm run db:migrate
npm run db:info
```

Rollback SQL은 `flyway/rollback/V1__init_korion_schema.down.sql`에 포함되어 있습니다.

## Docker Compose (EC2 권장)
한 번에 `DB -> Flyway migrate -> App` 순으로 구동:
```bash
cp .env.example .env
npm run stack:up
```

EC2 운영 가이드는 [EC2_DEPLOYMENT.md](/Users/an/work/coin_manage/EC2_DEPLOYMENT.md) 참고.

`3000` 포트가 이미 사용 중이면 `.env`에서 `APP_PORT`를 다른 값으로 변경:
```env
APP_PORT=3001
```

운영 배포에서 PostgreSQL은 기본적으로 `127.0.0.1`에만 바인딩됩니다:
```env
DB_BIND_ADDRESS=127.0.0.1
```

실제 DB 영속화를 사용하려면:
```env
APP_LEDGER_PROVIDER=postgres
```

실제 TRC20 송금을 사용하려면:
```env
APP_TRON_GATEWAY_MODE=trc20
KORI_TOKEN_CONTRACT_ADDRESS=TPKZnRjJngnxVgxw52pMPSrCp2wGm7iT9W
```

위 값은 현재 전달받은 `테스트넷` 컨트랙트 주소 기준입니다. 메인넷 운영값은 별도로 분리해야 합니다.

상태/로그:
```bash
docker compose ps
npm run stack:logs
```

중지:
```bash
npm run stack:down
```

## API
- `POST /api/deposits/scan`
- `GET /api/system/status`
- `GET /api/wallets/:userId/balance`
- `POST /api/wallets/transfer`
- `POST /api/withdrawals`
- `POST /api/withdrawals/:withdrawalId/approve`
- `POST /api/withdrawals/:withdrawalId/broadcast`
- `POST /api/withdrawals/:withdrawalId/confirm`
- `GET /api/withdrawals/:withdrawalId`
- `POST /api/scheduler/retry-pending`

상세 계약은 `openapi.yaml` 참고.

## Local Sandbox
브라우저에서 전체 흐름을 바로 점검하려면:
```bash
npm run dev
```

열기:
```text
http://localhost:3000/sandbox/
```

포함 항목:
- runtime / wallet config 확인
- balance 조회
- deposit scan
- internal transfer
- withdrawal request / approve / broadcast / confirm
- scheduler retry

## 테스트
```bash
npm test
npm run build
```

## 현재 런타임 범위
- Docker 기준으로 앱까지 원커맨드 기동됨.
- DB 마이그레이션은 Flyway로 적용됨.
- `APP_LEDGER_PROVIDER=postgres`를 사용하면 앱이 PostgreSQL 기반 Ledger를 사용합니다.
- `APP_TRON_GATEWAY_MODE=trc20`는 구현되어 있고 테스트넷 컨트랙트 주소는 반영됐습니다.
- 메인넷 운영 송금 검증은 별도 컨트랙트 주소와 실환경 검증이 필요합니다.

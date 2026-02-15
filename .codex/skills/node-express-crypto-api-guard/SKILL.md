---
name: node-express-crypto-api-guard
description: Safeguard Node Express crypto API services using web3 ethers tronweb mysql redis and worker jobs. Use when wallet transfer signing auth queue or transaction endpoints are added changed or failing in production-like flows.
---

# Node Express Crypto API Guard

## Workflow
1. Map risk surface.
List impacted endpoints, chain integrations, DB writes, and background jobs.
2. Validate secret and key boundaries.
Ensure private keys, mnemonics, and JWT secrets are environment-backed and never logged.
3. Enforce request and response contracts.
Add input validation, consistent error schemas, and idempotency keys for transfer-like actions.
4. Harden transactional flow.
Wrap balance updates and ledger inserts in DB transactions.
Add retry strategy only for safe idempotent operations.
5. Verify with focused tests.
Run route-level tests for success, duplicate, invalid signature, and timeout paths.

## Output Contract
Always include:
- Security-sensitive paths touched.
- Validation and idempotency changes.
- Transaction consistency guarantees.
- Verification commands and results.
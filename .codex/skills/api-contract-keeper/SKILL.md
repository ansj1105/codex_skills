---
name: api-contract-keeper
description: Enforce API contract safety whenever endpoints change. Use when adding or modifying API routes, request response schemas, DTOs, validators, or integration behavior that must stay aligned with OpenAPI and contract tests.
---

# API Contract Keeper

## Workflow
1. Identify contract impact.
List affected endpoints, methods, payload fields, and error shapes.
2. Update source of truth.
Update OpenAPI schema first.
Keep examples and enum values synchronized with implementation.
3. Align server implementation.
Update DTOs, validators, and serialization logic to match the spec.
4. Align tests.
Add or update contract tests for success and failure cases.
Add regression tests for backward compatibility where needed.
5. Verify and publish.
Run API tests and contract checks.
Produce a concise changelog entry for consumers.

## Output Contract
Always report:
- OpenAPI paths and components changed.
- DTO validator test files updated.
- Breaking change status and migration notes.
- Exact verification commands executed.

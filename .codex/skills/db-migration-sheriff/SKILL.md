---
name: db-migration-sheriff
description: Safeguard database schema changes through disciplined migration workflows. Use when tables columns indexes constraints or data backfills change, and when rollback safety lock risk or downtime must be evaluated before deploy.
---

# DB Migration Sheriff

## Workflow
1. Define schema delta.
Specify exact create alter drop operations and affected services.
2. Generate migration pair.
Create forward and rollback migrations together.
Keep migration names timestamped and purpose-specific.
3. Evaluate runtime risk.
Assess table lock risk, index build strategy, and backfill batching.
Plan for long-running operations with phased rollout.
4. Validate on realistic data.
Run migration up and down in staging-like conditions.
Measure execution time and check query plans where relevant.
5. Release guardrails.
Document deploy order, feature flags, and recovery procedure.

## Output Contract
Always include:
- Up and down migration paths.
- Lock and performance risk assessment.
- Rollback trigger conditions.
- Verification commands and observed timings.

---
name: coin-delivery-rules
description: Apply shared delivery rules for coin frontend and backend work. Use when updating branch propagation, frontend platform separation, backend QueryBuilder usage, API contract docs, Swagger synchronization, tests, or verification discipline across coin service repositories.
---

# Coin Delivery Rules

Use this skill when the task touches shared team working rules rather than one product feature.

## Backend rules

- Prefer repository `QueryBuilder` helpers over raw SQL when the query fits the existing builder model.
- Prefer typed operators such as `Op.Equal`, `Op.GreaterThan`, `Op.GreaterThanOrEqual`, `Op.LessThan`, and `Op.LessThanOrEqual`.
- If the builder is missing a safe primitive needed by the repository layer, extend the builder first and then use it.
- Add or update tests for backend behavior changes. Use the narrowest test that proves the regression fix or contract.
- Run compile plus targeted tests before closing backend work.
- If request or response shapes change, update `openapi.yaml` in the same task and keep Swagger output aligned with the implementation.
- For balance, ledger, or accounting changes, verify with concrete data or reconciliation queries, not code inspection alone.

## Frontend rules

- Treat the existing codebase as the source of truth for CSS, component structure, tokens, and interaction patterns.
- Do not introduce styling or layout conventions that conflict with the current repository patterns.
- `develop` is the baseline for shared admin or AOS-facing frontend work unless the user says otherwise.
- `ios` is reserved for iOS-responsibility work. Do not mix `develop` and `ios` changes casually because CSS, SDK setup, and platform behavior can diverge.
- If a frontend fix must exist on both branches, implement from the correct source branch first and propagate deliberately.
- After frontend changes, run the smallest meaningful verification step such as build, targeted test, or lint for the touched surface.

## Delivery discipline

- Keep environment-specific repository paths, personal SSH commands, and workstation-only notes out of shared public skills.
- Sync reusable rules and workflows to shared skills, but keep machine-specific routing in local memories or local-only docs.
- When a schema change is introduced in an app repo, mirror the migration into the Flyway source-of-truth repo if that repository is part of the team workflow.

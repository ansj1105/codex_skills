---
name: task-intent-broadscan
description: Widen scope before acting and resolve user intent from the full repo and task context. Use when the request could affect multiple repos, branches, environments, contracts, or deployment paths and you need to understand the user's actual goal before editing.
---

# Task Intent Broadscan

Use this skill before making changes when a task risks being interpreted too narrowly.

## Goals

- Understand what the user is actually asking for, not just the most recent sentence.
- Inspect the wider repo, branch, environment, and deployment context before editing.
- Separate:
  - what is explicitly requested
  - what is implied by system behavior
  - what is out of scope

## Workflow

1. Restate the task in operational terms.
   - Convert user wording into concrete checks, code paths, data paths, and delivery steps.
   - Note any ambiguous words such as `backend`, `frontend`, `deploy`, `same`, `sync`, `total`, or `balance`.

2. Widen the search before changing code.
   - Identify the likely repositories involved.
   - Check branch expectations.
   - Check whether the task has runtime, DB, API contract, or deployment implications.
   - Search for adjacent code paths, not just the first matching file.

3. Confirm the source of truth.
   - Determine whether the behavior comes from:
     - backend response
     - frontend calculation
     - DB state
     - worker or scheduler side effects
     - environment-specific config
   - Prefer proving this with code and data rather than inference.

4. State the impact surface before editing.
   - List the minimal affected areas:
     - repo(s)
     - tables or migrations
     - API or OpenAPI
     - tests
     - branches to propagate
     - deploy targets if any

5. Only then implement.
   - Fix root cause before patching presentation when the issue is data-integrity or contract-related.
   - If a display bug is caused by backend inconsistency, fix the backend write path and plan reconciliation if needed.

6. Verify broadly.
   - Compile or build the touched repo.
   - Run the narrowest meaningful tests.
   - Run one or more concrete validation queries or runtime checks for data-affecting work.
   - Re-check whether another repo needs a mirrored migration or propagation.

## Output discipline

- Call out assumptions explicitly.
- If you are excluding something, say why.
- Do not treat the first discovered code path as the whole system.
- Do not start editing before mapping the likely full impact surface.

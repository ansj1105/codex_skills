---
name: docker-compose-stack-doctor
description: Diagnose and stabilize Docker Compose stacks across local and server environments. Use when services fail to start, containers cannot connect, env variables are missing, volumes break, or network naming conflicts appear across multiple projects.
---

# Docker Compose Stack Doctor

## Workflow
1. Normalize Compose inputs.
Run `docker compose config` and inspect merged output.
2. Check service readiness assumptions.
Verify healthchecks, `depends_on` conditions, and startup order.
3. Validate network and port plan.
Detect host port collisions and external network name mismatches.
4. Validate data and config mounts.
Check bind mount paths, permission issues, and missing host files.
5. Confirm recovery path.
Define commands for clean restart, selective rebuild, and log triage.

## Output Contract
Always provide:
- Broken service and exact failure signal.
- Minimal compose or env fixes.
- Safe restart sequence.
- Preventive checks for future changes.
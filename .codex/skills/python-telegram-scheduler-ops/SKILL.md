---
name: python-telegram-scheduler-ops
description: Build and operate Python Telegram scheduler bots with predictable timing and safe message delivery. Use when implementing python-telegram-bot schedule loops, job retries, timezone logic, and deployment reliability for recurring notifications.
---

# Python Telegram Scheduler Ops

## Workflow
1. Validate scheduler model.
Clarify job source, interval or cron rules, and timezone handling.
2. Protect bot interaction layer.
Validate chat targets, command permissions, and token loading via environment.
3. Make job execution reliable.
Wrap job tasks with retry backoff and exception isolation to avoid scheduler death.
4. Control duplicates and drift.
Use persistent state or markers to prevent duplicate sends after restart.
5. Verify operational visibility.
Add structured logs for job start, skip, success, and failure counts.

## Output Contract
Always provide:
- Job timing model and timezone assumptions.
- Retry and deduplication strategy.
- Failure handling behavior.
- Run command and smoke-test result.
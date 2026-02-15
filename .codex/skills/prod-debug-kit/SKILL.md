---
name: prod-debug-kit
description: Triage and stabilize production incidents with a repeatable debugging kit. Use when errors latency spikes memory leaks or intermittent failures appear, and when quick containment plus root-cause analysis are both required.
---

# Prod Debug Kit

## Workflow
1. Stabilize first.
Define blast radius and immediate containment steps.
Prefer reversible mitigations such as feature flags, rate limiting, or temporary fail-open paths.
2. Build a minimal repro.
Correlate logs, metrics, and traces by request ID and time window.
Reduce to the smallest reproducible path.
3. Isolate root cause.
Check dependency health, resource saturation, retries timeouts, and recent deploy changes.
Form and test one hypothesis at a time.
4. Implement durable fix.
Apply minimal-risk code or config change.
Add guards such as circuit breaker, bounded retries, or idempotency protections.
5. Verify and prevent recurrence.
Confirm error rate and latency recovery.
Add alert tuning and targeted regression tests.

## Output Contract
Always provide:
- Incident timeline with concrete timestamps.
- Containment action and business impact.
- Root cause with evidence links.
- Follow-up prevention tasks.

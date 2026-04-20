---
name: korean-incident-rca-evidence-style
description: Write Korean incident RCA and tech-spec markdown with strict evidence discipline. Use when analyzing logs, DB waits, websocket or eventbus failures, or mixed infra and app incidents that require exact timestamps, count-based summaries, confirmed-vs-inferred wording, and report-safe root-cause statements.
---

# Korean Incident RCA Evidence Style

Use this skill when writing Korean 장애 분석, RCA, 장애보고, or incident tech-spec documents where the user expects exact evidence, tight wording, and minimal speculation.

## Core goals

- Prefer `확인된 사실` over explanation.
- Separate `직접 근거`, `판단`, `미확인` explicitly.
- Use exact time windows with timezone labels.
- Tie every root-cause sentence back to log lines, SQL, waits, or code paths.
- Avoid vague wording that weakens review quality.

## Default structure

Prefer this order unless the user asks otherwise:

1. `장애 개요`
2. `타임테이블`
3. `직접 근거`
4. `원인 판단`
5. `영향도`
6. `조치 내용`
7. `확인 범위와 한계`
8. `결론`

If the issue spans multiple subsystems, split evidence by layer:

- `DB`
- `HTTP 서버`
- `WebSocket 서버`
- `EventBus / downstream`
- `배치 / 스케줄러`

## Writing rules

- Use short factual bullets before narrative explanation.
- Put timestamps in absolute form. Prefer:
	- `2026-04-17 21:59:16 KST`
	- if needed, also include UTC pair
- When counting symptoms, use tables.
- If two times differ between user report and logs, state both.
	- Example: `사용자 인지 시각은 02:20, 로그상 첫 실패는 02:13:30 KST`
- If a statement is observed, write it as observed.
	- `발생했다`
	- not `발생할 수 있었다`
- If a statement is interpretation, mark it.
	- `...로 해석할 수 있다`
	- `...로 판단된다`
- If the evidence is missing, say so directly.
	- `현재 로그만으로는 확정 불가`
	- `당시 pg_locks 스냅샷이 없어 lock chain은 확정할 수 없음`

## Evidence-strength rules

Use these tiers consistently:

- `확인됨`
	- direct logs, DB waits, SQL, code path, or exact rows
- `강하게 의심됨`
	- multiple sources align, but one missing direct artifact remains
- `가능성 있음`
	- plausible but not strong enough for report mainline
- `근거 부족`
	- do not promote to root cause

Do not mix these levels in one sentence.

## Cause wording rules

- Prefer:
	- `row-level lock 대기`
	- `transactionid lock 대기`
	- `Vert.x event loop 처리 지연`
	- `websocket 재연결 churn`
	- `DataTransfer validator 불일치`
- Avoid vague or overclaiming phrases:
	- `조합`
	- `스파이크`
	- `eventbus block`
	- `서버가 죽음`
unless directly proven

If a stronger phrase is tempting, downgrade it unless you have direct proof.

Examples:

- Good:
	- `HTTP 서버의 tardis.* request timeout과 웹소켓 서버의 blocked thread 경고가 시간상 직접 맞물린다.`
- Too strong:
	- `eventbus가 블락되어 서버가 죽었다.`

## Time-correlation rules

When correlating sources, use explicit anchors:

- `첫 실패 시각`
- `같은 분 단위 동시 발생`
- `선행 정황`
- `후속 증상`

If two layers must be linked, show the chain:

1. HTTP timeout first seen at `...`
2. WebSocket blocked-thread or reconnect storm seen at `...`
3. Code path shows HTTP `request(serverId)` and WebSocket `consumer(serverId)`
4. Therefore the timeout is time-aligned with the websocket-side delay

## Count-summary rules

When many symptoms exist, summarize them in a compact table:

| 항목 | 건수 | 해석 |
|---|---:|---|
| `RemoteStartTransaction` | 1360 | 요청 자체는 많이 들어옴 |
| `30초 timeout` | 515 | downstream 또는 consumer 응답 지연 |

Rules:

- Keep one interpretation per row.
- Do not hide uncertainty inside the table.
- If counts come from logs only, say `로그 raw count 기준`.

## DB incident rules

When the issue involves DB waits:

- state the dominant wait types first
- then the top SQL
- then the safest interpretation

Pattern:

- `Performance Insights 기준 총 DB Load는 ...`
- `대기 유형은 Lock:tuple ..., Lock:transactionid ...`
- `상위 SQL은 UPDATE chargers ..., UPDATE mmny_chrgr_elctc ..., COMMIT`
- `따라서 동일 row를 갱신하는 트랜잭션이 겹치며 lock 대기가 누적된 것으로 해석할 수 있다`

Do not claim exact blocking rows unless you have:

- `pg_stat_activity`
- `pg_locks`
- `pg_blocking_pids`

for the same time window.

## WebSocket and EventBus rules

Separate these carefully:

- `연결 성공`
- `메시지 처리 성공`
- `consumer reply 성공`
- `charger 응답 성공`

Do not equate connection success with business success.

If HTTP logs show `Timed out after waiting 30000(ms) for a reply` and code shows websocket consumer should `reply()` immediately:

- safe wording:
	- `charger 응답 이전 단계에서 websocket consumer 또는 event loop 처리 지연이 있었을 가능성이 높다`
- safer for reports:
	- `websocket server consumer path와 시간상 직접 맞물린다`

Avoid:

- `eventbus 자체 장애 확정`

unless websocket logs or metrics prove it.

## User-specific collaboration rules learned from repeated review

- The user will reject speculation quickly. Tighten every statement to source-backed wording.
- If a statement changed after new evidence, correct it plainly.
	- `이전 판단은 과했고, 현재 로그 기준으로는 ...가 맞다`
- If a process kill was attempted but PID had already disappeared, write exactly that.
	- `종료를 시도했으나 시점상 이미 PID가 소멸된 상태였다`
- If overall service impact existed but direct lock proof is limited to one table, write both:
	- `직접 확인된 락 대상`
	- `동일 instance 자원 공유에 따른 전체 영향 가능성`
- If the user asks for a compact report, collapse repeated evidence into:
	- `직접 원인`
	- `동반 증상`
	- `근거`

## Review checklist

Before finishing, verify:

1. Every root-cause sentence points to a source type.
2. All key times are absolute and timezone-safe.
3. `확인된 사실` and `판단` are not blurred.
4. Counts are labeled as log count, SQL count, or DB row count.
5. Phrases like `block`, `죽음`, `전부`, `확정` are only used when directly supported.

---
name: ocpp-pseudocode-writer
description: Write OCPP flow and design documents as standardized Korean pseudocode with hierarchical numbering and fixed sentence tone. Use when converting code, sequence logic, logs, or API flow descriptions into a readable step-by-step document that must enforce the exact function-call phrasing.
---

# OCPP Pseudocode Writer

## Goal
Convert implementation flow into readable sentence-based pseudocode, not line-by-line source code.
Keep function-call sentences in one fixed tone across the document.

## Format Rules
1. Use hierarchical numbering.
Use `1.`, `1.1`, `1.1.1` consistently.
2. Use fixed sentence tone by line type.
Variable declaration: `String 변수 A 에 B 값을 할당`
Function call: `입력값(인자) 변수로 대상함수(...) 함수 호출`
Log output: `X 변수로 log.info(...) 함수 호출`
Branch: `if ... 이면:`, `else 이면:`

## Function Call Rule
1. Never use standalone `실행` or `호출`.
2. Always use this fixed pattern.
`입력값(인자) 변수로 대상함수(...) 함수 호출`
3. Keep every function-call line ending with `함수 호출`.

## Conversion Examples
1. Input
`resetChargerWebSocketTimer(webSocket, chargerId, textHandlerId) 실행`
1.1 Output
`webSocket, chargerId, textHandlerId 변수로 resetChargerWebSocketTimer(...) 함수 호출`
2. Input
`message.reply("[proxy] failed : ...") 실행`
2.1 Output
`"[proxy] failed : ..." 문자열 변수로 message.reply(...) 함수 호출`

## Checklist
1. Does every function line include `변수로`?
2. Does every function line end with `함수 호출`?
3. Is numbering consistent as `1 -> 1.1 -> 1.1.1`?
4. Are standalone `실행` and `호출` removed?

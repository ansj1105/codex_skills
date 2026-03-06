---
name: obsidian-techspec-style
description: Apply the established Korean tech-spec document structure, tone, and markdown formatting used in this repository (especially OCPP websocket architecture docs). Use when creating or refactoring sectioned markdown specs, aligning tab-indented bullets and pseudocode blocks, moving function-role explanations into proper subsection levels, and rewriting abstract wording into code-grounded statements.
---

# Obsidian Techspec Style

## Overview

Refactor tech-spec markdown to match this repository's style.
Preserve existing section numbering and intent while making wording concrete, code-grounded, and review-safe.

## Workflow

1. Identify the target section and its sibling structure first.
2. Keep parent sections concise: `목적`, `흐름 요약`, `작성요약`.
3. Move detailed function explanations to child sections (`x.y.z`) as `주요 함수 역할`.
4. Separate `구현 내용` and `구현 의도`.
5. Verify indentation/code-fence stability before finishing.

## Writing Rules

- Use concise Korean technical prose.
- Prefer concrete behavior over abstract terms.
- Explain why with code-path facts, not assumptions.
- On first use, define protocol terms that can be unclear (`consumer`, `request/reply`, `send`).
- Avoid vague nouns such as `편차`, `수치 제약`, `단일 책임` without concrete context.
- Avoid wording that implies facts not validated in code.

## Structure Rules

- Keep parent section (`2.1.2`, `2.1.3`, `2.1.4`, `2.2`, `2.3`) light:
	- Keep: 목적, 흐름 요약, 작성요약.
	- Remove duplicated `주요 개념/함수 역할` if child sections already have it.
	- Add: `함수별 상세 역할은 x.y.z ~ ...에서 설명` when needed.
- Child section (`x.y.z`) pattern:
	- `구현 위치`
	- `주요 함수 역할`
	- `구현 내용`
	- `동작 기준` (if needed)
	- `구현 의도`
	- `시퀀스 다이어그램` (if needed)
	- `수도 코드 (Pseudocode)`
- For `기술적 결정 이유`, merge overlapping bullets and avoid duplicated “적용 내용/적용 이유” blocks.

## Function-Role Placement Rule

- Do not leave only execution results.
- Always add one-line function intent where the reader needs it:
	- Example: `eventBus.send("proxy.to.service", CONNECTION_CLOSE)` -> “서비스 측에 연결 종료 사실을 단방향 전달”.
	- Example: `closeConnection(...)` -> “종료 시 공통 정리 함수와 이벤트 전파를 한 순서로 실행”.

## Pseudocode and Diagram Rules

- Use the exact label: `수도 코드 (Pseudocode)`.
- Keep opening and closing code fences aligned at the same indentation level.
- Use `text` fence for pseudocode.
- Place sequence diagram before pseudocode when it improves branching/timing understanding.
- Do not add “시퀀스 다이어그램 적용 이유” section unless explicitly requested; put rationale in nearby `구현 내용` if needed.

## Markdown Formatting Rules

- Use tabs for list indentation to match repository style.
- Preserve heading hierarchy and numbering.
- Keep existing section IDs and filenames unchanged unless asked.
- Avoid accidental code-block swallowing; verify adjacent bullets remain outside fences.

## Consistency Checks

Before finalizing, confirm:
1. Parent sections do not duplicate function-role details that already exist in child sections.
2. Each child section has enough role-level explanation to understand why each function exists.
3. `구현 의도` statements are intent-level, not step-by-step implementation traces.
4. EventBus terms have first-use explanations in that section.
5. Pseudocode blocks render correctly and indentation is stable.

## Output Expectation

Produce edits that reviewers can validate against code quickly:
- direct wording,
- explicit function responsibility,
- minimal ambiguity,
- stable markdown structure.

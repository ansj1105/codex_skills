---
name: obsidian-techspec-style
description: Refactor Korean Obsidian tech-spec markdown into a review-friendly bullet style. Use when aligning sectioned specs to implementation items, fixing heading and indent stability, replacing narrative wording with code-grounded bullets, documenting DTO or API changes, or mapping design and implementation sections 1:1.
---

# Obsidian Techspec Style

Use this skill when editing Korean Obsidian tech-spec documents that need stable markdown rendering, code-grounded wording, and implementation-review readability.

## Core goals

- Keep the document easy to scan in Obsidian.
- Prefer implementation-grounded statements over abstract explanation.
- Make `개발 항목` and `구현 상세` map 1:1 when possible.
- Remove stale or duplicated structure if newer sections already cover the same work.

## Writing rules

- Prefer bullet style over narrative prose.
- Avoid `한다`, `했다` style explanations when a noun phrase or short factual line is enough.
- Keep each item role-first: the reader should understand what changed by reading the first line.
- Avoid dumping raw code unless the code itself adds review value.
- If code-like explanation is needed, prefer short pseudocode or numbered flow over large snippets.

## DTO rules

- For new DTOs, prefer:
	- `목적`
	- `구조`
	- `필드`
	- `buildQuery` / `checkValidation` / `toMap` 역할 when relevant
- For modified DTOs, prefer:
	- `목적`
	- `구조`
	- `수정 내용`
	- changed-field-only explanation
- Do not describe unchanged fields as if they were newly added.
- If `toMap` or `buildQuery` is documented, use numbered conditional style:

```text
1. if ...
1.1 ...
2. if ...
2.1 ...
```

- If a setter exists but is never called in service logic, do not justify it as a required post-processing path without verifying usage.

## Entity rules

- For new entities, keep:
	- `목적`
	- `구조`
	- `역할`
	- `필드`
- For modified entities, describe only changed fields and changed role.
- Do not list every field of large existing entities unless the task truly changed them.

## API rules

- Put a human-readable API title first, then endpoint details.
- Recommended order:
	- `목적`
	- `API endpoint`
	- `권한`
	- `요청 파라미터`
	- `응답 필드`
	- `구현 상세`
- Inside `구현 상세`, prefer:
	- `동작 순서`
	- `Handler`
	- `Service`
	- `Repository`
- In `동작 순서`, use numbered steps and short responsibility labels:

```text
1. hasRole(...) : 권한 확인
2. ...Validation(...) : 요청 검증
3. Handler : 요청 수신, Service 호출
4. Service : 흐름 제어
5. Repository : DB 조회/저장
```

- `주요 코드`보다 `주요 함수 기능` 또는 함수별 `입력` / `동작` 설명을 우선한다.
- For `Repository / Query`, explain intent, not just SQL fragments. If the exact function matters, name the repository function explicitly.

## Function documentation rules

- For common handler or repository functions, prefer:
	- `구현 위치`
	- `입력`
	- `동작`
- When documenting function internals, prefer numbered step flow over prose.
- If a function delegates directly, keep it short. Do not invent complexity.
- If a helper function changes the meaning of saved data, document it explicitly.
	- Example: `getMappedRegionGroupId(...)` deciding whether to save `id` or `parentGroupId`.

## Technical design rules

- Keep design sections in the same bullet tone as implementation sections.
- Preserve explanatory sections the user wants retained, even if they are not yet implemented.
- For architecture or schema sections, separate:
	- current problem
	- design direction
	- current implementation coverage
- When discussing prefixes, depths, or mapping rules, define them concretely with field names and examples.

## Markdown rules

- Preserve heading numbering and keep sibling sections structurally aligned.
- Keep indentation stable for Obsidian rendering.
- Verify code fences do not swallow adjacent bullets.
- Remove duplicated template blocks or stale copied sections after refactors.

## Review checklist

Before finishing, verify:

1. `개발 항목 정리` maps cleanly to the current implementation sections.
2. Old copied text does not contradict current code.
3. DTO and Entity sections distinguish added fields from existing fields.
4. API sections mention the actual repository or service function names when that matters.
5. Documented helper logic matches the current branch, not a guessed future implementation.

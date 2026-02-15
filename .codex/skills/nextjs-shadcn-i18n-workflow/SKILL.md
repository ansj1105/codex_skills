---
name: nextjs-shadcn-i18n-workflow
description: Implement and maintain Next.js App Router projects using Tailwind component systems and i18n routing. Use when building or refactoring UI flows with Radix style components, locale-aware content, and production build lint routing consistency checks.
---

# Nextjs Shadcn I18n Workflow

## Workflow
1. Confirm route and locale model.
Document App Router segments, locale prefixes, and default fallback behavior.
2. Implement UI with shared primitives.
Prefer shared components and variant patterns over page-local custom markup.
3. Keep i18n contract strict.
Require translation keys for all user-facing text and ensure locale file parity.
4. Validate build and runtime.
Run `npm run lint` and `npm run build`.
Check locale switch navigation and SSR hydration consistency.
5. Guard against regressions.
Add tests for locale routing, missing key fallback, and critical interactive flows.

## Output Contract
Always include:
- Routes and locales touched.
- New translation keys and files updated.
- Build or lint verification status.
- UI consistency and accessibility notes.
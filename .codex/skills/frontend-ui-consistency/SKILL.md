---
name: frontend-ui-consistency
description: Enforce consistent frontend UI architecture and design-system usage. Use when adding or refactoring components, defining naming and state patterns, applying accessibility requirements, or introducing snapshot and UI regression tests.
---

# Frontend UI Consistency

## Workflow
1. Align with system rules.
Apply project folder structure, naming conventions, and component boundaries.
Prefer shared design tokens over one-off inline styles.
2. Standardize interaction patterns.
Use consistent form handling, loading states, empty states, and error states.
Keep state ownership predictable and avoid duplicated state.
3. Validate accessibility.
Check semantic elements, focus order, keyboard navigation, labels, and contrast.
4. Validate visual consistency.
Ensure spacing typography and color usage match design tokens.
Review responsive behavior for mobile and desktop.
5. Protect with tests.
Add snapshot or visual regression tests for critical components.
Add behavioral tests for interactive flows.

## Output Contract
Always provide:
- Components affected and convention decisions.
- Accessibility checks passed and remaining gaps.
- Test coverage added for UI stability.
- Any design-system token additions or changes.

---
name: frontend-performance-budget
description: Keep frontend performance within explicit budgets and prevent regressions. Use when bundle size grows, Lighthouse scores drop, runtime rendering is slow, or code splitting and asset optimization decisions are needed.
---

# Frontend Performance Budget

## Workflow
1. Baseline current performance.
Run production build and capture bundle outputs.
Collect Lighthouse or Web Vitals measurements for key pages.
2. Compare against budgets.
Check JS CSS image budgets and initial page weight thresholds.
Flag regressions by route and entry chunk.
3. Apply targeted optimizations.
Use route-level code splitting and lazy loading.
Remove dead dependencies and optimize images and fonts.
Memoize expensive renders only after profiling.
4. Re-measure.
Run the same metrics after changes.
Confirm budget compliance and no user-visible regressions.
5. Lock in protections.
Add CI checks for bundle size and critical page performance.

## Output Contract
Always include:
- Before and after bundle and metric values.
- Files or chunks driving regressions.
- Optimization changes made and expected impact.
- CI budget rules to enforce.

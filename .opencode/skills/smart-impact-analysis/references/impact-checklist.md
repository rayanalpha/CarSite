# Impact Analysis Quick Checklist

## Rigor Level
- [ ] Rigor level selected: 🟢 🟡 🔴
- [ ] If 🟢: skip to implementation, run `npm run build`
- [ ] If 🟡: dep graph + edge cases + build/typecheck/lint
- [ ] If 🔴: full SIAS

## Pre-Change
- [ ] Dependency graph built (actual grep commands run)
- [ ] Interface contracts audited
- [ ] SEO & rendering impact checked (1.2.1)
- [ ] State space enumerated (all 9 states)
- [ ] Performance baseline captured from build output
- [ ] Breaking changes identified
- [ ] Rendering mode (SSR/SSG/ISR) confirmed unchanged (or intentional)

## Planning
- [ ] Change decomposed into atomic steps
- [ ] Regression risk matrix created
- [ ] Safe execution contract declared and shown to user

## Implementation
- [ ] Every conditional has a test case
- [ ] All state variables initialized
- [ ] All async ops have error handling
- [ ] All new props are optional (unless guaranteed)
- [ ] No `as` casts, no `any`, no `@ts-ignore`
- [ ] No N+1 queries
- [ ] No unnecessary re-renders
- [ ] Bundle size within limits
- [ ] Meta tags / SEO preserved

## Verification (all AUTO-EXECUTED)
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero new warnings
- [ ] All 15 edge cases checked
- [ ] Rendered HTML checked for correct meta tags (if SEO change)
- [ ] Light + dark mode tested (if UI change)
- [ ] Mobile + desktop tested (if UI change)
- [ ] Performance compared (build output before/after)
- [ ] Console has no new errors/warnings

---
name: smart-impact-analysis
description: |
  Ultra-intelligent change planning and impact analysis system. Before any code modification,
  traces every line's cross-module dependencies, enumerates all edge cases and system states,
  predicts performance and regression risk, and produces a provably-safe execution plan.
  Use before implementing any feature, refactor, or bug fix. Use when you need to understand
  how a change ripples through the entire codebase before writing a single line.
---

# Smart Impact Analysis System (SIAS)

## Philosophy

Every line of code you write touches more than the file it lives in. SIAS exists to
make those invisible connections visible *before* you change anything. No guesswork.
No "we'll fix it later." Every change is planned, traced, and verified.

**Core principle:** If you cannot predict the full impact of a change, you are not
ready to make it. If you cannot enumerate every edge case, you have not designed it.

---

## Rigor Level Selection

Not every change needs the full treatment. **You MUST select a rigor level first.**

| Level | Label | When | Effort |
|-------|-------|------|--------|
| 🟢 **Green** | Cosmetic / Low Risk | CSS-only, copy/text changes, optional fields, isolated new files with no dependents | 1–2 min: skim deps, write code, `npm run build` |
| 🟡 **Yellow** | Medium Risk | New component, new API route (internal), adding logic to existing function, refactoring without changing contracts | 5–10 min: dep graph + edge cases + build/typecheck |
| 🔴 **Red** | High / Critical Risk | DB schema change, public API change, shared UI component change, auth/permissions, data migration, anything affecting SEO/rendering | Full SIAS (Phases 1–5) |

**How to choose:**
1. If the change only touches `.css` files, `*.config.*`, or static content → **Green**
2. If the change touches a file with 3+ imports from elsewhere, or adds new logic → **Yellow**
3. If the change touches a file used in 5+ places, or affects API contracts, DB, auth, or SSR → **Red**
4. When in doubt, choose the higher level

**For 🟢 Green changes:** Skip directly to implementation. Run `npm run build` at the end.
**For 🟡 Yellow changes:** Run Phase 1.1 (dependency graph — be concise, 5 lines max) + Phase 1.3 (edge cases — just list non-trivial ones) + Phase 4.1 (build/typecheck/lint).
**For 🔴 Red changes:** Run the full system below.

---

## Phase 1: Pre-Change Mapping

### 1.1 Build the Dependency Graph

Before touching any code:

1. Identify the **entry point** of the change (component, API route, utility, DB query, etc.)
2. **AUTO-EXECUTE:** Use `grep` / `ripgrep` to find all imports/usages of the entry point. Do NOT guess — actually search the codebase.
3. Trace the chain recursively — a change to `Button.tsx` affects every parent that renders it.
4. Record every file that will be touched, even transitively.

```
grep -r "from '@/components/shop/product-card'" src/ --include="*.tsx" --include="*.ts"
grep -r "ProductCard" src/ --include="*.tsx" --include="*.ts" -l
```

**Output format:**

```
## Dependency Graph

Entry: src/components/shop/product-card.tsx

Direct dependents:
  - src/app/products/page.tsx (line 45: renders ProductCard)
  - src/app/products/[slug]/page.tsx (line 32: renders ProductCard)
  - src/app/categories/[slug]/page.tsx (line 28: renders ProductCard)

Transitive dependents:
  - src/app/layout.tsx (wraps products page)
  - src/components/layout/navbar.tsx (links to products page)

Data dependencies:
  - src/lib/products.ts (getProductBySlug, getProductsByCategory)
  - src/lib/categories.ts (getCategoryBySlug)
  - prisma/schema.prisma (Product model, Category model)
  - src/app/api/products/route.ts (API endpoint)
```

### 1.2 Interface Contract Audit

For every function, component, API route, or DB schema involved:

- [ ] Are `props` / `parameters` / `return types` changing?
- [ ] Does any caller pass arguments differently than declared?
- [ ] Is a new `required` field being added anywhere? (This is a **breaking change**)
- [ ] Is a field being renamed or removed? (This is a **breaking change**)
- [ ] Is a GraphQL/REST API response shape changing?
- [ ] Is a database column or relation changing?
- [ ] Are there TypeScript `any` or `as` casts that silently bypass the type system?

#### 1.2.1 SEO & Rendering Impact

For any change to pages, layouts, or data-fetching code:

- [ ] Does this change affect **SSR vs SSG vs ISR** rendering mode of any page?
  - If a page uses `force-dynamic` or `revalidate`, does the new code change that?
  - If you add `useEffect` or `window` access, does it break SSG?
- [ ] Does this change affect **meta tags** (`title`, `description`, `og:*`, `twitter:*`)?
  - Check `generateMetadata`, `layout.tsx`, or hardcoded `<head>` tags
- [ ] Does this change affect **structured data / JSON-LD / schema.org** markup?
- [ ] Does this change affect **`robots.txt`**, **`sitemap.xml`**, or **canonical URLs**?
- [ ] Does this change affect **Core Web Vitals** (LCP, FID, CLS)?
  - New large images? New client-side JS? Layout shifts?
- [ ] Does this change affect **critical CSS** or above-the-fold render timing?
- [ ] If adding client-side data fetching, is there a **loading skeleton** to prevent CLS?
- [ ] Does the page still render correctly with **JavaScript disabled**? (If SSR matters to you)

### 1.3 State Space Enumeration

For every component or function being modified, enumerate **all possible states**:

| State | Description | Handled? |
|-------|-------------|----------|
| Loading | Initial render before data arrives | Yes/No |
| Empty | Data is null/undefined/empty array | Yes/No |
| Error | API/DB/network failure | Yes/No |
| Success | Happy path with full data | Yes/No |
| Partial | Some fields null, others populated | Yes/No |
| Edge | Single item, max items, boundary values | Yes/No |
| Auth | Unauthenticated, unauthorized, expired token | Yes/No |
| Race | Rapid state changes, duplicate requests | Yes/No |
| Offline | Network disconnected, timeout | Yes/No |

**Rule:** If any state is marked "No", the implementation is incomplete. Do not proceed.

### 1.4 Performance Baseline

Before changing any code that runs more than once:

1. **AUTO-EXECUTE:** Read `next.config.ts` and check if `bundlePagesRouterDependencies` or `experimental` bundle options are configured.
2. **AUTO-EXECUTE:** Run `npm run build` and capture the "First Load JS" and "Route (pages)" size for any affected pages. Parse the output lines looking for `├` and `└` entries.
3. **AUTO-EXECUTE:** For API routes, check the route handler for N+1 patterns by reading the handler file and checking Prisma `.findMany()` calls inside loops.
4. For client components, count `useEffect` calls and check if any run on every render vs only on mount.

---

## Phase 2: Change Planning

### 2.1 Atomic Change Decomposition

Break every feature/refactor into the smallest possible atomic steps:

```
❌ BAD: "Add search functionality" (too large, cannot verify)
✅ GOOD:
  Step 1: Add search input UI component (no logic, static)
  Step 2: Add search API endpoint (test standalone)
  Step 3: Wire input to API with debounce (test interaction)
  Step 4: Add search results display (test rendering)
  Step 5: Add empty state, loading state, error state
  Step 6: Add keyboard navigation for results
```

Each step must:
- Keep the app fully functional
- Pass all existing tests
- Be verifiable independently

### 2.2 Regression Risk Matrix

For each file in the dependency graph, assess:

| File | Risk Level | Reason | Mitigation |
|------|-----------|--------|------------|
| product-card.tsx | High | 3 components depend on it | Add unit tests for new props |
| products/page.tsx | Medium | Uses pagination + filters | Add integration test |
| api/products/route.ts | Critical | Public API contract | Add API contract test |

**Risk levels:**
- **Critical** — Breaking change to public API, DB schema, or shared UI component
- **High** — Change affects multiple consumers or has complex logic
- **Medium** — Change is contained but touches core logic
- **Low** — Isolated change to new code with no dependents

### 2.3 Safe Execution Contract

**AUTO-EXECUTE:** After writing the contract below, show it to the user for confirmation before writing any code.

Before writing code, declare:

```json
{
  "change": "Brief description of the change",
  "goal": "What this change achieves",
  "rigor_level": "🟢 Green / 🟡 Yellow / 🔴 Red",
  "files_touched": ["file1.ts", "file2.tsx", ...],
  "contracts_preserved": [
    "API response shape unchanged",
    "Database schema compatible",
    "All component props backward-compatible"
  ],
  "seo_rendering_impact": "None / SSR unchanged / Meta tags updated / ...",
  "edge_cases_handled": [
    "null description",
    "empty product list",
    "network timeout"
  ],
  "performance_guarantees": [
    "No new N+1 queries",
    "No bundle size increase > 5KB",
    "No additional re-renders in parent components"
  ],
  "verification_commands": [
    "npm run build",
    "npm run lint",
    "npm run typecheck"
  ]
}
```

---

## Phase 3: Implementation with Guardrails

### 3.1 Code Generation Rules

When writing code:

1. **Every conditional must have a corresponding test case.** If you write `if (!data)`, there must be a test for the null-data scenario.
2. **Every new state variable must be initialized.** No `undefined` surprises.
3. **Every async operation must have try/catch with user-facing error feedback.**
4. **Every new prop must be optional unless there is a provable guarantee it will always be provided.**
5. **Every change to an existing interface must be backward-compatible for at least one release.**

### 3.2 Type Safety Enforcement

- [ ] No `as` type casts unless absolutely necessary (and documented with a comment explaining why)
- [ ] No `any` types — use `unknown` instead and narrow with type guards
- [ ] No `// @ts-expect-error` or `// @ts-ignore`
- [ ] All API responses validated with runtime type guards (zod, io-ts, or manual checks)
- [ ] All database queries use type-safe query builders (Prisma types, Drizzle, etc.)

### 3.3 Performance & SEO Guardrails

During implementation, **AUTO-EXECUTE** these checks:

| Check | Automation |
|-------|------------|
| Bundle size impact | Run `npm run build` and parse the `├` line for the affected route; compare First Load JS before/after (run build before any changes, then after) |
| TypeScript errors | Run `npx tsc --noEmit` and check for new errors |
| Lint errors | Run `npm run lint` and check for new warnings/errors |
| DB query count | Read route handler / server component for Prisma `.findMany()` inside loops |
| N+1 queries | Search for `findMany` + `include` patterns that lack relation loading |
| Unnecessary `useEffect` | Can this be derived from props/state instead? |
| Missing `key` props | Run the app and check browser console for React key warnings |
| Large images unoptimized | Search for `<img` (not `next/image`) or `Image` without `sizes` prop |
| Meta tags missing | Search the affected page/layout for `generateMetadata`, `title`, `description` |
| SSR breakage | If the component uses `useEffect`, `useState`, `window`, `document`, verify the parent uses `"use client"` and no server component imports it directly |
| inline styles triggering reflow | Check for `style={{` that change dimensions dynamically |

---

## Phase 4: Verification

### 4.1 Test Coverage Audit

After implementing, **AUTO-EXECUTE** these commands and report the results:

- [ ] **AUTO-EXECUTE:** `npm run build` — capture output, check for errors
- [ ] **AUTO-EXECUTE:** `npx tsc --noEmit` — check for type errors
- [ ] **AUTO-EXECUTE:** `npm run lint` — check for lint warnings/errors
- [ ] Unit tests for every new function/logic branch (check if test files exist for new functions)
- [ ] Component tests for every state (loading, empty, error, success, edge)
- [ ] Integration test for every new API endpoint or data flow
- [ ] **AUTO-EXECUTE:** If existing tests exist, run them (e.g., `npm test` or `npx vitest run`)

### 4.2 Edge Case Walkthrough

Run through this checklist for the changed code:

```text
What happens when:
1. The user has no network connection?
2. The API returns a 500 error?
3. The API returns malformed data?
4. The database is down?
5. The user is not authenticated?
6. The user session expires mid-operation?
7. The user rapidly clicks the same button 10 times?
8. The browser tab is backgrounded and restored?
9. The data changes between two rapid requests?
10. The screen size is 320px wide? 2560px wide?
11. The content is in RTL language?
12. The user has `prefers-reduced-motion: reduce` set?
13. There are 0 items to display? 10,000 items?
14. A required field is empty string? whitespace? null? undefined?
15. A file upload is 0 bytes? 2GB? wrong format?
```

If any case is not handled correctly, fix it before proceeding.

### 4.3 Regression Verification

**AUTO-EXECUTE all of these:**

- [ ] **AUTO-EXECUTE:** `npm run build` — verify it passes and inspect route sizes
- [ ] **AUTO-EXECUTE:** `npx tsc --noEmit` — verify zero new type errors
- [ ] **AUTO-EXECUTE:** `npm run lint` — verify zero new warnings
- [ ] **AUTO-EXECUTE:** Read the built page source (`curl http://localhost:3000/<page>`) or check rendered HTML for correct meta tags (if SEO-relevant change)
- [ ] Verify all API endpoints return correct shapes (read the route handler + any tests)
- [ ] Check that no new `console.error` / `console.warn` calls were added to production code paths
- [ ] Verify the change in both light and dark mode (if UI change)
- [ ] Verify the change in mobile and desktop viewports (if UI change)
- [ ] Confirm bundle size is within acceptable limits (compare captured build output)
- [ ] Confirm no performance regression (compare before/after metrics)

### 4.4 Performance Verification

**AUTO-EXECUTE:** Run `npm run build` and capture the First Load JS for the affected route. Compare with the baseline from Phase 1.4 (if baseline was captured).

```
# Example: parse the build output
> npm run build 2>&1 | grep -A5 "Route (app)"
├ ƒ /products                          47.2 kB        152 kB
├ ƒ /products/[slug]                   9.28 kB        129 kB
```

Using the baseline from Phase 1.4, compare:

| Metric | Source | Before | After | Threshold |
|--------|--------|--------|-------|-----------|
| First Load JS | `npm run build` output | — KB | — KB | < +10 KB |
| Total Page Size | `npm run build` output | — KB | — KB | < +20 KB |
| Route type | `ƒ` (dynamic) vs `○` (static) | — | — | Must not regress from static→dynamic |
| Build errors | build output | 0 | 0 | 0 |
| Type errors | `npx tsc --noEmit` | 0 | 0 | 0 |

---

## Phase 5: Final Review

Before declaring the change complete:

1. Re-read the dependency graph from Phase 1 — is every file still relevant?
2. Re-check the edge case matrix from Phase 1.3 — are all states handled?
3. Confirm the execution contract from Phase 2.3 — are all guarantees met?
4. Run the verification checklist from Phase 4 — does everything pass?
5. Ask: **"Would I approve this change if someone else wrote it?"** If the answer is no, fix it.

---

## Quick Reference: When to Use SIAS

| Trigger | Rigor | Action |
|---------|-------|--------|
| CSS-only, copy/text, config-only | 🟢 Green | Skip to implementation, then `npm run build` |
| New isolated component, no dependents | 🟢 Green | Skip to implementation, then `npm run build` + `npx tsc --noEmit` |
| Adding logic to existing function | 🟡 Yellow | 1.1 (concise dep graph) + 1.3 (edge cases) + build/typecheck |
| New UI component with states | 🟡 Yellow | 1.1 + 1.3 + 3.3 + 4.1 |
| New API endpoint (internal) | 🟡 Yellow | 1.1 + 1.2 + 1.3 + 3.3 + 4.1 |
| New feature with multiple files | 🔴 Red | Full SIAS (Phases 1–5) |
| Refactoring shared code | 🔴 Red | 1.1 + 1.2 + 2.2 + 3.2 + 4.3 |
| Database schema change | 🔴 Red | 1.1 + 1.2 + 2.2 + 4.3 (+ backup DB first) |
| Public API / webhook change | 🔴 Red | Full SIAS |
| Auth / permissions change | 🔴 Red | Full SIAS + security review |
| SEO-sensitive change (titles, meta, sitemaps, rendering mode) | 🔴 Red | 1.2.1 (mandatory) + 4.3 with curl check on rendered output |
| SSR ↔ SSG rendering mode change | 🔴 Red | 1.2.1 + 4.4 build comparison + manual curl test |
| Bug fix | 🟡 Yellow | 1.1 + 1.3 + 2.2 + 4.2 (focus on regression) |
| Dependency update | 🟢 Green | 4.3 (build + lint only) |

---
target: dashboard
total_score: 26
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-06-12T23-16-23Z
slug: apps-client-src-app-protected-dashboard-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading and error states exist; CRUD mutations give no success/pending feedback beyond UI change |
| 2 | Match System / Real World | 4 | Familiar todo vocabulary, clear Incomplete/Completed split |
| 3 | User Control and Freedom | 3 | Modal cancel/close via Radix; completion is reversible; delete is immediate with no undo |
| 4 | Consistency and Standards | 2 | FAB uses hardcoded `#6686B3`; dialog inputs use `bg-white`/`slate-900` instead of Nord tokens |
| 5 | Error Prevention | 2 | Title validation in forms; delete has no confirmation step |
| 6 | Recognition Rather Than Recall | 2 | Edit/Delete hidden until card hover; empty state omits its inline Add button |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts or bulk actions; standard paths are fine for scope |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained Nord dark/light; empty Completed column consumes half the grid on desktop |
| 9 | Error Recovery | 3 | `ErrorBanner` on fetch failure; inline form validation; mutation errors not surfaced in dialogs |
| 10 | Help and Documentation | 2 | Empty-state copy teaches intent; no contextual help (acceptable for demo scope) |
| **Total** | | **26/40** | **Acceptable — solid foundation, targeted polish needed** |

## Anti-Patterns Verdict

**LLM assessment:** This does **not** read as generic AI SaaS slop. No cream backgrounds, gradient text, hero metrics, or section eyebrows. The Nord palette, fixed product type scale, and shadcn/Radix primitives align with the documented "Nordic Workbench" direction. What *does* undermine credibility for the stated audience (engineers reviewing craft) is subtle token drift and hover-gated affordances — the kind of inconsistency a reviewer notices even when the surface looks calm.

**Deterministic scan:** `detect.mjs` returned **0 findings** across dashboard page, `todo-list`, `todo-card`, `empty-state`, and `add-todo-dialog`. No banned patterns (side stripes, gradient text, glass defaults, etc.) detected in markup.

**Visual overlays:** Browser script injection (`detect.js` via live-server on port 8400) was **attempted but blocked** by the environment's safety policy. No reliable user-visible overlay is available. Assessment B relied on CLI scan (clean) plus live browser inspection at `http://localhost:4200/dashboard` (empty state, add dialog, populated list, mobile 390×844).

## Overall Impression

The dashboard already feels like a credible product demo — calm, readable, and on-brand. The single biggest opportunity is **making affordances discoverable and token-consistent**: surface Edit/Delete without hover, wire the empty-state CTA, and consolidate the FAB/dialog styling to `--primary` so the engineering story matches the visual story.

## What's Working

1. **Clear information architecture** — Incomplete/Completed columns with count badges answer "what's left?" immediately. Section headings use proper `aria-labelledby` wiring.
2. **Restrained Nord execution** — Header, cards, and typography stay within the documented scale. No decorative motion or template scaffolding.
3. **Production-minded states** — Loading spinner with `role="status"`, fetch error banner, Radix dialog focus trap, and meaningful `aria-label`s on toggle/delete controls.

## Priority Issues

### [P1] Edit/Delete are hover-gated on active todo cards
- **Why it matters:** Keyboard and touch users cannot discover secondary actions; screen-reader users may miss actions that only appear on `:hover`. Violates recognition heuristic and WCAG operability expectations for a demo targeting engineers.
- **Fix:** Keep actions always visible on touch/small screens; use `focus-within` alongside `group-hover` on desktop; or expose a compact overflow menu.
- **Suggested command:** `/impeccable harden todo-card`

### [P1] Empty state doesn't offer its own Add action
- **Why it matters:** `EmptyState` supports `onAddTodo` but `dashboard/page.tsx` never passes it. First-time users see copy ("Create your first todo") but must discover the floating FAB — a recall test on the exact screen meant to teach the interface.
- **Fix:** Pass `onAddTodo={() => setAddOpen(true)}` from the dashboard page so the empty state includes a primary inline button.
- **Suggested command:** `/impeccable onboard dashboard empty state`

### [P1] Token drift on primary actions
- **Why it matters:** The FAB hardcodes `#6686B3` / `#5775A0` and tinted shadow while dialogs use `bg-primary`. Reviewers explicitly looking for "production-minded decisions" will flag this as unfinished consolidation called out in DESIGN.md.
- **Fix:** Replace FAB hex classes with `bg-primary hover:bg-primary/90` (or consolidate frost-action into `--primary` once).
- **Suggested command:** `/impeccable polish dashboard FAB and auth CTAs`

### [P2] Delete is immediate with no confirmation
- **Why it matters:** One mis-click permanently removes a todo. For a portfolio demo, showing thoughtful error prevention is part of the quality bar.
- **Fix:** Add a lightweight confirm step (AlertDialog) or soft-delete with undo toast.
- **Suggested command:** `/impeccable harden delete flow`

### [P2] Completed column renders empty at full width on desktop
- **Why it matters:** With zero completed items, half the 960px canvas is blank — visual dead space that weakens hierarchy on first load after adding one item.
- **Fix:** Collapse the Completed section when count is 0, or use single-column layout until both columns have content.
- **Suggested command:** `/impeccable layout todo-list columns`

## Persona Red Flags

**Alex (Power User):** Edit/Delete require hover before click — extra motion per task. No keyboard shortcut to open Add dialog. Delete is one click with no undo — risky for fast workflows.

**Sam (Accessibility-Dependent):** `role="listitem"` on cards without a wrapping `list`/`ul` breaks list semantics. Hover-only action row may not appear on keyboard focus without `group-focus-within`. Dialog inputs use hardcoded white backgrounds in dark mode — high-contrast flash inconsistent with token system.

**Morgan (Dev Reviewer — project-specific):** FAB hex drift vs documented `--primary` rule signals incomplete design-system discipline. Spinner loading instead of skeleton states (called out in DESIGN.md/product register) reads as tutorial-grade, not production-grade.

## Minor Observations

- Add/Edit dialog inputs use `placeholder:text-gray-400` and raw `bg-white dark:bg-slate-900` instead of `bg-background` / `text-muted-foreground` tokens.
- `Save Task` vs `Save` label mismatch between add and edit dialogs.
- Completed-column badge uses bespoke green styling while incomplete uses `bg-muted` — intentional but slightly uneven.
- Mobile FAB at `bottom-8 right-8` is thumb-friendly; good for Casey persona.

## Cognitive Load Assessment

**Failures (2/8):** Progressive disclosure (hover hides actions); recognition at empty state (FAB-only path).

**Working memory:** Within limits — no cross-screen recall required.

**Decision points:** ≤4 visible actions per card when hover reveals Edit/Delete — acceptable when visible.

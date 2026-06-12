---
name: Full Stack Todo
description: A precise, calm Nord-themed product UI for a full-stack engineering demo
colors:
  nord-snow: "#ECEFF4"
  nord-frost: "#E5E9F0"
  nord-ink: "#2E3440"
  nord-slate: "#4C566A"
  nord-frost-blue: "#5E81AC"
  nord-frost-blue-light: "#81A1C1"
  nord-frost-action: "#6686B3"
  nord-frost-action-hover: "#5775A0"
  nord-aurora-red: "#BF616A"
  nord-aurora-green: "#A3BE8C"
  nord-aurora-yellow: "#EBCB8B"
  nord-panel: "#3B4252"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  shell: "40px"
components:
  button-primary:
    backgroundColor: "{colors.nord-frost-blue}"
    textColor: "{colors.nord-snow}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.nord-frost-blue}"
    textColor: "{colors.nord-snow}"
    rounded: "{rounded.md}"
  button-frost-action:
    backgroundColor: "{colors.nord-frost-action}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "48px"
  button-frost-action-hover:
    backgroundColor: "{colors.nord-frost-action-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
  input-default:
    backgroundColor: "{colors.nord-snow}"
    textColor: "{colors.nord-ink}"
    rounded: "10px"
    padding: "0 16px"
    height: "48px"
  card-surface:
    backgroundColor: "{colors.nord-frost}"
    textColor: "{colors.nord-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: Full Stack Todo

## 1. Overview

**Creative North Star: "The Nordic Workbench"**

A cool, low-noise product surface built for engineers evaluating craft. The interface behaves like a well-organized bench: every control has a place, color signals state rather than mood, and nothing competes with the task list. Personality is **precise, calm, competent** — Scandinavian restraint applied to a demo-grade todo app.

The system rejects spectacle. No marketing-page scaffolding, no decorative gradients, no uniform card grids selling features that don't exist. Depth comes from tonal layering (snow → frost surfaces → ink text) with shadows reserved for elevation changes — hover on todo rows, modal lift, fixed FAB.

**Key Characteristics:**
- Single sans family (Inter) across all UI; no display/body pairing
- Nord palette via CSS custom properties in `apps/client/src/app/globals.css`
- shadcn/Radix primitives (`Button`, `Card`, `Input`, `Dialog`) as the component backbone
- Light + dark themes via `ThemeProvider` (`next-themes`)
- Inline SVG icons for todo actions; Material Symbols for form affordances
- Fixed rem type scale (14–28px); no fluid clamp headings in product surfaces

## 2. Colors

Cool Arctic neutrals with one frost-blue accent. Warmth is absent by design — this is engineered calm, not lifestyle cozy.

### Primary
- **Frost Blue** (`#5E81AC` / `hsl(210 50% 52%)`): Primary actions in the token system, links, focus rings, todo completion hover. Token: `--primary`.
- **Frost Action** (`#6686B3` / hover `#5775A0`): Hardcoded CTA fill on auth forms, register, dashboard FAB. **Drift from `--primary`** — consolidate to token in a future polish pass.

### Secondary
- **Arctic Green** (`#A3BE8C`): Completed-state checkbox fill, success semantics. Token: `--success` / `--color-nord-success`.
- **Arctic Red** (`#BF616A`): Destructive actions, delete affordances, form errors. Token: `--destructive` / `--color-nord-danger`.
- **Arctic Yellow** (`#EBCB8B`): Warning semantics. Token: `--warning`.

### Neutral
- **Snow Field** (`#ECEFF4`): Page background (light). Token: `--background`.
- **Frost Surface** (`#E5E9F0`): Cards, auth shell, elevated panels. Token: `--card`.
- **Polar Ink** (`#2E3440`): Primary text (light mode). Token: `--foreground`.
- **Slate Muted** (`#4C566A`): Secondary text, placeholders, completed todo titles. Token: `--muted-foreground`.
- **Panel Dark** (`#3B4252`): Card surfaces in dark mode. Token: `--card` (dark).

### Named Rules
**The One Accent Rule.** Frost blue (or its consolidated token) appears on primary actions, links, focus, and selection — never as decorative fill across large surfaces. Accent ≤10% of any screen.

**The Token-First Rule.** New UI must use `hsl(var(--*))` or Tailwind semantic utilities (`bg-primary`, `text-muted-foreground`). Hardcoded hex (`#6686B3`) is legacy drift on auth CTAs and the dashboard FAB — do not extend.

## 3. Typography

**Display Font:** Inter (with system-ui fallback)
**Body Font:** Inter (same family — product register, one family)
**Icon Font:** Material Symbols Outlined (form icons only)

**Character:** Neutral grotesque, engineered legibility. Weight does hierarchy work; size stays in a tight product band.

### Hierarchy
- **Display** (700, 28px, 1.2): Auth page app title (`TodoApp`). Tracking ≥ -0.02em. Not used in dashboard chrome.
- **Headline** (600, 22px, 1.3): Empty state heading (`No todos yet`).
- **Title** (600, 18px, 1.35): Active todo card titles.
- **Body** (500, 15–16px, 1.5): Descriptions, auth subcopy, dashboard content. Max ~65ch for prose blocks.
- **Label** (700, 14px): Form field labels. Bold, never uppercase-tracked.

### Named Rules
**The Fixed Scale Rule.** Product headings use fixed px/rem sizes, not `clamp()`. Sidebar and dashboard density depend on predictable type metrics.

**The No-Eyebrow Rule.** No uppercase tracked kickers above section headings. Section titles speak directly.

## 4. Elevation

Hybrid system: **tonal layering by default**, **shadow on state change**.

Surfaces rest flat against the snow background. Cards use `border border-border` plus `shadow-sm` at rest; todo cards gain `shadow-md` on hover. Modals use `.modal-shadow` (`0 8px 30px rgba(0,0,0,0.12)`) and `.backdrop-blur-nord` overlay (`blur(4px)`, `rgba(46,52,64,0.6)`). No ghost-card pattern (1px border + 16px+ blur shadow combined as decoration).

### Shadow Vocabulary
- **Card rest** (`shadow-sm`): Todo cards, shadcn `Card` default.
- **Card hover** (`shadow-md`): Interactive todo row lift.
- **Modal lift** (`.modal-shadow`): Add/Edit todo dialogs.
- **FAB glow** (`shadow-lg shadow-[#6686B3]/40`): Dashboard floating action — tinted, restrained.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows signal interaction or modal elevation only.

**The No-Glass-Default Rule.** Backdrop blur appears on modal overlays only — never as decorative card treatment.

## 5. Components

Product components are restrained, familiar, and consistent screen-to-screen.

### Buttons
- **Shape:** 8px radius (`rounded-md`) for shadcn `Button`; 12px (`rounded-xl`) for auth/FAB CTAs.
- **Primary (token):** `bg-primary text-primary-foreground`, h-10, focus ring `ring-ring` 2px offset.
- **Frost Action (legacy CTA):** `#6686B3` fill, 48px height, bold 15px label, `active:scale-[0.98]`.
- **Outline:** `border-input bg-background` — used for header Log out.
- **Hover / Focus:** Color shift or `/90` opacity; `focus-visible:ring-2 ring-ring ring-offset-2`.

### Cards / Containers
- **Todo row:** `bg-card p-4 rounded-lg border shadow-sm`; completed state at 75% opacity with strikethrough title.
- **Auth shell:** `bg-card rounded-3xl p-10 shadow-nord` — centered 400px column. *Note: 24px radius exceeds card guideline; preserved as auth signature, not a pattern to spread.*
- **shadcn Card:** `rounded-lg border bg-card shadow-sm`, 24px (`p-6`) internal padding on header/content.

### Inputs / Fields
- **Auth inputs:** 48px height, 10px radius, `border-border`, focus `ring-2 ring-primary/20 border-primary`.
- **shadcn Input:** 40px height, `rounded-md`, `border-input`, same focus ring pattern.
- **Error:** `bg-destructive/10 border-destructive` alert block with Material Symbol `error` icon.

### Navigation
- **Header:** Fixed 64px bar, `bg-card border-b`, logo + `text-xl font-bold` title, `ThemeToggle` + outline Log out.
- **No sidebar.** Single-column dashboard below header offset.

### Dialogs
- **Radix Dialog:** Frost overlay with blur; content `max-w-[480px] bg-card rounded-xl modal-shadow p-6`.
- **Focus trap and escape** handled by Radix primitives.

### Todo Card (signature)
- Circular 24px completion toggle; green fill when done (`bg-nord-success`).
- Hover-revealed Edit/Delete actions with uppercase 12px labels — the one permitted uppercase micro-label pattern for action affordances.
- Inline SVG icons, geometric style matching `public/logo.svg`.

## 6. Do's and Don'ts

Concrete guardrails enforcing PRODUCT.md anti-references.

### Do:
- **Do** use Nord CSS variables and Tailwind semantic colors (`primary`, `card`, `muted-foreground`, `border`).
- **Do** keep Inter as the sole UI typeface at fixed product sizes (14–28px).
- **Do** provide focus rings (`focus-visible:ring-2`) on every interactive control.
- **Do** support dark mode with AA contrast in both themes.
- **Do** use skeleton/empty/loading states that teach the interface (see `EmptyState`).
- **Do** respect `prefers-reduced-motion` — instant state changes, no choreographed page load.

### Don't:
- **Don't** use generic AI SaaS aesthetics: cream/sand body backgrounds, gradient text, identical icon+heading+text card grids, hero-metric blocks, uppercase tracked eyebrows on every section.
- **Don't** apply decorative motion (uniform staggered reveals, bounce/elastic easing).
- **Don't** use over-rounded cards (32px+ radii) outside the existing auth shell — new surfaces cap at 12–16px.
- **Don't** pair 1px borders with wide soft shadows (ghost-card pattern).
- **Don't** introduce playful consumer-app cute (emoji UI, bouncy interactions).
- **Don't** add hardcoded hex colors for new components — consolidate `#6686B3` to `--primary` instead of spreading drift.
- **Don't** use side-stripe borders (`border-left` accent stripes) on cards or alerts.
- **Don't** use glassmorphism as a default card treatment.

# Product

## Register

product

## Users

Portfolio and engineering audiences evaluating full-stack craft. Primary viewers are developers, hiring managers, and technical peers reviewing the repo — not end users relying on it as a daily productivity tool. They arrive with a skeptical, professional lens: does this demonstrate sound architecture, polished UI, and production-minded decisions?

## Product Purpose

A full-stack todo application that showcases an Nx monorepo with a NestJS API, Next.js client, JWT auth, PostgreSQL persistence, structured logging, and a disciplined test pyramid. Success means the app reads as **credible production work** — not a tutorial scaffold — while remaining small enough to understand in one sitting.

## Brand Personality

**Precise. Calm. Competent.**

Voice is restrained and direct. Visual tone follows the existing Nord palette: cool, Scandinavian, low-noise. The interface should feel engineered, not decorated — confidence through clarity and consistency, not flash.

## Anti-references

- Generic AI SaaS aesthetics: cream/sand body backgrounds, gradient text, identical icon+heading+text card grids, hero-metric blocks, uppercase tracked eyebrows on every section
- Decorative motion without purpose (uniform staggered reveals, bounce/elastic easing)
- Over-rounded cards (32px+ radii), ghost-card pattern (1px border + wide soft shadow)
- Playful consumer-app cute (emoji UI, bouncy interactions) — this is a professional demo, not a lifestyle app

## Design Principles

1. **Clarity over spectacle** — Every screen should answer "what can I do here?" within two seconds. Hierarchy, spacing, and copy do the work; decoration does not.
2. **Consistency is credibility** — Reuse the established Nord token system, shadcn/Radix primitives, and existing component patterns. New work should look like it was always part of the app.
3. **Professional restraint** — Motion, color, and typography earn their place. One accent, one type family (Inter), measured radii. If it feels like a landing-page template, remove it.
4. **Accessible by default** — Keyboard paths, focus states, contrast, and reduced-motion alternatives are not polish items; they are part of the demo's quality bar.
5. **Show the stack** — UI decisions should reinforce the engineering story: optimistic updates, error handling, auth flows, empty states, and loading feedback demonstrate real product thinking.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for text contrast, focus visibility, and interactive targets
- Respect `prefers-reduced-motion` — provide instant or crossfade alternatives for any animation
- Form errors must be programmatically associated and visually distinct
- Dark mode (already supported via `ThemeProvider`) must maintain AA contrast in both themes

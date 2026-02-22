# Full-Stack Todo — Design System Specification

> This document is the **single source of truth** for all visual design decisions.
> Every UI mockup, Stitch prompt, and code implementation **must** reference this spec to ensure consistency.

---

## 1. Color Palette (Nord)

The entire application uses the [Nord](https://www.nordtheme.com/) color palette exclusively. No ad-hoc colors are allowed.

| Token                    | Light value        | Dark value         | Usage                                   |
| ------------------------ | ------------------ | ------------------ | --------------------------------------- |
| `--bg-app`               | `#ECEFF4` (nord6)  | `#2E3440` (nord0)  | Page / root background                  |
| `--bg-surface`           | `#E5E9F0` (nord5)  | `#3B4252` (nord1)  | Cards, side panels, modals              |
| `--bg-elevated`          | `#FFFFFF`          | `#434C5E` (nord2)  | Elevated surfaces (dropdowns, tooltips) |
| `--text-primary`         | `#2E3440` (nord0)  | `#ECEFF4` (nord6)  | Headings, body text                     |
| `--text-secondary`       | `#4C566A` (nord3)  | `#D8DEE9` (nord4)  | Labels, descriptions, placeholders      |
| `--text-disabled`        | `#9DA5B4`          | `#4C566A` (nord3)  | Disabled / muted text                   |
| `--border-default`       | `#D8DEE9` (nord4)  | `#434C5E` (nord2)  | Default borders on cards, inputs        |
| `--border-focus`         | `#5E81AC` (nord10) | `#88C0D0` (nord8)  | Focus rings, active borders             |
| `--accent-primary`       | `#5E81AC` (nord10) | `#88C0D0` (nord8)  | Primary buttons, links, active state    |
| `--accent-primary-hover` | `#81A1C1` (nord9)  | `#8FBCBB` (nord7)  | Button hover                            |
| `--accent-danger`        | `#BF616A` (nord11) | `#BF616A` (nord11) | Delete buttons, error borders           |
| `--accent-warning`       | `#EBCB8B` (nord13) | `#EBCB8B` (nord13) | Warning indicators                      |
| `--accent-success`       | `#A3BE8C` (nord14) | `#A3BE8C` (nord14) | Success feedback, completed status      |

---

## 2. Typography

| Property         | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| **Font Family**  | `Inter, system-ui, -apple-system, sans-serif`                   |
| **Base Size**    | `16px`                                                          |
| **Scale Ratio**  | `1.25` (Major Third)                                            |
| **Weights Used** | `400` (regular), `500` (medium), `600` (semibold), `700` (bold) |

| Level               | Size | Weight | Usage                     |
| ------------------- | ---- | ------ | ------------------------- |
| **Page title (h1)** | 28px | 700    | "My Todos", Page headings |
| **Section (h2)**    | 22px | 600    | Column headers            |
| **Card title (h3)** | 18px | 600    | Todo titles               |
| **Body**            | 16px | 400    | Descriptions, paragraphs  |
| **Small / caption** | 14px | 400    | IDs, timestamps, meta     |
| **Button text**     | 14px | 500    | All button labels         |

---

## 3. Spacing & Layout

All spacing uses an **8px grid** system.

| Token      | Value | Usage                           |
| ---------- | ----- | ------------------------------- |
| `--sp-xs`  | 4px   | Inline icon gaps                |
| `--sp-sm`  | 8px   | Tight padding, small gaps       |
| `--sp-md`  | 16px  | Card inner padding, stack gaps  |
| `--sp-lg`  | 24px  | Section gaps                    |
| `--sp-xl`  | 32px  | Page-level padding              |
| `--sp-2xl` | 48px  | Hero/empty-state breathing room |

### Layout Grid

- **Max content width**: `960px`, centered
- **Dashboard columns**: 2 equal columns at `≥ 768px`, 1 column below
- **Gap between columns**: `24px`
- **Card stack gap**: `16px`

---

## 4. Border Radius

| Token           | Value  | Usage                         |
| --------------- | ------ | ----------------------------- |
| `--radius-sm`   | 6px    | Buttons, badges               |
| `--radius-md`   | 10px   | Cards, input fields           |
| `--radius-lg`   | 16px   | Modals                        |
| `--radius-full` | 9999px | Circular icons, avatar, chips |

---

## 5. Elevation / Shadows

| Token         | Light Value                      | Dark Value                   | Usage             |
| ------------- | -------------------------------- | ---------------------------- | ----------------- |
| `--shadow-sm` | `0 1px 3px rgba(46,52,64,0.08)`  | `0 1px 3px rgba(0,0,0,0.3)`  | Cards at rest     |
| `--shadow-md` | `0 4px 12px rgba(46,52,64,0.12)` | `0 4px 12px rgba(0,0,0,0.4)` | Cards on hover    |
| `--shadow-lg` | `0 8px 24px rgba(46,52,64,0.16)` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dropdowns |

---

## 6. Component Specifications

### 6.1 Navigation Bar

- **Height**: `64px`
- **Background**: `--bg-surface`
- **Border bottom**: `1px solid --border-default`
- **Content**: App logo/name left-aligned, theme toggle icon button right-aligned
- **Inner padding**: `0 --sp-xl` (horizontal)

### 6.2 Todo Card

- **Background**: `--bg-surface`
- **Border**: `1px solid --border-default`
- **Border-radius**: `--radius-md` (10px)
- **Padding**: `--sp-md` (16px)
- **Shadow**: `--shadow-sm` at rest → `--shadow-md` on hover
- **Hover**: `translateY(-2px)` + shadow change, `0.2s ease-in-out`
- **Layout**: Horizontal flex — checkbox | content (title + description) | action buttons
- **Checkbox**: 24px circular outline icon (unchecked) or filled check (completed); tinted `--accent-success` when completed
- **Title**: `h3` level, `--text-primary`, strike-through + reduced opacity when completed
- **Description**: Body text, `--text-secondary`, max 2 lines with ellipsis
- **ID**: Small/caption style, `--text-disabled`
- **Action buttons**: icon-only, 36px touch target, pencil (edit) and trash (delete). Delete uses `--accent-danger`

### 6.3 Buttons

| Variant       | Background         | Text color         | Border                       |
| ------------- | ------------------ | ------------------ | ---------------------------- |
| **Primary**   | `--accent-primary` | `#FFFFFF`          | none                         |
| **Secondary** | transparent        | `--text-primary`   | `1px solid --border-default` |
| **Danger**    | `--accent-danger`  | `#FFFFFF`          | none                         |
| **Icon-only** | transparent        | `--text-secondary` | none                         |

**Common**: `--radius-sm` (6px), min-height `40px`, padding `8px 16px`, font-weight `500`
**Hover**: Lighten bg by one Nord step, `translateY(-1px)`, add `--shadow-sm`
**Focus**: `3px solid --border-focus` outline, `2px offset`
**Disabled**: `opacity: 0.5`, `cursor: not-allowed`

### 6.4 Input Fields

- **Background**: `--bg-elevated`
- **Border**: `1px solid --border-default`
- **Border-radius**: `--radius-md`
- **Padding**: `12px 16px`
- **Font size**: `16px`
- **Focus**: border changes to `--border-focus`, subtle box-shadow `0 0 0 3px rgba(--accent-primary, 0.15)`
- **Label**: placed above input, `--text-secondary`, font-weight `500`, font-size `14px`, margin-bottom `6px`

### 6.5 Modal / Dialog

- **Backdrop**: `rgba(46,52,64,0.6)` with `backdrop-filter: blur(4px)`
- **Card**: `--bg-surface`, `--radius-lg` (16px), `--shadow-lg`, max-width `480px`, centered
- **Padding**: `--sp-lg` (24px)
- **Header**: h2, `--text-primary`, margin-bottom `--sp-md`
- **Footer**: Flex row, gap `--sp-sm`, justify-end. Cancel (secondary button) + Save (primary button)

### 6.6 Empty State

- **Layout**: centered column
- **Icon**: 48px, `--text-disabled`, muted clipboard/check icon
- **Heading**: h3, `--text-primary`
- **Description**: body text, `--text-secondary`
- **CTA**: Primary button below

### 6.7 Error Banner

- **Background**: `rgba(--accent-danger, 0.1)`
- **Border**: `1px solid --accent-danger`
- **Border-radius**: `--radius-md`
- **Icon**: Warning triangle, `--accent-danger`
- **Text**: `--accent-danger`, font-weight `500`

### 6.8 Login Page

- **Background**: `--bg-app`
- **Card**: centered, max-width `400px`, `--bg-surface`, `--radius-lg`, `--shadow-lg`
- **Logo/App name**: centered, h1, `--accent-primary`, margin-bottom `--sp-lg`
- **Inputs**: full-width, stacked vertically, gap `--sp-md`
- **Button**: full-width primary
- **Footer link**: centered small text, `--text-secondary`, with `--accent-primary` link color

---

## 7. Iconography

- **Library**: Outlined, rounded stroke icons (e.g., Lucide or FontAwesome outlined)
- **Sizes**: `16px` (inline), `20px` (buttons), `24px` (card checkbox), `48px` (empty state)
- **Color**: Inherit from parent text color; danger icons use `--accent-danger`

---

## 8. Motion & Transitions

| Property          | Duration | Easing        | Usage                         |
| ----------------- | -------- | ------------- | ----------------------------- |
| **Hover effects** | `0.2s`   | `ease-in-out` | Card hover, button hover      |
| **Focus rings**   | `0.15s`  | `ease-out`    | Focus state transitions       |
| **Modal open**    | `0.25s`  | `ease-out`    | Fade in + scale from 0.95     |
| **Theme switch**  | `0.3s`   | `ease-in-out` | Background, text color change |
| **Card enter**    | `0.3s`   | `ease-out`    | Fade in + translateY(10px→0)  |

---

## 10. Implementation Strategy (Tailwind CSS)

The client application uses **Tailwind CSS v4** with a CSS-variable based theme approach (similar to Shadcn UI).

### 10.1 Theme Variables (HSL)

All design tokens are defined as HSL values in `apps/client/src/app/globals.css`.

- **Usage in CSS**: `color: hsl(var(--primary));`
- **Usage in Tailwind**: `className="bg-primary text-primary-foreground"`

### 10.2 Core Utilities

| Pattern        | Tailwind Class Example                                                    |
| -------------- | ------------------------------------------------------------------------- |
| **Surface**    | `bg-card border-border shadow-sm`                                         |
| **Typography** | `text-primary font-semibold text-lg`                                      |
| **Spacing**    | `p-4 m-2 gap-4`                                                           |
| **Buttons**    | `inline-flex items-center justify-center rounded-md bg-primary px-4 py-2` |

### 10.3 Dark Mode

Tailwind is configured with the `class` strategy.

- Ensure the `dark` class is applied to the `<html>` or `<body>` tag.
- Components automatically swap HSL values when the `.dark` class is present.

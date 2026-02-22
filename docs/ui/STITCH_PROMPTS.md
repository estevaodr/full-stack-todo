# Google Stitch MCP — Consistent UI Prompts

> **Important:** Every prompt in this document begins with the same **Design System Preamble** to ensure all generated screens share a single, cohesive visual language. See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full spec.

---

## Design System Preamble (prepend to every prompt)

```text
DESIGN SYSTEM RULES (apply to this and every screen in this project):
- Color palette: Nord exclusively.
  Light mode: page bg #ECEFF4, card bg #E5E9F0, text #2E3440, secondary text #4C566A, borders #D8DEE9, primary accent #5E81AC, danger #BF616A, success #A3BE8C.
  Dark mode: page bg #2E3440, card bg #3B4252, text #ECEFF4, secondary text #D8DEE9, borders #434C5E, primary accent #88C0D0, danger #BF616A, success #A3BE8C.
- Typography: Inter font only. Page title 28px bold, section 22px semibold, card title 18px semibold, body 16px regular, caption 14px, button text 14px medium.
- Spacing: 8px grid. Card padding 16px, section gap 24px, page padding 32px.
- Border radius: buttons 6px, cards and inputs 10px, modals 16px, circular elements 9999px.
- Shadows: cards at rest have subtle 1px shadow, on hover deeper 4px shadow. Modals have strong 8px shadow.
- Buttons: primary has solid accent bg with white text, secondary has transparent bg with border, danger has solid red bg. All have 40px min height, 6px radius. Hover lifts 1px with shadow.
- Inputs: elevated bg, 1px border, 10px radius, 12px 16px padding. Focus shows accent-colored border with soft glow.
- Icons: outlined/rounded style, 20px in buttons, 24px in card checkboxes, 48px in empty states.
- Nav bar: 64px height, surface bg, 1px bottom border, logo left, theme toggle right.
- Max content width: 960px centered.
- All interactive elements are at least 44x44px.
- Consistent hover: cards lift 2px, buttons lift 1px, transitions 0.2s ease-in-out.
```

---

## Step 1: Create a Project

**Tool:** `mcp_StitchMCP_create_project`

```json
{
  "title": "Full-Stack Todo Redesign"
}
```

---

## Step 2: Main Dashboard — Light Theme

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Light mode: page bg #ECEFF4, card bg #E5E9F0, text #2E3440, secondary text #4C566A, borders #D8DEE9, primary accent #5E81AC, danger #BF616A, success #A3BE8C. Typography: Inter font only. Page title 28px bold, section 22px semibold, card title 18px semibold, body 16px regular, caption 14px, button text 14px medium. Spacing: 8px grid. Card padding 16px, section gap 24px, page padding 32px. Border radius: buttons 6px, cards and inputs 10px. Shadows: cards at rest have subtle 1px shadow, on hover deeper 4px shadow. Buttons: primary has solid #5E81AC bg with white text, 40px min height, 6px radius. Icons: outlined/rounded style. Nav bar: 64px height, #E5E9F0 bg, 1px bottom border #D8DEE9, logo left, theme toggle right. Max content width 960px centered. --- SCREEN: Todo Dashboard in Light Mode. A navigation bar at the top with the app name 'TodoApp' on the left and a sun/moon theme toggle icon button on the right. Below the nav, a centered content area (max 960px) with two equal columns side by side. Left column header 'Incomplete' (22px semibold), right column header 'Completed' (22px semibold). Each column contains a vertical stack of todo cards with 16px gap. Each card is a horizontal row: a 24px circular outlined checkbox on the left, then the todo title (18px semibold) and description (16px regular, secondary color, max 2 lines) in the middle, and two icon-only buttons (pencil for edit, trash in #BF616A for delete) on the right. There is a floating '+' or 'Add Todo' primary button in the bottom-right corner. The completed column cards have a filled green check icon and the title has a line-through style with reduced opacity."
}
```

---

## Step 3: Main Dashboard — Dark Theme

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Dark mode: page bg #2E3440, card bg #3B4252, text #ECEFF4, secondary text #D8DEE9, borders #434C5E, primary accent #88C0D0, danger #BF616A, success #A3BE8C. Typography: Inter font only. Page title 28px bold, section 22px semibold, card title 18px semibold, body 16px regular, caption 14px, button text 14px medium. Spacing: 8px grid. Card padding 16px, section gap 24px, page padding 32px. Border radius: buttons 6px, cards and inputs 10px. Shadows: cards at rest have subtle shadow, on hover deeper shadow. Buttons: primary has solid #88C0D0 bg with dark text, 40px min height, 6px radius. Icons: outlined/rounded style. Nav bar: 64px height, #3B4252 bg, 1px bottom border #434C5E, logo left, theme toggle (moon icon) right. Max content width 960px centered. --- SCREEN: Todo Dashboard in Dark Mode. Identical layout to the light mode version. Navigation bar at top with 'TodoApp' left and moon icon toggle right. Two equal columns below: 'Incomplete' and 'Completed'. Todo cards have #3B4252 bg with #434C5E border. Text in #ECEFF4. Each card has a circular checkbox, title, description, and edit/delete icon buttons. Completed cards have green filled check and line-through title. Floating 'Add Todo' primary button in bottom-right. The overall feeling is calm, professional, and easy on the eyes."
}
```

---

## Step 4: Empty State

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Light mode: page bg #ECEFF4, card bg #E5E9F0, text #2E3440, secondary text #4C566A, borders #D8DEE9, primary accent #5E81AC. Typography: Inter font only. Spacing: 8px grid. Border radius: buttons 6px, cards 10px. Nav bar: 64px height, #E5E9F0 bg, 1px bottom border, logo left, theme toggle right. Max content width 960px centered. --- SCREEN: Empty State. Same navigation bar as the dashboard. Below, a single centered container (max 960px). In the exact vertical and horizontal center of the content area, display: a 48px outlined clipboard icon in #4C566A at 50% opacity, below it a heading 'No todos yet' in 22px semibold #2E3440, below that a body text 'Create your first todo to get started' in 16px regular #4C566A, and below that a primary button 'Add Todo' with #5E81AC bg, white text, 6px radius, 40px height. All elements are center-aligned vertically with 16px spacing between them."
}
```

---

## Step 5: Error State

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Light mode: page bg #ECEFF4, card bg #E5E9F0, text #2E3440, secondary text #4C566A, borders #D8DEE9, primary accent #5E81AC, danger #BF616A. Typography: Inter font only. Spacing: 8px grid. Border radius: cards 10px. Nav bar: 64px height, #E5E9F0 bg, 1px bottom border, logo left, theme toggle right. Max content width 960px centered. --- SCREEN: Error State. Same navigation bar as the dashboard. Below, a centered container (max 960px). At the top of the content area, an error banner: a rounded rectangle with 10px radius, background rgba(191,97,106,0.1), border 1px solid #BF616A, padding 16px. Inside the banner: a 20px warning triangle icon in #BF616A on the left, and on the right the text 'Failed to load todos. Please try again later.' in 14px medium #BF616A. Below the banner, the rest of the page is empty with the same #ECEFF4 background."
}
```

---

## Step 6: Add/Edit Todo Modal

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Light mode: page bg #ECEFF4, card/surface bg #E5E9F0, elevated bg #FFFFFF, text #2E3440, secondary text #4C566A, borders #D8DEE9, focus border #5E81AC, primary accent #5E81AC, danger #BF616A. Typography: Inter font only. Spacing: 8px grid. Border radius: buttons 6px, inputs 10px, modals 16px. Shadows: modals have strong 8px shadow. Inputs: #FFFFFF bg, 1px #D8DEE9 border, 10px radius, 12px 16px padding. --- SCREEN: Add/Edit Todo Modal. The dashboard is visible in the background but covered by a semi-transparent overlay (rgba(46,52,64,0.6) with 4px backdrop blur). Centered on screen is a modal card: max-width 480px, #E5E9F0 bg, 16px border-radius, 8px shadow, 24px padding. At the top of the modal is a heading 'Add New Todo' in 22px semibold #2E3440. Below the heading are two form fields stacked vertically with 16px gap: a 'Title' input and a 'Description' textarea. Each has a label above it (14px medium #4C566A, 6px below), and the field itself has #FFFFFF bg, 1px #D8DEE9 border, 10px radius, 12px 16px padding. At the bottom of the modal is a row of two buttons aligned to the right with 8px gap: a 'Cancel' secondary button (transparent bg, 1px #D8DEE9 border, #2E3440 text) and a 'Save' primary button (#5E81AC bg, white text). Both buttons are 40px height, 6px radius."
}
```

---

## Step 7: Login Page

**Tool:** `mcp_StitchMCP_generate_screen_from_text`

```json
{
  "projectId": "<PROJECT_ID>",
  "deviceType": "DESKTOP",
  "prompt": "DESIGN SYSTEM RULES (apply to this and every screen in this project): Color palette: Nord exclusively. Light mode: page bg #ECEFF4, card/surface bg #E5E9F0, elevated bg #FFFFFF, text #2E3440, secondary text #4C566A, borders #D8DEE9, focus border #5E81AC, primary accent #5E81AC. Typography: Inter font only. Spacing: 8px grid. Border radius: buttons 6px, inputs 10px, card 16px. Shadows: login card has strong 8px shadow. Inputs: #FFFFFF bg, 1px #D8DEE9 border, 10px radius, 12px 16px padding. --- SCREEN: Login Page. Full-page centered layout with #ECEFF4 background. In the exact center of the screen is a login card: max-width 400px, #E5E9F0 bg, 16px border-radius, 8px shadow, 32px padding. At the top, the app name 'TodoApp' in 28px bold #5E81AC, center-aligned. Below is a subtitle 'Welcome back' in 16px regular #4C566A, center-aligned, 8px below the title. Below (24px gap) are two form fields stacked vertically with 16px gap: 'Email' input and 'Password' input. Each has a label above it (14px medium #4C566A, 6px margin below) and the field is full-width with #FFFFFF bg, 1px #D8DEE9 border, 10px radius, 12px 16px padding. Below the fields (24px gap) is a full-width primary button 'Log In' with #5E81AC bg, white text, 6px radius, 40px height. At the bottom of the card (16px below) is center-aligned text in 14px: 'Don't have an account?' in #4C566A followed by a 'Sign up' link in #5E81AC."
}
```

---

## Refinement (edit existing screens)

Use `mcp_StitchMCP_edit_screens` to adjust any screen while keeping the system consistent:

```json
{
  "projectId": "<PROJECT_ID>",
  "selectedScreenIds": ["<SCREEN_ID>"],
  "prompt": "<describe the specific change, always reference the Design System tokens>"
}
```

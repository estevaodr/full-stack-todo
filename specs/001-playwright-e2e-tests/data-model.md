# Phase 1: Data Model & Test Entities

The defining entities for this implementation reside in the E2E structure utilizing Page Object Models to encapsulate CSS selectors and routine actions.

## Page Object Models (POMs)

### 1. Registration Page (`register.page.ts`)
- **Elements**: Email input, password input, submit button, error boundaries.
- **Transitions**: Redirects to Dashboard on success, shows inline error on fail.

### 2. Login Page (`login.page.ts`)
- **Elements**: Email input, password input, submit button, error boundary.
- **Transitions**: Redirects to Dashboard on success, shows inline error on fail.

### 3. Dashboard Page (`dashboard.page.ts`)
- **Elements**: Todo input field, submit button, todo list container, checkbox (status toggle), delete icon.
- **Validation**: Total count calculation, UI state reactivity on action.

## E2E Authentication State
- **Artifact**: `auth.json` (Playwright storage state).
- **Usage**: Automatically injected into the browser context for downstream task tests.

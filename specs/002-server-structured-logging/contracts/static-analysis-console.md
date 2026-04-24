# Contract: No `console` usage under `apps/server` (SC-005 / FR-010)

## Primary gate (automated)

- **ESLint** rule **`no-console`** set to **`error`** for all TypeScript files under **`apps/server/**/*.ts`** (exact glob per **tasks** T002 / `eslint.config.mjs`).
- **`npx nx lint server`** MUST exit **0** on the default CI / pre-merge path.

This is the **authoritative** automated check for **SC-005** (no `console.log`, `console.error`, `console.warn`, `console.debug`, etc.). **FR-010** / tests vs Nest harness: [nest-logging-tests.md](./nest-logging-tests.md).

## Supplementary check (optional)

- **`rg '\bconsole\.' apps/server`** (or workspace-equivalent) MAY be used in docs/runbooks as a quick sanity check; **false positives** are possible in comments/strings—when in doubt, **ESLint** wins.

## Out of scope for this contract

- Other packages under `libs/**` unless a future spec extends **FR-010**.
- Non-TypeScript files unless **tasks** explicitly extend the lint glob.

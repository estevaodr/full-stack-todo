# Contract: Middleware `x-request-id` (Edge)

## Allowed

- Read `request.headers.get('x-request-id')` (any casing; compare case-insensitively when looking up).
- If **missing** or **empty after trim**: generate **UUID** (v4).
- If present and **invalid** per **Validation rules** below (same intent as [research.md](../research.md#decision-correlation-id-for-invalid--oversized-x-request-id): unsafe length or characters): **replace** with new UUID (no in-middleware warn; Edge has no app logger).
- Otherwise: **forward** the incoming value **unchanged** (opaque token, not required to be UUID) — **byte-for-byte** the trimmed string on request and response; **FR-003** / **US1** scenario 4 require downstream logs to use this same value.
- Forward request: ensure downstream sees the **final** id (middleware may clone headers).
- Response: set **`x-request-id`** on outgoing response to the **same** final value.

**Spec alignment**: [spec.md](../spec.md#edge-cases) defers missing/invalid/long `x-request-id` behavior to this contract.

## Forbidden

- Import `@full-stack-todo/client/logging`, `pino`, `server-only`, or any module that pulls them in.
- `AsyncLocalStorage`, filesystem, or Node-only APIs not supported on Edge.

## Validation rules (normative)

- After trim: length **1–128** inclusive.
- Allowed characters: **visible ASCII** (0x21–0x7E) only — reject tabs, newlines, Unicode outside ASCII for the correlation token.

# Contract: `withLogging` (App Router Route Handlers)

## Signature (illustrative)

```ts
export function withLogging(handler: (req: NextRequest, ctx: RouteContext) => Promise<Response> | Response): ...
```

Exact types follow Next.js `route.ts` exports.

## Runtime

- Caller file MUST include `export const runtime = 'nodejs'`.

## Behavior

1. Read `x-request-id` from request (already normalized by middleware); if still missing, generate UUID.
2. Start timer; `AsyncLocalStorage.run` with `{ requestId, startedAt }`.
3. Invoke handler inside store.
4. On success: log **access / completion** line with `method`, `url`, `statusCode`, `responseTimeMs`, `requestId` (and other fields per [log-schema.md](./log-schema.md)).
5. On throw (no usable `Response` from handler): emit **access / completion** line with **`statusCode` = 500** by default, plus `method`, `url`, `responseTimeMs`, `requestId`, and **FR-002** error details (`msg` / stack); if the runtime maps the failure to a `Response` with a status, use that status instead. **Rethrow** unless product contract says otherwise (default: **rethrow**). **`statusCode` MUST always be present** on this line (never omit).
6. When handler returns a `Response` with **4xx or 5xx** without throwing: emit **access / completion** line with that **`statusCode`** (not treated as step 5); still log **`responseTimeMs`**, **`requestId`**, etc.

## FR-010 test coverage (normative)

Aligned with [spec.md](../spec.md) **FR-010**:

| Path | Meaning | Minimal test signal |
|------|---------|---------------------|
| **Success** | Returns `Response` with **2xx–3xx** | e.g. **200** + access line `statusCode` 200 |
| **Error (a)** | **Uncaught throw** before `Response` | Access line with **`statusCode` 500** default + error details; exception propagates per wrapper |
| **Error (b)** | Returns **`Response`** with **4xx or 5xx** without throw | Access line **`statusCode`** equals returned status (e.g. 404, 422, 502) |

**FR-010** requires tests for **Success**, **Error (a)**, and **Error (b)**.

## ALS

- `getLogger()` inside the same synchronous async stack as the handler reads `requestId` from ALS.
- No ALS outside this wrapper for Route Handlers.

## Tests

- **Success (FR-010)**: 200 (or other 2xx/3xx) response; assert access log `statusCode` and timing.
- **Error (a) (FR-010)**: handler throws; assert access/error logging + default **500** (or mapped) per Behavior step 5.
- **Error (b) (FR-010)**: handler returns `Response` with **4xx/5xx** without throw; assert access log **`statusCode`** matches returned status.

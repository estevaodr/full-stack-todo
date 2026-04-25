# Production-ready structured logging (Next.js, Node only)

**Scope note (2026-04-24):** `specs/003-nextjs-structured-logging/spec.md` clarifies **App Router only** for the first delivery. **`withPagesLogging` / Pages Router API routes** below are **reference for a follow-up** when `pages/api` exists—not required for acceptance of that spec.

Implement a **production-ready structured logging** setup for a Next.js app using **pino** and **pino-pretty**.

## Transports and format

- **Production**: newline-delimited **JSON** to stdout.
- **Development**: **human-readable**, colorized output (pino-pretty).
- **Severity**: log records include a **numeric syslog severity (RFC 5424 severity 0–7)** derived from the pino level. Document the mapping table in code comments next to the mapper. Facility / PRI wire format is **not** required; numeric severity in JSON is enough for “RFC 5424 severity levels” in this spec.
- **Redaction**: sensitive values are replaced with `[Redacted]` **before** stdout. Redactors must work with **Web `Request` / `Headers`** (App Router), not only Node-style `req`. Cover at least: `authorization` header, `cookie` header, and common secret fields on **small, explicit** log payloads (e.g. `password`, `token`, `accessToken`). **Do not** log full request bodies by default; if a handler logs a parsed object, redaction runs on that object’s known keys only.

## Runtime scope

- **In scope**: **Node.js runtime only** (`export const runtime = 'nodejs'` everywhere logging or ALS-backed helpers run).
- **Out of scope**: Edge runtime, log shipping, rotation, DB query logging, distributed tracing, client-side logging, **Pages Router API logging in v1** (no `pages/api` in target app yet).

## Middleware (Edge)

Next.js **`middleware.ts` runs on the Edge runtime**. It **must not** import `@/lib/logger`, `pino`, or `server-only` modules.

Middleware **only** propagates correlation: read incoming `x-request-id`, generate a **uuid** if missing, set **`x-request-id` on the request (as seen by downstream) and on the response** before handlers run. No AsyncLocalStorage in middleware.

## Dependencies

```bash
npm install pino pino-pretty uuid
```

## Environment variables

**Normative contract** (names, values, defaults, bootstrap): [`specs/003-nextjs-structured-logging/contracts/environment.md`](../../specs/003-nextjs-structured-logging/contracts/environment.md). Do not treat the table below as authoritative if it drifts — update the contract first.

No code changes are required to **select** format/level via env; interpret values at **process startup** unless the optional runtime level behavior below is implemented.

| Variable    | Values                                      | Default       | Role                                                                 |
| ----------- | ------------------------------------------- | ------------- | -------------------------------------------------------------------- |
| `NODE_ENV`  | `production` / `development`                | `development` | Chooses default log **format** when `LOG_FORMAT=auto`.               |
| `LOG_LEVEL` | `fatal` / `error` / `warn` / `info` / `debug` / `trace` | `info`        | Minimum level for the **root** pino instance at startup.            |
| `LOG_FORMAT`| `json` / `pretty` / `auto`                  | `auto`        | `auto` → `json` when `NODE_ENV=production`, else `pretty`.           |

### Optional: log level without process recycle (**follow-up — not v1 acceptance**)

**v1 normative rule** is **process restart or recycle** for `LOG_LEVEL` changes — see [spec.md](../../specs/003-nextjs-structured-logging/spec.md) **SC-005** and [research.md](../../specs/003-nextjs-structured-logging/research.md). This subsection is **ideas for a later track**, not part of current acceptance.

Pino does **not** reload `LOG_LEVEL` from the environment automatically after startup. If a **future** product version requires changing level **in the same OS process** without redeploy, document and implement one approach, for example:

- Periodically re-read `process.env.LOG_LEVEL` and set the **root** `logger.level`, or  
- An internal/admin path that sets `logger.level`.

Until then: **update platform / `.env` and restart or recycle** the Node process.

## Module layout

- **Single place** instantiates pino: `src/lib/logger/logger.ts` (top of file: `import 'server-only'`).
- **Public API**: `getLogger(contextName, options?)` from `@/lib/logger` (re-export barrel as needed).
- **Never** use `console.*` for application logging on server code paths covered by this standard.
- **Never** import the logger from Client Components. `server-only` on the logger module prevents accidental client bundling.

## AsyncLocalStorage (ALS)

- ALS holds **per-request context** (at least `requestId`, optional start time) **only** inside **App Router Route Handlers** wrapped with `withLogging()`.
- **(Follow-up)** Pages Router API routes would use `withPagesLogging()` the same way when introduced.
- **Server Components must not use ALS** for `requestId` or logging context.
- **Middleware** must not use ALS (Edge + no Node context store).

## Request ID rules

- Prefer **`x-request-id`** end-to-end. Middleware ensures every request/response has it.
- **App Router Route Handlers**: `withLogging` reads `x-request-id` or generates a **uuid**, stores it in ALS, and ensures the same id appears on **every log line** for that invocation. Child loggers (`logger.child`) should merge ALS bindings at the `getLogger()` call site when applicable.
- **Server Components**: obtain the id **only** from incoming request headers via **`const h = await headers(); h.get('x-request-id')`** (Next.js 15: **`headers()` is async** — always `await`; no sync access). Pass `requestId` **explicitly** into `getLogger('ContextName', { requestId })` (or an equivalent **typed** API). **Do not** pass `requestId` via `searchParams` unless there is an exceptional, documented reason (URLs leak ids to referrals, logs, and caches). If `x-request-id` is missing, the Server Component path may generate a **one-off uuid for logs only** and must not claim parity with middleware unless headers were actually set.

### Dynamic rendering note

Using `await headers()` (and logging keyed off the request) opts those Server Components into **request-time / dynamic** behavior. Document that for pages that must stay static.

## Wrappers

- **`withLogging(handler)`** (App Router Route Handlers): `export const runtime = 'nodejs'` in **each** route file that uses ALS. Wraps the handler; logs **method, url, statusCode, responseTime**, and **errors**; runs the handler inside ALS.
- **`withPagesLogging(handler)`** (Pages Router): same pattern for `(req, res)` — **implement in a follow-up** when the app has Pages API routes (see scope note at top).

## Acceptance criteria (v1 — `003-nextjs-structured-logging`)

These bullets are **normative for the current spec** ([spec.md](../../specs/003-nextjs-structured-logging/spec.md)); Pages Router items are **not** part of v1 acceptance (see scope note at top).

- `NODE_ENV=production` → stdout is **valid NDJSON** (one JSON object per line).
- `NODE_ENV=development` → **colorized** pretty output (pino-pretty).
- `LOG_FORMAT` overrides the format implied by `NODE_ENV` when not `auto`.
- Each JSON line in production includes **numeric syslog severity** per the documented mapping.
- Every **App Router Route Handler** log line includes **`requestId`** from `x-request-id` or a generated uuid; **consistent within one invocation** via ALS.
- Middleware sets **`x-request-id`** on request/response **without** importing the logger (Edge-safe); normalization rules: [middleware-request-id.md](../../specs/003-nextjs-structured-logging/contracts/middleware-request-id.md).
- Server Components use **`await headers()`**, pass **`requestId` into `getLogger`**, no ALS.
- Redaction: `authorization`, `cookie`, and configured secret keys show `[Redacted]`; no reliance on Express-only `req` shape in App Router.
- `LOG_LEVEL` for v1: **process restart or recycle** required for changes to apply (see spec **SC-005**); optional in-process reload is **not** part of v1 acceptance.
- **`withLogging`** captures **method, url, statusCode, responseTime**, and errors for App Router Route Handlers.
- All participating Route Handler files declare **`export const runtime = 'nodejs'`**.
- Logger entrypoint protected with **`server-only`**; no client import of the logger.
- No `console.log` (or other `console.*` used for app logging) in server-side code covered by this initiative.
- **Unit tests (v1 required)**: **`withLogging()`** success and error paths only (**FR-010**).

### Follow-up (not v1 acceptance)

When the repo adds **`pages/api`** and a Pages Router logging track: implement **`withPagesLogging`**, mirror field/redaction behavior, and add its own tests — **out of scope** until then.

## Explicit non-goals

- Log shipping, log rotation, database query logging, distributed tracing, client-side logging, Edge runtime support (including **no pino in `middleware.ts`**).

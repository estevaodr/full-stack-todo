# Research: Structured logging (002-server-structured-logging)

## Decision: Use `nestjs-pino` + `pino-http` as the single HTTP + app logger

**Rationale**: Official Nest integration wraps `pino` + `pino-http`, supports `genReqId`, serializers, redact lists, and `app.useLogger()` to forward Nest internal logs—matches spec engineering contract (`PinoLogger`, `@InjectPinoLogger`).

**Alternatives considered**:

- **Winston + nest-winston**: weaker NDJSON ergonomics vs pino for high-volume servers.
- **Bare `pino` without nestjs-pino**: more glue code for DI, lifecycle, and Nest `Logger` replacement.

## Decision: Pretty output only when resolved format is `pretty`

**Rationale**: `pino-pretty` must never be loaded in production JSON mode (performance + correctness). Use `pino.transport` targeting `pino-pretty` only when `LOG_FORMAT` resolves to `pretty`; otherwise stdout raw JSON.

**Alternatives considered**:

- Always attach pretty as destination with `sync: false` — risks accidental prod pretty if misconfigured.

## Decision: Request id = `x-request-id` header else `randomUUID()`

**Rationale**: Matches **FR-006**; `uuid` package already specified.

## Decision: Redaction — header + nested `password` keys

**Rationale**:

- `pino-http` / serializers: set `redact: ['req.headers.authorization']` (paths may vary by serializer shape; validate against actual serialized req object).
- Nested `password`: `pino` `redact` path globs are limited; implement **custom `req` serializer** (or post-process clone with depth cap) that walks JSON body objects and replaces any own-property key exactly `password` at any depth with `[Redacted]`, without logging full multi-megabyte bodies (truncate or sample per plan in implementation).

**Alternatives considered**:

- Redact only `req.body.password` — rejected by clarification **B**.

## Decision: Runtime `LOG_LEVEL` without restart

**Rationale**: Pino’s numeric level is updated via `logger.level = 'info'` etc. A small in-process **sync loop** (default **1s**) reads `process.env.LOG_LEVEL`, normalizes, and applies to the **root** logger. Satisfies clarification **A** (in-process env as source of truth) and **SC-004** “within 1 minute”.

**Alternatives considered**:

- SIGHUP reload — unnecessary complexity for container env that often does not mutate in-process env without restart.

## Decision: `LOG_FORMAT` vs runtime (`SC-004` split)

**Rationale**: `nestjs-pino` / pino **transports** are wired at **module bootstrap**. Changing JSON vs pretty is therefore **effective after process restart** when `LOG_FORMAT` (or related env) changes—no silent hot-swap in v1. **`LOG_LEVEL`** remains the **in-process** knob (poll `process.env.LOG_LEVEL` → `logger.level`) without restart.

**SC-004 wording** (aligned with spec): **(a) Format** — restart to apply transport. **(b) Level** — tests use **next sync** after mutation (default poll **1s**); **manual runbooks** may use **≤1 minute** wall-clock slack. Automated CI SHOULD prefer fake timers over wall-clock waits.

## Decision: Invalid `LOG_LEVEL` / `LOG_FORMAT` at startup → fail fast

**Rationale**: Matches clarifications + **FR-014**/**FR-015**; Joi `.custom()` or strict `.valid()` with **no silent fallback**.

**After startup**: invalid `LOG_LEVEL` at a sync tick does **not** exit the process (sticky last-good level); invalid in-process `LOG_FORMAT` does not change transport — [scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017**, [runtime-log-level.md](./contracts/runtime-log-level.md).

## Decision: `LOG_FORMAT` includes `auto` and equals unset

**Rationale**: Clarification **A** — normalize empty string to `auto`; treat `auto` as derive-from-`NODE_ENV`.

## Decision: AsyncLocalStorage for request context

**Rationale**: Spec names ALS explicitly. Implement a tiny `RequestContext` helper (store: `{ reqId: string }` minimum) set in HTTP middleware/interceptor chain **before** controllers; read in services if needed.

**Alternatives considered**:

- `@nestjs/cls` — adds dependency; only adopt if ALS wiring becomes unwieldy (YAGNI for v1).

## Decision: TypeORM query logging vs new `LOG_LEVEL`

**Rationale**: Feature spec marks **DB query logging** as out of scope, but app already ties TypeORM `logging` to legacy `LOG_LEVEL === 'DEBUG'`. **Minimal alignment**: map **SQL logging on** when resolved pino level is **`debug` or `trace`** (and keep `synchronize`/migration rules per constitution unchanged).

**Alternatives considered**:

- Leave uppercase `INFO/DEBUG` — conflicts with new pino levels + **FR-014**; migrate fully in implementation.

## Decision: Zero `console.*` in `apps/server`

**Rationale**: Clarification **A** + **FR-010**/**SC-005**. Add ESLint `no-console` for `apps/server/**`; replace `main.ts` `Logger.log` with pino-backed logger after app creation, with **stderr** for pre-bootstrap fatals only.

## Open questions for implementation (non-blocking)

- Request id JSON field: locked to **`reqId`** — [contracts/log-schema.md](./contracts/log-schema.md), [contracts/http-request-logging.md](./contracts/http-request-logging.md).

# Contract: HTTP request logging edge cases (`apps/server`)

Extends **FR-006**, **FR-007**, **FR-009**, **FR-013**, **NFR-001**, spec **Edge Cases**.

## Transport surfaces (**CHK022** / **FR-013**)

| Surface | Mandatory **`reqId`** on **pino-http** + **`LoggingInterceptor`** lines (**FR-006**, **FR-009**)? | ALS HTTP lifecycle (**FR-012**)? |
|---------|---------------------------------------------------------------------------------------------------|-------------------------------------|
| Default Nest **Express** HTTP pipeline (`NestFactory.create` without Fastify adapter) — ordinary request/response traffic | **Yes** (per tables below) | **Yes** |
| **WebSocket** gateways, post-upgrade message handlers (`@nestjs/websockets`), or other non-REST HTTP protocols | **No** — **out of scope** for v1 acceptance; logs **MAY** omit **`reqId`** | **No** — not required unless spec amended |
| **Fastify** or any **non-Express** HTTP adapter | **No** — **out of scope** until spec/plan explicitly adopts that adapter | **No** |

**WS upgrade request**: single inbound **HTTP** upgrade request **MAY** be logged like any other Express HTTP request (including **`reqId`** for that one shot); **subsequent** socket frames / gateway callbacks are **not** covered by the mandatory HTTP tables in v1.

## HTTP logging stack (**CHK027** / **FR-009** / **FR-006**)

Resolves ambiguity: **“single interceptor”** in **FR-009** means **one** Nest **`LoggingInterceptor`** class for request **outcome** (success + error). It does **not** forbid **pino-http** automatic **access** lines — those are **middleware**, a different role.

| Component | Mechanism | Role |
|-----------|-----------|------|
| **pino-http** | Middleware / nestjs-pino wiring | Automatic **HTTP access** request/response line(s); **FR-006** **MUST** carry **`reqId`** |
| **`LoggingInterceptor`** | Nest interceptor | **Single** FR-009 outcome logger (success + error); **FR-006** **MUST** carry **`reqId`** |

- **Both** are **allowed** and **expected** in v1; they share one **pino** sink (**FR-009**, [nest-logging-tests.md](./nest-logging-tests.md)).
- **Not allowed** without spec amendment: a **second** Nest interceptor duplicating the FR-009 outcome role, or an extra ad-hoc access logger that bypasses **`reqId`** / redaction rules.

## `reqId` on which lines (**FR-006**)

Defines **HTTP-access-related** for correlation and rules out alternate field names (v1).

| Log source | `reqId` on stdout |
|------------|-------------------|
| **pino-http** (nestjs-pino) automatic **request / response** line for an inbound HTTP request | **MUST** |
| **`LoggingInterceptor`** line for that request (success or error, **FR-009**) | **MUST** |
| Other **`PinoLogger`** lines emitted while HTTP **AsyncLocalStorage** request context is active | **SHOULD** when the stack binds `reqId` to the logger; omission only for calls documented as non-request-scoped (e.g. startup tasks) |
| Startup, shutdown, handlers **without** an HTTP request (**spec** non-HTTP edge case) | **MUST NOT** be required |

**Field name:** correlation on structured JSON lines uses **`reqId`** only — [log-schema.md](./log-schema.md).

## Request body on stdout (scope)

Answers **which** log paths may carry body data vs forbid raw dumps (**FR-007**, large-body edge case).

| Rule | Requirement |
|------|-------------|
| **No mandatory full body** | No spec path **requires** writing the full raw request body to **stdout** for acceptance. |
| **Optional snapshots** | **pino-http** / **LoggingInterceptor** (or serializers they use) MAY attach a **bounded** representation of the body per §**Serialization limits** when useful for debugging; that snapshot is subject to **FR-007** + [redaction.md](./redaction.md). |
| **Large or binary** | MUST NOT expand full payload on stdout; omit, truncate, or neutral marker only—redaction still applies to any included fragment. |
| **Application `PinoLogger` lines** | Application-level log calls MUST **not** rely on dumping full inbound HTTP bodies by default; if a service logs request-derived data, it MUST follow the same redaction rules for any structured fields that mirror body/header secrets. |

## Serialization limits (large bodies) (**CHK023** / **NFR-001**)

- **Process-wide log latency / throughput SLA** (p99 write time, max lines/sec): **not** required at spec level in v1; plan “avoid deep clone of huge bodies” remains guidance.
- **Optional request-body preview** (any single structured field or string fragment representing all or part of the inbound HTTP body on stdout from access/interceptor paths): **MUST** be **≤ 8192 UTF-8 bytes** after truncation/preview selection and **before** JSON serialization to the line; implementations **MAY** append a fixed marker such as `[truncated]` outside that byte budget. **MUST NOT** emit the full raw body when its size exceeds this cap.
- **Very large payloads**: implementation **SHOULD** omit or neutral-marker the body field in logs rather than buffering entire body solely for logging.

## `x-request-id` header

| Condition | Behavior |
|-----------|----------|
| Header **absent** | Generate new UUID; use as **`reqId`** for that request lifecycle (**FR-006**). |
| Present, **empty** or **only whitespace** after `trim()` | Treat as **absent** → generate new UUID. |
| **Multiple** header values (e.g. duplicate headers, comma-separated) | Use the **first** non-empty value after per-element `trim()`; if none, treat as absent. |

**Retries / duplicate requests**: each inbound HTTP request is independent; **`reqId`** is per request instance. Reusing the same header value across retries is allowed; correlation is **per request**, not deduplicated across clients.

## Request body & `Content-Type`

| Condition | Redaction / logging obligation |
|-----------|-------------------------------|
| **`Content-Type` missing** or not indicating JSON | Pipeline MUST **not** dump raw body bytes to stdout to satisfy redaction; MAY log a neutral marker (e.g. `body: 'omitted'`, `bodyParse: 'non-json'`) without echoing secrets. |
| Body **not valid JSON** | Do **not** serialize raw body; same as above. |
| JSON parses to **non-object** (array, string, number, null) | **FR-007** password walk applies to **objects only**; MUST **not** emit raw primitive/array payload as substitute for redacted object fields. |
| Valid **object** | Apply **`password`** own-property redaction per **FR-007** and [redaction.md](./redaction.md). |

Large or binary bodies: follow spec edge case — no full raw dump; redaction still applies to any included snapshot.

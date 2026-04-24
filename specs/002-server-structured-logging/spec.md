# Feature Specification: Structured logging for API server

**Feature Branch**: `002-server-structured-logging`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Implement a production-ready structured logging system for a NestJS application using nestjs-pino, pino-http, and pino-pretty. The logger must output JSON in production and human-readable pretty-print in development, support syslog severity levels (RFC 5424), automatically propagate request context (trace ID) across the entire request lifecycle via AsyncLocalStorage, redact sensitive fields before writing to stdout, and be controllable via environment variables without code changes. Dependencies: npm install nestjs-pino pino-http pino-pretty uuid. Environment Variables: NODE_ENV (production/development, default: development) — controls log transport format; LOG_LEVEL (fatal/error/warn/info/debug/trace, default: info) — minimum log level to output; LOG_FORMAT (json/pretty, default: auto by NODE_ENV) — explicit format override. Usage contract: All services must use PinoLogger with @InjectPinoLogger(ServiceName.name). Never use new Logger() from @nestjs/common. Acceptance criteria: NODE_ENV=production outputs valid newline-delimited JSON to stdout; NODE_ENV=development outputs colorized pretty-print text; LOG_FORMAT env var overrides the format derived from NODE_ENV; Every HTTP request log includes reqId from x-request-id header or generated uuid; req.headers.authorization and req.body.password are redacted as [Redacted]; Log level is controlled via LOG_LEVEL without restarting the app; All NestJS internal logs are routed through pino; LoggingInterceptor captures both successful responses and errors; No console.log calls exist anywhere in the codebase; Unit tests exist for LoggingInterceptor covering success and error paths. Out of scope: log shipping, log rotation, database query logging, distributed tracing. The feature must be implement in the apps/server."

## Clarifications

### Session 2026-04-24

- Q: On startup, if `LOG_LEVEL` is invalid (unknown token), what should happen? → A: Fail fast with non-zero exit and clear configuration error (Option A).
- Q: Without process restart, how should `LOG_LEVEL` changes take effect? → A: In-process — effective minimum level follows current `process.env.LOG_LEVEL` whenever the logging stack evaluates verbosity (Option A).
- Q: Should `LOG_FORMAT=auto` be a supported explicit token? → A: Yes — supported set is `json`, `pretty`, `auto`; unset behaves the same as `auto` (Option A).
- Q: Redaction scope for `password` in request body? → B: Any nesting depth — every own-property whose key is exactly `password` has its value redacted (Option B).
- Q: Allow any `console.*` besides `console.log`? → A: Zero `console.*` under entire `apps/server` tree; bootstrap uses `process.stderr.write` or equivalent non-console channel (Option A).

## Contracts

Normative detail for implementation and tests (extends **FR-001**, **FR-002**, **FR-005**, **FR-006**, **FR-007**, **FR-008**, **FR-009**, **FR-010**):

- [Environment variables](./contracts/environment.md)
- [Log schema & NDJSON stdout lines](./contracts/log-schema.md)
- [Redaction placeholder](./contracts/redaction.md)
- [HTTP request logging edge cases](./contracts/http-request-logging.md)
- [Example JSON log line](./contracts/log-line.example.json)
- [Static analysis — no `console`](./contracts/static-analysis-console.md)
- [Bootstrap configuration errors](./contracts/bootstrap-config-errors.md)
- [Runtime `LOG_LEVEL` semantics](./contracts/runtime-log-level.md)
- [Application logger (`PinoLogger`)](./contracts/application-logger.md)
- [Nest logs, pino, and tests](./contracts/nest-logging-tests.md)
- [Scenario coverage — env phases, transport failure, concurrency](./contracts/scenario-coverage.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operators diagnose production issues from logs (Priority: P1)

Operations and support staff rely on standard output logs in production to triage incidents. Each line must be machine-parseable structured data with consistent severity semantics so log aggregators and runbooks can filter and alert reliably.

**Why this priority**: Production observability is the primary value of structured logging; without reliable structured output, downstream monitoring is blocked.

**Independent Test**: Deploy or run server with production-style environment; emit sample traffic; confirm every emitted log line is valid structured output and includes request correlation identifier where HTTP handling applies.

**Acceptance Scenarios**:

1. **Given** production-style runtime configuration, **When** the API server handles traffic and emits logs to standard output, **Then** each log line is valid standalone structured data suitable for newline-delimited ingestion.
2. **Given** production-style runtime configuration, **When** an HTTP request is processed, **Then** request-scoped logs include a stable request identifier for that request (from inbound `x-request-id` when present, otherwise a newly generated identifier).

---

### User Story 2 - Developers read logs comfortably in local development (Priority: P1)

Developers working locally need human-readable, visually scannable logs (including severity cues) without manually formatting JSON while debugging.

**Why this priority**: Fast local feedback reduces time to fix defects; parity of information with production without sacrificing readability.

**Independent Test**: Run server with development-style configuration; trigger API calls; confirm logs are readable without JSON tooling and convey severity clearly.

**Acceptance Scenarios**:

1. **Given** development-style runtime configuration, **When** the server logs normal activity, **Then** output uses human-oriented formatting with clear severity presentation (including colorized severity where the terminal supports it).

---

### User Story 3 - Security and compliance staff trust log redaction (Priority: P2)

Sensitive request data must never appear in clear text in logs. Credentials and bearer tokens must be masked consistently before any write to standard output.

**Why this priority**: Prevents accidental credential leakage via logs; required for safe operations even before log shipping.

**Independent Test**: Send HTTP requests that include `Authorization` header and `password` values at top level and nested inside JSON bodies; verify log output shows redacted placeholders instead of raw secrets.

**Acceptance Scenarios**:

1. **Given** an inbound HTTP request with `Authorization` header set, **When** request is logged, **Then** the authorization value appears only as a redacted placeholder (e.g. `[Redacted]`), never the raw secret.
2. **Given** an inbound JSON request body where a property named `password` exists at any nesting depth, **When** request is logged, **Then** every such password value appears only as a redacted placeholder, never the raw value.

---

### User Story 4 - Platform engineers tune logging without code changes (Priority: P2)

Teams must tune logging **without code edits**: minimum verbosity follows in-process `process.env.LOG_LEVEL` **without process restart** (FR-005). Output shape (JSON vs pretty) is selected only via `LOG_FORMAT` / `NODE_ENV` rules (FR-002–FR-004); **resolved transport shape is fixed for the lifetime of the process**—applying a new `LOG_FORMAT` requires **restarting the Node process** (or starting a new process/replica with updated env), not in-process env mutation alone (v1).

**Why this priority**: Reduces release churn for operational tuning; supports incident response and noisy-neighbor mitigation.

**Independent Test**: Set documented environment variables; confirm shape after **process start** and again **after restart** when `LOG_FORMAT` changes; mutate in-process `process.env.LOG_LEVEL` on a running server and observe verbosity change **without** restart.

**Acceptance Scenarios**:

1. **Given** `LOG_FORMAT` is unset, `auto`, `json`, or `pretty`, **When** the server starts, **Then** output format follows the resolved rule: `json` or `pretty` always wins over coarse environment; `auto` or unset derives from `NODE_ENV` per FR-002/FR-003.
2. **Given** a running server, **When** in-process `process.env.LOG_LEVEL` is updated to a different allowed value, **Then** new verbosity threshold applies on subsequent log evaluations without restarting the process.
3. **Given** operators deploy a new supported `LOG_FORMAT` (or change coarse env such that `auto` resolves differently), **When** a **new** server process starts with that configuration, **Then** stdout transport shape matches FR-002/FR-003/FR-004 for that process (restart or new replica required; mutating only in-process `LOG_FORMAT` on an already-running process does **not** rewire transport in v1).

---

### User Story 5 - Consistent application logging contract (Priority: P2)

All application modules log through one injectable logger per class; framework-internal messages follow the same pipeline so support sees one stream with one schema and severity model.

**Why this priority**: Avoids split-brain logging, duplicate formats, and accidental use of unstructured legacy loggers.

**Independent Test**: Code review plus runtime check: sample services use injectable logger with class name context; Nest framework logs appear in the same pipeline; automated search confirms **no** `console.*` usage anywhere under `apps/server` (including tests).

**Acceptance Scenarios**:

1. **Given** any application service class, **When** it emits logs, **Then** it uses the project-approved injectable logger pattern (named by owning class) and does not construct the legacy framework logger directly.
2. **Given** normal server startup and request handling, **When** framework emits internal messages, **Then** those messages appear in the same structured logging pipeline as application logs.

---

### User Story 6 - Request lifecycle observability (Priority: P3)

For each HTTP request, both successful completion and failures are captured in a consistent interceptor-based record suitable for latency and outcome debugging.

**Why this priority**: Uniform request/response logging improves supportability; lower than P1/P2 because base structured logging can exist without interceptors, but acceptance criteria require it.

**Independent Test**: Issue successful and failing HTTP calls; verify interceptor-attributed records for both paths; automated unit tests cover success and error branches.

**Acceptance Scenarios**:

1. **Given** an HTTP request that completes successfully, **When** response returns to client, **Then** interceptor-associated logging captures success path metadata as defined by the feature tests.
2. **Given** an HTTP request that throws or maps to an error response, **When** error propagates, **Then** interceptor-associated logging captures error path metadata as defined by the feature tests.

---

### Edge Cases

- Inbound request lacks `x-request-id`: system generates a new identifier and uses it consistently for that request’s lifecycle.
- `x-request-id` present but empty, whitespace-only, or duplicated / multi-valued: resolution per [contracts/http-request-logging.md](./contracts/http-request-logging.md).
- Malformed JSON body, JSON that is not an object, or missing / non-JSON `Content-Type`: MUST NOT write raw body to stdout in a way that bypasses redaction; behavior per [contracts/http-request-logging.md](./contracts/http-request-logging.md).
- Invalid or unsupported `LOG_LEVEL` at startup (before traffic): process MUST exit with non-zero status and surface a clear configuration error; silent fallback to a default level is forbidden.
- Invalid `LOG_LEVEL` **after** startup (running process): MUST NOT exit; effective level stays at last successfully applied allowed level until env reads valid again — [contracts/scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017** (maps **FR-014** vs **FR-005**).
- `LOG_FORMAT` unset, empty, or `auto`: same meaning — derive json vs pretty from `NODE_ENV` (see FR-004). `json` or `pretty` forces that shape regardless of `NODE_ENV`. Invalid non-empty `LOG_FORMAT` at startup: fail fast per FR-015. In-process `LOG_FORMAT` changes (valid or invalid) do not rewire transport in v1; invalid post-bootstrap values do not exit — same contract §**CHK017**.
- Concurrent overlapping requests: each request’s context (including identifier) does not leak across requests under parallel load; cross-request log ordering is unspecified; worker / off-ALS paths — §**CHK019** in [contracts/scenario-coverage.md](./contracts/scenario-coverage.md).
- Logger or stdout transport failure mid-process (disk full, broken pipe, etc.): **no** mandated automatic recovery or secondary sink in v1 — intentional gap per §**CHK018** in [contracts/scenario-coverage.md](./contracts/scenario-coverage.md).
- Large request bodies: redaction rules still apply; logging must not dump full raw body in violation of redaction rules for sensitive keys; **which paths may include bounded body snapshots vs omit body** is per [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Request body on stdout (scope)**; **byte cap and no full-buffer-for-logging** per §**Serialization limits** (**NFR-001** / **CHK023**).
- Non-HTTP code paths (startup, cron, message handlers): logging still works; request identifier may be absent where no HTTP request exists—documented as acceptable.
- WebSocket gateways, post-upgrade traffic, Fastify / non-Express HTTP: **out of scope** for mandatory HTTP **`reqId`** + interceptor contract — [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Transport surfaces** (**CHK022** / **FR-013**).
- Bootstrap failures before structured logger exists: human-readable fatal text MAY go to standard error via `process.stderr.write` (or equivalent) only — **not** via `console.*` (per FR-010).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: API server scoped to `apps/server` MUST emit all application and framework log lines through a single structured logging pipeline with severity levels aligned to **RFC 5424 severity semantics** (ordering / names: `fatal`, `error`, `warn`, `info`, `debug`, `trace`). Canonical JSON field names and **normative pino numeric `level` values** are per [contracts/log-schema.md](./contracts/log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`** (**CHK026**). Automated golden table: **tasks** T028.
- **FR-002**: In production-style coarse environment (`NODE_ENV=production`), standard output MUST contain only newline-delimited structured records where each line is valid JSON parseable as a single object (NDJSON line rules per [contracts/log-schema.md](./contracts/log-schema.md)).
- **FR-003**: In development-style coarse environment (`NODE_ENV=development` defaulting to development when unset), standard output MUST use human-oriented formatting including colorized severity when attached to a color-capable terminal stream.
- **FR-004**: `LOG_FORMAT` controls transport shape. Allowed values (ASCII case-insensitive unless plan documents otherwise): `json`, `pretty`, `auto`. Unset or empty string MUST behave identically to `auto`. When `LOG_FORMAT` is `json` or `pretty`, that shape MUST apply regardless of `NODE_ENV`. When `LOG_FORMAT` is `auto` or unset, shape MUST derive from coarse environment: `NODE_ENV=production` → newline-delimited JSON lines per FR-002; `NODE_ENV=development` or unset per project assumptions → human-oriented output per FR-003. Resolved JSON vs pretty **transport** is fixed at **logger module bootstrap** for the life of the process; changing effective transport shape for a running deployment **requires** a **new** Node process whose startup env reflects the new `LOG_FORMAT` / coarse env (restart or replace instance). In-process mutation of `process.env.LOG_FORMAT` alone **does not** rewire transport in v1.
- **FR-005**: Minimum verbosity MUST be controlled by `LOG_LEVEL` (fatal, error, warn, info, debug, trace; default `info` when unset). Without restarting the Node process, changing in-process `process.env.LOG_LEVEL` to another allowed value MUST change which severities emit on **subsequent log evaluations** (defined per [contracts/runtime-log-level.md](./contracts/runtime-log-level.md)). Caching between sync ticks is **allowed** only while **observable invariant I1** in that contract holds; automated tests SHOULD use fake timers across **≥ one** sync interval.
- **FR-006**: **HTTP access records** (automatic **pino-http** request/response logging) and **`LoggingInterceptor`** request outcome records MUST include canonical field **`reqId`** (string), sourced per [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**`reqId` on which lines** from `x-request-id` when a usable value is present, otherwise from a newly generated UUID. **Mandatory** correlation applies only on **in-scope** surfaces per §**Transport surfaces** (**FR-013**). Other application logs during an HTTP request **SHOULD** carry **`reqId`** when request context is bound; correlation field name is **`reqId`** only ([contracts/log-schema.md](./contracts/log-schema.md)).
- **FR-007**: Before writing to standard output, logging pipeline MUST redact the HTTP `Authorization` header value and every applicable **`password`** value to the literal **`[Redacted]`** (per [contracts/redaction.md](./contracts/redaction.md)). For any structured snapshot of the parsed request body included in logs, every **own-property** whose key is exactly `password` at **any object nesting depth** MUST have its value redacted before serialization (arrays, prototypes, non-plain values: per [contracts/redaction.md](./contracts/redaction.md) §**`password` walk**). Key match is case-sensitive for `password` unless plan documents otherwise. Non-JSON / non-object bodies: no raw secret echo per [contracts/http-request-logging.md](./contracts/http-request-logging.md). **No** log path is **required** to emit the full raw body; optional body fragments are **bounded** per [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Request body on stdout (scope)** and §**Serialization limits** (**NFR-001**).
- **FR-008**: Application services MUST obtain logger only via the approved injectable logger pattern with name equal to owning class name; direct use of the framework’s legacy static logger constructor pattern is forbidden in `apps/server` application sources. **Approved** pattern = **`PinoLogger`** + **`@InjectPinoLogger(Class.name)`** per [contracts/application-logger.md](./contracts/application-logger.md) (aligns Assumptions / stakeholder Input).
- **FR-009**: HTTP pipeline MUST include **exactly one** Nest **`LoggingInterceptor`** (fixed class name in plan/tests) that records **both** successful completions and error outcomes to the **pino** pipeline. **Automatic `pino-http` access logging** (middleware) **SHOULD** remain enabled and does **not** violate “single interceptor” — **FR-006** treats **pino-http** lines and **`LoggingInterceptor`** lines as **separate required** **`reqId`** sources, not duplicates of the same role. Allowed stack and anti-duplication rules: [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**HTTP logging stack** (**CHK027**). Nest framework and these components MUST use the same **pino**-backed pipeline per [contracts/nest-logging-tests.md](./contracts/nest-logging-tests.md).
- **FR-010**: Entire `apps/server` project tree (application sources, co-located unit/integration tests, and project-local tooling scripts that ship in-repo under that path) MUST contain **zero** references to the global `console` object for any purpose (`console.log`, `console.error`, `console.warn`, `console.debug`, etc.). Pre-logger bootstrap and configuration fatal errors MUST surface text via `process.stderr.write` or another non-`console` channel documented in the implementation plan. **Tests, Nest harness, and dependencies:** per [contracts/nest-logging-tests.md](./contracts/nest-logging-tests.md) (ESLint applies to `**/*.spec.ts`; `node_modules` out of scope).
- **FR-011**: Automated unit tests MUST cover the HTTP logging interceptor for success path and error path independently.
- **FR-012**: Request-scoped context (at minimum request identifier for HTTP) MUST propagate across asynchronous continuations for the same in-flight request for the full HTTP lifecycle, using the async context mechanism documented in the implementation plan. Concurrent isolation, cross-request ordering, and worker-thread boundaries are per [contracts/scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK019**.
- **FR-013**: Feature implementation scope is limited to `apps/server`; log shipping, log rotation, database query logging, and distributed tracing are explicitly out of scope. **WebSocket** surfaces, **non-Express** HTTP adapters (e.g. Fastify), and other non-default-Express HTTP entrypoints are **out of scope** for mandatory **`reqId`** / **pino-http** access logging / **`LoggingInterceptor`** / ALS rules in **FR-006**/**FR-009**/**FR-012** — v1 **targets Express-backed HTTP only**; boundary per [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Transport surfaces**.
- **FR-014**: If `LOG_LEVEL` is set at process start to a value outside the allowed set `{fatal,error,warn,info,debug,trace}`, the process MUST exit with non-zero status before accepting traffic and MUST surface a clear configuration error (standard error is acceptable if structured logger is not yet available). Message shape and exit-code precision beyond “non-zero + human-readable + actionable” are per [contracts/bootstrap-config-errors.md](./contracts/bootstrap-config-errors.md) (v1: **no** mandatory JSON or fixed exit code). **After** the server has passed startup validation and is running, invalid `process.env.LOG_LEVEL` at a sync tick MUST NOT terminate the process; sticky last-good level applies per [contracts/scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017**.
- **FR-015**: If `LOG_FORMAT` is set at process start to a non-empty value outside the allowed set `{json,pretty,auto}` (after trim and case normalization per FR-004), the process MUST exit with non-zero status before accepting traffic and MUST surface a clear configuration error (same bootstrap error channel as FR-014). Same contract as **FR-014** for stderr content and exit-code expectations. Post-bootstrap `LOG_FORMAT` semantics (including invalid in-process values) are per [contracts/scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017** (no hot-reload; invalid mutations do not exit).

### Non-functional requirements

- **NFR-001** (**CHK023** — large bodies / serialization): No numeric **latency or throughput SLA** for log writes in v1. Optional HTTP body snapshots on stdout **MUST** obey byte cap and anti-buffering rules in [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Serialization limits** (normative **8192 UTF-8 bytes** max per preview). Aligns large-body **Edge Cases** with measurable acceptance beyond informal plan notes.
- **NFR-002** (**CHK024** — time): Canonical JSON log **`time`** = Unix epoch **milliseconds** per [contracts/log-schema.md](./contracts/log-schema.md). **Clock skew**, NTP, and cross-host wall-clock alignment are **explicitly out of scope**. Extra timezone string fields on JSON lines are **not** required; pretty-print local rendering is **optional** per that contract.

### Key Entities

- **Log record**: One emitted log event with severity, message, optional structured attributes, optional request correlation fields, and timestamps. Canonical timestamp on JSON stdout lines: pino **`time`** (epoch ms) per [contracts/log-schema.md](./contracts/log-schema.md) (**NFR-002** / **CHK024**).
- **Request context**: Per-request data bound for the lifetime of HTTP handling, including request identifier and any fields propagated through async continuations.
- **Redaction rule**: Named path or key pattern whose values are replaced before serialization to output; includes header `Authorization` and any object property key exactly `password` at arbitrary depth in logged body snapshots.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a production-style configuration runbook test, 100% of sampled non-empty standard-output log lines pass JSON validation as single-line documents (**minimum sample: 50 lines** across startup + mixed HTTP success/error traffic). The **50**-line floor is normative; automated acceptance (**tasks** T026) MUST use **≥ 50** lines from the same population — [contracts/log-schema.md](./contracts/log-schema.md) §**SC-001 sample size**.
- **SC-002** (**manual / runbook**, not default CI): In a development-style configuration, a human reviewer follows the rubric in [quickstart.md](./quickstart.md) §**Manual acceptance — SC-002** on **10** sampled stdout lines from mixed HTTP traffic **without** using a JSON parser; for each line they record **(A)** a visible severity cue (name or color tied to one of `fatal`…`trace`) and **(B)** a visible request correlation value matching the active request’s **`reqId`** (from inbound `x-request-id` or generated UUID). **Pass** = 10/10 lines where both (A) and (B) are correct per rubric. Optional future **snapshot** tests in CI do not replace this criterion unless the spec is amended.
- **SC-003**: Redaction smoke test: 0 occurrences of raw bearer token or raw password value in standard output across 20 crafted requests, including nested `password` keys and top-level header/body cases.
- **SC-004**: Configuration-only drill: **(a) Format** — after each supported `LOG_FORMAT` change, a **new server process** started with that env shows stdout shape per FR-002/FR-003/FR-004 **without code edits** (restart or new replica acceptable; no requirement that shape flips on a long-lived process without restart). **(b) Level** — mutating in-process `process.env.LOG_LEVEL` per **FR-005** changes which severities emit **no later than the next application** of the env→logger sync (default poll interval **1 second**, per [research.md](./research.md)); **automated tests SHOULD use fake timers** tied to that interval. **Manual runbooks** MAY wait up to **1 minute** wall-clock as sufficient slack before sampling logs.
- **SC-005** (**automated**): **ESLint** `no-console` = **error** on all `apps/server/**/*.ts` sources per [contracts/static-analysis-console.md](./contracts/static-analysis-console.md); **`npx nx lint server`** MUST pass on the default CI path. (Ad-hoc `rg` is optional documentation-only sanity check; ESLint is authoritative.)
- **SC-006**: Test suite includes at least two dedicated tests for interceptor behavior (success and error) that pass in CI.

### Enforcement (automated vs manual)

| ID | Default CI | Manual / runbook |
|----|------------|------------------|
| **SC-001** | Recommended / tasks | Runbook may supplement |
| **SC-002** | Not required unless team adds optional snapshots | **Required** for release sign-off per quickstart rubric |
| **SC-003** | Recommended / tasks | May supplement |
| **SC-004 (a)** | Integration or scripted restart | Operator restart OK |
| **SC-004 (b)** | Tests with fake timers + sync contract | Wall-clock ≤ 1 min OK for humans |
| **SC-005** | `npx nx lint server` (ESLint `no-console`) | None |
| **SC-006** | `npx nx test server` (interceptor specs) | None |

## Assumptions

- Target codebase location for all changes: `apps/server` only.
- Stakeholder-selected implementation packages (npm): `nestjs-pino`, `pino-http`, `pino-pretty`, `uuid`, consistent with existing NestJS stack in the monorepo.
- Startup env validation: **Joi** in `ConfigModule.forRoot` is the **v1 reference implementation** for **FR-014**/**FR-015**; swap to another validator allowed only if behavior matches [contracts/environment.md](./contracts/environment.md) §**Startup validation library** (**CHK025**).
- Engineering usage contract (traceability to acceptance tests): same as **FR-008** — [contracts/application-logger.md](./contracts/application-logger.md) (`PinoLogger`, `@InjectPinoLogger(Class.name)`, forbid `new Logger()` / primary `@nestjs/common` `Logger` for app logs). HTTP outcome logging implemented as `LoggingInterceptor`. Request context propagation uses Node `AsyncLocalStorage` unless plan documents an equivalent.
- `NODE_ENV` values of interest are at least `production` and `development`; default when unset treated as `development` for format defaults.
- Syslog / **RFC 5424** alignment: **normative** label ↔ numeric **`level`** table + auditor path (no pino source required) in [contracts/log-schema.md](./contracts/log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`**; **tasks** T028 (**CHK026**).
- Runtime `LOG_LEVEL` (no restart): source of truth is in-process `process.env.LOG_LEVEL`; tests or operators update that variable and subsequent log evaluations honor it. Platform env changes that never refresh in-process `process.env` require a new process or documented platform hook outside this feature’s scope.
- Invalid `LOG_LEVEL` at startup: fail fast per FR-014 (clarified session 2026-04-24). Invalid `LOG_LEVEL` while running: sticky last-good, no exit — [contracts/scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017**.
- `LOG_FORMAT`: supported tokens `json`, `pretty`, `auto`; unset or empty equals `auto` (clarified session 2026-04-24). Invalid non-empty values fail fast per FR-015. Transport shape follows resolution at **process start** only; new value applies after **restart** (v1), unlike `LOG_LEVEL` (in-process, no restart). Post-bootstrap `LOG_FORMAT` mutations: §**CHK017**.
- Mid-process logger/transport failure: no v1 recovery mandate — §**CHK018** in [contracts/scenario-coverage.md](./contracts/scenario-coverage.md).
- Body `password` redaction: any nesting depth, key exactly `password` (clarified session 2026-04-24).
- No `console.*` anywhere under `apps/server`; bootstrap uses stderr writes only (clarified session 2026-04-24).
- Request correlation on JSON stdout: canonical field **`reqId`** — [contracts/log-schema.md](./contracts/log-schema.md), [contracts/http-request-logging.md](./contracts/http-request-logging.md).
- Out of scope items remain excluded from acceptance unless separately specified later.
- Log record **time** semantics, timezone strings, clock skew: **NFR-002** + [contracts/log-schema.md](./contracts/log-schema.md) (**CHK024**).

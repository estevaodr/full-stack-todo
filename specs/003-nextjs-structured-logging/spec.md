# Feature Specification: Server-side structured logging (web app)

**Feature Branch**: `003-nextjs-structured-logging`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Feature derived from `docs/logging/production-structured-logging-nextjs.md` — production-ready structured logging, request correlation, redaction, environment-driven format and verbosity, Node-only server execution, Edge-safe middleware correlation only."

## Clarifications

### Session 2026-04-24

- Q: Must this deliverable include the legacy Pages Router API logging wrapper and its automated tests, or App Router only? → A: **B** — **App Router only** for this feature; Pages Router wrapper and its tests are **deferred** until the app ships at least one `pages/api` route (follow-up).
- **Normative acceptance testing (B)**: Required automated tests for this feature cover **`withLogging` (App Router) only**. **`withPagesLogging`**, Pages Router API routes, and any Pages-only tests are **out of scope** for acceptance until a follow-up track (see **FR-010**).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Correlate all server activity for one request (Priority: P1)

As an **operator** investigating errors or slow requests, I need **every server-emitted log line for a single HTTP request** to carry the **same correlation identifier**, so I can filter logs in my toolchain without guessing timestamps or free text.

**Why this priority**: Without correlation, incident response and performance analysis are unreliable; this is the core value of structured server logging.

**Independent Test**: Send a single HTTP request through the app, trigger multiple log statements in the server path that handles that request, and verify every resulting log record includes an identical correlation identifier for that request lifecycle.

**Acceptance Scenarios**:

1. **Given** a client sends a request with an existing correlation header, **When** the server handles the request and emits logs in the HTTP handler path, **Then** every log line for that invocation includes that identifier (or a documented, consistent substitute if the header is absent).
2. **Given** a client sends a request without a correlation header, **When** the server handles the request, **Then** the platform assigns an identifier before application handlers run and downstream logs for that request use it consistently.
3. **Given** server-rendered UI that logs without shared async storage for correlation, **When** a page or layout logs, **Then** the component path still includes a correlation value obtained from the incoming request metadata passed explicitly into the logging API (no hidden global request context for that path).
4. **Given** a client sends a **valid** custom **`x-request-id`** that is **opaque ASCII** (not necessarily a UUID) and passes middleware validation, **When** the server handles the request in a wrapped Route Handler and emits logs, **Then** every **attributed** log line (per **SC-001**) carries **exactly that same string** as the correlation identifier (no silent rewrite to UUID).

---

### User Story 2 - Prevent secrets from appearing in logs (Priority: P1)

As a **security or compliance stakeholder**, I need **authentication material and common secret fields** to appear only as the literal **`[Redacted]`** (see [contracts/redaction.md](./contracts/redaction.md)), so leaked logs do not expose credentials or session secrets.

**Why this priority**: Secret leakage in logs is a common high-severity finding; it must hold for standard headers and typical credential-bearing payloads.

**Independent Test**: Issue requests that include standard auth headers and representative secret fields in small logged objects; verify log output contains no raw secret substrings and shows **`[Redacted]`** wherever a redacted scalar is required.

**Acceptance Scenarios**:

1. **Given** a request includes a standard authorization header, **When** the server logs request-related metadata, **Then** the authorization value is not present in clear text and appears only as **`[Redacted]`**.
2. **Given** a request includes a standard cookie header, **When** the server logs request-related metadata, **Then** the cookie value is not present in clear text and appears only as **`[Redacted]`**.
3. **Given** application code logs a small object that includes fields such as password or bearer token keys defined in the technical supplement, **When** those fields are present, **Then** their values are replaced by **`[Redacted]`** before emission.

---

### User Story 3 - Readable logs in development, aggregation-friendly in production (Priority: P2)

As a **developer**, I need **human-readable logs during local development** and **consistent, machine-friendly structured logs in production**, controlled by **environment configuration** without editing application source for each environment.

**Why this priority**: Speeds debugging locally while keeping production suitable for log platforms; second after correlation and redaction.

**Independent Test**: Run the application in a development configuration and confirm logs are easy to scan visually; run in production configuration and confirm each log emission is a single structured record per line suitable for streaming parsers.

**Acceptance Scenarios**:

1. **Given** a development environment configuration, **When** the server emits logs, **Then** output is visually scannable (multi-line or colorized human layout is acceptable) and meets **SC-004** minimum signals.
2. **Given** a production environment configuration, **When** the server emits logs, **Then** each non-blank line is one structured record suitable for automated log pipelines without manual line splitting.
3. **Given** an explicit environment override for output format, **When** the server starts, **Then** the override takes precedence over defaults implied by environment name alone.

---

### User Story 4 - Operators control minimum verbosity (Priority: P3)

As an **operator**, I need to **raise or lower the minimum severity of messages written to logs** using deployment configuration, so noisy environments can be quieted or verbose tracing enabled without code edits.

**Why this priority**: Operational tuning; depends on having stable logging in P1–P2 first.

**Independent Test**: Set minimum severity via environment to a stricter level, **restart the process**, and confirm finer-grained messages are suppressed; set to a more permissive level, **restart again**, and confirm additional detail appears (see **SC-005**).

**Acceptance Scenarios**:

1. **Given** minimum severity is set to a high threshold, **When** the server runs, **Then** messages below that threshold are not emitted to the log stream.
2. **Given** the product documents **process restart or recycle** for `LOG_LEVEL` changes (v1 normative rule, see **SC-005**), **When** operators follow that procedure, **Then** observed verbosity matches the documented behavior.

---

### Edge Cases

- Incoming **`x-request-id`** **missing**, **empty after trim**, **too long**, or **disallowed characters** (per [contracts/middleware-request-id.md](./contracts/middleware-request-id.md)): middleware MUST **generate or replace with a new UUID** and MUST NOT crash; downstream handlers see the **final** header value only (no truncation-in-place of attacker-controlled bytes). **Normative** policy matches that contract and [research.md](./research.md#decision-correlation-id-for-invalid--oversized-x-request-id).
- **Static vs dynamic Server Components (v1 scope)**: Using **`await headers()`** (or equivalent) to read **`x-request-id`** for logging opts those surfaces into **dynamic** behavior where Next.js requires it. **v1 has no automated acceptance gate** on “stay static” vs “log with request metadata”; **documentation-only**: [quickstart.md](./quickstart.md) (Server Component logging) and **`docs/logging/production-structured-logging-nextjs.md`** MUST explain this tradeoff so teams can decide deliberately.
- **Middleware** runs outside the Node application logger process model: correlation must still be applied via HTTP headers only, without importing the Node-only logger module.
- **Handler throws** before a `Response` exists: the standard wrapper’s **access / request-completion** line MUST still include **`method`**, **`url`**, **`responseTimeMs`**, **`requestId`**, and a numeric **`statusCode`** (**MUST** use **500** when no response-derived status is available; use the actual status if the framework maps the error to a `Response` with a status). This aligns **FR-002** with [contracts/with-logging.md](./contracts/with-logging.md).
- **Missing `x-request-id` on Server Component paths**: **FR-005** **allows and requires** a **one-time UUID** as `requestId` when the header is absent to RSC; operators MUST NOT assume **parity** with middleware’s id for that navigation. This path is **out of scope for SC-001** (**SC-001** applies only to **wrapped API-style handlers** per scope terms); no contradiction — correlation guarantees differ by surface.

## Requirements *(mandatory)*

### Functional Requirements

**Scope terms (normative)**:

- **HTTP API-style server handlers** (FR-002, FR-004, FR-010): App Router Route Handlers under **`apps/client/src/app/api/**/route.{ts,tsx,js,jsx}`** running on the **Node.js** runtime, wrapped with the standard request logging helper for acceptance in this feature.
- **Covered server paths (FR-001)**: (1) all modules under **`apps/client/src/`** except **`apps/client/src/middleware.ts`** (Edge) and except any source file whose **first** meaningful directive is **`'use client'`** (entire file excluded); (2) **`libs/client/logging/**`**. Ad-hoc print-style logging (`console.*` or equivalent unstructured prints for **application events**) is forbidden on these paths; framework/bootstrap noise is out of scope.

- **FR-001**: The system MUST emit **structured server-side log records** for application-defined contexts using a single documented application logging entry point (no ad-hoc print-style logging for application events on **covered server paths**).
- **FR-002**: For **HTTP API-style server handlers** wrapped by the standard request logging helper, the system MUST include on every **access / request-completion** line for that invocation: **HTTP method**; **`url`** per canonical rule in [contracts/log-schema.md](./contracts/log-schema.md#canonical-url-field-fr-002); numeric **`statusCode`** (HTTP status; on uncaught throw with no response status, **MUST** log **500** unless a mapped `Response` supplies another code); **elapsed time**; and **error details** when the handler fails (see next sentence), plus the **correlation identifier** for that invocation. **Error details** on failure: MUST include a stable **error message**; MAY include a **stack trace** string; MUST NOT substitute raw **request headers**, **cookie**, **authorization**, or **request body** blobs for “details”—if additional context is logged, it remains subject to **FR-006**.
- **FR-003**: The system MUST propagate **correlation identifiers** on the **`x-request-id`** HTTP header (field name lowercase in docs; header matching is **case-insensitive** per RFC 9110) on **inbound** requests and **outbound** responses for every browser/request cycle that hits the app. **Valid opaque** tokens (per [contracts/middleware-request-id.md](./contracts/middleware-request-id.md)) MUST be forwarded **unchanged** to handlers and logs — **no** forced normalization to UUID. **Edge middleware** MUST set or normalize this header using **header read/write only** — **no** Node-only logger import, **no** `AsyncLocalStorage`, **no** pino.
- **FR-004**: For **HTTP API-style server handlers** using the async context helper, the system MUST copy the **same correlation string** the handler sees in **`x-request-id` after middleware** (per **FR-003** normalization) into **async request context** for the duration of that handler invocation, together with optional timing metadata. **AsyncLocalStorage** is used **only** inside **Node** Route Handlers wrapped by the standard helper — **not** in Edge middleware, **not** in Server Components, **not** at module scope outside the wrapper’s `run` scope.
- **FR-005**: **Server-rendered UI components** MUST obtain the correlation value from **incoming request metadata via the framework’s async headers API** (`await headers()`), reading **`x-request-id`** when present, and pass that string **explicitly** into the logging entry point; they MUST NOT rely on async request context for correlation. **When `x-request-id` is absent** (e.g. static optimization paths or tests without middleware), the caller MUST supply a **one-time explicit identifier** (implementation: **random UUID**) passed into the same logging API; that value is **diagnostic only** and MAY differ from any id assigned at the edge for the same user-visible navigation (see Edge Cases).
- **FR-006**: The system MUST **redact** standard sensitive HTTP headers (`authorization`, `cookie`) and agreed secret field keys on logged objects before emission; redacted scalars MUST become the literal **`[Redacted]`** per [contracts/redaction.md](./contracts/redaction.md). **Normative detail** (nested depth, arrays, header name casing): same contract.
- **FR-007**: The system MUST attach a **numeric severity** compatible with syslog severity scale (0–7) on each structured production record. **Normative mapping table**: [contracts/log-schema.md](./contracts/log-schema.md#syslog-severity-mapping-normative-fr-007).
- **FR-008**: The system MUST support **environment-driven** selection of minimum severity, output format (human-friendly vs line-delimited structured), and default format implied by deployment mode, without changing application source for each deployment.
- **FR-009**: The logging subsystem MUST be **importable only from server-side code**; **client bundles** MUST NOT include the logger module (build-time guard required). **“Client bundle”** means any **browser-downloaded** JS chunk produced for **Client Components**: the module graph rooted at files whose **first** meaningful directive is **`'use client'`**, plus any modules **only** reachable from that graph (shared client chunks). **Not** “client bundle”: **Server** graphs — Route Handlers, Server Components (without `'use client'`), **`server-only`** modules, middleware (Edge), and server-only library code under **`libs/client/logging/**` when consumed from those surfaces — **may** import the logger. **Mechanism**: top-level **`import 'server-only'`** on the logger entrypoint plus lint rules per [plan.md](./plan.md) / technical supplement.
- **FR-010**: Automated tests MUST cover the **App Router** request logging wrapper only (see Clarifications session 2026-04-24), with **success** and **error** paths defined as: **Success path** — handler returns a **`Response`** whose `status` is **2xx or 3xx** (conformance tests SHOULD use **200**). **Error path** includes **both**: (**a**) **Uncaught throw** — handler throws before returning a `Response`; (**b**) **Returned client/server error** — handler returns a **`Response`** with **4xx or 5xx** status **without** throwing. **FR-010** requires automated coverage of **(a)** and **(b)** in addition to the success path (three distinct cases unless merged with clear assertions for each). Details: [contracts/with-logging.md](./contracts/with-logging.md#fr-010-test-coverage-normative).

### Non-functional requirements (logging volume, v1)

- **NFR-LOG-001**: Default logging paths MUST **not** emit **raw full** request or response bodies; opt-in rules: [contracts/redaction.md](./contracts/redaction.md#body-logging).
- **NFR-LOG-002**: **`x-request-id`** volume and safety bounds (**length 1–128 after trim**, visible ASCII only) are **normative** per [contracts/middleware-request-id.md](./contracts/middleware-request-id.md#validation-rules-normative) (replaces unbounded header values before they reach handlers or logs).
- **NFR-LOG-003 (deferred)**: Per-request **stdout quotas**, **sampling**, **back-pressure**, and caps on **total** HTTP header bytes beyond **`x-request-id`** validation are **out of scope** for v1 acceptance; implementation intent only: [plan.md](./plan.md#technical-context) **Performance Goals**.

**Journey traceability (normative, US1–US2 ↔ FR)**:

| User story | Operator / security need | Satisfied by |
|------------|-------------------------|--------------|
| **US1** | Same correlation on all attributed lines; access shape for APIs | **FR-003**, **FR-004**, **FR-002** (method, `url`, `statusCode`, `responseTimeMs`, correlation), **SC-001** (wrapped handlers **only**); **FR-005** + Edge Cases for RSC (**SC-001** does not apply) |
| **US2** | No secrets in logs; redaction marker | **FR-006**, **SC-002**; **FR-002** forbids using raw headers/body as error “details” |

### Key Entities

- **Log record**: One emitted event with severity, message, optional structured fields, optional correlation identifier, optional HTTP metadata, and numeric syslog-compatible severity.
- **Correlation identifier**: String carried on `x-request-id` and repeated on all related log lines for one request lifecycle where the async context wrapper applies; explicitly passed where async context is disallowed.
- **Redaction policy**: Set of header names and object field keys whose values are replaced before emission with the literal **`[Redacted]`**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any single HTTP request handled by a **wrapped API-style handler** (see scope terms), **100%** of log records **attributed to that request** include the **same correlation identifier** (sample size: at least 20 consecutive requests in automated tests). **Attributed to that request** means: emitted **while the standard wrapper’s async context for that HTTP invocation is active** — including (1) the wrapper’s **access / request-completion** line for that invocation, and (2) any **child** application log lines from `getLogger()` (or equivalent) that resolve `requestId` from the **same** async context during that invocation. **Excluded**: middleware output (no app logger there), logs from **other** concurrent requests, any line emitted **after** the wrapper’s store has ended for that invocation, and **all Server Component logs** (including **FR-005** log-only UUID when `x-request-id` is absent — **not** governed by this criterion).
- **SC-002**: In redaction tests covering the **`authorization`** header, **`cookie`** header, and the **object-field closed set** in [contracts/redaction.md](./contracts/redaction.md#object-keys-case-sensitive-unless-implementation-documents-case-insensitivity) — at minimum **`password`**, **`token`**, **`accessToken`**, **`refreshToken`** (four keys; satisfies “at least three”) — **0** raw secret substrings appear in captured log output (100% **`[Redacted]`** substitution).
- **SC-003**: In production deployment configuration, **100%** of non-blank emitted log lines each represent **exactly one** structured event such that **automated ingestion validation** (definition: [contracts/log-schema.md](./contracts/log-schema.md#sc-003-ingestion-validation-structural)) reports **zero** structural parse failures over a sample of at least **500** lines.
- **SC-004**: Development-mode logs are **human-scannable** without external log parsers when the following **minimum signals** are visible in pretty/human output: (1) every **wrapped handler access** (or request-completion) line includes **severity** (label or unambiguous level), **`msg`**, **`method`**, **`url`**, **`statusCode`**, **`responseTimeMs`**, and **`requestId`** (or equivalent correlation field name); (2) every other **application** log line from covered paths includes at least **severity** and **`msg`**. Optional QA checklist sign-off may supplement but does not replace these minima.
- **SC-005**: **Normative (v1)**: After changing minimum severity via documented environment configuration, **`LOG_LEVEL` takes effect only following a process restart or platform recycle** (not in-process reload). Within **5 minutes** of the restarted process accepting traffic, **observable** inclusion or exclusion of **debug**-level messages matches the configured threshold.

## Assumptions

- **Normative precedence (conflict resolution)**: **`spec.md`** (Clarifications, functional + non-functional requirements, success criteria, Edge Cases) is **authoritative for product acceptance**. **[`contracts/`](./contracts/)** files are **normative** for the interfaces they name (environment, redaction, middleware, log shape, wrappers); if a contract disagrees with this spec, **this spec wins** and the contract MUST be updated in the same change. **`plan.md`**, **`docs/logging/production-structured-logging-nextjs.md`**, and **`quickstart.md`** are **implementation / onboarding aids** — on conflict with **`spec.md`**, **the spec wins**; update the aid, not silent drift.
- **Technical supplement**: File layout, library choices, wrapper name `withLogging`, `getLogger` API, `server-only` placement, `export const runtime = 'nodejs'`, and ALS boundaries are specified in **`docs/logging/production-structured-logging-nextjs.md`**; **environment variable names and semantics** are **not** duplicated normatively there — see [contracts/environment.md](./contracts/environment.md). That document may still describe a Pages Router helper for future use—**it is not in scope** for this feature’s acceptance (see Clarifications session 2026-04-24). This specification states **what** must be true for users and operators; the supplement states **how** the repo implements it for Next.js.
- **Target application**: Next.js **App Router** on **Node runtime only** for this feature. **Pages Router** API logging is **out of scope** until a follow-up when `pages/api` routes exist. Edge execution is explicitly excluded for logger code; middleware remains header-only correlation.
- **Log level change semantics**: Same as **SC-005** / **research.md** (v1): **restart or recycle only**; optional in-process reload is a **non-normative** follow-up if implemented later.
- **`LOG_LEVEL` hot reload (v1 vs supplement)**: The technical supplement’s **“Optional: log level without process recycle”** section describes a **follow-up / non-normative** pattern only. **v1 acceptance** remains **restart-only** per **SC-005**; readers MUST NOT treat in-process `LOG_LEVEL` sync as required or acceptance-gated for this feature.
- **Out of scope** (unchanged from supplement): log shipping, rotation, database query logging, distributed tracing, client-side logging, full request body logging by default.

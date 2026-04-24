# Contract: Log record shape & JSON stdout lines (`apps/server`)

Extends **FR-001**, **FR-002**, **FR-006**, **SC-001**, **NFR-002**. Pretty transport (**FR-003**) is human-oriented; this file defines **JSON / NDJSON** expectations.

## NDJSON line (CHK006)

When resolved transport is **JSON** (per **FR-002** / **FR-004**):

- Each **non-empty** line written to **stdout** as an application log record MUST be **exactly one** JSON **object** document: from opening `{` through closing `}` with **no** leading application text, **no** trailing garbage, **no** same-line second JSON value.
- Encoding: **UTF-8**.
- **stderr** and **container/orchestrator** prefixes are out of scope for **FR-002** (spec targets **stdout** shape the app controls).

## Severity & level field (CHK001)

- **Canonical numeric severity**: pino **`level`** (number). Names `fatal` … `trace` align with **RFC 5424 severity semantics** (ordering / intent: `fatal` most severe → `trace` least). **Independent audit** uses the golden table below + **tasks** T028 (`pino-syslog-levels.spec.ts`); auditors do **not** need to read pino source (**CHK026**).

## RFC 5424 semantics ↔ pino numeric `level` (**CHK026** / **FR-001**)

| Label (`LOG_LEVEL` token / pino name) | pino JSON **`level`** (number) | RFC 5424 note (informative) |
|---------------------------------------|----------------------------------|-----------------------------|
| `trace` | **10** | least severe operational detail |
| `debug` | **20** | |
| `info` | **30** | |
| `warn` | **40** | |
| `error` | **50** | |
| `fatal` | **60** | most severe |

- **Normative for this feature**: emitted JSON lines **MUST** use the numeric values above for default pino configuration (no custom `customLevels` that reorder or renumber unless **spec** + this table are amended together).
- **RFC 5424**: spec requires **semantic** alignment (names + monotonic severity ordering shared with syslog practice), **not** bit-for-bit use of RFC 5424’s 0–7 integer on the wire in JSON.
- **Regression**: **T028** MUST assert each row (label ↔ number) matches runtime / docs; comment in test file **MAY** link public pino docs for extra context only.

## Canonical timestamp & clock (**CHK024** / **NFR-002**)

- **Canonical timestamp**: pino **`time`** (Unix epoch **milliseconds**, number). Semantics = single instant; **no** mandated `timezone` / offset string field on JSON lines in v1.
- **Timezone display**: NDJSON JSON lines (**FR-002**) keep numeric epoch **`time`** as canonical. Human pretty transport (**FR-003**) **MAY** render additional human-readable timestamps in **local** or **UTC** at implementation discretion; not normative for acceptance.
- **Clock skew** between hosts, NTP correction, or agreement with wall clocks: **out of scope** for this feature — operators and aggregators reconcile at platform layer.

## Other common JSON fields

- **Human message**: optional **`msg`** (string).
- **Nest context**: optional **`context`** (string), when emitted by Nest/pino integration.
- Additional keys (`pid`, `hostname`, `req`, …) MAY appear per pino defaults; consumers MUST tolerate unknown fields.

## HTTP request correlation field (`reqId`)

- **Canonical property name** for HTTP correlation on structured JSON lines: **`reqId`** (string). **MUST** be present on lines listed as **MUST** in [http-request-logging.md](./http-request-logging.md) §**`reqId` on which lines**; **SHOULD** on other in-request app lines when context is bound.
- Value: either trimmed inbound **`x-request-id`** (see [http-request-logging.md](./http-request-logging.md)) or a newly generated **UUID** string.
- **Tests and dashboards** SHOULD assert **`reqId`**; no alternate spellings (e.g. `requestId`) in v1 without a spec amendment.

See [log-line.example.json](./log-line.example.json) for a minimal example line.

## SC-001 sample size

Aligns **SC-001** with **tasks** T026 so the threshold is requirements-level, not task-only.

| Rule | Text |
|------|------|
| **Minimum** | **50** distinct **non-empty** stdout lines (same as **SC-001**). |
| **Population** | Across **startup** + **mixed HTTP success and error** traffic. |
| **CI** | **T026** MUST assert on **≥ 50** lines drawn from that population before claiming **100%** JSON validity — **no** lower bound in tasks than in spec. |
| **Manual / runbook** | MAY sample more than 50; MUST NOT report **SC-001** satisfied on **fewer** than 50 qualifying lines unless **spec** is amended. |

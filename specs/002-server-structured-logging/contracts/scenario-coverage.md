# Contract: Scenario coverage — env phases, transport failure, concurrency, audit tails (**CHK017–CHK019**, **CHK022–CHK027**)

Normative clarification for audit items **CHK017**–**CHK019**, **CHK022**–**CHK027** (see sections below). Cross-linked from [spec.md](../spec.md) and contracts as cited per section.

## CHK017 — Invalid env: startup vs after bootstrap

| Phase | Variable | Primary (happy path) | Alternate | Exception |
|-------|----------|----------------------|-----------|-----------|
| **Before traffic** (startup validation — **Joi** v1 per [environment.md](./environment.md) §**Startup validation library**) | `LOG_LEVEL` | Unset → default `info`; allowed token → use | — | Non-empty **invalid** token → **non-zero exit**, clear config error (**FR-014**, [bootstrap-config-errors.md](./bootstrap-config-errors.md)) |
| **Before traffic** | `LOG_FORMAT` | `auto` / unset / empty → derive from `NODE_ENV`; `json` / `pretty` → forced shape | — | Non-empty **invalid** token → **non-zero exit** (**FR-015**, same stderr contract as FR-014) |
| **After bootstrap** (server already running) | `LOG_LEVEL` | On each sync tick, unset or allowed → apply per [runtime-log-level.md](./runtime-log-level.md) (**FR-005**) | — | **Invalid** token at a tick → **do not** exit; **retain** effective minimum level from **previous successful** tick (sticky last-good). Next tick that reads a valid value applies **FR-005** normatively. |
| **After bootstrap** | `LOG_FORMAT` | Transport shape fixed for process life (**FR-004**) | In-process mutation to another **allowed** value → **no** transport change in v1 (restart required) | In-process mutation to **invalid** non-empty value → **no** exit; transport remains **bootstrap-resolved** shape until **new process** |

**Difference that matters**: Startup invalid `LOG_LEVEL` / `LOG_FORMAT` is **fail-fast**; post-bootstrap invalid `LOG_LEVEL` is **non-fatal sticky**; post-bootstrap `LOG_FORMAT` changes are **non-authoritative** for transport (invalid or valid) until restart.

## CHK018 — Logger or transport failure mid-process

**Intentional v1 scope**: No requirement for automatic failover transport, on-disk spool, alternate sink, or mandated “degraded mode” continuation if **pino** or **stdout** fails (e.g. `EPIPE`, `ENOSPC`, stream `error` events).

- Implementations SHOULD rely on normal Node.js stream / process semantics (errors may surface to `unhandledRejection` / `uncaughtException` handlers outside this feature).
- **Absence of recovery requirements is normative** for v1 acceptance; log shipping / HA logging infrastructure remain **out of scope** (**FR-013**).

## CHK019 — Concurrent-request isolation (beyond single bullet)

- **Isolation**: Request-scoped context (**FR-012**, AsyncLocalStorage) MUST **not** leak identifiers or custom context fields into a **different** in-flight HTTP request on the **same** Node instance under overlapping async work (default Nest HTTP + single event loop).
- **Ordering**: **No** requirement that log lines from concurrent requests appear in wall-clock or completion order relative to each other; only per-request consistency of **`reqId`** (and bound fields) for lines emitted **within** that request’s context.
- **Worker threads / off-ALS execution**: Propagation of **`reqId`** into code that runs **without** a restored ALS context (e.g. explicit `worker_threads`, some pool APIs) is **not** required by this feature; logs from such paths **MAY** omit **`reqId`** (**FR-006** SHOULD for non-access lines already allows absence). Mainline HTTP controller → service → async continuations on the default loop **remain** in scope for **FR-012**.

## CHK022 — WebSocket / non-Express HTTP

Table + upgrade nuance: [http-request-logging.md](./http-request-logging.md) §**Transport surfaces**. **FR-013** + **Edge Cases** in [spec.md](../spec.md).

## CHK023 — Large-body serialization

**NFR-001** in [spec.md](../spec.md); byte cap §**Serialization limits** in [http-request-logging.md](./http-request-logging.md).

## CHK024 — Timestamps / clock / timezone

**NFR-002** in [spec.md](../spec.md); canonical **`time`** + clock skew + pretty — [log-schema.md](./log-schema.md) §**Canonical timestamp & clock**.

## CHK025 — Joi / startup validation dependency

[environment.md](./environment.md) §**Startup validation library**; **Assumptions** in [spec.md](../spec.md).

## CHK026 — RFC 5424 ↔ pino numeric audit trail

[log-schema.md](./log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`**; **tasks** T028; **FR-001** in [spec.md](../spec.md).

## CHK027 — Single interceptor vs pino-http

[http-request-logging.md](./http-request-logging.md) §**HTTP logging stack**; **FR-009** + **FR-006** in [spec.md](../spec.md); [nest-logging-tests.md](./nest-logging-tests.md).

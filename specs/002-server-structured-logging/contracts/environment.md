# Contract: Logging environment variables (`apps/server`)

All variables MUST be declared and validated in **`ConfigModule.forRoot` Joi schema** (constitution **V**).

## Startup validation library (**CHK025** / **FR-014** / **FR-015**)

- **Normative behavior**: invalid `LOG_LEVEL` / `LOG_FORMAT` (and any other vars this feature validates) **MUST** fail process startup **before** accepting HTTP traffic, with stderr messaging per [bootstrap-config-errors.md](./bootstrap-config-errors.md).
- **Reference implementation (v1 `apps/server`)**: **Joi** `validationSchema` on `ConfigModule.forRoot` (aligns constitution **V** and **tasks** T004). This is a **delivery** choice, not the only library allowed forever.
- **If validation library changes** (e.g. Zod, `class-validator`): replacement **MUST** preserve the **same** observable rules — allowed sets, ASCII case-folding for `LOG_FORMAT`, trim/empty→`auto`, defaults, and fail-fast **before listen** — documented by updating **this file** and [bootstrap-config-errors.md](./bootstrap-config-errors.md) to name the new mechanism. **FR-014**/**FR-015** bind to **behavior**, not Joi syntax.

## Required / optional

| Name | Required | Allowed | Default | Failure mode |
|------|----------|---------|---------|--------------|
| `NODE_ENV` | no* | common strings | `development` in Joi | n/a |
| `LOG_FORMAT` | no | `json`, `pretty`, `auto` (ASCII case-insensitive) | `auto` | **Exit ≠ 0** if non-empty invalid |
| `LOG_LEVEL` | no | `fatal`, `error`, `warn`, `info`, `debug`, `trace` | `info` | **Exit ≠ 0** if set and invalid **at startup only**; while running, invalid values are **ignored** per sync tick (sticky last-good) — [scenario-coverage.md](./scenario-coverage.md) §**CHK017**, [runtime-log-level.md](./runtime-log-level.md) |

\*Align with existing process defaults; Joi should still apply explicit defaults for local DX.

## Resolution algorithm (`LOG_FORMAT`)

1. Read raw string; `trim()`; empty → **`auto`**.
2. Case-fold ASCII; must be one of `json`, `pretty`, `auto` else **fail fast**.
3. If `json` or `pretty` → use that transport shape regardless of `NODE_ENV`.
4. If `auto` → `NODE_ENV === 'production'` → **json** lines; else → **pretty** (per spec FR-002/FR-003).

## Effective change (`LOG_FORMAT`)

- v1 does **not** hot-reload transport shape. After changing `LOG_FORMAT`, **restart** the server process so `LoggerModule` / pino wiring picks up the new value (**FR-004** without code change; differs from in-process **`LOG_LEVEL`** — see `research.md`).

## Runtime change (`LOG_LEVEL`)

- Source of truth: **`process.env.LOG_LEVEL`** (in-process).
- Implementation MUST periodically sync env → pino root level (see `research.md`).
- Observable semantics, caching, and **“subsequent log evaluations”** — [runtime-log-level.md](./runtime-log-level.md) (**FR-005**).

## Bootstrap errors

- Before Nest logger is available: write human-readable messages to **`process.stderr.write`** only (**FR-010**).

## Related contracts

- [Log schema & NDJSON](./log-schema.md)
- [Redaction placeholder](./redaction.md)
- [HTTP request logging edge cases](./http-request-logging.md)
- [Example JSON log line](./log-line.example.json)
- [Static analysis — no `console`](./static-analysis-console.md)
- [Bootstrap configuration errors](./bootstrap-config-errors.md)
- [Runtime `LOG_LEVEL` semantics](./runtime-log-level.md)
- [Application logger (`PinoLogger`)](./application-logger.md)
- [Nest logs, pino, and tests](./nest-logging-tests.md)

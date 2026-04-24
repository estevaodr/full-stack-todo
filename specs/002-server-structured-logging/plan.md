# Implementation Plan: Structured logging for API server

**Branch**: `002-server-structured-logging` (spec); current git: `server-logging` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-server-structured-logging/spec.md`

## Summary

Deliver production-grade structured logging in **`apps/server`** using **nestjs-pino** + **pino-http** + **pino-pretty**, with **newline-delimited JSON** on stdout in production-style runs, **pretty** colorized output in development, **RFC 5424–aligned** severities, **request id** (`x-request-id` or UUID), **AsyncLocalStorage**-backed request context, **redaction** of `Authorization` and nested `password` keys, **env-only** configuration (`NODE_ENV`, `LOG_LEVEL`, `LOG_FORMAT`) with **fail-fast** validation for invalid values, **runtime `LOG_LEVEL`** via in-process `process.env` + periodic sync to the root pino level, **Nest logs routed through pino**, a **`LoggingInterceptor`** for success/error paths with **Jest unit tests**, and **zero `console.*`** under `apps/server` (bootstrap errors use **`process.stderr.write`**).

**Spec amended (CHK012, 2026-04-24):** **`LOG_FORMAT`** transport shape applies from **bootstrap** of each process—**restart (or new process)** to pick up a new value; **`LOG_LEVEL`** may change **in-process without restart**. Aligned in [spec.md](./spec.md) (US4, FR-004, SC-004, Assumptions); rationale unchanged in [research.md](./research.md) §`LOG_FORMAT` vs runtime.

**FR-009 vs pino-http (CHK027):** one Nest **`LoggingInterceptor`** for request **outcome** (success + error); **`pino-http`** automatic **access** lines stay — different roles, same pino sink — [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**HTTP logging stack**.

## Technical Context

**Language/Version**: TypeScript ~5.9 (workspace), Node LTS (Nx `server` target)  
**Primary Dependencies**: NestJS ^11, `nestjs-pino`, `pino`, `pino-http`, `pino-pretty`, `uuid` (new); existing `@nestjs/config` + **Joi** for startup validation  
**Storage**: N/A (stdout logging only; log shipping out of scope)  
**Testing**: Jest + `@nestjs/testing` (`nx test server`)  
**Target Platform**: Linux/macOS server process (stdout/stderr)  
**Project Type**: NestJS HTTP API (`apps/server`)  
**Performance Goals**: No strict **latency / throughput SLA** for log writes (**NFR-001**); avoid per-request deep clones of large bodies for redaction (prefer pino serializers / bounded snapshots). Normative body-preview cap **8192 UTF-8 bytes**: [spec.md](./spec.md) **NFR-001**, [contracts/http-request-logging.md](./contracts/http-request-logging.md) §**Serialization limits**.  
**Constraints**: Must comply with spec **FR-001–FR-015**, **NFR-001–NFR-002**, + clarifications; no `console.*` in `apps/server` tree; bootstrap fatal config on stderr only; SQL/query logging behavior **not** expanded beyond aligning TypeORM `logging` flag to new `LOG_LEVEL` semantics (see research)  
**Scale/Scope**: Single app (`apps/server`); feature libs under `libs/server/*` unchanged unless later extraction is scheduled

## Constitution Check

*GATE: Passed with documented deviation (see Complexity Tracking).*

- **III. Security by Default**: Redaction + fail-fast invalid env aligns with “sensitive values MUST NOT appear in logs”.
- **IV. Test Coverage as a Quality Gate**: Adds `LoggingInterceptor` unit tests; full repo gates remain `nx run-many -t test/lint --all` and `nx e2e client-e2e` per workspace rules.
- **V. Explicit Configuration & Observability**: Extends Joi `validationSchema` for `NODE_ENV`, `LOG_FORMAT`, and expanded `LOG_LEVEL`; invalid combinations fail before listen.
- **VI. Code Simplicity (DRY, KISS & YAGNI)**: Prefer `nestjs-pino` defaults + minimal custom ALS wrapper over bespoke logger framework.

**Deviation note (Principle I — Library-First)**: Constitution prefers reusable infra in `libs/server/*`. **Spec FR-013** confines this delivery to **`apps/server`**. Implementation stays in-app with a **follow-up** optional extraction to `libs/server/feature-logging` if reuse appears (tracked in Complexity table).

## Project Structure

### Documentation (this feature)

```text
specs/002-server-structured-logging/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 entities
├── quickstart.md        # Operator/dev runbook
├── contracts/           # Env + log shape contracts
└── tasks.md             # Created by /speckit.tasks (not this command)
```

### Source Code (repository root)

```text
apps/server/
├── src/
│   ├── main.ts                          # Bootstrap: NestFactory bufferLogs, useLogger(Pino), stderr bootstrap
│   ├── app/
│   │   ├── app.module.ts                # LoggerModule.forRootAsync, global interceptor, Joi env
│   │   ├── logging/
│   │   │   ├── logging.module.ts        # Thin module: LoggerModule + APP_INTERCEPTOR
│   │   │   ├── config/                  # Env schema, log format, pino factory, level sync
│   │   │   ├── http/                    # Req id, serializers, redaction, ALS, interceptor
│   │   │   └── __tests__/               # Unit + integration specs + test sink
│   │   └── ...
│   └── ...
├── project.json
└── tsconfig*.json
```

**Structure Decision**: All new wiring and helpers live under `apps/server/src/app/logging/` (or adjacent `src/logging/` if cleaner import graph) per **FR-013**; **no new `libs/` package** in this iteration.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle **I** (library-first): logging implementation colocated in `apps/server` | **Spec FR-013** explicitly limits scope to `apps/server` | Moving to `libs/server/feature-logging` first would violate the approved spec boundary for this track |

## Generated Artifacts (Phase 0–1)

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
| Contracts | [contracts/](./contracts/) — `environment.md`, `log-schema.md`, `redaction.md`, `http-request-logging.md`, `static-analysis-console.md`, `bootstrap-config-errors.md`, `runtime-log-level.md`, `application-logger.md`, `nest-logging-tests.md`, `log-line.example.json` |

## Implementation Notes (high level)

1. **Dependencies**: add `nestjs-pino`, `pino-http`, `pino-pretty`, `uuid`, `supertest`, `@types/supertest` to workspace (root or `apps/server` per existing install pattern) for HTTP integration specs (**SC-001** / **SC-003** harnesses).
2. **Joi**: replace legacy `LOG_LEVEL: INFO|DEBUG` with lowercase pino set `fatal|error|warn|info|debug|trace`, default `info`; add `NODE_ENV` + `LOG_FORMAT` with rules matching **FR-004**, **FR-014**, **FR-015**.
3. **LoggerModule**: `LoggerModule.forRootAsync` using `ConfigService`; `pinoHttp` `genReqId` from `x-request-id` or `uuid`; **redact** paths + custom `req` serializer if needed for nested `password`.
4. **Format**: `LOG_FORMAT` resolution → `pino.transport` with `pino-pretty` only when resolved pretty; otherwise stdout JSON.
5. **Nest integration**: `bufferLogs: true`, `app.useLogger(...)` so internal Nest logs go through pino; remove `@nestjs/common` `Logger` usage from `main.ts` (use `process.stderr.write` for pre-listen fatals only).
6. **ALS**: middleware/interceptor sets `AsyncLocalStorage.run` per request; expose `getRequestId()` for services + mixin/bindings.
7. **Runtime level**: lightweight sync (e.g. 1s interval) maps `process.env.LOG_LEVEL` → `rootLogger.level`.
8. **Interceptor + tests**: Jest specs for success + thrown error paths.
9. **Enforcement**: ESLint `no-console` for `apps/server` glob; grep/CI alignment with **SC-005**.

## Follow-up (Principle I — outside FR-013 v1)

| Item | Action |
|------|--------|
| **GitHub issue** | `TBD` — open a tracking issue when ready: extract `apps/server/src/app/logging/**` to `libs/server/feature-logging` (or amend constitution with ADR if infra bootstrap stays app-local). |
| **Done when** | Shared package consumed by `server`, or constitution explicitly documents Principle I exception for observability bootstrap. |

*Populated by **T029** in [tasks.md](./tasks.md).*

## Agent context

From repo root:

```bash
./.specify/scripts/bash/update-agent-context.sh cursor-agent
```

**Branch / script note (2026-04-24):** `setup-plan.sh` and `get_feature_paths` expect a git branch named like `NNN-feature`. On branch `server-logging`, `setup-plan.sh --json` **exits 1**; canonical paths still come from **`.specify/feature.json`** → `specs/002-server-structured-logging/`. For `update-agent-context.sh`, keep **`specs/server-logging/plan.md`** as a **symlink** to `../002-server-structured-logging/plan.md` (or rename the git branch to match the spec directory). Remove the symlink once branch naming matches SpecKit.

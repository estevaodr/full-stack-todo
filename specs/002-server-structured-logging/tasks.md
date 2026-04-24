# Tasks: Structured logging for API server

**Input**: Design documents from `specs/002-server-structured-logging/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec **FR-011** / **SC-006** require **unit tests** for `LoggingInterceptor` (success + error). Additional tests listed below support redaction, format resolution, and runtime `LOG_LEVEL`.

**Organization**: Phases follow user stories (spec) after shared setup + foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no ordering dependency on incomplete sibling)
- **[Story]**: `US1`…`US6` map to spec user stories

## Phase 1: Setup (shared infrastructure)

**Purpose**: Dependencies, lint guardrails, env documentation.

- [x] T001 Add npm dependencies `nestjs-pino`, `pino-http`, `pino-pretty`, `uuid`, **`supertest`**, and **`@types/supertest`** to workspace `package.json` and refresh lockfile from repo root (HTTP integration tests per **T012** / **T027**)
- [x] T002 [P] Enable ESLint `no-console` (error) for all TypeScript under `apps/server` by updating `apps/server/eslint.config.mjs` (spread `baseConfig` then add `files` + `rules` for `apps/server/**/*.ts`)
- [x] T003 [P] Create or update `apps/server/.env.example` with `NODE_ENV`, `LOG_FORMAT`, `LOG_LEVEL` documented per `specs/002-server-structured-logging/contracts/environment.md`

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Core pino + Nest wiring, ALS, Joi, bootstrap — **no user story work before this completes** (per plan).

**Checkpoint**: Server boots with structured logger; invalid env fails fast; no `console.*` in bootstrap path.

- [x] T004 Replace legacy Joi `LOG_LEVEL` (`INFO`/`DEBUG` only) and add `NODE_ENV`, `LOG_FORMAT`, lowercase pino `LOG_LEVEL` validation with fail-fast rules **FR-014**/**FR-015** in `apps/server/src/app/app.module.ts`
- [x] T005 Update TypeORM `useFactory` in `apps/server/src/app/app.module.ts` so `logging: true` when resolved `LOG_LEVEL` is `debug` or `trace` (per [research.md](./research.md)), removing uppercase `DEBUG` coupling
- [x] T006 Implement AsyncLocalStorage request store + helpers in `apps/server/src/app/logging/http/request-context.ts`
- [x] T007 Implement `apps/server/src/app/logging/config/pino-level-sync.service.ts` to poll in-process `process.env.LOG_LEVEL` and apply to root pino logger; register provider in `apps/server/src/app/app.module.ts` (or `apps/server/src/app/logging/logging.module.ts`)
- [x] T008 Add `LoggerModule.forRootAsync` with `ConfigService`, `pinoHttp` `genReqId` from `x-request-id` header or `uuid`, redaction + serializers for nested `password`, resolved JSON vs pretty transport in `apps/server/src/app/app.module.ts` and/or new `apps/server/src/app/logging/logging.module.ts` imported by `AppModule`
- [x] T009 Wire per-request ALS entry (middleware or early interceptor) in `apps/server/src/app/app.module.ts` using `apps/server/src/app/logging/http/request-context.ts` aligned with pino request id
- [x] T010 Refactor `apps/server/src/main.ts` to use `bufferLogs: true`, `logger: false`, `app.useLogger(...)` with pino-backed Nest logger, and `process.stderr.write` only for pre-listen fatal errors (**FR-010**)

---

## Phase 3: User Story 1 — Operators diagnose production issues from logs (Priority: P1) MVP

**Goal**: Production-style runs emit **NDJSON** to stdout; HTTP logs carry stable **reqId** (**FR-002**, **FR-006**, **SC-001**).

**Independent Test**: `NODE_ENV=production` `LOG_FORMAT=auto`, drive traffic, validate each stdout log line parses as JSON and includes request correlation.

### Implementation / verification

- [x] T011 [US1] Extract pure `resolveLogFormat(nodeEnv, logFormat)` in `apps/server/src/app/logging/config/log-format.ts` and add unit tests `apps/server/src/app/logging/__tests__/log-format.spec.ts` covering `json`/`pretty`/`auto`/unset per **FR-004**
- [x] T012 [US1] Add integration-style Jest test `apps/server/src/app/logging/__tests__/http-req-id.integration.spec.ts` bootstrapping Nest app with **supertest**: assert access/auto logs include stable `reqId` from `x-request-id` when provided and generated UUID when absent (**FR-006**)
- [x] T026 [US1] Add `apps/server/src/app/logging/__tests__/stdout-ndjson.integration.spec.ts` (or extend **T012** harness with shared helper) that captures **≥50** non-empty **stdout** lines under `NODE_ENV=production` / resolved JSON transport with mixed HTTP success + error traffic and asserts **100%** of sampled lines parse as single JSON objects per **SC-001** (50 = spec minimum; see [contracts/log-schema.md](./contracts/log-schema.md) §**SC-001 sample size** — tasks MUST NOT use a lower threshold)
- [x] T028 [US1] Add `apps/server/src/app/logging/__tests__/pino-syslog-levels.spec.ts` asserting each row of [contracts/log-schema.md](./contracts/log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`** (label ↔ pino `level` number); **FR-001** / **CHK026**. Optional pino doc URL in comment only — auditors use spec table + this test, not pino source.

**Checkpoint**: US1 acceptance scenarios satisfied in CI or documented runbook path.

---

## Phase 4: User Story 2 — Developers read logs comfortably in local development (Priority: P1)

**Goal**: Development-style / pretty transport is human-readable with severity emphasis (**FR-003**, **SC-002**).

**Independent Test**: `NODE_ENV=development` `LOG_FORMAT=auto`, confirm colorized pretty output (manual or captured snapshot test without brittle ANSI).

### Implementation / verification

- [x] T013 [US2] Extend `apps/server/src/app/logging/__tests__/log-format.spec.ts` (or add `apps/server/src/app/logging/__tests__/log-format.pretty.spec.ts`) proving `auto` + `development` resolves to pretty transport selection used by `LoggerModule` factory

**Checkpoint**: US2 scenario satisfied.

---

## Phase 5: User Story 3 — Security and compliance staff trust log redaction (Priority: P2)

**Goal**: `Authorization` header + any-depth `password` keys redacted as `[Redacted]` before stdout (**FR-007**, **SC-003**).

**Independent Test**: Crafted requests with bearer token + nested JSON passwords never leak raw secrets in log output.

### Tests (write / extend first where practical)

- [x] T014 [P] [US3] Add `apps/server/src/app/logging/__tests__/redaction.spec.ts` covering nested `password` and `Authorization` serialization paths used by pino config

### Implementation

- [x] T015 [US3] Implement shared request/body serializer helpers in `apps/server/src/app/logging/http/request-serializer.ts` and integrate into pino `LoggerModule` config from **T008** paths
- [x] T027 [US3] Add `apps/server/src/app/logging/__tests__/redaction.http.integration.spec.ts` that issues **≥20** HTTP requests with `Authorization: Bearer …` and nested JSON bodies containing `password` at varying depths, then asserts aggregated log output (stdout sink or test `destination`) contains **no** raw bearer token or raw password substrings per **SC-003**

**Checkpoint**: US3 redaction scenarios pass tests.

---

## Phase 6: User Story 4 — Platform engineers tune logging without code changes (Priority: P2)

**Goal**: `LOG_FORMAT` override semantics; runtime `LOG_LEVEL` via in-process env without restart (**FR-005**, **SC-004**).

**Independent Test**: Mutate in-process `process.env.LOG_LEVEL` and observe verbosity within sync interval. For **`LOG_FORMAT`**, verify env-only selection per **FR-004** / **SC-004 (a)**; **transport shape applies after process restart** (see [research.md](./research.md) — pino transport wired at bootstrap; spec US4 / FR-004).

### Tests

- [x] T016 [US4] Add `apps/server/src/app/logging/__tests__/pino-level-sync.service.spec.ts` proving level changes after mutating `process.env.LOG_LEVEL` (may use fake timers) per **FR-005** / **SC-004** level half

**Checkpoint**: US4 acceptance scenarios covered by automated test or documented + smoke.

---

## Phase 7: User Story 5 — Consistent application logging contract (Priority: P2)

**Goal**: Services use `PinoLogger` + `@InjectPinoLogger(ClassName.name)`; Nest internal logs via pino; **zero** `console.*` under `apps/server` (**FR-008**, **FR-010**, **SC-005**).

**Independent Test**: Code search + runtime: no `console.`; sample service injects pino logger; Nest framework logs appear in same stream.

- [x] T017 [P] [US5] Remove/replace any `@nestjs/common` `Logger` construction in `apps/server/src/**/*.ts` (except allowed Nest adapter wiring) with `PinoLogger` pattern
- [x] T018 [US5] Migrate `apps/server/src/app/app.service.ts` (and `apps/server/src/app/app.controller.ts` if applicable) to `@InjectPinoLogger` using `*.name` tokens per engineering contract in [spec.md](./spec.md)
- [x] T019 [US5] Verify `nx lint server` and ripgrep report **zero** `console.` matches under `apps/server/` (**SC-005**)

**Checkpoint**: US5 contract satisfied.

---

## Phase 8: User Story 6 — Request lifecycle observability (Priority: P3)

**Goal**: `LoggingInterceptor` logs successful responses and errors; **unit tests** for both branches (**FR-009**, **FR-011**, **SC-006**).

**Independent Test**: Jest specs pass; manual HTTP success/error shows interceptor metadata.

### Tests (required)

- [x] T020 [US6] Add success-path cases in `apps/server/src/app/logging/__tests__/logging.interceptor.spec.ts`
- [x] T021 [US6] Add error-path cases in `apps/server/src/app/logging/__tests__/logging.interceptor.spec.ts` (same file as T020 — serialize edits to avoid merge conflicts)

### Implementation

- [x] T022 [US6] Implement `apps/server/src/app/logging/http/logging.interceptor.ts` with success + error logging (depends on T020–T021 if doing TDD; else implement before tests and update tests to green)
- [x] T023 [US6] Register global `LoggingInterceptor` via `APP_INTERCEPTOR` or `app.useGlobalInterceptors` in `apps/server/src/app/app.module.ts` or `apps/server/src/main.ts` per chosen Nest pattern

**Checkpoint**: US6 complete; FR-011 satisfied.

---

## Phase 9: Polish & cross-cutting

**Purpose**: Docs sync + full workspace quality gates + constitution follow-up.

- [x] T024 [P] Update `specs/002-server-structured-logging/quickstart.md` with final ports, env defaults, **`LOG_FORMAT` requires restart** for transport shape vs **runtime `LOG_LEVEL`**, and script names used for verification
- [x] T025 Run from repository root: `npx nx run-many -t test --all`, then `npx nx run-many -t lint --all`, then `npx nx e2e client-e2e` (per `.cursor/rules/developer.mdc`)
- [ ] T029 [P] Open a GitHub tracking issue for **Principle I** closure (extract `apps/server/src/app/logging/**` → `libs/server/feature-logging` **or** constitution amendment); replace `#___` in `specs/002-server-structured-logging/plan.md` **Follow-up** table with the real issue number (**C1**)

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on | Notes |
|-------|------------|------|
| 1 Setup | — | Start immediately |
| 2 Foundational | Phase 1 | **Blocks all user stories** |
| 3 US1 | Phase 2 | MVP slice (production JSON + reqId) |
| 4 US2 | Phase 2 | Can run after or parallel with US1 once T008 factory exists |
| 5 US3 | Phase 2 | Redaction hooks land in pino config (T008/T015) |
| 6 US4 | Phase 2 | Depends on `PinoLevelSyncService` (T007) |
| 7 US5 | Phase 2 | Ongoing cleanup as files touched |
| 8 US6 | Phase 2 | Interceptor stacks on HTTP pipeline |
| 9 Polish | All targeted story phases done | Gates |

### User story dependencies

- **US1 (P1)**: After Phase 2 — no dependency on other stories.
- **US2 (P1)**: After Phase 2 — independent of US1 beyond shared logger factory.
- **US3–US6 (P2/P3)**: After Phase 2 — parallelizable across developers; avoid merge conflicts in same files (`app.module.ts` serialization vs interceptor).

### Within each user story

- Prefer **tests before implementation** where marked (US6 T020–T021 before T022 if strict TDD).
- Serializer (**US3**) should land before relying on redaction tests in CI.

### Parallel opportunities

| Phase | Parallel tasks |
|-------|----------------|
| 1 | T002, T003 alongside T001 (different files) |
| 5 | T014 parallel prep while serializer file is stubbed |
| 8 | T020 and T021 share one spec file — not parallel-safe; split by `describe` blocks in sequence |

---

## Parallel example: Phase 1

```bash
# After T001 lands, T002 and T003 touch eslint.config vs .env.example — safe parallel.
```

---

## Implementation strategy

### MVP first (User Story 1)

1. Complete **Phase 1** + **Phase 2**.
2. Complete **Phase 3 (US1)** — validate JSON + reqId (**T011–T012**, **T026** NDJSON sample, **T028** severity table).
3. **STOP**: run `npx nx test server` and manual smoke from [quickstart.md](./quickstart.md).

### Incremental delivery

1. Add **US2** (pretty) → verify locally.
2. Add **US3** (redaction tests + serializer).
3. Add **US4** (runtime level tests).
4. Add **US5** (service migration + console ban proof).
5. Add **US6** (interceptor + tests).
6. **Phase 9** full monorepo gates.

### Parallel team strategy

- After Phase 2: Developer A → US1+US4; Developer B → US3+serializer; Developer C → US5+US6 (watch `app.module.ts` conflicts).

---

## Task summary

| Metric | Value |
|--------|------|
| **Total tasks** | 29 |
| Phase 1 | 3 |
| Phase 2 | 7 |
| US1 | 4 |
| US2 | 1 |
| US3 | 3 |
| US4 | 1 |
| US5 | 3 |
| US6 | 4 |
| Polish | 3 |

**Format validation**: All tasks use `- [ ] Tnnn` with optional `[P]` and required `[USn]` only on story phases; each line includes a repository-relative file path (from monorepo root).

---

## Notes

- `check-prerequisites.sh --json` may fail when git branch is not `NNN-feature-*`; feature dir remains **`specs/002-server-structured-logging/`** per `.specify/feature.json`.
- Reorder **T022/T023** vs **T020/T021** if team enforces strict red-green TDD for interceptor.
- Library extraction to `libs/server/*` is **explicitly out of scope** for this task list (**FR-013** / plan complexity table).

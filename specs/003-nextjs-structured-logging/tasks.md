# Tasks: Next.js App Router structured logging (client)

**Input**: Design documents from `/Users/estevao/src/brenz-io/full-stack-todo/specs/003-nextjs-structured-logging/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)  
**Note**: `check-prerequisites.sh --json` may require a `NNN-feature-name` git branch; feature directory is authoritative from `.specify/feature.json`.

**Tests**: **Required** — [spec.md](./spec.md) **FR-010** mandates Vitest coverage for `withLogging` (**success**, **error (a)** throw, **error (b)** returned 4xx/5xx) per [contracts/with-logging.md](./contracts/with-logging.md#fr-010-test-coverage-normative).

**Organization**: Phases follow user story priority (US1+US2 P1, US3 P2, US4 P3). Library-first: `libs/client/logging/**` before thin `apps/client/**` wiring.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no ordering dependency)
- **[USn]**: User story from [spec.md](./spec.md)

---

## Phase 1: Setup (shared infrastructure)

**Purpose**: Nx library, dependencies, path alias — no runtime behavior yet.

- [x] T001 Add runtime dependencies `pino`, `pino-pretty`, `uuid`, `server-only` to workspace root `package.json` (or workspace policy file) per [plan.md](./plan.md#implementation-notes-high-level) item 2.
- [x] T002 Create Nx library project `libs/client/logging/project.json` with tags `scope:client`, `type:util`, `src` root, and **`test`** target (Vitest) runnable via `npx nx test client-logging` (or chosen project name matching [plan.md](./plan.md#project-structure)).
- [x] T003 Add `tsconfig.json` and `tsconfig.lib.json` under `libs/client/logging/` consistent with other Nx libs (reference `libs/server/util/tsconfig.json` patterns).
- [x] T004 Register path alias `@full-stack-todo/client/logging` → `libs/client/logging/src/index.ts` in repository root `tsconfig.base.json` per [plan.md](./plan.md#constitution-check) Principle I.
- [x] T005 [P] Add `libs/client/logging/README.md` with one-line purpose and link to `specs/003-nextjs-structured-logging/spec.md`.

---

## Phase 2: Foundational (blocking — all user stories)

**Purpose**: Core modules every story depends on. **No US work until this checkpoint passes.**

- [x] T006 Implement `libs/client/logging/src/lib/severity-map.ts` — map pino level → `syslogSeverity` 0–7 per [contracts/log-schema.md](./contracts/log-schema.md#syslog-severity-mapping-normative-fr-007).
- [x] T007 [P] Implement `libs/client/logging/src/lib/redaction.ts` — header case-insensitive redaction + object key traversal per [contracts/redaction.md](./contracts/redaction.md) (depth 10, closed key set).
- [x] T008 Implement `libs/client/logging/src/lib/request-context.ts` — `AsyncLocalStorage` store `{ requestId, startedAt? }` and `runWithRequestContext` / getters per [data-model.md](./data-model.md#correlationcontext-als-store) and [contracts/with-logging.md](./contracts/with-logging.md#als).
- [x] T009 Implement `libs/client/logging/src/lib/logger.ts` — top `import 'server-only'`; single `pino()` root; read `NODE_ENV`, `LOG_LEVEL`, `LOG_FORMAT` per [contracts/environment.md](./contracts/environment.md); merge `syslogSeverity` via child serializers or mixin; wire `pino-pretty` transport when pretty; apply redaction from T007.
- [x] T010 Export `getLogger` from `libs/client/logging/src/lib/logger.ts` (or adjacent module re-exported from `index.ts`) per [contracts/get-logger.md](./contracts/get-logger.md).
- [x] T011 Implement `libs/client/logging/src/lib/with-logging.ts` — `withLogging` wrapper per [contracts/with-logging.md](./contracts/with-logging.md) (steps 1–6: `x-request-id`, ALS, success access line, throw path **500** default, returned 4xx/5xx path, rethrow default).
- [x] T012 Wire public barrel `libs/client/logging/src/index.ts` exporting `getLogger`, `withLogging`, request-context helpers, and types per [plan.md](./plan.md#project-structure).

**Checkpoint**: `npx nx run client-logging:build` (or `tsc -p libs/client/logging/tsconfig.lib.json`) succeeds; no imports from `apps/client` inside the lib.

---

## Phase 3: User Story 1 — Correlate server activity (Priority: P1) 🎯 MVP

**Goal**: `x-request-id` via Edge `middleware.ts`; same `requestId` on all **SC-001**–attributed lines inside `withLogging` (opaque passthrough, UUID when missing/invalid per middleware contract).

**Independent Test**: HTTP request through wrapped Route Handler → all captured stdout JSON lines for that invocation share identical `requestId` (see [spec.md](./spec.md) US1, **SC-001**).

### Tests (FR-010 — write first if doing TDD)

- [x] T013 [US1] Add `libs/client/logging/src/__tests__/with-logging.spec.ts` — **Success** path: handler returns 200; assert access line `requestId`, `method`, `url`, `statusCode`, `responseTimeMs`, `syslogSeverity` per [contracts/with-logging.md](./contracts/with-logging.md#fr-010-test-coverage-normative).
- [x] T014 [US1] Extend `libs/client/logging/src/__tests__/with-logging.spec.ts` — **Error (a)**: handler throws; assert access line `statusCode` 500 (or mapped), error fields, rethrow.
- [x] T015 [US1] Extend `libs/client/logging/src/__tests__/with-logging.spec.ts` — **Error (b)**: handler returns `Response` with 404 (or 502) without throw; assert access `statusCode` matches.
- [x] T016 [US1] Extend `libs/client/logging/src/__tests__/with-logging.spec.ts` — valid **opaque ASCII** `x-request-id` (non-UUID) preserved on attributed lines per [spec.md](./spec.md) US1 scenario 4.

### Implementation

- [x] T017 [US1] Implement or update `apps/client/src/middleware.ts` — read/normalize/set `x-request-id` per [contracts/middleware-request-id.md](./contracts/middleware-request-id.md); **no** logger imports.
- [x] T018 [US1] Wrap **one** pilot Route Handler (e.g. `apps/client/src/app/api/todos/route.ts`) with `withLogging`, add `export const runtime = 'nodejs'`, use default export pattern per [plan.md](./plan.md#project-structure); verify manually before bulk rollout.
- [x] T019 [P] [US1] Apply same wrapper + `runtime` to remaining handlers: `apps/client/src/app/api/todos/[id]/route.ts`, `apps/client/src/app/api/auth/login/route.ts`, `apps/client/src/app/api/auth/logout/route.ts`, `apps/client/src/app/api/auth/register/route.ts`, `apps/client/src/app/api/auth/session/route.ts`, `apps/client/src/app/api/logs/route.ts`.
- [x] T020 [US1] Ensure any in-handler `getLogger()` calls without explicit `requestId` resolve correlation from ALS (add minimal usage in one handler if needed to prove **SC-001** child lines).

**Checkpoint**: `npx nx test client-logging` passes; pilot + all API routes emit consistent `requestId` under load spot-check.

---

## Phase 4: User Story 2 — Prevent secrets in logs (Priority: P1)

**Goal**: `authorization`, `cookie`, closed object keys → `[Redacted]`; no raw secrets in stdout tests (**SC-002**).

**Independent Test**: Fixtures with auth header + cookie + object with `password`/`token`/etc.; golden stdout has no secret substrings ([spec.md](./spec.md) US2).

- [x] T021 [P] [US2] Add `libs/client/logging/src/__tests__/redaction.spec.ts` (or extend `with-logging.spec.ts`) — assert `[Redacted]` for headers and for each key in [contracts/redaction.md](./contracts/redaction.md#object-keys-case-sensitive-unless-implementation-documents-case-insensitivity) closed set.
- [x] T022 [US2] Integrate serializers / merge policies into access and app log paths so request metadata logs never emit raw `authorization`/`cookie` per **FR-006** (adjust `logger.ts` / `with-logging.ts` as needed).

**Checkpoint**: Redaction tests green; manual `curl` with `Authorization` does not leak secret in NDJSON.

---

## Phase 5: User Story 3 — Dev readable / prod NDJSON (Priority: P2)

**Goal**: `LOG_FORMAT` + `NODE_ENV` drive pretty vs JSON; lines are one JSON object in production (**SC-003**, **SC-004** minima on access lines).

**Independent Test**: `NODE_ENV=production` + `LOG_FORMAT=json` → valid NDJSON lines; dev → pretty with required fields visible ([spec.md](./spec.md) US3).

- [x] T023 [US3] Verify `libs/client/logging/src/lib/logger.ts` implements [contracts/environment.md](./contracts/environment.md) `LOG_FORMAT` resolution and **SC-004** field presence on access lines in pretty mode (adjust formatters if gaps).
- [x] T024 [P] [US3] Add `libs/client/logging/src/__tests__/log-format.spec.ts` — capture stdout or pino destination mock: production config emits parseable single-object lines with required keys per [contracts/log-schema.md](./contracts/log-schema.md#sc-003-ingestion-validation-structural).

**Checkpoint**: Documented run commands in [quickstart.md](./quickstart.md) match observed behavior.

---

## Phase 6: User Story 4 — Operator log level control (Priority: P3)

**Goal**: `LOG_LEVEL` honored at process start; **restart** required for change (**SC-005**).

**Independent Test**: Set `LOG_LEVEL=warn`, restart, confirm `debug` logs absent; lower threshold, restart, confirm present ([spec.md](./spec.md) US4).

- [x] T025 [US4] Add Vitest (or doc-only if impractical) proving root logger level respects `LOG_LEVEL` at bootstrap in `libs/client/logging/src/__tests__/logger-level.spec.ts`.
- [x] T026 [US4] Confirm [quickstart.md](./quickstart.md) and [docs/logging/production-structured-logging-nextjs.md](../../docs/logging/production-structured-logging-nextjs.md) state **restart-only** for v1 and defer in-process reload to follow-up per [spec.md](./spec.md#assumptions).

**Checkpoint**: Operators can follow quickstart + spec **SC-005** without ambiguity.

---

## Phase 7: Polish & cross-cutting

**Purpose**: Lint, constitution gates, optional SC examples.

- [x] T027 [P] Extend ESLint config (e.g. `apps/client/eslint.config.mjs` or root flat config) to forbid `console.*` on server paths / `libs/client/logging/**` per [plan.md](./plan.md#implementation-notes-high-level) item 8 — scope per [spec.md](./spec.md) covered paths.
- [x] T028 Add or update one Server Component example (optional file under `apps/client/src/app/`) documenting `await headers()` + `getLogger('Page', { requestId })` per [contracts/get-logger.md](./contracts/get-logger.md) and [quickstart.md](./quickstart.md#server-component-logging) (**documentation-only** static/dynamic tradeoff).
- [x] T029 Run repo gates from monorepo root: `npx nx run-many -t test --all`, `npx nx run-many -t lint --all`, `npx nx e2e client-e2e` per `.cursor/rules/developer.mdc`.

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on | Blocks |
|-------|------------|--------|
| 1 Setup | — | Phase 2 |
| 2 Foundational | Phase 1 | All user stories |
| 3 US1 | Phase 2 | — |
| 4 US2 | Phase 2 (T009–T011 integrate redaction) | Can parallelize with US3 after T022 if staffed |
| 5 US3 | Phase 2 (logger) | Mostly verification; can overlap US4 |
| 6 US4 | Phase 2 | Documentation-heavy |
| 7 Polish | US1–US4 desired scope | Release |

### User story dependencies

- **US1 (P1)**: Requires Foundational. No dependency on US2–US4 for minimal MVP (middleware + wrapper + tests T013–T016, T017–T020).
- **US2 (P1)**: Requires T007+T009; can start after T009 exists; ideally complete before calling feature “secure”.
- **US3 (P2)**: Requires T009 logger behavior.
- **US4 (P3)**: Requires T009; mostly docs/tests.

### Parallel opportunities

- T005 parallel with T004 after T001–T003 stable.
- T006 || T007 in Phase 2 (different files).
- T013–T016 share `with-logging.spec.ts` — execute in order (or split into multiple `*.spec.ts` files to parallelize in CI).
- T019 routes marked [P] **after** T018 pattern is reviewed (parallel across seven files).

---

## Parallel example: Phase 3 tests (if split files)

```bash
# Optional: split specs so Vitest files run in parallel CI jobs:
libs/client/logging/src/__tests__/with-logging.success.spec.ts
libs/client/logging/src/__tests__/with-logging.throw.spec.ts
libs/client/logging/src/__tests__/with-logging.status.spec.ts
```

---

## Implementation strategy

### MVP (US1 minimal)

1. Complete Phase 1–2.  
2. Complete Phase 3 through T018 + T013–T016 (one route + full FR-010 tests).  
3. **STOP**: `nx test client-logging` + manual correlation check.

### Incremental delivery

1. Add T019 (all routes).  
2. Phase 4 (US2 redaction).  
3. Phase 5–6 (format + level ops).  
4. Phase 7 (lint + gates).

### Suggested MVP scope

**User Story 1** through consistent `requestId` on wrapped handlers + **FR-010** tests (T013–T020 subset) delivers operator-visible value first.

---

## Task summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 29 (T001–T029) |
| **Phase 1** | 5 |
| **Phase 2** | 7 |
| **Phase 3 US1** | 8 (4 test tasks T013–T016 + 4 impl T017–T020) |
| **Phase 4 US2** | 2 |
| **Phase 5 US3** | 2 |
| **Phase 6 US4** | 2 |
| **Phase 7 Polish** | 3 |
| **FR-010 test tasks** | T013, T014, T015, T016 |

**Format validation**: All lines use `- [x] Tnnn` with optional `[P]` and `[USn]` where required by template; descriptions include concrete paths under `libs/client/logging/` or `apps/client/`.

---

## Output path

**Generated file**: `/Users/estevao/src/brenz-io/full-stack-todo/specs/003-nextjs-structured-logging/tasks.md`

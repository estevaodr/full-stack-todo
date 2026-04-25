# Implementation Plan: Next.js App Router structured logging (client)

**Branch**: `003-nextjs-structured-logging` (spec); git may differ — use `SPECIFY_FEATURE=003-nextjs-structured-logging` for speckit scripts when not on a `NNN-*` branch | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-nextjs-structured-logging/spec.md` + technical supplement [docs/logging/production-structured-logging-nextjs.md](../../docs/logging/production-structured-logging-nextjs.md)

## Summary

Deliver **production-grade structured logging** for **`apps/client`** (Next.js App Router, **Node runtime only**). **Acceptance tests in this track**: **`withLogging` (App Router) only** — same as [spec Clarifications](./spec.md#clarifications) **B** / **FR-010**; **`withPagesLogging`** lives under [Follow-up](#follow-up), not the acceptance gate, using **pino** + **pino-pretty**, **NDJSON stdout** in production-style runs, **pretty** output in development, **RFC 5424 numeric severity (0–7)** on each production record, **redaction** (`authorization`, `cookie`, agreed object keys), **env-only** configuration (`NODE_ENV`, `LOG_LEVEL`, `LOG_FORMAT`), **`x-request-id`** correlation via **Edge middleware** (headers only, **no logger import**), **AsyncLocalStorage** only inside **`withLogging()`**-wrapped **App Router Route Handlers**, **explicit `requestId`** for **Server Components** via **`await headers()`**, **`server-only`** singleton logger, **no `console.*`** for app logging on covered paths, **Vitest** unit tests for **`withLogging`** success + error paths. **Pages Router** / **`withPagesLogging`** is **out of scope** for this track ([Clarifications](./spec.md#clarifications)).

## Technical Context

**Language/Version**: TypeScript ~5.9 (workspace), Node LTS (Nx `client` / Next server runtime)  
**Primary Dependencies**: `pino`, `pino-pretty`, `uuid` (new); Next.js App Router; `server-only` package for build guard  
**Storage**: N/A (stdout only; shipping/rotation out of scope)  
**Testing**: Vitest (`nx test client` today runs Vitest from `apps/client`); add **focused unit tests** for `withLogging` — either under `apps/client` next to implementation or via new lib test target (see Structure)  
**Target Platform**: Next.js **Node** runtime for Route Handlers + RSC server; **Edge** for `middleware.ts` only (header propagation)  
**Project Type**: Nx monorepo — **`apps/client`** (Next) + new **`libs/client/logging`** library  
**Performance Goals**: No per-request full-body logging; serializers stay shallow (see [contracts/redaction.md](./contracts/redaction.md)); **normative** volume rules: [spec.md](./spec.md#non-functional-requirements-logging-volume-v1) **NFR-LOG-001–003**  
**Environment (normative)**: [contracts/environment.md](./contracts/environment.md) — **`NODE_ENV`**, **`LOG_LEVEL`**, **`LOG_FORMAT`** only; cite this contract from code and docs; do not redefine semantics in plan prose.  
**Constraints**: No pino/logger in middleware; no ALS in Server Components; every `route.ts` that uses ALS declares `export const runtime = 'nodejs'`; align with [docs/logging/production-structured-logging-nextjs.md](../../docs/logging/production-structured-logging-nextjs.md)  
**Scale/Scope**: All App Router `src/app/api/**/route.ts` handlers + middleware + optional SC logging patterns; Pages API **deferred**

## Constitution Check

*GATE: Passed.*

- **I. Library-First**: Core logger factory, ALS store, `withLogging`, redaction serializers, and syslog mapping live in **`libs/client/logging`** with public barrel `src/index.ts`; **`apps/client`** wires middleware, re-exports or imports `@full-stack-todo/client/logging`, applies wrappers to routes. Add path alias **`@full-stack-todo/client/logging`** → `libs/client/logging/src/index.ts` in `tsconfig.base.json`.
- **II. Separation**: No NestJS code in client; no shared logger module with `apps/server`.
- **III. Security**: Constitution “sensitive values MUST NOT appear in logs” — satisfied via redaction contract + tests.
- **IV. Test Coverage**: `withLogging` Vitest tests required (**FR-010**); repo gates remain Nx `test` / `lint` / `e2e` per workspace rules.
- **V. Explicit configuration**: Document env vars in contracts; optional Joi/Zod validation at **Next bootstrap** if project adds startup schema (defer to tasks if not already present for client).
- **VI. Simplicity**: Single pino root, child loggers by context; avoid duplicate logger singletons.

## Project Structure

### Documentation (this feature)

```text
specs/003-nextjs-structured-logging/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # /speckit.tasks (not created here)
```

### Source Code (repository root)

```text
libs/client/logging/
├── project.json                 # Nx lib, tags: scope:client, type:util
├── tsconfig.json
├── tsconfig.lib.json
└── src/
    ├── index.ts                 # Public: getLogger, withLogging, als, types
    ├── lib/
    │   ├── logger.ts            # 'server-only' — sole pino() instantiation
    │   ├── request-context.ts   # AsyncLocalStorage + run helpers
    │   ├── with-logging.ts      # App Router wrapper + access log fields
    │   ├── severity-map.ts      # pino level → syslog 0–7
    │   └── redaction.ts         # serializers / redact paths
    └── __tests__/
        └── with-logging.spec.ts # success + error paths

apps/client/
├── src/
│   ├── middleware.ts            # x-request-id only; Edge-safe; no @full-stack-todo/client/logging
│   ├── app/
│   │   └── api/**/route.ts      # export const runtime = 'nodejs'; default export wrapped with withLogging
│   └── ...                      # Server Components: await headers(); getLogger('Ctx', { requestId })
└── ...
```

**Structure Decision**: **`libs/client/logging`** holds all reusable logging infrastructure (**Principle I**). **`apps/client`** remains a thin orchestrator: middleware + route wiring + app-specific `getLogger` import sites.

## Complexity Tracking

> No constitution violations requiring justification.

## Generated Artifacts (Phase 0–1)

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
| Contracts | [contracts/](./contracts/) |

## Implementation Notes (high level)

1. **Nx**: Generate `client-logging` under `libs/client/logging` (`nx g @nx/js:library` or equivalent) and wire `tsconfig.base.json` paths + implicitDependencies if needed.
2. **Dependencies**: `npm install pino pino-pretty uuid server-only` (workspace root or per Nx convention).
3. **`logger.ts`**: `import 'server-only'`; read `NODE_ENV`, `LOG_LEVEL`, `LOG_FORMAT`; pino `redact` paths; optional `pino.transport` to `pino-pretty` when pretty; default **restart-only** for `LOG_LEVEL` changes (document in quickstart); optional follow-up: periodic `process.env.LOG_LEVEL` sync like `apps/server`.
4. **`request-context.ts`**: `AsyncLocalStorage` store `{ requestId, startTime? }`; `runWithRequestContext`.
5. **`with-logging.ts`**: wrap `RouteHandler`; read `x-request-id` or `uuid`; `ALS.run`; log finish with method, url, statusCode, responseTime, errors; rethrow or map errors.
6. **`middleware.ts`**: get/generate id; `NextResponse.next({ request: { headers: new Headers(request.headers) } })` pattern or response header mutation per Next 15 docs — **no logger**.
7. **Server Components**: `const h = await headers(); getLogger('Name', { requestId: h.get('x-request-id') ?? randomUUID() })` — document dynamic rendering tradeoff in quickstart.
8. **Lint**: extend ESLint to forbid `console` in `apps/client` server paths / `libs/client/logging` as per supplement.
9. **Vitest**: tests for `withLogging` with mock `NextRequest`/`Response` or minimal handler doubles.

## Follow-up

- **`withPagesLogging`** + Pages API when `pages/api` exists.
- Optional extraction of shared **severity/redaction** constants with `apps/server` only if duplication becomes painful (not in v1 scope).

## Post-Phase 1 Constitution re-check

- **Principle I (library-first)**: **PASS** — implementation targets **`libs/client/logging`** + thin **`apps/client`** wiring.
- **Principles III–VI**: **PASS** — unchanged from the pre-Phase-0 gate; contracts document security and test expectations.

# Contract: Nest framework logs, pino, and tests (**FR-009**, **FR-010**)

Resolves consistency questions between **Nest internal logging → pino** and **zero `console.*` including tests** under `apps/server`. **pino-http** vs **`LoggingInterceptor`** roles — [http-request-logging.md](./http-request-logging.md) §**HTTP logging stack** (**CHK027**).

## Nest internal logs → same pipeline (**FR-009** / plan)

- At runtime, Nest’s **`LoggerService`** used for framework messages MUST be the **pino-backed** implementation wired in **`main.ts`** (`bufferLogs`, `app.useLogger(...)`, per **plan.md**).
- **`LoggingInterceptor`** (and **pino-http** access lines) emit through that same pipeline — no parallel “Nest only” text format on stdout for those components.

There is **no** requirement that Nest internals call `PinoLogger` directly in application services; only that **their** log output is handled by the configured **LoggerService** → pino.

## `console.*` in tests and harnesses (**FR-010**)

| Topic | Rule |
|-------|------|
| **First-party TypeScript** under `apps/server/**/*.ts` (including `**/*.spec.ts`, `**/*.e2e.ts` if present) | **Zero** `console` global usage — same as app code; enforced by **ESLint** per [static-analysis-console.md](./static-analysis-console.md). |
| **`@nestjs/testing`** | Using **`Test.createTestingModule`** does **not** exempt test files from **FR-010**. Prefer assertions or injected/mocked log sinks — **no** `console.*` in authored test code. |
| **`node_modules` / dependencies** | **Out of scope** for **FR-010**; no obligation to patch Nest/Jest internals. |
| **Vendored** `.ts` copied into `apps/server/**` | **In scope** — same `no-console` rules. |
| **Jest / test runner** writing to its own stdout/stderr | Runner output is **not** “application log pipeline”; **FR-010** targets **source references** to the global **`console`** object in the **repo** paths above, not the runner binary. |

## Summary

- **Framework logs** → pino (**consistent** with single stream).
- **Tests** → **no** `console.*` in authored `apps/server` sources (**consistent** with **FR-010**).
- **Third-party** packages → not edited under this feature’s **FR-010** scope.

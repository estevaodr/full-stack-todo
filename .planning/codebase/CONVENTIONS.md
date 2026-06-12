# Coding Conventions

**Analysis Date:** 2026-06-12

## Naming Patterns

**Files:**
- React components: kebab-case with descriptive suffix — `login-form.tsx`, `todo-card.tsx`, `edit-todo-dialog.tsx` in `apps/client/src/components/`
- UI primitives: kebab-case under `apps/client/src/components/ui/` — `button.tsx`, `dialog.tsx`, `form.tsx`
- Hooks: `use-<feature>.ts` — `use-todos.ts`, `use-auth.ts` in `apps/client/src/hooks/`
- Next.js API routes: `route.ts` under `apps/client/src/app/api/**/`
- NestJS server libs: `server-feature-<domain>.{controller,service}.ts` in `libs/server/feature-*/src/lib/`
- Playwright page objects: `<page>.page.ts` — `login.page.ts`, `register.page.ts` in `apps/client-e2e/src/pages/`
- Server unit tests: co-located `*.spec.ts` next to source (e.g. `server-feature-todo.service.spec.ts`)
- Client unit/integration tests: `__tests__/` subdirectories or `*.test.ts(x)` — `apps/client/src/components/__tests__/login-form.test.tsx`

**Functions:**
- camelCase for functions and methods — `getAll`, `fetchApi`, `createWrapper`, `buildUrl`
- React hooks prefixed with `use` — `useTodos`, `useAuth`, `useUpdateTodo`
- Async handlers in API routes use descriptive names — `postLogin` in `apps/client/src/app/api/auth/login/route.ts`, exported as `POST` via `withLogging`

**Variables:**
- camelCase for locals and parameters — `userId`, `queryClient`, `accessToken`
- SCREAMING_SNAKE for module-level constants — `TODOS_QUERY_KEY` in `apps/client/src/hooks/use-todos.ts`
- Domain/API fields use snake_case where persisted or serialized — `user_id`, `access_token` in `libs/shared/domain/src/lib/models/todo.interface.ts` and API responses

**Types:**
- Interfaces prefixed with `I` — `ITodo`, `IUser`, `ITokenResponse` in `libs/shared/domain/src/lib/models/`
- Derived types use `I` prefix + operation suffix — `ICreateTodo`, `IUpdateTodo`, `IUpsertTodo`
- NestJS DTO classes use PascalCase without `I` — `CreateTodoDto`, `UpdateTodoDto`, `TodoDto` in `libs/shared/src/lib/todo.dto.ts`
- Mock utility types in tests — `MockType<T>` in `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`
- Zod inferred form types — `LoginFormData`, `RegisterFormData` from `apps/client/src/lib/validations.ts`

## Code Style

**Formatting:**
- Prettier via root `.prettierrc` — `singleQuote: true`
- No Biome or alternate formatter detected
- Run formatting through the editor/Prettier integration; no dedicated `format` Nx target at root

**Linting:**
- ESLint 9 flat config at root `eslint.config.mjs`
- Extends `@nx/eslint-plugin` presets: `flat/base`, `flat/typescript`, `flat/javascript`
- Enforces Nx module boundaries via `@nx/enforce-module-boundaries` (error)
- `no-console: error` for restricted paths only:
  - `apps/client/src/middleware.ts`
  - `apps/client/src/app/api/**/*.{ts,tsx}`
  - `libs/client/logging/**/*.ts` (excluding tests and test shims)
- Per-project overrides in `apps/client/eslint.config.mjs`, `apps/server/eslint.config.mjs`, `libs/server/data-access-todo/eslint.config.mjs`
- Run: `npx nx run-many -t lint --all`

**TypeScript:**
- Client (`apps/client/tsconfig.json`): `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`
- Server: decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`) via `tsconfig.base.json` and app configs
- Path aliases — see Import Organization

## Import Organization

**Order:**
1. External packages (framework, libraries) — e.g. `next/server`, `@nestjs/common`, `@tanstack/react-query`
2. Workspace path aliases (`@full-stack-todo/*`, `@/*`)
3. Relative imports (`../`, `./`) for same-feature modules

No enforced import-sorting plugin; match surrounding files in each package.

**Path Aliases:**
- Client app: `@/*` → `apps/client/src/*` (`apps/client/tsconfig.json`, `apps/client/vitest.config.ts`)
- Workspace (`tsconfig.base.json`):
  - `@full-stack-todo/shared` → `libs/shared/src/index.ts`
  - `@full-stack-todo/shared/domain` → `libs/shared/domain/src/index.ts`
  - `@full-stack-todo/server/feature-todo` → `libs/server/feature-todo/src/index.ts`
  - `@full-stack-todo/server/data-access-todo` → `libs/server/data-access-todo/src/index.ts`
  - `@full-stack-todo/server/util` → `libs/server/util/src/index.ts`
  - `@full-stack-todo/server/feature-user` → `libs/server/feature-user/src/index.ts`
  - `@full-stack-todo/server/feature-auth` → `libs/server/feature-auth/src/index.ts`
  - `@full-stack-todo/client/logging` → `libs/client/logging/src/index.ts`

**Nx tags (module boundaries):**
- `scope:client`, `type:app` — `apps/client`
- `scope:server`, `type:feature` — e.g. `libs/server/feature-todo`
- `type:data-access`, `scope:server` — `libs/server/data-access-todo`
- `type:util`, `scope:client` — `libs/client/logging`

## Error Handling

**Patterns:**

**NestJS services** — throw framework exceptions for domain failures:
```typescript
// libs/server/feature-todo/src/lib/server-feature-todo.service.ts
if (!todo) {
  throw new NotFoundException(`Todo with ID ${id} not found`);
}
```
Also used: `ConflictException` in `libs/server/feature-user/src/lib/server-feature-user.service.ts` for duplicate email.

**NestJS controllers** — delegate to services; use `@UseFilters(QueryErrorFilter)` for DB constraint errors (`libs/server/feature-todo/src/lib/server-feature-todo.controller.ts`).

**Next.js API routes** — validate input, return structured JSON errors, log failures:
```typescript
// apps/client/src/app/api/auth/login/route.ts
const parsed = loginSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ message: 'Invalid email or password.' }, { status: 400 });
}
// ...
catch (err) {
  getLogger('auth/login').error({ err }, 'login failed');
  return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
}
```
Wrap handlers with `withLogging` from `@full-stack-todo/client/logging`.

**Client `fetchApi`** — throws `Error` with message from response body (`apps/client/src/lib/api-client.ts`):
```typescript
if (!res.ok) {
  let message = `Request failed: ${res.status} ${res.statusText}`;
  // parse body.message or body.error
  throw new Error(message);
}
```

**React Query mutations** in `apps/client/src/hooks/use-todos.ts` — throw generic `Error` on non-OK fetch (`Failed to fetch todos`, etc.).

**React context** — throw when hook used outside provider (`apps/client/src/providers/auth-provider.tsx`, `apps/client/src/components/ui/form.tsx`).

**Config validation** — Joi schemas on server (`apps/server/src/app/logging/config/logging-env.schema.ts`); Zod on client forms and API bodies (`apps/client/src/lib/validations.ts`).

## Logging

**Framework:** Pino via `nestjs-pino` on server; `@full-stack-todo/client/logging` on Next.js server routes.

**Server patterns:**
- Inject with `@InjectPinoLogger(ClassName.name)` or `getLoggerToken` in tests — `apps/server/src/app/app.service.ts`, `apps/server/src/app/logging/http/logging.interceptor.ts`
- Structured fields: `reqId`, `method`, `path`, `err` — `apps/server/src/app/logging/http/logging.interceptor.ts`
- NDJSON in production; `pino-pretty` in dev — `apps/server/src/app/logging/config/create-pino-params.ts`
- Redaction via pino `redact.paths` — `libs/client/logging/src/lib/redaction.ts`, server mirrors in logging config

**Client patterns:**
- Use `getLogger('<component>')` and `withLogging(handler)` — `apps/client/src/app/api/todos/route.ts`, `apps/client/src/app/api/auth/login/route.ts`
- Do not use `console.*` in middleware, API routes, or logging lib (ESLint `no-console`)
- Edge middleware swallows logging errors — `apps/client/src/middleware.ts`
- Test reset helper: `__resetRootLoggerForTests()` in `libs/client/logging/src/lib/logger.ts`

**Log env vars:** `LOG_LEVEL`, `LOG_FORMAT` (documented in logging specs; not read from `.env` in this doc).

## Comments

**When to Comment:**
- JSDoc on public service/controller methods explaining params, returns, and thrown exceptions — common in `libs/server/feature-todo/src/lib/server-feature-todo.service.ts` and controllers
- File-level comments explaining test purpose — `apps/client/src/hooks/__tests__/use-todos.test.tsx`, integration tests
- Educational block comments in NestJS controller/service specs (tutorial-style) — `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`
- Brief module headers for security or runtime constraints — `apps/client/src/lib/api-client.ts` (`server-only` usage boundary)

**JSDoc/TSDoc:**
- Use `@param`, `@returns`, `@throws` on NestJS service methods
- Domain interfaces document fields in `libs/shared/domain/src/lib/models/`
- `@vitest-environment node` at top of files that need Node instead of jsdom — `apps/client/src/__tests__/middleware.test.ts`, `apps/client/src/app/api/auth/__tests__/login.test.ts`
- `@ts-expect-error` with reason for test-environment gaps — `apps/client/src/__tests__/middleware.test.ts`
- `@ts-ignore` with explanation for path-mapping false positives in Jest specs — `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts`

## Function Design

**Size:** Services and controllers split CRUD into discrete methods (`getAll`, `getOne`, `create`, `update`, `delete`, `upsert`). React components keep UI logic in components; data fetching in hooks.

**Parameters:** Pass `userId` explicitly in service layer for user-scoped operations. Controllers extract user via `@ReqUserId()` decorator from `libs/server/util`. API routes parse body once, validate with Zod, then call backend.

**Return Values:**
- Services return domain types (`Promise<ITodo>`, `Promise<ITodo[]>`)
- API routes return `NextResponse.json(...)` with appropriate status codes
- Hooks return React Query result objects or mutation hooks

## Module Design

**Exports:**
- Barrel `index.ts` at library roots — `libs/shared/domain/src/index.ts`, `libs/client/logging/src/index.ts`
- Next.js route handlers export named HTTP methods (`export const POST`, `export const GET`)
- NestJS modules export feature modules from lib `index.ts`; controllers/services exported from feature `src/lib/`

**Barrel Files:** Used for workspace libraries (`@full-stack-todo/*`). Client app imports components by relative path or `@/` alias, not a components barrel.

**Monorepo layout:**
- Apps: `apps/client` (Next.js), `apps/server` (NestJS), `apps/client-e2e` (Playwright)
- Server libs: `libs/server/feature-*`, `libs/server/data-access-*`, `libs/server/util`
- Client libs: `libs/client/logging`
- Shared: `libs/shared`, `libs/shared/domain`

**Validation split:**
- Client forms/API routes: Zod (`apps/client/src/lib/validations.ts`)
- Server HTTP DTOs: class-validator via DTO classes in `libs/shared/src/lib/todo.dto.ts`
- Server env: Joi fragments (e.g. logging env in `apps/server/src/app/logging/config/logging-env.schema.ts`)

---

*Convention analysis: 2026-06-12*

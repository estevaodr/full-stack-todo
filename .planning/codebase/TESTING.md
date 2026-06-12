# Testing Patterns

**Analysis Date:** 2026-06-12

## Test Framework

**Runner:**
- **Vitest 4** — `apps/client`, `libs/client/logging` (primary client-side runner)
  - Config: `apps/client/vitest.config.ts`, `libs/client/logging/vitest.config.ts`
- **Jest 30** — NestJS server app and server libraries (via `@nx/jest` plugin)
  - Root aggregator: `jest.config.ts` (loads all Jest projects via `getJestProjectsAsync`)
  - Preset: `jest.preset.js` (extends `@nx/jest/preset`)
  - Per-project: `apps/server/jest.config.cts`, `libs/server/feature-*/jest.config.cts`, `libs/server/data-access-todo/jest.config.cts`
- **Playwright** — E2E only (`apps/client-e2e`)
  - Config: `apps/client-e2e/playwright.config.ts`
  - Plugin target: `e2e` via `@nx/playwright/plugin` in `nx.json`

**Assertion Library:**
- Vitest: built-in `expect` (Jest-compatible API)
- Jest: built-in `expect`
- Client DOM: `@testing-library/jest-dom` (imported in `apps/client/src/setupTests.ts`)
- Playwright: `@playwright/test` `expect`

**Run Commands:**
```bash
# All unit/integration tests (Nx gate — run from repo root)
npx nx run-many -t test --all
# or package.json script
pnpm test:all

# Single project — client (Vitest)
npx nx test client
npx nx run client:test:coverage   # vitest run --coverage
npx nx run client:test:watch      # vitest --watch

# Client logging lib (Vitest)
npx nx test client-logging

# Server / server libs (Jest — auto-discovered by nx jest plugin)
npx nx test server
npx nx test server-feature-todo

# E2E (Playwright — separate gate)
npx nx e2e client-e2e

# Lint gate
npx nx run-many -t lint --all
```

**Pre-commit:** `.husky/pre-commit` runs `npx nx run-many --target=test --all --exclude=DataAccess,ui-components`.

## Test File Organization

**Location:**
- **Client:** `__tests__/` directories next to source OR co-located `*.test.ts(x)`
  - Components: `apps/client/src/components/__tests__/`
  - Hooks: `apps/client/src/hooks/__tests__/`
  - Lib: `apps/client/src/lib/__tests__/`
  - API routes: `apps/client/src/app/api/auth/__tests__/`
  - App-level integration: `apps/client/src/__tests__/`
- **Server libs:** co-located `*.spec.ts` beside implementation — `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts`
- **Server app:** `apps/server/src/app/**/__tests__/*.spec.ts` for logging integration tests
- **Client logging lib:** `libs/client/logging/src/__tests__/*.spec.ts`
- **E2E:** `apps/client-e2e/src/e2e/*.spec.ts`, setup in `apps/client-e2e/src/fixtures/`

**Naming:**
- Client Vitest: `*.test.ts`, `*.test.tsx`
- Server Jest: `*.spec.ts`
- E2E Playwright: `*.spec.ts`
- Integration tests explicitly named: `*.integration.test.tsx` (client), `*.integration.spec.ts` (server logging)

**Structure:**
```
apps/client/
  src/
    setupTests.ts              # Vitest global setup (MSW + env)
    mocks/
      handlers.ts              # Default MSW handlers
      server.ts                # setupServer for Node
    components/__tests__/*.test.tsx
    hooks/__tests__/*.test.tsx
    __tests__/*.integration.test.tsx
    app/api/**/__tests__/*.test.ts

apps/server/
  src/app/**/__tests__/*.spec.ts

libs/server/feature-*/
  src/lib/*.spec.ts            # co-located with *.ts sources

libs/client/logging/
  src/__tests__/*.spec.ts

apps/client-e2e/
  src/e2e/*.spec.ts
  src/pages/*.page.ts          # Page Object Model
  src/fixtures/auth.setup.ts   # authenticated storage state
```

## Test Structure

**Suite Organization (Vitest — client):**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders email input, password input, and submit button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });
});
```
Reference: `apps/client/src/components/__tests__/login-form.test.tsx`

**Suite Organization (Jest — NestJS):**
```typescript
describe('ServerFeatureTodoService', () => {
  let service: ServerFeatureTodoService;
  let repoMock: MockType<Repository<ITodo>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureTodoService,
        {
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    service = module.get(ServerFeatureTodoService);
    repoMock = module.get(getRepositoryToken(ToDoEntitySchema));
  });

  it('should return an array of to-do items for a specific user', async () => {
    repoMock.find?.mockReturnValue(Promise.resolve(todos));
    const result = await service.getAll(userId);
    expect(result.length).toBe(todos.length);
  });
});
```
Reference: `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts`

**Patterns:**
- **Setup:** Global MSW in `apps/client/src/setupTests.ts` — `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`; sets `SESSION_SECRET` and `API_URL` if missing
- **Teardown:** `vi.clearAllMocks()` / `vi.restoreAllMocks()` in client tests; `jest.clearAllMocks()` in server tests; `__resetRootLoggerForTests()` in logging lib tests
- **Assertions:** Prefer Testing Library queries by role/label (`getByRole`, `getByLabelText`, `findByText`); `waitFor` for async UI; `expect().rejects.toThrow(NotFoundException)` for service errors
- **QueryClient wrapper:** Create per-test `QueryClient` with `retry: false` and wrap hooks/components — pattern in `apps/client/src/hooks/__tests__/use-todos.test.tsx`

## Mocking

**Framework:** Vitest `vi` (client); Jest `jest` (server); MSW for HTTP (client); `@nestjs/testing` (server).

**Patterns:**

**Vitest module mock (hooks/components):**
```typescript
const mockLogin = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    login: (...args: unknown[]) => mockLogin(...args),
    // ...
  }),
}));
```
Reference: `apps/client/src/components/__tests__/login-form.test.tsx`

**Vitest dynamic import + mock (middleware):**
```typescript
/**
 * @vitest-environment node
 */
vi.mock('@/lib/session', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));
const middleware = (await import('../middleware')).default;
```
Reference: `apps/client/src/__tests__/middleware.test.ts`

**MSW per-test overrides:**
```typescript
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

beforeEach(() => {
  server.use(
    http.get(pathname('/api/todos'), () => HttpResponse.json<ITodo[]>(mockTodos))
  );
});
```
Default handlers in `apps/client/src/mocks/handlers.ts` target `API_URL` + `/api/v1/*`. Per-test handlers often match Next.js BFF paths `/api/todos` — see `apps/client/src/hooks/__tests__/use-todos.test.tsx`.

**Jest repository mock factory (shared across controller + service specs):**
```typescript
export const repositoryMockFactory: () => MockType<Repository<ITodo>> = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  findOneBy: jest.fn(() => ({})),
  save: jest.fn((entity) => entity),
  find: jest.fn((entities) => entities),
  remove: jest.fn((entity) => entity),
}));
```
Reference: `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`

**NestJS logger mock:**
```typescript
{ provide: getLoggerToken(LoggingInterceptor.name), useValue: mockLog }
```
Reference: `apps/server/src/app/logging/__tests__/logging.interceptor.spec.ts`

**Stdout capture (logging lib):**
```typescript
const spy = vi.spyOn(process.stdout, 'write').mockImplementation(...);
```
Reference: `libs/client/logging/src/__tests__/with-logging.spec.ts`

**What to Mock:**
- External HTTP: MSW handlers or `vi.mock('@/lib/api-client')` for API route tests
- Database: TypeORM repository via `getRepositoryToken` + `repositoryMockFactory`
- Auth/session: `vi.mock('@/lib/session')` in middleware and login route tests
- React context hooks when testing presentational components (`use-auth`)
- Pino/logger tokens in NestJS unit tests
- `global.fetch` in middleware tests

**What NOT to Mock:**
- Component under test
- Zod validation schemas (exercise real validation in form/route tests)
- Shared domain types and pure utilities
- MSW-unhandled requests fail tests (`onUnhandledRequest: 'error'` in setup)

## Fixtures and Factories

**Test Data:**
```typescript
function createMockTodo(userId?: string): ITodo {
  return {
    id: `todo-${Math.random().toString(36).substr(2, 9)}`,
    title: `Test Todo ${Math.random().toString(36).substr(2, 5)}`,
    description: `Test Description ${Math.random().toString(36).substr(2, 5)}`,
    completed: false,
    ...(userId && { user_id: userId }),
  };
}
```
Reference: `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`

**MSW defaults:** `mockUser`, `mockTodo` in `apps/client/src/mocks/handlers.ts`

**E2E unique users:** `email = \`newuser_${Date.now()}@example.com\`` — `apps/client-e2e/src/e2e/auth.spec.ts`

**Playwright auth fixture:** `apps/client-e2e/src/fixtures/auth.setup.ts` registers user and saves `src/fixtures/auth.json` for chromium project dependency

**Server integration harness:** `TestLogStream`, `NdjsonHarnessModule` built inline — `apps/server/src/app/logging/__tests__/stdout-ndjson.integration.spec.ts`

**Location:**
- Client MSW: `apps/client/src/mocks/`
- E2E pages: `apps/client-e2e/src/pages/`
- E2E fixtures: `apps/client-e2e/src/fixtures/`
- Server logging test helpers: `apps/server/src/app/logging/__tests__/test-log-stream.ts` (referenced in integration specs)
- Client logging shims: `libs/client/logging/src/test-shims/server-only.ts`

## Coverage

**Requirements:** No enforced coverage threshold in CI config detected. Coverage is optional via Nx target.

**View Coverage:**
```bash
npx nx run client:test:coverage
# Vitest v8 provider — outputs text, json, html to apps/client/coverage
```

Vitest coverage config in `apps/client/vitest.config.ts`:
- `include`: `src/**/*.{ts,tsx}`
- `exclude`: tests, `__tests__`, `*.d.ts`

Jest projects define `coverageDirectory` per project (e.g. `coverage/apps/server`, `coverage/libs/server/feature-todo`) but no root coverage gate.

## Test Types

**Unit Tests:**
- **Client:** Component behavior, hooks, validations, session helpers, API route handlers — Vitest + Testing Library
- **Server libs:** Controllers mock services; services mock TypeORM repositories — Jest + `@nestjs/testing`
- **Logging lib:** Logger level, redaction, `withLogging` wrapper — Vitest (node environment)

**Integration Tests:**
- **Client:** `*.integration.test.tsx` — render real components with QueryClient + MSW simulating BFF/API (`apps/client/src/__tests__/todo-crud.integration.test.tsx`, `auth-flow.integration.test.tsx`)
- **Server logging:** Boot minimal Nest modules, hit routes with `supertest`, assert NDJSON log lines (`apps/server/src/app/logging/__tests__/stdout-ndjson.integration.spec.ts`, `http-req-id.integration.spec.ts`, `redaction.http.integration.spec.ts`)

**E2E Tests:**
- Playwright with Page Object Model — `LoginPage`, `RegisterPage`, `DashboardPage` in `apps/client-e2e/src/pages/`
- Projects: `setup` (auth fixture) → `chromium` (depends on setup, uses `storageState`)
- `webServer` starts `nx run-many --target=serve --projects=server,client --parallel`; health check `http://localhost:3000/api/v1`
- Specs: `auth.spec.ts`, `tasks.spec.ts`, `security.spec.ts` in `apps/client-e2e/src/e2e/`
- Unauthenticated tests: `test.use({ storageState: { cookies: [], origins: [] } })`
- Fresh browser contexts for isolated sessions in duplicate-email / login flows

## Common Patterns

**Async Testing (Vitest hooks):**
```typescript
const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
expect(result.current.data).toEqual(mockTodos);
```
Reference: `apps/client/src/hooks/__tests__/use-todos.test.tsx`

**Error Testing (Jest services):**
```typescript
await expect(service.getOne(userId, 'non-existent-id')).rejects.toThrow(
  NotFoundException
);
```
Reference: `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts`

**Error Testing (API route):**
```typescript
const res = await POST(jsonRequest({ email: 'bad', password: '' }));
expect(res.status).toBe(400);
```
Reference: `apps/client/src/app/api/auth/__tests__/login.test.ts`

**Node environment for non-DOM code:**
```typescript
/**
 * @vitest-environment node
 */
```
Use for middleware, API routes, and security header tests under `apps/client/src/__tests__/` and `apps/client/src/app/api/**/__tests__/`.

**Vitest aliases in tests:** Match production — `@/`, `@full-stack-todo/client/logging`, `server-only` shim (`apps/client/vitest.config.ts`).

**Jest environment:** `testEnvironment: 'node'` for server; client Vitest uses `jsdom` by default.

**Pass with no tests:** `apps/server/project.json` and `libs/server/data-access-todo/project.json` set `passWithNoTests: true` on test target (data-access lib has no spec files yet).

**Task completion gate (agent/CI expectation):**
1. `npx nx run-many -t test --all`
2. `npx nx run-many -t lint --all`
3. `npx nx e2e client-e2e`

No separate Nx `integration` target; integration specs run under the `test` target.

---

*Testing analysis: 2026-06-12*

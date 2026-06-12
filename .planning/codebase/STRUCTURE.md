# Codebase Structure

**Analysis Date:** 2026-06-12

## Directory Layout

```
full-stack-todo/
├── apps/
│   ├── client/                 # Next.js 16 frontend + BFF API routes
│   │   └── src/
│   │       ├── app/            # App Router pages, layouts, API routes
│   │       ├── components/     # React components + ui/ (shadcn)
│   │       ├── hooks/          # React Query hooks
│   │       ├── lib/            # Session, api-client, validations, logger
│   │       ├── providers/      # Context providers (auth, theme, query, log)
│   │       ├── mocks/          # MSW handlers for tests
│   │       └── middleware.ts   # Edge auth + correlation IDs
│   ├── client-e2e/             # Playwright E2E tests
│   │   └── src/
│   │       ├── e2e/            # Test specs
│   │       ├── pages/          # Page Object Model classes
│   │       └── fixtures/       # Auth setup + storage state
│   └── server/                 # NestJS 11 REST API (webpack build)
│       └── src/
│           ├── main.ts         # Bootstrap entry
│           └── app/
│               ├── app.module.ts
│               ├── logging/    # Pino logging module (app-local)
│               └── todo/       # Legacy unused module (not in AppModule)
├── libs/
│   ├── client/
│   │   └── logging/            # Shared Next.js structured logging lib
│   ├── server/
│   │   ├── data-access-todo/   # TypeORM entities, DB module, auth/user DTOs
│   │   ├── feature-auth/       # Login controller + JWT strategy
│   │   ├── feature-todo/       # Todo CRUD controller + service
│   │   ├── feature-user/       # User registration + profile
│   │   └── util/               # JWT guard, decorators, exception filters
│   └── shared/
│       ├── domain/             # Cross-stack TypeScript interfaces
│       └── src/                # Shared DTO classes (class-validator)
├── scripts/                    # seed.ts, env.ts utilities
├── specs/                      # Feature specs (logging, e2e, etc.)
├── docs/                       # UI, database, logging, test documentation
├── .planning/                  # GSD planning artifacts
├── .cursor/rules/              # Agent rules
├── docker-compose.yml          # Local PostgreSQL
├── nx.json                     # Nx workspace config
├── tsconfig.base.json          # Path aliases for all libs
├── pnpm-workspace.yaml         # pnpm workspace + allowBuilds
├── package.json                # Root deps + scripts
├── jest.preset.js              # Jest config for server libs
└── Taskfile.yml                # Task runner (Nx wraps similar targets)
```

## Directory Purposes

**apps/client:**
- Purpose: User-facing Next.js application and BFF proxy layer
- Contains: App Router routes, React components, API route handlers, middleware
- Key files: `apps/client/src/app/layout.tsx`, `apps/client/src/middleware.ts`, `apps/client/src/lib/api-client.ts`, `apps/client/next.config.js`

**apps/server:**
- Purpose: NestJS REST API host process
- Contains: Bootstrap, root module, app-local logging infrastructure
- Key files: `apps/server/src/main.ts`, `apps/server/src/app/app.module.ts`, `apps/server/webpack.config.js`

**apps/client-e2e:**
- Purpose: End-to-end browser tests via Playwright
- Contains: Spec files, Page Object Model, auth fixtures
- Key files: `apps/client-e2e/playwright.config.ts`, `apps/client-e2e/src/fixtures/auth.setup.ts`

**libs/server/feature-***:**
- Purpose: Domain-vertical NestJS modules (controller + service + module)
- Contains: One feature per lib (`feature-auth`, `feature-user`, `feature-todo`)
- Key files: `libs/server/feature-todo/src/lib/server-feature-todo.controller.ts`, `libs/server/feature-todo/src/index.ts`

**libs/server/data-access-todo:**
- Purpose: Database layer — entity schemas, TypeORM module registration, request DTOs
- Contains: `EntitySchema` files, `DatabaseModule`, `DataAccessTodoModule`
- Key files: `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts`, `libs/server/data-access-todo/src/lib/database.module.ts`

**libs/server/util:**
- Purpose: Cross-cutting NestJS utilities shared by feature modules
- Contains: JWT guard, `@SkipAuth()`, `@ReqUserId()` decorator, `QueryErrorFilter`
- Key files: `libs/server/util/src/lib/guards/jwt.auth-guard.ts`, `libs/server/util/src/index.ts`

**libs/shared/domain:**
- Purpose: Pure TypeScript interfaces used by both client and server
- Contains: `ITodo`, `IUser`, `ITokenResponse`, `IAccessTokenPayload`, etc.
- Key files: `libs/shared/domain/src/lib/models/todo.interface.ts`, `libs/shared/domain/src/index.ts`

**libs/shared:**
- Purpose: Shared validation DTO classes (class-validator decorators)
- Contains: `CreateTodoDto`, `UpdateTodoDto`, `TodoDto`
- Key files: `libs/shared/src/lib/todo.dto.ts`, `libs/shared/src/index.ts`

**libs/client/logging:**
- Purpose: Structured logging for Next.js (route handlers, browser ingest)
- Contains: `withLogging`, `getLogger`, redaction, severity mapping
- Key files: `libs/client/logging/src/lib/with-logging.ts`, `libs/client/logging/src/index.ts`

**scripts:**
- Purpose: One-off workspace scripts (not Nx projects)
- Contains: Database seeding, env utilities
- Key files: `scripts/seed.ts`, `scripts/env.ts`

**specs:**
- Purpose: Feature specification documents driving phased implementation
- Contains: Per-feature folders with plan, research, tasks, contracts
- Key files: `specs/002-server-structured-logging/`, `specs/003-nextjs-structured-logging/`

## Key File Locations

**Entry Points:**
- `apps/server/src/main.ts`: NestJS bootstrap — global prefix, versioning, Swagger, ValidationPipe
- `apps/client/src/app/layout.tsx`: Root React layout with provider tree
- `apps/client/src/app/page.tsx`: Landing page (`/`)
- `apps/client/src/middleware.ts`: Edge middleware for all matched routes

**Configuration:**
- `nx.json`: Nx plugins (Next, Webpack, ESLint, Jest, Playwright)
- `tsconfig.base.json`: Monorepo path aliases (`@full-stack-todo/server/*`, `@full-stack-todo/shared/domain`)
- `apps/client/tsconfig.json`: Client-specific paths (`@/*` → `./src/*`)
- `apps/client/next.config.js`: Security headers, server logger webpack alias
- `apps/client/tailwind.config.js`: Tailwind CSS v4 config
- `apps/server/.env.example`: Server env var template (never commit `.env`)
- `docker-compose.yml`: Local PostgreSQL container
- `project.json`: Workspace-level `postgres` Nx targets

**Core Logic:**
- `apps/client/src/lib/session.ts`: Cookie-based session encrypt/decrypt
- `apps/client/src/lib/api-client.ts`: Server-side fetch wrapper to NestJS (`API_URL`)
- `apps/client/src/lib/validations.ts`: Zod schemas for BFF input validation
- `apps/client/src/hooks/use-todos.ts`: React Query todo CRUD hooks
- `libs/server/feature-todo/src/lib/server-feature-todo.service.ts`: Todo business logic + repository
- `libs/server/feature-auth/src/lib/server-feature-auth.service.ts`: Credential validation + JWT generation
- `libs/server/feature-user/src/lib/server-feature-user.service.ts`: User creation + lookup

**Testing:**
- `apps/client/vitest.config.ts`: Client unit/integration tests (Vitest)
- `apps/client/src/setupTests.ts`: Test setup (MSW, jest-dom)
- `apps/client/src/mocks/handlers.ts`: MSW mock handlers
- `libs/server/feature-*/src/lib/*.spec.ts`: Jest unit tests for NestJS libs
- `apps/server/src/app/logging/__tests__/`: Server logging integration tests
- `apps/client-e2e/src/e2e/*.spec.ts`: Playwright E2E specs
- `jest.preset.js`: Shared Jest preset for server libraries

## Naming Conventions

**Files:**
- React components: kebab-case — `todo-list.tsx`, `edit-todo-dialog.tsx`
- UI primitives: kebab-case under `ui/` — `button.tsx`, `dialog.tsx`
- Hooks: kebab-case with `use-` prefix — `use-todos.ts`, `use-auth.ts`
- NestJS feature files: kebab-case with domain prefix — `server-feature-todo.controller.ts`, `server-feature-todo.service.ts`
- Entity schemas: kebab-case with suffix — `to-do.entity-schema.ts`, `user.entity-schema.ts`
- Tests co-located: `*.test.ts(x)` for client (Vitest), `*.spec.ts` for server (Jest)
- API routes: Next.js convention — `apps/client/src/app/api/todos/route.ts`, `apps/client/src/app/api/todos/[id]/route.ts`

**Directories:**
- Next.js route groups: parentheses — `(auth)/`, `(protected)/`
- Nx libs: scope/type pattern — `libs/server/feature-todo`, `libs/client/logging`, `libs/shared/domain`
- NestJS lib internals: always `src/lib/` for implementation, `src/index.ts` for public API

**Types/Interfaces:**
- Domain interfaces: `I` prefix — `ITodo`, `IUser`, `ITokenResponse` in `libs/shared/domain/`
- DTO classes: descriptive suffix — `CreateTodoDto`, `LoginRequestDto`, `UserResponseDto`
- Entity schema exports: PascalCase const — `ToDoEntitySchema`, `UserEntitySchema`

**Nx Projects:**
- Apps: `client`, `server`, `client-e2e`
- Libs: scoped import paths matching folder — `@full-stack-todo/server/feature-todo`
- Tags: `client` app tagged `type:app`, `scope:client` in `apps/client/project.json`

## Where to Add New Code

**New NestJS API Endpoint (existing domain):**
- Controller method: `libs/server/feature-{domain}/src/lib/server-feature-{domain}.controller.ts`
- Service logic: `libs/server/feature-{domain}/src/lib/server-feature-{domain}.service.ts`
- Tests: co-located `*.spec.ts` in same `lib/` folder
- If new entity/table needed: schema in `libs/server/data-access-todo/src/lib/database/schemas/`, register in `database.module.ts`

**New NestJS Feature Domain:**
- Create new lib: `libs/server/feature-{name}/` with module, controller, service, `index.ts`
- Add path alias in `tsconfig.base.json`
- Add `project.json` for Nx
- Import module in `apps/server/src/app/app.module.ts`

**New BFF API Route (client-facing):**
- Route handler: `apps/client/src/app/api/{resource}/route.ts` (or `[id]/route.ts` for dynamic)
- Wrap handlers: `export const GET = withLogging(handler)`
- Set runtime: `export const runtime = 'nodejs'` when using session/cookies
- Proxy via: `fetchApi` or `fetchApiWithAuth` from `@/lib/api-client`
- Tests: `apps/client/src/app/api/{resource}/__tests__/` or co-located `*.test.ts`

**New Client Page:**
- Page: `apps/client/src/app/(protected)/{route}/page.tsx` for auth-required pages
- Auth pages: `apps/client/src/app/(auth)/{route}/page.tsx`
- Layout: add or extend route group layout in `(protected)/layout.tsx` or `(auth)/layout.tsx`
- Update middleware protected/public route lists in `apps/client/src/middleware.ts` if needed

**New React Component:**
- Feature component: `apps/client/src/components/{name}.tsx`
- Reusable UI primitive: `apps/client/src/components/ui/{name}.tsx` (shadcn pattern)
- Tests: `apps/client/src/components/__tests__/{name}.test.tsx`

**New Client Hook:**
- Hook: `apps/client/src/hooks/use-{name}.ts`
- Tests: `apps/client/src/hooks/__tests__/use-{name}.test.tsx`
- Pattern: React Query `useQuery`/`useMutation` calling `/api/*` endpoints

**Shared Type (client + server):**
- Interface: `libs/shared/domain/src/lib/models/{name}.interface.ts`, export from `libs/shared/domain/src/index.ts`
- Validation DTO (server): `libs/shared/src/lib/{name}.dto.ts` or `libs/server/data-access-todo/src/lib/dtos/`

**New E2E Test:**
- Spec: `apps/client-e2e/src/e2e/{feature}.spec.ts`
- Page object: `apps/client-e2e/src/pages/{name}.page.ts`

**Utilities:**
- Client-only helpers: `apps/client/src/lib/{name}.ts`
- Server cross-cutting: `libs/server/util/src/lib/{name}.ts`, export from `libs/server/util/src/index.ts`
- Workspace scripts: `scripts/{name}.ts`

## Special Directories

**.next/ (apps/client/.next):**
- Purpose: Next.js build output (dev and prod)
- Generated: Yes
- Committed: No

**dist/ (dist/apps/server, dist/apps/client):**
- Purpose: Nx production build artifacts
- Generated: Yes
- Committed: No

**node_modules/:**
- Purpose: pnpm hoisted dependencies (monorepo root)
- Generated: Yes
- Committed: No

**playwright-report/ and test-results/:**
- Purpose: Playwright test output
- Generated: Yes
- Committed: No

**.planning/:**
- Purpose: GSD planning and codebase map documents
- Generated: By planning agents
- Committed: Yes

**apps/server/src/app/todo/:**
- Purpose: Legacy in-app todo module from early scaffolding
- Generated: No
- Committed: Yes (dead code — not imported by `AppModule`; use `libs/server/feature-todo` instead)

**.env / .env.development:**
- Purpose: Local environment configuration (secrets, DATABASE_URL, API_URL, SESSION_SECRET)
- Generated: No (manually created from `.env.example`)
- Committed: No (gitignored)

---

*Structure analysis: 2026-06-12*

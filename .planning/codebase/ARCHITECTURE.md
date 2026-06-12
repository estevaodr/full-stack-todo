<!-- refreshed: 2026-06-12 -->
# Architecture

**Analysis Date:** 2026-06-12

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (React 19)                               │
│  Pages: `apps/client/src/app/**`  │  Hooks: `apps/client/src/hooks/**`  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ fetch('/api/*', credentials: 'include')
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Next.js 16 BFF (App Router + Edge Middleware)               │
│  Middleware: `apps/client/src/middleware.ts`                             │
│  API Routes: `apps/client/src/app/api/**`                              │
│  Session:    `apps/client/src/lib/session.ts` (httpOnly cookie)        │
│  Proxy:      `apps/client/src/lib/api-client.ts` → API_URL               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ fetch(API_URL + '/api/v1/...', Bearer JWT)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NestJS 11 REST API (Webpack build)                    │
│  Bootstrap: `apps/server/src/main.ts`                                    │
│  Root:      `apps/server/src/app/app.module.ts`                          │
│  Features:  `libs/server/feature-{auth,user,todo}/`                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ TypeORM Repository
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PostgreSQL (Docker via `docker-compose.yml`)                │
│  Entities: `libs/server/data-access-todo/src/lib/database/schemas/`      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Next.js pages | UI routes, server components, route groups | `apps/client/src/app/` |
| Next.js API routes | BFF proxy, session management, input validation | `apps/client/src/app/api/` |
| Edge middleware | Route protection, correlation IDs, access log ingest | `apps/client/src/middleware.ts` |
| React Query hooks | Client-side todo CRUD state | `apps/client/src/hooks/use-todos.ts` |
| NestJS AppModule | Root wiring: config, DB, logging, global JWT guard | `apps/server/src/app/app.module.ts` |
| Feature modules | Domain controllers + services (auth, user, todo) | `libs/server/feature-*/src/lib/` |
| Data access module | TypeORM entity registration + repository export | `libs/server/data-access-todo/` |
| Shared domain | Cross-stack TypeScript interfaces | `libs/shared/domain/src/lib/models/` |
| Shared DTOs | Validation classes for API contracts | `libs/shared/src/lib/todo.dto.ts` |
| Server util | JWT guard, decorators, exception filters | `libs/server/util/src/lib/` |
| Client logging lib | Structured logging for Next.js route handlers | `libs/client/logging/src/lib/` |
| Server logging | Pino HTTP logging + request interceptor | `apps/server/src/app/logging/` |
| E2E tests | Playwright flows against running client+server | `apps/client-e2e/src/e2e/` |

## Pattern Overview

**Overall:** Nx monorepo with Backend-for-Frontend (BFF) proxy pattern

**Key Characteristics:**
- The browser never calls the NestJS API directly; all backend traffic goes through Next.js `/api/*` route handlers that attach the session JWT as a Bearer token.
- Server-side domain logic lives in Nx feature libraries (`libs/server/feature-*`), not in the NestJS app folder, enabling reuse and clear boundaries.
- Shared types flow from `libs/shared/domain` (interfaces) and `libs/shared` (DTOs) to both client and server.
- Authentication is dual-layer: an httpOnly session cookie (Next.js, signed with `SESSION_SECRET`) stores the backend JWT (`accessToken`); NestJS validates that JWT on every protected route via a global `JwtAuthGuard`.
- URI versioning on the NestJS API (`/api/v1/...`) with Swagger at `/api/v1`.

## Layers

**Presentation (Client UI):**
- Purpose: Render pages, forms, todo list; manage client state
- Location: `apps/client/src/app/`, `apps/client/src/components/`
- Contains: React Server Components, Client Components (`'use client'`), shadcn/ui primitives in `apps/client/src/components/ui/`
- Depends on: `@/hooks/*`, `@/providers/*`, `@full-stack-todo/shared/domain`
- Used by: Browser

**BFF / API Proxy (Next.js Route Handlers):**
- Purpose: Validate input, manage sessions, proxy to NestJS with auth
- Location: `apps/client/src/app/api/`
- Contains: Route handlers wrapped with `withLogging` from `@full-stack-todo/client/logging`
- Depends on: `@/lib/api-client`, `@/lib/session`, `@/lib/validations`
- Used by: Client hooks and forms via relative `/api/*` fetch calls

**Edge Middleware:**
- Purpose: Protect `/dashboard`, redirect authenticated users, propagate request/trace IDs, emit edge access logs
- Location: `apps/client/src/middleware.ts`
- Contains: Session check via `getSession()`, correlation ID headers, fire-and-forget POST to `/api/logs`
- Depends on: `@/lib/session`, `@/lib/correlation-id`
- Used by: All non-static Next.js requests (matcher excludes `_next/static`, images)

**Feature (NestJS Controllers + Services):**
- Purpose: HTTP endpoints, business logic, user scoping
- Location: `libs/server/feature-auth/`, `libs/server/feature-user/`, `libs/server/feature-todo/`
- Contains: `@Controller` classes, `@Injectable` services
- Depends on: `@full-stack-todo/server/data-access-todo`, `@full-stack-todo/server/util`, `@full-stack-todo/shared`
- Used by: `apps/server/src/app/app.module.ts` imports

**Data Access (TypeORM):**
- Purpose: Entity schema definitions, repository registration
- Location: `libs/server/data-access-todo/src/lib/`
- Contains: `EntitySchema` definitions (`to-do.entity-schema.ts`, `user.entity-schema.ts`), DTOs for auth/user
- Depends on: `@full-stack-todo/shared/domain`, `@nestjs/typeorm`
- Used by: Feature services via `@InjectRepository()`

**Shared Kernel:**
- Purpose: Type contracts shared across client and server
- Location: `libs/shared/domain/` (interfaces), `libs/shared/` (DTOs/classes)
- Contains: `ITodo`, `IUser`, `ITokenResponse`, `CreateTodoDto`, etc.
- Depends on: Nothing external
- Used by: All apps and libs

## Data Flow

### Primary Request Path (Authenticated Todo Read)

1. User navigates to `/dashboard` — middleware checks session cookie (`apps/client/src/middleware.ts:42-51`)
2. `useTodos()` hook fires `fetch('/api/todos')` (`apps/client/src/hooks/use-todos.ts:12-15`)
3. Next.js route handler reads session, extracts `accessToken` (`apps/client/src/app/api/todos/route.ts:11-14`)
4. `fetchApiWithAuth('/api/v1/todos', accessToken)` calls NestJS (`apps/client/src/lib/api-client.ts:35-42`)
5. Global `JwtAuthGuard` validates Bearer token, `JwtStrategy.validate()` attaches `userId` (`libs/server/feature-auth/src/lib/jwt-strategy.service.ts:64-74`)
6. `ServerFeatureTodoController.getAll()` receives `@ReqUserId()` (`libs/server/feature-todo/src/lib/server-feature-todo.controller.ts:67-68`)
7. `ServerFeatureTodoService.getAll(userId)` queries TypeORM repository scoped by `user_id` (`libs/server/feature-todo/src/lib/server-feature-todo.service.ts:55-61`)
8. JSON array returned up the chain to React Query cache

### Authentication Flow (Login)

1. Browser submits login form → `POST /api/auth/login` (`apps/client/src/app/api/auth/login/route.ts`)
2. Request body validated with Zod `loginSchema` (`apps/client/src/lib/validations.ts`)
3. BFF proxies to `POST /api/v1/auth/login` (public, `@SkipAuth()`) (`libs/server/feature-auth/src/lib/server-feature-auth.controller.ts:51-53`)
4. `ServerFeatureAuthService.validateUser()` checks bcrypt hash, `generateAccessToken()` returns JWT
5. BFF decodes JWT with `decodeJwt`, calls `createSession(userId, email, accessToken)` (`apps/client/src/lib/session.ts:57-72`)
6. httpOnly `session` cookie set; middleware redirects authenticated users away from `/login`

### Registration Flow

1. `POST /api/auth/register` validates with `registerBodySchema` (`apps/client/src/app/api/auth/register/route.ts`)
2. Creates user via `POST /api/v1/users` (public, `@SkipAuth()`) (`libs/server/feature-user/src/lib/server-feature-user.controller.ts:43-45`)
3. Immediately logs in via `POST /api/v1/auth/login` to obtain JWT
4. Session cookie created; user redirected to dashboard

### Logging Flow

1. **Server:** `LoggingModule` registers `nestjs-pino` + global `LoggingInterceptor` (`apps/server/src/app/logging/logging.module.ts`)
2. **Next.js route handlers:** Wrapped with `withLogging()` for access logs (`libs/client/logging/src/lib/with-logging.ts`)
3. **Edge middleware:** Posts structured payload to `POST /api/logs` (no Pino on Edge) (`apps/client/src/middleware.ts:91-101`)
4. **Browser:** `LogProvider` can ingest client-side logs via same `/api/logs` endpoint (`apps/client/src/app/api/logs/route.ts`)

**State Management:**
- Server session: httpOnly cookie encrypted with `jose` SignJWT/jwtVerify (`apps/client/src/lib/session.ts`)
- Client todo list: TanStack React Query with optimistic updates in mutations (`apps/client/src/hooks/use-todos.ts`)
- Auth context: `AuthProvider` in `apps/client/src/providers/auth-provider.tsx`
- No global Redux/Zustand; React Query is the primary async state store

## Key Abstractions

**Session + Backend JWT:**
- Purpose: Bridge browser auth (cookie) to NestJS auth (Bearer JWT)
- Examples: `apps/client/src/lib/session.ts`, `apps/client/src/lib/api-client.ts`
- Pattern: Session cookie holds `accessToken`; BFF attaches it as `Authorization: Bearer` on backend calls

**Feature Module (NestJS):**
- Purpose: Encapsulate one domain vertical (controller + service + module)
- Examples: `libs/server/feature-todo/src/lib/server-feature-todo.module.ts`
- Pattern: Feature module imports `DataAccessTodoModule`; exports service if needed by other features

**EntitySchema (TypeORM):**
- Purpose: Define DB table structure without decorator classes
- Examples: `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts`
- Pattern: Schema typed against `ITodo` from shared domain; registered via `TypeOrmModule.forFeature()` in `database.module.ts`

**withLogging wrapper:**
- Purpose: Consistent structured access logging for Next.js route handlers
- Examples: All exports in `apps/client/src/app/api/**/route.ts`
- Pattern: `export const GET = withLogging(handler)` — wraps handler with ALS context + timing

**SkipAuth opt-out:**
- Purpose: Mark public NestJS routes on a globally-protected API
- Examples: `@SkipAuth()` on login and register controllers
- Pattern: `JwtAuthGuard` checks `SKIP_AUTH_KEY` reflector metadata before enforcing JWT (`libs/server/util/src/lib/guards/jwt.auth-guard.ts`)

## Entry Points

**NestJS Server Bootstrap:**
- Location: `apps/server/src/main.ts`
- Triggers: `nx serve server` or `pnpm dev` (runs client + server in parallel)
- Responsibilities: Create NestJS app, set global prefix `api`, enable URI versioning `v1`, register ValidationPipe, Swagger, listen on `PORT` (default 3000)

**Next.js App:**
- Location: `apps/client/src/app/layout.tsx` (root layout), `apps/client/src/app/page.tsx` (landing)
- Triggers: `nx serve client` (port 4200 by default in Nx Next plugin)
- Responsibilities: Provider tree (Log, Query, Theme, Auth), request context propagation

**Edge Middleware:**
- Location: `apps/client/src/middleware.ts`
- Triggers: Every matched request (pages + `/api/*`)
- Responsibilities: Auth redirects, correlation ID headers, edge access logging

**Nx Workspace Root:**
- Location: `project.json` (workspace-level targets)
- Triggers: `nx run @full-stack-todo/source:postgres` (Docker Compose up)
- Responsibilities: Local PostgreSQL lifecycle; server `serve` target depends on this

**Database Seed:**
- Location: `scripts/seed.ts`
- Triggers: `pnpm seed` or `nx run server:seed`
- Responsibilities: Populate development data

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop per process (NestJS server and Next.js Node runtime). Edge middleware runs on Vercel Edge runtime constraints (no Pino, limited APIs).
- **Global state:** No shared in-memory state between requests on the server. React Query holds client-side cache. TypeORM `synchronize: true` in dev only (`apps/server/src/app/app.module.ts:136`).
- **Circular imports:** None detected between libs; dependency direction is enforced: `feature-*` → `data-access-todo` → `shared/domain`. Client imports only `shared/domain` and `client/logging`, never server libs.
- **API_URL isolation:** `apps/client/src/lib/api-client.ts` is server-only (used exclusively by route handlers); webpack alias excludes `@/lib/logger/server` from client bundle (`apps/client/next.config.js:35-40`).
- **Session secret:** `apps/client/src/lib/session.ts` throws at module load if `SESSION_SECRET` is missing or < 32 chars.
- **User scoping:** All todo operations filter by `user_id` from JWT; users can only read their own profile (`ServerFeatureUserController.getUser` checks `reqUserId === id`).

## Anti-Patterns

### Calling NestJS Directly from the Browser

**What happens:** A client component imports `fetchApi` or calls `API_URL` directly.

**Why it's wrong:** Exposes backend URL, bypasses session management, leaks JWT handling to client bundle.

**Do this instead:** Call relative `/api/*` routes from hooks/components (`apps/client/src/hooks/use-todos.ts`); let route handlers in `apps/client/src/app/api/` proxy with `fetchApiWithAuth`.

### Importing Server Libraries in the Client

**What happens:** Client code imports from `@full-stack-todo/server/*`.

**Why it's wrong:** Pulls NestJS/TypeORM into browser bundle; breaks build or leaks server code.

**Do this instead:** Import types from `@full-stack-todo/shared/domain` only. Keep server logic in `libs/server/` consumed exclusively by `apps/server`.

### Adding Controllers to apps/server Instead of Feature Libs

**What happens:** New domain logic placed in `apps/server/src/app/` (legacy pattern — `apps/server/src/app/todo/` exists but is not wired into `AppModule`).

**Why it's wrong:** Breaks Nx library boundaries; code not reusable or independently testable.

**Do this instead:** Create or extend a `libs/server/feature-*` module and import it in `apps/server/src/app/app.module.ts`.

### Relying on synchronize in Production

**What happens:** `TypeOrmModule` configured with `synchronize: true` (`apps/server/src/app/app.module.ts:136`).

**Why it's wrong:** Auto schema mutations can drop data in production.

**Do this instead:** Use migrations for production deployments; keep synchronize for local dev only.

## Error Handling

**Strategy:** Layer-specific handling with generic client messages for auth failures

**Patterns:**
- NestJS: `NotFoundException`, `UnauthorizedException` thrown from services/controllers; `QueryErrorFilter` on todo controller catches DB constraint violations (`libs/server/util/src/lib/query-error.filter.ts`)
- BFF routes: try/catch around `fetchApi`, return 401/400/502 with `{ message }` JSON (`apps/client/src/app/api/todos/route.ts:22-26`)
- Auth endpoints: Generic "Invalid email or password" to prevent user enumeration (`apps/client/src/app/api/auth/login/route.ts:46-48`)
- Validation: Zod on client BFF (`apps/client/src/lib/validations.ts`); class-validator DTOs on NestJS via global `ValidationPipe` (`apps/server/src/main.ts:22-30`)

## Cross-Cutting Concerns

**Logging:** Structured NDJSON via Pino on NestJS (`apps/server/src/app/logging/`); `@full-stack-todo/client/logging` on Next.js with `withLogging`, `getLogger`, redaction (`libs/client/logging/src/lib/redaction.ts`). Correlation via `x-request-id` and `x-trace-id` headers propagated from middleware through layout (`apps/client/src/app/layout.tsx:15-21`).

**Validation:** Zod schemas in `apps/client/src/lib/validations.ts` for BFF input; class-validator DTOs in `libs/shared/src/lib/todo.dto.ts` and `libs/server/data-access-todo/src/lib/dtos/` for NestJS; Joi env validation in `AppModule` (`apps/server/src/app/app.module.ts:85-100`).

**Authentication:** Passport JWT strategy on server (`libs/server/feature-auth/src/lib/jwt-strategy.service.ts`); global guard with `@SkipAuth()` opt-out; session cookie bridge on client (`apps/client/src/lib/session.ts`); middleware route protection (`apps/client/src/middleware.ts:28-58`).

---

*Architecture analysis: 2026-06-12*

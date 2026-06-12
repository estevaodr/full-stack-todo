# External Integrations

**Analysis Date:** 2026-06-12

## APIs & External Services

**Backend REST API (internal):**
- NestJS server exposes versioned REST at `/api/v1/*` (`apps/server/src/main.ts`)
- OpenAPI/Swagger UI at `http://localhost:<PORT>/api/v1` via `@nestjs/swagger`
- Client Next.js API routes proxy to backend using `API_URL` (`apps/client/src/lib/api-client.ts`, routes under `apps/client/src/app/api/`)
- SDK/Client: Native `fetch` (server-side in Next.js route handlers); no shared HTTP client library in production client code
- Auth: Bearer JWT from backend stored in encrypted session cookie (`apps/client/src/lib/session.ts`)

**Third-party SaaS APIs:**
- Not detected — No Stripe, Clerk, SendGrid, AWS SDK, Firebase, or similar imports in application code

## Data Storage

**Databases:**
- PostgreSQL 16 (local via Docker Compose `docker-compose.yml`)
  - Connection: `DATABASE_URL` env var (Joi-validated in `apps/server/src/app/app.module.ts`)
  - Default local: `postgresql://postgres:postgres@localhost:5432/fullstack_todo` (documented in `README.md`, `docs/database/SCHEMA.md`)
  - Client: TypeORM ^0.3.28 via `@nestjs/typeorm`
  - Entities/schemas: `libs/server/data-access-todo/src/lib/database/schemas/` (`user.entity-schema.ts`, `todo.entity-schema.ts`)
  - Schema sync: `synchronize: true` in `apps/server/src/app/app.module.ts` (auto DDL in dev)
  - Seed script: `scripts/seed.ts` reads `DATABASE_URL` from `.env` or `.env.development`

**File Storage:**
- Local filesystem only — Docker volume `./postgres-data` for PostgreSQL data; no S3/blob storage integration

**Caching:**
- None — No Redis, Memcached, or in-memory cache layer detected

## Authentication & Identity

**Auth Provider:**
- Custom JWT + bcrypt (no external IdP)
  - Backend: `@nestjs/jwt` + `passport-jwt` (`libs/server/feature-auth/`, global `JwtAuthGuard` in `apps/server/src/app/app.module.ts`)
  - Password hashing: `bcrypt` in `libs/server/feature-auth/src/lib/server-feature-auth.service.ts`
  - Public routes opt out via `@SkipAuth()` decorator (`libs/server/util/src/lib/guards/jwt.auth-guard.ts`)
  - Login endpoint: `POST /api/v1/auth/login` (`libs/server/feature-auth/src/lib/server-feature-auth.controller.ts`)
- Frontend session layer:
  - Encrypted HTTP-only cookie (`session`) signed with `jose` HS256 (`apps/client/src/lib/session.ts`)
  - Middleware route protection in `apps/client/src/middleware.ts` (redirects unauthenticated users from `/dashboard`)
  - Backend JWT embedded in session as `accessToken` for proxied API calls (`apps/client/src/lib/api-client.ts` `fetchApiWithAuth`)

**Token configuration:**
- `JWT_SECRET` — Required server env var
- `JWT_ACCESS_TOKEN_EXPIRES_IN` — Default `600s` (10 minutes)
- `SESSION_SECRET` — Required client env var (minimum 32 characters)

## Monitoring & Observability

**Error Tracking:**
- None — No Sentry, Datadog APM, or similar error reporting SDK

**Logs:**
- Server: `nestjs-pino` + `pino-http` NDJSON to stdout (`apps/server/src/app/logging/`)
  - Env: `LOG_LEVEL`, `LOG_FORMAT`, `NODE_ENV` (contract: `specs/002-server-structured-logging/contracts/environment.md`)
  - Runtime `LOG_LEVEL` sync via `apps/server/src/app/logging/config/pino-level-sync.service.ts`
  - HTTP request logging interceptor: `apps/server/src/app/logging/http/logging.interceptor.ts`
- Client (Node runtime): `@full-stack-todo/client/logging` library (`libs/client/logging/`)
  - `withLogging` wrapper for App Router route handlers; `getLogger` for Server Components
  - Env: `LOG_LEVEL`, `LOG_FORMAT`, `NODE_ENV` (contract: `specs/003-nextjs-structured-logging/contracts/environment.md`)
- Client (browser): `pino` browser transmit sends errors to `POST /api/logs` (`apps/client/src/lib/logger/client.ts`, `apps/client/src/app/api/logs/route.ts`)
- Edge middleware: Correlation IDs only (`x-request-id`, `x-trace-id`); no logger imports (`apps/client/src/middleware.ts`, `apps/client/src/lib/correlation-id.ts`)
- Redaction: Authorization/cookie fields redacted per logging specs (server and client logging libs)

## CI/CD & Deployment

**Hosting:**
- Not configured in repository — No `.github/workflows`, Dockerfile for apps, or cloud deployment manifests

**CI Pipeline:**
- None in repo — `.github/` directory exists but contains no workflow files
- Local quality gates (per workspace rules): `npx nx run-many -t test --all`, `npx nx run-many -t lint --all`, `npx nx e2e client-e2e`
- Husky pre-commit runs `npx nx run-many --target=test --all` (`.husky/pre-commit`)

## Environment Configuration

**Required env vars:**

| Variable | Where | Required | Notes |
|----------|-------|----------|-------|
| `DATABASE_URL` | server | Yes | PostgreSQL connection string |
| `JWT_SECRET` | server | Yes | JWT signing secret |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | server | No | Default `600s` |
| `SESSION_SECRET` | client | Yes | ≥ 32 characters |
| `API_URL` | client | Yes (runtime) | Backend URL for Next.js API route proxies |
| `LOG_LEVEL` | server, client | No | Default `info` |
| `LOG_FORMAT` | server, client | No | `json` \| `pretty` \| `auto` |
| `NODE_ENV` | server, client | No | Drives log format auto-resolution |
| `NEXT_PUBLIC_LOG_LEVEL` | client | No | Browser logger level |
| `PORT` | server | No | Default `3000` |
| `CI` | test runners | No | Playwright retries/workers (`apps/client-e2e/playwright.config.ts`) |

**Secrets location:**
- Local: `.env` (root, copied from `.env.development` by `scripts/env.ts`), `apps/client/.env.local`, server `.env` (from `apps/server/.env.example` template)
- `.env.development` present at repo root (committed template pattern — never read or commit actual secret values)
- Husky auto-syncs `.env` from `.env.development` after merge/checkout

## Webhooks & Callbacks

**Incoming:**
- None — No webhook endpoints (Clerk, Stripe, GitHub, etc.) detected

**Outgoing:**
- Client browser logger → `POST /api/logs` on same Next.js origin (`apps/client/src/lib/logger/client.ts`)
- All other outbound calls are to the internal NestJS API at `API_URL` (`/api/v1/auth/*`, `/api/v1/todos/*`, `/api/v1/users/*`)

## Inter-App Communication

```text
Browser ──► Next.js (apps/client) ──► NestJS API (apps/server) ──► PostgreSQL
              │                              │
              │  /api/auth/*, /api/todos/*   │  /api/v1/auth/*, /api/v1/todos/*
              │  (session cookie)            │  (Bearer JWT)
              └──────────────────────────────┘
                    API_URL env var
```

**Key integration files:**
- `apps/client/src/app/api/auth/login/route.ts` — Proxies login, creates session
- `apps/client/src/app/api/auth/register/route.ts` — Proxies registration
- `apps/client/src/app/api/todos/route.ts`, `apps/client/src/app/api/todos/[id]/route.ts` — Todo CRUD proxy
- `apps/client/src/hooks/use-todos.ts` — Calls Next.js `/api/todos` (not backend directly)
- `libs/server/feature-todo/`, `libs/server/feature-user/`, `libs/server/feature-auth/` — Backend domain modules

**E2E test integration:**
- Playwright starts both apps via `npx nx run-many --target=serve --projects=server,client` (`apps/client-e2e/playwright.config.ts`)
- Health check URL: `http://localhost:3000/api/v1` (Swagger/backend)
- Browser base URL: `http://localhost:4200` (Next.js client)

---

*Integration audit: 2026-06-12*

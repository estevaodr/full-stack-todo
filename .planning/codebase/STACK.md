# Technology Stack

**Analysis Date:** 2026-06-12

## Languages

**Primary:**
- TypeScript ~5.9.2 — All application and library code (`apps/`, `libs/`, `scripts/`)
- JavaScript — Config files only (`apps/client/next.config.js`, `apps/server/webpack.config.js`, `eslint.config.mjs`)

**Secondary:**
- YAML — Docker Compose (`docker-compose.yml`), seed data (`scripts/seed-data.yaml`), Task runner (`Taskfile.yml`), pnpm workspace (`pnpm-workspace.yaml`)
- Markdown — Specs (`specs/`), docs (`docs/`), README files

## Runtime

**Environment:**
- Node.js 22 (pinned in `.nvmrc`; README recommends v20+)
- Browser runtime for Next.js client components and Playwright E2E

**Package Manager:**
- **pnpm** — Active lockfile `pnpm-lock.yaml` and workspace config `pnpm-workspace.yaml` (root-only workspace, no nested packages)
- **npm** — Legacy `package-lock.json` and README/Taskfile still reference `npm install`; treat pnpm as the in-progress standard and npm as residual
- Lockfile: `pnpm-lock.yaml` present; `package-lock.json` also present (dual lockfile state)

## Frameworks

**Core:**
- Nx 22.3.3 — Monorepo orchestration (`nx.json`, per-project `project.json` files)
- NestJS ^11.0.0 — Backend API (`apps/server`, `libs/server/*`)
- Next.js ^16.1.4 — Frontend App Router (`apps/client`)
- React ^19.2.3 — UI (`apps/client/src`)

**Testing:**
- Jest ^30.0.2 + ts-jest — Server and server-side library unit/integration tests (inferred via `@nx/jest` plugin in `nx.json`, root `jest.config.ts`)
- Vitest ^4.0.18 + @vitejs/plugin-react — Client app tests (`apps/client/vitest.config.ts`) and `libs/client/logging` tests (`libs/client/logging/vitest.config.ts`)
- Playwright ^1.36.0 — E2E tests (`apps/client-e2e/playwright.config.ts`, `@nx/playwright` plugin)
- MSW ^2.12.9 — HTTP mocking in client unit tests (`apps/client/src/mocks/`)

**Build/Dev:**
- Webpack + `@nx/webpack` — Server bundle (`apps/server/webpack.config.js`, target `server:build`)
- `@nx/next` — Client build and dev server (`apps/client/project.json`)
- SWC ~1.5.7 — Transpilation via Nx toolchain (`@swc/core`, `@swc-node/register`)
- Task (Taskfile) — Developer convenience wrappers (`Taskfile.yml`); Nx is the authoritative task runner for CI gates
- Husky ^9.1.7 — Git hooks (`.husky/pre-commit`, `.husky/post-merge`, `.husky/post-checkout`)

## Key Dependencies

**Critical:**
- `@nestjs/core` ^11.0.0 — Backend framework entry (`apps/server/src/main.ts`)
- `typeorm` ^0.3.28 + `@nestjs/typeorm` ^11.0.0 + `pg` ^8.11.3 — PostgreSQL ORM (`apps/server/src/app/app.module.ts`, entities in `libs/server/data-access-todo/`)
- `next` ^16.1.4 — Frontend framework (`apps/client/`)
- `@tanstack/react-query` ^5.90.19 — Client data fetching (`apps/client/src/providers/query-provider.tsx`, hooks in `apps/client/src/hooks/`)
- `pino` ^10.3.1 + `nestjs-pino` ^4.6.1 + `pino-http` ^11.0.0 — Structured logging on server (`apps/server/src/app/logging/`) and client (`libs/client/logging/`, `apps/client/src/lib/logger/`)
- `passport` ^0.7.0 + `passport-jwt` ^4.0.1 + `@nestjs/jwt` ^11.0.2 — JWT authentication (`libs/server/feature-auth/`)
- `bcrypt` ^6.0.0 — Password hashing (`libs/server/feature-auth/src/lib/server-feature-auth.service.ts`)
- `jose` ^6.1.3 — Encrypted session cookies on Next.js (`apps/client/src/lib/session.ts`)
- `joi` ^18.0.2 — Server startup env validation (`apps/server/src/app/app.module.ts`)
- `zod` ^4.3.6 — Client request validation (`apps/client/src/lib/validations`, API routes)
- `class-validator` ^0.14.3 + `class-transformer` ^0.5.1 — NestJS DTO validation (`apps/server/src/main.ts` global `ValidationPipe`)

**Infrastructure:**
- `@nestjs/config` ^4.0.2 — Environment configuration (`apps/server/src/app/app.module.ts`)
- `@nestjs/swagger` ^11.2.3 — OpenAPI docs at `/api/v1` (`apps/server/src/main.ts`)
- `axios` ^1.6.0 — Listed in root dependencies; client uses native `fetch` via `apps/client/src/lib/api-client.ts`
- `tailwindcss` ^4.1.18 + `@tailwindcss/postcss` — Styling (`apps/client/tailwind.config.js`, `apps/client/postcss.config.js`)
- `@radix-ui/react-*` — Accessible UI primitives (`apps/client/src/components/ui/`)
- `react-hook-form` ^7.71.1 + `@hookform/resolvers` ^5.2.2 — Form handling
- `next-themes` ^0.4.6 — Theme switching (`apps/client/src/components/theme-toggle.tsx`)
- `server-only` ^0.0.1 — Prevents server logger bundling on client (`libs/client/logging/src/lib/logger.ts`)
- `supertest` ^7.2.2 — HTTP integration tests on server (`apps/server/src/app/logging/__tests__/`)

## Configuration

**Environment:**
- Root `.env.development` — Template copied to `.env` by `scripts/env.ts` (triggered by Husky post-merge/post-checkout)
- `apps/server/.env.example` — Documents server vars (copy to server `.env` for local runs)
- `apps/client/.env.local` — Client-local overrides (present; do not commit secrets)
- Server validates at startup via Joi in `apps/server/src/app/app.module.ts` and logging fragment in `apps/server/src/app/logging/config/logging-env.schema.ts`
- Client session module fails fast if `SESSION_SECRET` is missing or &lt; 32 chars (`apps/client/src/lib/session.ts`)
- Normative logging contracts: `specs/002-server-structured-logging/contracts/environment.md`, `specs/003-nextjs-structured-logging/contracts/environment.md`

**Key configs required:**

| Variable | App | Purpose |
|----------|-----|---------|
| `DATABASE_URL` | server | PostgreSQL connection string (required) |
| `JWT_SECRET` | server | JWT signing key (required) |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | server | Access token TTL (default `600s`) |
| `SESSION_SECRET` | client | Session cookie signing (≥ 32 chars) |
| `API_URL` | client | Backend base URL for server-side proxy routes |
| `LOG_LEVEL`, `LOG_FORMAT`, `NODE_ENV` | server + client | Structured logging behavior |
| `NEXT_PUBLIC_LOG_LEVEL` | client | Browser pino logger level |
| `PORT` | server | HTTP listen port (default `3000`) |

**Build:**
- `tsconfig.base.json` — Path aliases (`@full-stack-todo/*`)
- `nx.json` — Nx plugins (Next, Webpack, ESLint, Jest, Playwright)
- `eslint.config.mjs` — Flat ESLint with `@nx/enforce-module-boundaries`; `no-console` enforced on logging/API paths
- `.prettierrc` — `singleQuote: true`
- `apps/server/webpack.config.js` — Node target, outputs to `dist/apps/server`
- `apps/client/next.config.js` — Security headers, `@nx/next` plugin, server logger alias exclusion
- `docker-compose.yml` — Local PostgreSQL 16

## Platform Requirements

**Development:**
- Node.js 22 (`.nvmrc`)
- Docker + Docker Compose for PostgreSQL (or use `npx nx postgres` / auto-start via `server:serve` dependency on `@full-stack-todo/source:postgres`)
- Playwright browsers for E2E (`npx playwright install chromium` via Taskfile `playwright-install`)
- Copy/sync env: run `pnpm run env` or rely on Husky hooks after clone/merge

**Production:**
- Not detected — No Dockerfile, Kubernetes manifests, or CI deploy config in repo
- Server bundles to `dist/apps/server` via Webpack; client builds to `dist/apps/client` (or `apps/client/.next` in dev config)
- PostgreSQL required at runtime; TypeORM `synchronize: true` is enabled in `apps/server/src/app/app.module.ts` (development-oriented; use migrations for production)

---

*Stack analysis: 2026-06-12*

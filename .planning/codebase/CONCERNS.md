# Codebase Concerns

**Analysis Date:** 2026-06-12

## Tech Debt

**Legacy in-memory Todo module (orphaned):**
- Issue: `apps/server/src/app/todo/` contains a full in-memory `TodoController` / `TodoService` stack that is not imported by `AppModule`. The live API uses `ServerFeatureTodoModule` in `libs/server/feature-todo/` with TypeORM and per-user scoping.
- Files: `apps/server/src/app/todo/todo.module.ts`, `apps/server/src/app/todo/todo.controller.ts`, `apps/server/src/app/todo/todo.service.ts`, `apps/server/src/app/todo/dto/`, `apps/server/src/app/todo/entities/todo.entity.ts`
- Impact: Confuses contributors about the canonical todo API; re-wiring `TodoModule` would expose unauthenticated, non-persistent todos at `/api/todos` (no versioning, no JWT guard on that controller).
- Fix approach: Delete the orphaned module or move it behind an explicit dev-only flag. Ensure all todo traffic goes through `libs/server/feature-todo/src/lib/server-feature-todo.controller.ts`.

**TypeORM `synchronize: true` hardcoded:**
- Issue: Database schema auto-sync is always enabled in the NestJS root module, regardless of environment.
- Files: `apps/server/src/app/app.module.ts` (line ~136), `scripts/seed.ts`
- Impact: Production or staging deploys can auto-alter or drop schema on startup. Documented as dev-only in `docs/database/MIGRATIONS.md` but not enforced in code.
- Fix approach: Gate with `synchronize: process.env.NODE_ENV !== 'production'` (or a dedicated env var). Add TypeORM migration files and a `migration:run` deploy step per `docs/database/MIGRATIONS.md`.

**No migration files in repo:**
- Issue: Migration strategy is documented but no generated migration artifacts exist under the repo.
- Files: `docs/database/MIGRATIONS.md`, entity schemas in `libs/server/data-access-todo/src/lib/database/schemas/`
- Impact: Production schema changes have no versioned, reviewable path; teams must rely on `synchronize` or manual SQL.
- Fix approach: Add a TypeORM data source config, generate initial migration from current entities, integrate `migration:run` into deploy/CI.

**Dual shared type libraries:**
- Issue: Todo types and DTOs are split across `@full-stack-todo/shared` (class-validator DTOs + legacy `Todo` with timestamps) and `@full-stack-todo/shared/domain` (domain `ITodo`, user, auth interfaces). Client hooks use domain; legacy server todo and some controllers import from `shared`.
- Files: `libs/shared/src/lib/todo.ts`, `libs/shared/src/lib/todo.dto.ts`, `libs/shared/domain/src/lib/models/todo.interface.ts`, `libs/server/feature-todo/src/lib/dtos/todo.dto.ts` (re-export shim)
- Impact: Two `ITodo`-like shapes (`Todo` adds `createdAt`/`updatedAt`; domain `ITodo` adds `user_id`). Easy to import the wrong package when adding fields.
- Fix approach: Consolidate on `@full-stack-todo/shared/domain` for interfaces and keep DTOs in one library; remove legacy `Todo` interface or align it with domain model.

**Commented-out legacy code in feature service:**
- Issue: `ServerFeatureTodoService` retains large blocks of commented BehaviorSubject in-memory implementation.
- Files: `libs/server/feature-todo/src/lib/server-feature-todo.service.ts`
- Impact: Noise in reviews; comments say "will be removed in future commits" but code remains.
- Fix approach: Remove commented blocks now that TypeORM path is stable.

**Package manager transition incomplete:**
- Issue: Root has both `package-lock.json` and new `pnpm-workspace.yaml` / `pnpm-lock.yaml` (per git status). Scripts still use `npx` without documenting a single package manager.
- Files: `package.json`, `pnpm-workspace.yaml`, `package-lock.json`, `pnpm-lock.yaml`
- Impact: Inconsistent installs, divergent lockfiles, CI/local drift.
- Fix approach: Pick one manager, remove the other lockfile, document install command in README.

**Nx package version skew:**
- Issue: `@nx/devkit` is `22.5.2` while other `@nx/*` packages and `nx` are `22.3.3`.
- Files: `package.json`
- Impact: Subtle Nx plugin/generator incompatibilities.
- Fix approach: Align all `@nx/*` packages to the same version.

**Stale Husky pre-commit exclusions:**
- Issue: Pre-commit runs `nx run-many --target=test --all --exclude=DataAccess,ui-components`, but no projects with those names exist in the workspace.
- Files: `.husky/pre-commit`
- Impact: Misleading hook config; suggests leftover Angular migration cleanup.
- Fix approach: Remove stale `--exclude` flags or replace with current project names if exclusions are still needed.

**Automatic `.env` overwrite on git operations:**
- Issue: `post-checkout` and `post-merge` Husky hooks run `scripts/env.ts`, which copies `.env.development` over `.env`, overwriting local changes.
- Files: `.husky/post-checkout`, `.husky/post-merge`, `scripts/env.ts`
- Impact: Developers lose customized local secrets/config after pull/checkout.
- Fix approach: Only create `.env` when missing, or prompt before overwrite.

**Runtime dependencies that belong in devDependencies:**
- Issue: `supertest` and `@types/pino` are listed under `dependencies`.
- Files: `package.json`
- Impact: Larger production install surface; test-only code in runtime dependency tree.
- Fix approach: Move to `devDependencies`.

**Storybook installed but not configured:**
- Issue: `storybook` and `@nx/storybook` are in devDependencies; no `.storybook/` directory exists.
- Files: `package.json`
- Impact: Dead weight in installs; unclear if UI component docs are planned.
- Fix approach: Add Storybook config or remove unused packages.

**Dual test runners (Jest + Vitest):**
- Issue: Server libs use Jest (`@nx/jest`); client and `libs/client/logging` use Vitest via shell commands in `project.json`.
- Files: `libs/server/feature-*/project.json`, `apps/client/project.json`, `libs/client/logging/project.json`
- Impact: Two config ecosystems, duplicate setup patterns (MSW in Vitest, jest mocks on server).
- Fix approach: Accept as intentional split or standardize on one runner per layer with documented rationale.

**TypeScript suppressions in server specs:**
- Issue: Multiple server spec files use `@ts-ignore` for path-mapping imports with eslint disables.
- Files: `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`, `libs/server/feature-auth/src/lib/server-feature-auth.service.spec.ts`, and sibling `*.spec.ts` files under `libs/server/feature-*`
- Impact: Hides real type errors; may mask broken imports after refactors.
- Fix approach: Fix `tsconfig.spec.json` paths or use public library entrypoints so suppressions are unnecessary.

**Server bootstrap marked non-production:**
- Issue: `apps/server/src/main.ts` opens with "This is not a production server yet!" and exposes Swagger at `/api/v1` without environment gating.
- Files: `apps/server/src/main.ts`
- Impact: Signals incomplete production hardening; Swagger may leak API surface in deployed environments.
- Fix approach: Gate Swagger behind `NODE_ENV !== 'production'` or auth; remove stale disclaimer once production checklist is met.

**Inconsistent API proxy in todo DELETE route:**
- Issue: `DELETE` handler in the Next.js BFF builds its own `fetch` URL instead of using `fetchApiWithAuth` like `GET`/`POST`/`PATCH`.
- Files: `apps/client/src/app/api/todos/[id]/route.ts` (lines ~55–60), `apps/client/src/lib/api-client.ts`
- Impact: Divergent error handling and URL construction; harder to change base URL or auth header logic in one place.
- Fix approach: Use `fetchApiWithAuth` (or a shared helper that handles 204 responses) for DELETE as well.

## Known Bugs

**Session outlives backend JWT (no refresh):**
- Symptoms: User remains "logged in" (session cookie valid 7 days) but todo/API calls fail with 401/502 after backend JWT expires (default `600s` / 10 minutes).
- Files: `apps/client/src/lib/session.ts` (7-day cookie), `libs/server/feature-auth/src/lib/server-feature-auth.module.ts` (`JWT_ACCESS_TOKEN_EXPIRES_IN` default `600s`), `apps/client/src/app/api/todos/route.ts`
- Trigger: Log in, wait >10 minutes without re-authenticating, perform todo CRUD.
- Workaround: Log out and log in again.
- Fix approach: Implement refresh tokens or re-login on 401 from BFF; align session TTL with JWT TTL; add client-side token expiry handling in `apps/client/src/providers/auth-provider.tsx`.

**Unique constraint errors return HTTP 401:**
- Symptoms: Duplicate resource database errors (e.g., unique todo title if constrained) return `401 Unauthorized` instead of `409 Conflict`.
- Files: `libs/server/util/src/lib/query-error.filter.ts` (lines ~80–91)
- Trigger: Provoke a TypeORM `QueryFailedError` with `UNIQUE` in the message (documented example: duplicate todo title).
- Workaround: User registration duplicates are handled separately via `ConflictException` in `libs/server/feature-user/src/lib/server-feature-user.service.ts`.
- Fix approach: Change status to `409 Conflict` and register filter globally or ensure all controllers that need it use `@UseFilters(QueryErrorFilter)`.

## Security Considerations

**Backend JWT stored inside session cookie:**
- Risk: Session JWT payload includes `accessToken` (`apps/client/src/lib/session.ts`). Compromise of the session secret or cookie exposes the backend bearer token.
- Files: `apps/client/src/lib/session.ts`, `apps/client/src/app/api/auth/login/route.ts`
- Current mitigation: `httpOnly` cookie, `secure` in production, `sameSite: 'lax'`.
- Recommendations: Store only opaque session ID server-side, or use shorter-lived tokens with refresh; avoid embedding bearer tokens in client-readable JWT claims if session is ever exposed to JS.

**Unauthenticated log ingest endpoint:**
- Risk: `POST /api/logs` accepts browser and edge-middleware log payloads without authentication.
- Files: `apps/client/src/app/api/logs/route.ts`, `apps/client/src/middleware.ts` (fire-and-forget POST on every matched request)
- Current mitigation: Zod schema validation for known shapes; malformed payloads rejected with 400.
- Recommendations: Rate-limit, require session for browser logs, or restrict ingest to internal/network paths in production.

**Dev-only `/test-logging` route exposed:**
- Risk: Logging verification page is not listed in middleware `protectedRoutes` and is reachable without login.
- Files: `apps/client/src/app/test-logging/page.tsx`, `apps/client/src/middleware.ts`
- Current mitigation: None beyond obscurity.
- Recommendations: Remove from production builds, guard with auth, or gate on `NODE_ENV === 'development'`.

**Swagger UI publicly available:**
- Risk: OpenAPI docs at `/api/v1` document all bearer-auth endpoints; no production disable.
- Files: `apps/server/src/main.ts`
- Current mitigation: API still requires JWT for protected routes.
- Recommendations: Disable or protect Swagger in non-dev environments.

**No rate limiting on auth endpoints:**
- Risk: Brute-force login and registration spam on `POST /api/v1/auth/login` and `POST /api/v1/users`.
- Files: `libs/server/feature-auth/src/lib/server-feature-auth.controller.ts`, `libs/server/feature-user/src/lib/server-feature-user.controller.ts`
- Current mitigation: bcrypt password hashing; generic login error messages on client.
- Recommendations: Add throttling (e.g., `@nestjs/throttler`) or edge rate limits.

**Missing Content-Security-Policy:**
- Risk: XSS impact is not mitigated by CSP at the Next.js layer.
- Files: `apps/client/next.config.js`, `apps/client/src/__tests__/security-headers.test.ts` (CSP not in expected list)
- Current mitigation: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Recommendations: Add a strict CSP appropriate for Next.js; extend security header tests.

**No CORS configuration on NestJS server:**
- Risk: If client and API are deployed on different origins, behavior depends on browser defaults; misconfiguration could allow unwanted cross-origin access when CORS is added ad hoc.
- Files: `apps/server/src/main.ts`
- Current mitigation: BFF pattern (`apps/client/src/lib/api-client.ts`) proxies most browser traffic server-side.
- Recommendations: Explicitly configure CORS if direct browser-to-API access is ever introduced.

**Client environment variables undocumented at repo level:**
- Risk: `SESSION_SECRET` and `API_URL` are required for client runtime (`apps/client/src/lib/session.ts`, `apps/client/src/lib/api-client.ts`) but only server partial example exists at `apps/server/.env.example`. Client has `apps/client/.env.local` (local only, not committed).
- Files: `apps/server/.env.example`, `apps/client/src/setupTests.ts` (test defaults only)
- Current mitigation: Tests set dummy values in `apps/client/src/setupTests.ts`.
- Recommendations: Add `apps/client/.env.example` documenting required vars.

## Performance Bottlenecks

**Middleware logs every page request via internal fetch:**
- Problem: Edge middleware POSTs to `/api/logs` on every non-API page navigation (fire-and-forget).
- Files: `apps/client/src/middleware.ts` (lines ~91–101)
- Cause: Access logging implemented as a second HTTP hop per request.
- Improvement path: Sample logs in production, batch ingest, or use edge-compatible logging without round-trip.

**User fetch loads todos relation eagerly:**
- Problem: `getOne` always loads `relations: ['todos']` even when only user profile is needed.
- Files: `libs/server/feature-user/src/lib/server-feature-user.service.ts` (line ~40)
- Cause: Default relation loading on every user lookup.
- Improvement path: Make relations optional or use dedicated query methods.

**Large educational test files:**
- Problem: Server controller/service specs exceed 400 lines with tutorial-style comments.
- Files: `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts` (422 lines), `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts` (415 lines)
- Cause: Course-style documentation embedded in tests.
- Improvement path: Trim comments in tests; move teaching content to docs.

## Fragile Areas

**Global JWT guard + `@SkipAuth()` opt-out:**
- Files: `apps/server/src/app/app.module.ts`, `libs/server/util/src/lib/guards/jwt.auth-guard.ts`, `libs/server/util/src/lib/skip-auth.ts`
- Why fragile: Any new controller method is protected by default; forgetting `@SkipAuth()` on a public route breaks clients silently with 401.
- Safe modification: When adding routes in `libs/server/feature-*`, explicitly decide auth requirement and add `@SkipAuth()` or `@ApiBearerAuth()` accordingly; add integration tests for public vs protected paths.

**Circular dependency between auth and user modules:**
- Files: `libs/server/feature-auth/src/lib/server-feature-auth.module.ts` (`forwardRef(() => ServerFeatureUserModule)`)
- Why fragile: Module init order issues if `forwardRef` is removed or modules are split further.
- Safe modification: Keep `forwardRef` when touching module imports; consider extracting shared user lookup into a smaller module if the cycle grows.

**Auth/session split across three layers:**
- Files: NestJS JWT (`libs/server/feature-auth/`), Next.js session cookie (`apps/client/src/lib/session.ts`), BFF routes (`apps/client/src/app/api/auth/`, `apps/client/src/app/api/todos/`)
- Why fragile: Token expiry, logout, and error handling must stay consistent across all three.
- Safe modification: Change auth in one layer only with cross-layer integration tests (`apps/client/src/__tests__/auth-flow.integration.test.tsx`, `apps/client-e2e/src/e2e/auth.spec.ts`).

**TypeORM entity schemas as single source of truth:**
- Files: `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts`, `libs/server/data-access-todo/src/lib/database/schemas/user.entity-schema.ts`
- Why fragile: Schema changes + `synchronize: true` apply immediately on restart; no migration review step.
- Safe modification: Treat entity edits as breaking changes; test against disposable DB; plan migration before production.

## Scaling Limits

**In-memory legacy todo service (if ever re-enabled):**
- Current capacity: Unbounded array in process memory.
- Limit: Lost on restart; not shared across instances; no user isolation.
- Scaling path: Keep using `ServerFeatureTodoService` + PostgreSQL only.

**PostgreSQL via single `DATABASE_URL`:**
- Current capacity: One connection URL per app instance.
- Limit: No read replicas, connection pooling config, or multi-tenant isolation beyond `user_id` column scoping.
- Scaling path: Add PgBouncer/connection pool settings; consider row-level security if multi-tenant requirements grow.

**JWT access token TTL (600s default):**
- Current capacity: Short-lived stateless auth.
- Limit: No refresh flow; poor UX for long sessions; session/JWT mismatch under load-balanced BFF.
- Scaling path: Refresh tokens, centralized session store, or shorter client session aligned with JWT.

## Dependencies at Risk

**Nx version mismatch (`@nx/devkit` vs rest):**
- Risk: `@nx/devkit@22.5.2` vs `@nx/*@22.3.3` and `nx@22.3.3`.
- Impact: Generator/executor API drift, hard-to-debug Nx errors.
- Migration plan: Pin all Nx packages to one version in `package.json`.

**Competing lockfiles during pnpm adoption:**
- Risk: `package-lock.json` coexists with `pnpm-lock.yaml`.
- Impact: Non-deterministic installs across developers and CI.
- Migration plan: Complete pnpm migration or revert `pnpm-workspace.yaml`; document single install path.

**Playwright vs Nx Playwright plugin age gap:**
- Risk: `@playwright/test@^1.36.0` may lag recommended version for `@nx/playwright@22.3.3`.
- Impact: E2E flakiness or missing browser features in CI.
- Migration plan: Align Playwright with Nx plugin compatibility matrix; run `npx nx e2e client-e2e` after upgrade.

## Missing Critical Features

**Token refresh / silent re-auth:**
- Problem: No refresh token or automatic re-login when backend JWT expires while session cookie remains.
- Blocks: Reliable long-lived sessions without user-visible failures on todo operations.

**Production database migrations:**
- Problem: Documented but not implemented in repo.
- Blocks: Safe production deploys without `synchronize`.

**CI pipeline in repository:**
- Problem: No `.github/workflows/` or equivalent CI config detected.
- Blocks: Automated gate for `nx run-many -t test --all`, lint, and `nx e2e client-e2e` on every PR.

## Test Coverage Gaps

**Data access layer untested:**
- What's not tested: Entity schemas, `DatabaseModule`, repositories, DTO validation in `libs/server/data-access-todo/`.
- Files: `libs/server/data-access-todo/src/lib/database.module.ts`, `libs/server/data-access-todo/src/lib/dtos/`
- Risk: Schema or validation regressions ship unnoticed.
- Priority: High

**BFF todo API routes (partial):**
- What's not tested: `apps/client/src/app/api/todos/route.ts` and `apps/client/src/app/api/todos/[id]/route.ts` have no dedicated unit tests (only indirect coverage via hook/integration tests).
- Files: `apps/client/src/app/api/todos/route.ts`, `apps/client/src/app/api/todos/[id]/route.ts`
- Risk: Auth header, 502 mapping, and DELETE URL bugs (see inconsistent DELETE handler).
- Priority: Medium

**JWT expiry scenario:**
- What's not tested: No integration or e2e test for expired backend token with valid session cookie.
- Files: `apps/client/src/lib/__tests__/session.test.ts` (session expiry only), `apps/client-e2e/src/e2e/tasks.spec.ts`
- Risk: Production UX break after 10 minutes undetected in CI.
- Priority: High

**Log ingest abuse / `/api/logs` malformed payloads:**
- What's not tested: Limited tests for rate/abuse scenarios on log ingest (validation unit tests exist in logging lib but not route-level auth).
- Files: `apps/client/src/app/api/logs/route.ts`, `libs/client/logging/src/__tests__/redaction.spec.ts`
- Risk: Log spam or oversized payloads in production.
- Priority: Medium

**Register duplicate email (end-to-end):**
- What's not tested: Server unit test covers `ConflictException`; no Playwright flow for duplicate registration UX.
- Files: `libs/server/feature-user/src/lib/server-feature-user.service.spec.ts`, `apps/client-e2e/src/e2e/auth.spec.ts`
- Risk: Client error handling for 409 not verified in browser.
- Priority: Low

**Legacy server todo module:**
- What's not tested: Orphaned module has zero tests and is not in the Nx graph as an imported module.
- Files: `apps/server/src/app/todo/*`
- Risk: Low (dead code) unless accidentally reconnected.
- Priority: Low (remove code instead of testing)

---

*Concerns audit: 2026-06-12*

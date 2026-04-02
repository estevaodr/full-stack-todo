<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0 (MINOR — new testing constraint added)
Modified principles: 
  - IV. Test Coverage as a Quality Gate (Added E2E constraints)
Added principles: none
Modified sections: 
  - Technology Stack (Added Playwright explicit row)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
Deferred TODOs: none
-->

# Full Stack Todo Constitution

## Core Principles

### I. Library-First Monorepo Architecture

Every domain capability (feature, data-access, utility) MUST live in a dedicated library
under `libs/`, not inside any application. Applications in `apps/` are thin orchestrators
that import and wire libraries only.

- Server library structure: `libs/server/{feature-*,data-access-*,util}/`
- Shared cross-app contracts: `libs/shared/` and `libs/shared/domain/`
- Client application (`apps/client`) MUST NOT contain reusable business logic;
  extract it into a library when reuse is needed.
- Every library MUST be independently testable: it can be built, linted, and tested
  via `nx <target> <lib-name>` without running other applications.
- Libraries are accessed exclusively through their public barrel (`src/index.ts`);
  internal files MUST NOT be imported directly across library boundaries.
- Path aliases defined in `tsconfig.base.json` (e.g., `@full-stack-todo/server/feature-todo`)
  MUST be used for all cross-library imports. Relative paths crossing library boundaries
  are forbidden.

### II. Strict Separation of Concerns (Frontend ↔ Backend)

The client (Next.js 16+) and the server (NestJS 11+) MUST remain decoupled at the
API boundary. Integration happens via the versioned REST API only — no direct module
sharing of server-side NestJS code into the client.

- Backend: NestJS with TypeORM + PostgreSQL, all routes prefixed `/api/v1/`.
  URI versioning is the single versioning strategy; version MUST NOT be encoded
  in headers or query strings.
- Frontend: Next.js App Router with React 19, TanStack Query for server-state,
  React Hook Form + Zod for form validation.
- Shared domain types (DTOs, enums, interfaces) that cross the API boundary MUST
  live in `libs/shared/domain/`, typed with `class-validator`/`class-transformer`
  on the server side and Zod schemas on the client side.
- The server MUST enforce global `ValidationPipe` with `whitelist: true` and
  `forbidNonWhitelisted: true`; no unvalidated payload data reaches business logic.

### III. Security by Default (NON-NEGOTIABLE)

Authentication and authorization MUST be applied globally and opted-out selectively,
never opted-in selectively.

- `JwtAuthGuard` is registered as a global `APP_GUARD`; every new endpoint is
  protected by default. Routes that must be public (e.g., `/auth/login`,
  `/auth/register`) MUST use the `@SkipAuth()` decorator explicitly.
- JWT secrets MUST be loaded from environment variables (`JWT_SECRET`),
  never hardcoded. Application MUST fail to start if `JWT_SECRET` is absent
  (enforced via Joi validation schema in `ConfigModule`).
- `DATABASE_URL` MUST match the PostgreSQL connection string pattern; the app
  MUST refuse to start if validation fails — fail-fast, never silent misconfiguration.
- Passwords MUST be hashed with bcrypt before persistence; plain-text passwords
  MUST NOT be stored or logged.
- Sensitive values (tokens, secrets, passwords) MUST NOT appear in logs at any
  log level.

### IV. Test Coverage as a Quality Gate

Automated tests MUST be written and passing before a commit is merged (enforced
via Husky pre-commit hook running `nx run-many --target=test --all`).

- **Server libraries** use Jest (`@nestjs/testing`) for unit and integration tests.
  Test files MUST use the `.spec.ts` suffix alongside the file under test.
- **Client** uses Vitest + React Testing Library for component and hook tests.
  MSW is used to mock API calls; no real HTTP requests in unit tests.
- Test doubles (mocks/stubs) MUST be scoped to the test file; shared test factories
  belong in a `__tests__/` helper sub-directory of the library.
- `passWithNoTests: true` is permitted only on the server app shell
  (`apps/server`); library projects MUST have tests.
- E2E tests for the client use Playwright (`@nx/playwright`) and require the backend API to be running. E2E is gated separately from unit tests in CI. E2E tests MUST use user-facing locators (e.g., `getByRole`, `getByLabel`) and enforce test-level semantic data isolation (each test scaffolds its own state via the API).

### V. Explicit Configuration & Observability

All runtime configuration MUST be declared and validated at startup; the application
MUST surface meaningful diagnostics.

- Environment variables MUST be declared in the Joi validation schema in `AppModule`.
  Undeclared or invalid variables cause startup failure.
- SQL query logging is controlled by `LOG_LEVEL=DEBUG`; INFO is the default for
  clean production logs.
- Swagger/OpenAPI documentation MUST be maintained and served at `/api/v1`.
  Every public controller action MUST have a corresponding Swagger decorator.
- Startup logs MUST emit the listening address and documentation URL at bootstrap.
- `TypeORM synchronize: true` is permitted only in development. Production
  deployments MUST use TypeORM migrations; enabling `synchronize` in production
  environments is strictly forbidden.

### VI. Code Simplicity (DRY, KISS & YAGNI)

Code MUST be the simplest correct solution. Complexity requires justification;
simplicity never does.

- **DRY (Don't Repeat Yourself)**: Every piece of business logic, validation rule,
  or configuration MUST have a single authoritative source. Duplication of logic
  across libraries or components MUST be refactored into a shared library or utility
  before merging. Copy-paste of non-trivial logic blocks is forbidden.
- **KISS (Keep It Simple, Stupid)**: Implementations MUST choose the simplest design
  that satisfies the stated requirements. Clever abstractions, over-engineering, and
  premature generalization are forbidden without explicit justification in the PR or
  linked spec.
- **YAGNI (You Aren't Gonna Need It)**: Code MUST NOT be written for anticipated
  future requirements that do not exist today. Features, interfaces, and abstractions
  not required by a current, approved spec MUST NOT be added. Remove dead code
  rather than leaving it commented-out or behind a flag.
- These three principles apply equally to frontend components, backend services,
  library APIs, database schemas, and configuration files.

## Technology Stack

The following stack is canonical. Deviations require a constitution amendment.

| Layer | Technology | Version constraint |
|---|---|---|
| Monorepo tooling | Nx | ~22.x |
| Language | TypeScript | ~5.9 |
| Backend framework | NestJS | ^11.0 |
| Backend ORM | TypeORM | ^0.3 |
| Backend database | PostgreSQL | 16 (Docker) |
| Auth | Passport + JWT (`@nestjs/passport`, `@nestjs/jwt`) | ^11.x / ^11.x |
| Input validation | class-validator + class-transformer (server) | ^0.14 / ^0.5 |
| Frontend framework | Next.js (App Router) | ^16.x |
| Frontend state | TanStack Query | ^5.x |
| Forms | React Hook Form + Zod | ^7.x / ^4.x |
| UI components | Radix UI + Tailwind CSS v4 | ^1-2.x / ^4.x |
| Client testing | Vitest + React Testing Library | ^4.x / ^16.x |
| Server testing | Jest + @nestjs/testing | ^30.x / ^11.x |
| E2E testing | Playwright | ^1.36.x |
| API mocking (client) | MSW | ^2.x |
| Code style | Prettier + ESLint (typescript-eslint) | ~3.6 / ^9.x |
| Task runner | Taskfile + Nx | latest |

## Development Workflow & Quality Gates

### Branching & Commits
- Feature branches from `main`; PRs MUST pass lint, build, and all unit tests.
- Commit messages SHOULD follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).

### Quality Gate Sequence (enforced by Husky)
1. `nx run-many --target=lint --all` — zero warnings-as-errors.
2. `nx run-many --target=test --all` — all unit/integration tests green.
3. Build MUST succeed (`nx run-many --target=build --all`) before release.

### Database Migrations
- Development: `synchronize: true` is acceptable.
- Staging/Production: MUST use `typeorm migration:run`; no schema sync allowed.
- Seed scripts (`scripts/seed.ts`) are for development only; MUST NOT run in CI/CD
  against production databases.

### Environment Management
- Each application under `apps/` MUST own its own `.env` (and `.env.development`)
  file at its project root (e.g., `apps/client/.env`, `apps/server/.env`).
  Workspace-root env files MUST NOT be the sole source of configuration for any app;
  app-level env files take precedence for app-specific variables.
- App-level `.env` files MUST NOT be committed with real secrets; use `.env.example`
  (committed) alongside `.env` (gitignored) per app.
- All variables consumed by an app MUST be declared in that app's `.env.example`
  and validated at startup (server: Joi schema in `ConfigModule`;
  client: documented in `apps/client/README.md` or equivalent).
- Shared infrastructure variables (e.g., `DATABASE_URL`, `JWT_SECRET`) belong in the
  server app's env only; the client MUST NOT have direct access to backend secrets.

## Governance

This constitution supersedes all other implicit practices for the Full Stack Todo project.
It is the authoritative source of architectural and engineering constraints.

- Any amendment that adds, removes, or redefines a principle is a MINOR or MAJOR
  version bump and MUST be documented with rationale, impact, and a migration plan
  for existing code if applicable.
- Clarifications and wording fixes are PATCH bumps.
- All pull requests MUST confirm that proposed changes comply with the principles
  above. Non-compliant code MUST be refactored before merge.
- Compliance is verified during code review and enforced mechanically by lint,
  test, and build gates.
- Complexity beyond what the principles prescribe MUST be justified in the PR
  description or a linked spec document under `.specify/`.
- Use `.specify/memory/` for runtime AI-agent development guidance and spec artifacts.

**Version**: 1.2.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-02

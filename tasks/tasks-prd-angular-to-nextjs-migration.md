# Tasks: Angular to Next.js 15 Migration

## Relevant Files

### Project Configuration
- `apps/client/next.config.js` - Next.js configuration with security headers
- `apps/client/tailwind.config.js` - Tailwind CSS configuration with Nord color palette
- `apps/client/postcss.config.js` - PostCSS configuration for Tailwind
- `apps/client/tsconfig.json` - TypeScript configuration for Next.js
- `apps/client/project.json` - Nx project configuration for Next.js targets
- `apps/client/.env.local` - Environment variables (API_URL, SESSION_SECRET)
- `apps/client/middleware.ts` - Route protection middleware

### Core Libraries
- `apps/client/src/lib/session.ts` - Session encryption/decryption with jose
- `apps/client/src/lib/__tests__/session.test.ts` - Session library tests
- `apps/client/src/lib/validations.ts` - Zod validation schemas
- `apps/client/src/lib/__tests__/validations.test.ts` - Validation schema tests
- `apps/client/src/lib/api-client.ts` - API client wrapper with fetch
- `apps/client/src/lib/__tests__/api-client.test.ts` - API client tests
- `apps/client/src/lib/utils.ts` - Utility functions (cn helper)

### App Structure
- `apps/client/src/app/layout.tsx` - Root layout with providers
- `apps/client/src/app/page.tsx` - Home page (redirect to dashboard)
- `apps/client/src/app/globals.css` - Global styles with Tailwind and CSS variables
- `apps/client/src/app/(auth)/layout.tsx` - Auth pages layout
- `apps/client/src/app/(auth)/login/page.tsx` - Login page
- `apps/client/src/app/(auth)/register/page.tsx` - Register page
- `apps/client/src/app/(protected)/layout.tsx` - Protected pages layout
- `apps/client/src/app/(protected)/dashboard/page.tsx` - Dashboard page

### API Routes
- `apps/client/src/app/api/auth/login/route.ts` - Login API route
- `apps/client/src/app/api/auth/__tests__/login.test.ts` - Login API route tests
- `apps/client/src/app/api/auth/logout/route.ts` - Logout API route
- `apps/client/src/app/api/auth/__tests__/logout.test.ts` - Logout API route tests
- `apps/client/src/app/api/auth/session/route.ts` - Session validation API route

### Components
- `apps/client/src/components/ui/` - shadcn/ui components directory
- `apps/client/src/components/login-form.tsx` - Login form component
- `apps/client/src/components/__tests__/login-form.test.tsx` - Login form tests
- `apps/client/src/components/register-form.tsx` - Register form component
- `apps/client/src/components/__tests__/register-form.test.tsx` - Register form tests
- `apps/client/src/components/todo-card.tsx` - Todo card component
- `apps/client/src/components/__tests__/todo-card.test.tsx` - Todo card tests
- `apps/client/src/components/todo-list.tsx` - Todo list with columns
- `apps/client/src/components/edit-todo-dialog.tsx` - Edit todo modal
- `apps/client/src/components/__tests__/edit-todo-dialog.test.tsx` - Edit dialog tests
- `apps/client/src/components/theme-toggle.tsx` - Theme toggle component
- `apps/client/src/components/__tests__/theme-toggle.test.tsx` - Theme toggle tests

### Hooks
- `apps/client/src/hooks/use-todos.ts` - React Query hooks for todos
- `apps/client/src/hooks/__tests__/use-todos.test.ts` - Todo hooks tests
- `apps/client/src/hooks/use-auth.ts` - Authentication hooks
- `apps/client/src/hooks/__tests__/use-auth.test.ts` - Auth hooks tests

### Providers
- `apps/client/src/providers/query-provider.tsx` - React Query provider
- `apps/client/src/providers/theme-provider.tsx` - Theme provider (next-themes)
- `apps/client/src/providers/auth-provider.tsx` - Auth context provider

### Types
- `apps/client/src/types/index.ts` - Re-exports from shared/domain

### Test Infrastructure
- `apps/client/vitest.config.ts` - Vitest configuration
- `apps/client/src/mocks/handlers.ts` - MSW request handlers
- `apps/client/src/mocks/server.ts` - MSW server setup
- `apps/client/src/__tests__/integration/auth-flow.test.ts` - Auth integration tests
- `apps/client/src/__tests__/integration/todo-crud.test.ts` - Todo CRUD integration tests

### E2E Tests (Playwright)
- `apps/client/playwright.config.ts` - Playwright configuration
- `apps/client/e2e/auth.spec.ts` - Authentication E2E tests
- `apps/client/e2e/todo.spec.ts` - Todo CRUD E2E tests
- `apps/client/e2e/theme.spec.ts` - Theme toggle E2E tests
- `apps/client/e2e/navigation.spec.ts` - Route protection E2E tests
- `apps/client/e2e/pages/login.page.ts` - Login page object
- `apps/client/e2e/pages/register.page.ts` - Register page object
- `apps/client/e2e/pages/dashboard.page.ts` - Dashboard page object
- `apps/client/e2e/fixtures/auth.fixture.ts` - Authentication test fixtures

### Database Documentation
- `docs/database/README.md` - Database documentation overview
- `docs/database/SCHEMA.md` - Complete database schema documentation
- `docs/database/ENTITIES.md` - TypeORM entity definitions and mappings
- `docs/database/ERD.md` - Entity Relationship Diagram (Mermaid)
- `docs/database/MIGRATIONS.md` - Migration strategy guide

### Files to Delete
- `apps/client/src/` (Angular files) - Will be replaced with Next.js structure
- `apps/ui-components-e2e/` - Cypress E2E tests (replaced by Playwright)

### Notes

- All implementation follows TDD methodology: write failing tests first (Red), implement minimal code to pass (Green), refactor (Refactor)
- Unit tests should be placed in `__tests__/` directories alongside the code files they test
- E2E tests use Playwright and are located in `apps/client/e2e/`
- Use `npx nx` for all Nx commands
- Shared domain types from `libs/shared/domain/` will be reused in the Next.js client
- The NestJS backend remains unchanged - only the frontend is being migrated

---

## Tasks

- [x] 1.0 Project Setup & Configuration
  - [x] 1.1 Back up existing Angular client files (create a git branch or copy to backup directory)
  - [x] 1.2 Remove Angular-specific files from `apps/client/src/` (keep `public/` folder)
  - [x] 1.3 Initialize Next.js 15 application with App Router in `apps/client/`
  - [x] 1.4 Configure `tsconfig.json` with strict mode and path mappings for `@/*` and `@full-stack-todo/shared/domain`
  - [x] 1.5 Install Tailwind CSS dependencies (`tailwindcss`, `postcss`, `autoprefixer`)
  - [x] 1.6 Create `tailwind.config.js` with Nord color palette CSS custom properties
  - [x] 1.7 Create `postcss.config.js` for Tailwind processing
  - [x] 1.8 Create `globals.css` with Tailwind directives and CSS variables for light/dark themes
  - [x] 1.9 Initialize shadcn/ui with `npx shadcn@latest init` and configure for Next.js
  - [x] 1.10 Install required shadcn/ui components: Button, Input, Form, Card, Dialog, Label, Separator
  - [x] 1.11 Create `.env.local` with `API_URL` and `SESSION_SECRET` (generate 32+ char secret)
  - [x] 1.12 Update `apps/client/project.json` with Next.js Nx targets (dev, build, start, lint)
  - [x] 1.13 Install core dependencies: `next`, `react`, `react-dom`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `next-themes`, `jose`, `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`
  - [x] 1.14 Verify project builds successfully with `npx nx build client`

- [ ] 2.0 Testing Infrastructure Setup
  - [ ] 2.1 Install Vitest and testing dependencies: `vitest`, `@vitejs/plugin-react`, `@vitest/coverage-v8`, `jsdom`
  - [ ] 2.2 Install React Testing Library: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
  - [ ] 2.3 Install MSW for API mocking: `msw`
  - [ ] 2.4 Create `vitest.config.ts` with React plugin, jsdom environment, and coverage configuration
  - [ ] 2.5 Create `src/mocks/handlers.ts` with MSW request handlers for auth and todo endpoints
  - [ ] 2.6 Create `src/mocks/server.ts` with MSW server setup for tests
  - [ ] 2.7 Create test setup file that extends jest-dom matchers and configures MSW
  - [ ] 2.8 Add test scripts to `project.json`: `test`, `test:coverage`, `test:watch`
  - [ ] 2.9 Verify test infrastructure works by creating and running a simple test

- [ ] 3.0 Core Libraries & Utilities (TDD)
  - [ ] 3.1 Create `src/lib/utils.ts` with `cn()` helper function for Tailwind class merging
  - [ ] 3.2 Create `src/types/index.ts` to re-export types from `@full-stack-todo/shared/domain`
  - [ ] 3.3 Write tests for `lib/validations.ts`: loginSchema and registerSchema validation
  - [ ] 3.4 Implement `lib/validations.ts` with Zod schemas matching PRD password requirements
  - [ ] 3.5 Write tests for `lib/session.ts`: encrypt, decrypt, createSession, deleteSession, getSession
  - [ ] 3.6 Implement `lib/session.ts` with jose for JWT encryption and secure cookie handling
  - [ ] 3.7 Add SESSION_SECRET validation (minimum 32 characters) on module load
  - [ ] 3.8 Write tests for `lib/api-client.ts`: fetch wrapper with error handling
  - [ ] 3.9 Implement `lib/api-client.ts` with base URL from server-only environment variable
  - [ ] 3.10 Verify all core library tests pass with `npx nx test client`

- [ ] 4.0 Authentication System (TDD)
  - [ ] 4.1 Write tests for `api/auth/login/route.ts`: successful login, invalid credentials, validation errors
  - [ ] 4.2 Implement `api/auth/login/route.ts`: proxy to backend, set HTTP-only cookie on success
  - [ ] 4.3 Write tests for `api/auth/logout/route.ts`: successful logout, clear session
  - [ ] 4.4 Implement `api/auth/logout/route.ts`: delete session cookie
  - [ ] 4.5 Implement `api/auth/session/route.ts`: validate and return session data
  - [ ] 4.6 Write tests for `middleware.ts`: protected route redirect, public route access, authenticated redirect
  - [ ] 4.7 Implement `middleware.ts` for route protection with session validation
  - [ ] 4.8 Create `providers/auth-provider.tsx` with AuthContext for client-side auth state
  - [ ] 4.9 Write tests for `hooks/use-auth.ts`: useAuth hook for session state
  - [ ] 4.10 Implement `hooks/use-auth.ts` with login, logout, and session refresh functions
  - [ ] 4.11 Write tests for `components/login-form.tsx`: form rendering, validation, submission
  - [ ] 4.12 Implement `components/login-form.tsx` with React Hook Form and shadcn/ui Form components
  - [ ] 4.13 Write tests for `components/register-form.tsx`: form rendering, password validation, submission
  - [ ] 4.14 Implement `components/register-form.tsx` with password confirmation and validation
  - [ ] 4.15 Create `app/(auth)/layout.tsx` for auth pages (centered layout, no header)
  - [ ] 4.16 Create `app/(auth)/login/page.tsx` with LoginForm component
  - [ ] 4.17 Create `app/(auth)/register/page.tsx` with RegisterForm component
  - [ ] 4.18 Write integration tests for auth flow: register → login → access dashboard → logout
  - [ ] 4.19 Verify all authentication tests pass

- [ ] 5.0 Todo Dashboard (TDD)
  - [ ] 5.1 Write tests for `hooks/use-todos.ts`: useTodos query, useUpdateTodo, useDeleteTodo mutations
  - [ ] 5.2 Implement `hooks/use-todos.ts` with React Query hooks for todo operations
  - [ ] 5.3 Write tests for `components/todo-card.tsx`: rendering, toggle completion, edit button, delete button
  - [ ] 5.4 Implement `components/todo-card.tsx` with shadcn/ui Card and action buttons
  - [ ] 5.5 Write tests for `components/edit-todo-dialog.tsx`: dialog open/close, form pre-fill, save
  - [ ] 5.6 Implement `components/edit-todo-dialog.tsx` with shadcn/ui Dialog and Form
  - [ ] 5.7 Implement `components/todo-list.tsx` with two-column layout (incomplete/complete)
  - [ ] 5.8 Create `app/(protected)/layout.tsx` with header, theme toggle, and logout button
  - [ ] 5.9 Create `app/(protected)/dashboard/page.tsx` with TodoList component
  - [ ] 5.10 Implement optimistic updates for toggle completion and delete operations
  - [ ] 5.11 Write integration tests for todo CRUD operations
  - [ ] 5.12 Verify all dashboard tests pass

- [ ] 6.0 Theme Toggle & Providers
  - [ ] 6.1 Create `providers/query-provider.tsx` with React Query client configuration
  - [ ] 6.2 Create `providers/theme-provider.tsx` wrapping next-themes ThemeProvider
  - [ ] 6.3 Write tests for `components/theme-toggle.tsx`: toggle between light/dark, system preference
  - [ ] 6.4 Implement `components/theme-toggle.tsx` with next-themes useTheme hook
  - [ ] 6.5 Create `app/layout.tsx` root layout with all providers (Query, Theme, Auth)
  - [ ] 6.6 Create `app/page.tsx` with redirect to /dashboard
  - [ ] 6.7 Add theme CSS variables for light and dark modes in `globals.css`
  - [ ] 6.8 Verify theme persistence works across page refreshes

- [ ] 7.0 Security Hardening
  - [ ] 7.1 Create `next.config.js` with security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - [ ] 7.2 Verify secure cookie settings in session.ts (httpOnly, secure in production, sameSite: lax)
  - [ ] 7.3 Implement generic error messages in login/register (prevent user enumeration)
  - [ ] 7.4 Add server-side error logging with generic client responses
  - [ ] 7.5 Verify API_URL is not exposed to client-side JavaScript
  - [ ] 7.6 Run `npm audit` and fix any high/critical vulnerabilities
  - [ ] 7.7 Verify all security headers are present using browser DevTools
  - [ ] 7.8 Test session expiration behavior (redirect to login when expired)

- [ ] 8.0 Database Documentation
  - [ ] 8.1 Create `docs/database/` directory structure
  - [ ] 8.2 Create `docs/database/README.md` with overview and navigation links
  - [ ] 8.3 Create `docs/database/ERD.md` with Mermaid diagram showing User and Todo entities
  - [ ] 8.4 Create `docs/database/ENTITIES.md` documenting User entity (id, email, password, todos relation)
  - [ ] 8.5 Add Todo entity documentation to `ENTITIES.md` (id, title, description, completed, user relation)
  - [ ] 8.6 Create `docs/database/SCHEMA.md` with PostgreSQL schema details and column types
  - [ ] 8.7 Document unique constraints (UNIQUE_TITLE_USER) and indexes
  - [ ] 8.8 Create `docs/database/MIGRATIONS.md` with migration strategy and TypeORM synchronize notes
  - [ ] 8.9 Document cascade behaviors (User deletion cascades to Todos)
  - [ ] 8.10 Review documentation for completeness and accuracy

- [ ] 9.0 E2E Testing with Playwright
  - [ ] 9.1 Install Playwright: `@playwright/test`
  - [ ] 9.2 Create `playwright.config.ts` with Next.js dev server, multi-browser support, and screenshot on failure
  - [ ] 9.3 Create `e2e/fixtures/auth.fixture.ts` with authenticated/unauthenticated test fixtures
  - [ ] 9.4 Create `e2e/pages/login.page.ts` page object with form interactions
  - [ ] 9.5 Create `e2e/pages/register.page.ts` page object with form interactions
  - [ ] 9.6 Create `e2e/pages/dashboard.page.ts` page object with todo interactions
  - [ ] 9.7 Create `e2e/auth.spec.ts` with login, register, logout E2E tests
  - [ ] 9.8 Create `e2e/todo.spec.ts` with toggle completion, edit, delete E2E tests
  - [ ] 9.9 Create `e2e/theme.spec.ts` with theme toggle E2E tests
  - [ ] 9.10 Create `e2e/navigation.spec.ts` with route protection E2E tests
  - [ ] 9.11 Add Playwright scripts to `project.json`: `e2e`, `e2e:ui`, `e2e:report`
  - [ ] 9.12 Run all E2E tests across Chromium, Firefox, and WebKit browsers
  - [ ] 9.13 Verify test reports and screenshots are generated correctly

- [ ] 10.0 Cleanup & Migration Finalization
  - [ ] 10.1 Delete `apps/ui-components-e2e/` directory (Cypress tests replaced by Playwright)
  - [ ] 10.2 Remove Cypress dependencies from root `package.json`
  - [ ] 10.3 Remove Angular-related dependencies from root `package.json`
  - [ ] 10.4 Delete Angular client libraries from `libs/client/` if no longer needed (keep shared domain)
  - [ ] 10.5 Update root `nx.json` to remove Angular-related configuration if present
  - [ ] 10.6 Run `npm install` to clean up node_modules
  - [ ] 10.7 Run full test suite: `npx nx test client` and `npx nx e2e client`
  - [ ] 10.8 Run linting: `npx nx lint client`
  - [ ] 10.9 Run type checking: `npx nx run client:typecheck` or `tsc --noEmit`
  - [ ] 10.10 Verify production build: `npx nx build client --configuration=production`
  - [ ] 10.11 Manual testing: complete the Testing Strategy checklist from PRD
  - [ ] 10.12 Update project README.md with new Next.js client instructions
  - [ ] 10.13 Create git commit with migration changes

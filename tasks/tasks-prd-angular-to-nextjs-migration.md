# Tasks: Angular to Next.js 15 Migration

## Relevant Files

### New Files to Create

- `apps/client-next/` - Next.js 15 application root
- `apps/client-next/src/app/layout.tsx` - Root layout with providers (QueryClient, Theme)
- `apps/client-next/src/app/page.tsx` - Home page (redirects to dashboard)
- `apps/client-next/src/app/login/page.tsx` - Login page
- `apps/client-next/src/app/register/page.tsx` - Registration page
- `apps/client-next/src/app/dashboard/page.tsx` - Protected dashboard page
- `apps/client-next/src/middleware.ts` - Route protection middleware
- `apps/client-next/src/components/ui/` - Shadcn UI components (button, input, card, dialog, etc.)
- `apps/client-next/src/components/forms/login-form.tsx` - Login form with React Hook Form + Zod
- `apps/client-next/src/components/forms/register-form.tsx` - Register form with password matching
- `apps/client-next/src/components/todo/todo-item.tsx` - Single todo display component
- `apps/client-next/src/components/todo/todo-list.tsx` - Todo list with columns
- `apps/client-next/src/components/todo/add-todo-dialog.tsx` - Dialog for creating todos
- `apps/client-next/src/components/todo/edit-todo-dialog.tsx` - Dialog for editing todos
- `apps/client-next/src/components/layout/header.tsx` - App header with user info, logout
- `apps/client-next/src/components/layout/theme-toggle.tsx` - Dark/light mode toggle
- `apps/client-next/src/components/providers/query-provider.tsx` - React Query provider wrapper
- `apps/client-next/src/components/providers/theme-provider.tsx` - Theme provider wrapper
- `apps/client-next/src/lib/api/client.ts` - Axios instance with interceptors
- `apps/client-next/src/lib/api/auth.ts` - Auth API functions (login)
- `apps/client-next/src/lib/api/users.ts` - User API functions (register)
- `apps/client-next/src/lib/api/todos.ts` - Todo CRUD API functions
- `apps/client-next/src/lib/hooks/use-auth.ts` - Auth mutation hooks
- `apps/client-next/src/lib/hooks/use-todos.ts` - Todo query and mutation hooks
- `apps/client-next/src/lib/stores/auth-store.ts` - Zustand store for auth state
- `apps/client-next/src/lib/stores/theme-store.ts` - Zustand store for theme (optional, next-themes may suffice)
- `apps/client-next/src/lib/schemas/auth.schema.ts` - Zod schemas for login/register
- `apps/client-next/src/lib/schemas/todo.schema.ts` - Zod schemas for todo CRUD
- `apps/client-next/src/lib/utils/constants.ts` - TOKEN_STORAGE_KEY and other constants
- `apps/client-next/src/lib/utils/cn.ts` - Tailwind class merge utility
- `apps/client-next/tailwind.config.ts` - Tailwind configuration
- `apps/client-next/postcss.config.js` - PostCSS configuration
- `apps/client-next/next.config.js` - Next.js configuration with API rewrites
- `apps/client-next/project.json` - Nx project configuration
- `apps/client-next-e2e/` - Playwright E2E test directory
- `apps/client-next-e2e/src/auth.spec.ts` - Auth flow E2E tests
- `apps/client-next-e2e/src/todos.spec.ts` - Todo CRUD E2E tests
- `apps/client-next-e2e/playwright.config.ts` - Playwright configuration

### Existing Files to Modify

- `package.json` - Add Next.js, React, Tailwind, and other dependencies
- `tsconfig.base.json` - Ensure paths work for shared libs in Next.js app
- `nx.json` - May need @nx/next plugin configuration

### Files to Remove (Phase 6)

- `apps/client/` - Angular application
- `apps/client-e2e/` - Cypress E2E tests
- `libs/client/data-access/` - Angular data access library
- `libs/client/feature-login/` - Angular login feature
- `libs/client/feature-register/` - Angular register feature
- `libs/client/feature-dashboard/` - Angular dashboard feature
- `libs/client/ui-components/` - Angular UI components
- `libs/client/ui-style/` - Angular SCSS styles
- `libs/client/util/` - Angular utilities

### Notes

- Use `npx nx serve client-next` to run the Next.js development server
- Use `npx nx build client-next` to build the application
- Use `npx nx e2e client-next-e2e` to run Playwright E2E tests
- Shared types from `@full-stack-todo/shared/domain` will be reused
- Angular code will be removed incrementally after each feature is verified
- Run the NestJS backend with `npx nx serve server` (required for API calls)

---

## Tasks

- [ ] 1.0 Project Setup & Infrastructure
  - [ ] 1.1 Install `@nx/next` plugin: `npm install -D @nx/next@22.3.3`
  - [ ] 1.2 Generate Next.js application: `npx nx g @nx/next:app client-next --directory=apps/client-next --appDir=true`
  - [ ] 1.3 Install core dependencies: `next`, `react`, `react-dom` (should be auto-installed by generator)
  - [ ] 1.4 Install state management: `npm install @tanstack/react-query zustand`
  - [ ] 1.5 Install form handling: `npm install react-hook-form @hookform/resolvers zod`
  - [ ] 1.6 Install utilities: `npm install axios jwt-decode clsx tailwind-merge lucide-react next-themes`
  - [ ] 1.7 Configure Tailwind CSS in `apps/client-next/tailwind.config.ts`
  - [ ] 1.8 Initialize Shadcn UI: `npx shadcn@latest init` (in apps/client-next directory)
  - [ ] 1.9 Add Shadcn components: Button, Input, Label, Card, Dialog, Checkbox, Form, Alert
  - [ ] 1.10 Create `cn()` utility in `src/lib/utils/cn.ts` for Tailwind class merging
  - [ ] 1.11 Create `constants.ts` with `TOKEN_STORAGE_KEY` matching Angular app
  - [ ] 1.12 Configure API proxy in `next.config.js` to forward `/api/*` to backend
  - [ ] 1.13 Verify shared lib imports work: test importing from `@full-stack-todo/shared/domain`
  - [ ] 1.14 Create `QueryProvider` component wrapping `QueryClientProvider`
  - [ ] 1.15 Create `ThemeProvider` component using `next-themes`
  - [ ] 1.16 Update root `layout.tsx` to include both providers
  - [ ] 1.17 Verify dev server runs: `npx nx serve client-next`

- [ ] 2.0 Authentication Module
  - [ ] 2.1 Create Axios client in `src/lib/api/client.ts` with base URL and interceptors
  - [ ] 2.2 Create Zustand auth store in `src/lib/stores/auth-store.ts` with token management
  - [ ] 2.3 Implement `setToken()`, `clearToken()`, `loadToken()`, `isTokenExpired()` in auth store
  - [ ] 2.4 Add JWT interceptor to Axios client to attach Authorization header
  - [ ] 2.5 Create Zod schemas in `src/lib/schemas/auth.schema.ts` for login and register
  - [ ] 2.6 Create auth API functions in `src/lib/api/auth.ts` (loginUser)
  - [ ] 2.7 Create user API functions in `src/lib/api/users.ts` (createUser)
  - [ ] 2.8 Create `useLogin` mutation hook in `src/lib/hooks/use-auth.ts`
  - [ ] 2.9 Create `useRegister` mutation hook in `src/lib/hooks/use-auth.ts`
  - [ ] 2.10 Build `LoginForm` component with React Hook Form + Zod validation
  - [ ] 2.11 Add error message display and loading state to LoginForm
  - [ ] 2.12 Build `RegisterForm` component with password matching validation
  - [ ] 2.13 Add error message display and loading state to RegisterForm
  - [ ] 2.14 Create `/login/page.tsx` using LoginForm component
  - [ ] 2.15 Create `/register/page.tsx` using RegisterForm component
  - [ ] 2.16 Add link from login page to register page and vice versa
  - [ ] 2.17 Create `middleware.ts` for route protection (check token, redirect to /login)
  - [ ] 2.18 Configure middleware matcher for `/dashboard` route
  - [ ] 2.19 Implement logout in Header component (clear token, redirect to /login)
  - [ ] 2.20 Load token from localStorage on app initialization (in layout or auth store)
  - [ ] 2.21 **Verify**: Test complete auth flow (register → login → session persistence → logout)

- [ ] 3.0 Todo Feature Implementation
  - [ ] 3.1 Create Zod schemas in `src/lib/schemas/todo.schema.ts` for create/update
  - [ ] 3.2 Create todo API functions in `src/lib/api/todos.ts` (getAll, create, update, delete)
  - [ ] 3.3 Create `useTodos` query hook for fetching todos
  - [ ] 3.4 Create `useCreateTodo` mutation hook with cache invalidation
  - [ ] 3.5 Create `useUpdateTodo` mutation hook with optimistic updates
  - [ ] 3.6 Create `useDeleteTodo` mutation hook with optimistic updates
  - [ ] 3.7 Build `TodoItem` component with title, description, completion indicator
  - [ ] 3.8 Add toggle completion button to TodoItem
  - [ ] 3.9 Add edit button to TodoItem (disabled for completed todos)
  - [ ] 3.10 Add delete button to TodoItem
  - [ ] 3.11 Build `TodoList` component with two columns (Incomplete/Completed)
  - [ ] 3.12 Build `AddTodoDialog` component using Shadcn Dialog + Form
  - [ ] 3.13 Build `EditTodoDialog` component using Shadcn Dialog + Form
  - [ ] 3.14 Create `Header` component with app title, user greeting, logout button
  - [ ] 3.15 Create `/dashboard/page.tsx` composing Header, TodoList, AddTodoDialog
  - [ ] 3.16 Add empty state message when no todos exist
  - [ ] 3.17 Ensure completed todos cannot be edited (button disabled or hidden)
  - [ ] 3.18 **Verify**: Test complete CRUD flow (create → read → update → toggle → delete)

- [ ] 4.0 UI Polish & Theme
  - [ ] 4.1 Build `ThemeToggle` component using Shadcn DropdownMenu
  - [ ] 4.2 Add ThemeToggle to Header component
  - [ ] 4.3 Configure Tailwind dark mode (class strategy)
  - [ ] 4.4 Style login and register pages with Card container, centered layout
  - [ ] 4.5 Style dashboard with responsive two-column layout
  - [ ] 4.6 Add mobile breakpoint: single column stacked layout
  - [ ] 4.7 Add tablet/desktop breakpoint: side-by-side columns
  - [ ] 4.8 Add hover states and focus rings for accessibility
  - [ ] 4.9 Add loading spinners/skeletons during data fetching
  - [ ] 4.10 Add transition animations for todo state changes
  - [ ] 4.11 **Verify**: Test responsive design on mobile, tablet, desktop viewports

- [ ] 5.0 E2E Testing with Playwright
  - [ ] 5.1 Install Playwright: `npm install -D @playwright/test`
  - [ ] 5.2 Create `apps/client-next-e2e/` directory structure
  - [ ] 5.3 Create `playwright.config.ts` with base URL and project settings
  - [ ] 5.4 Create Nx project.json for client-next-e2e with e2e target
  - [ ] 5.5 Write auth tests: user can register with valid credentials
  - [ ] 5.6 Write auth tests: user cannot register with invalid email
  - [ ] 5.7 Write auth tests: user cannot register with mismatched passwords
  - [ ] 5.8 Write auth tests: user can login with valid credentials
  - [ ] 5.9 Write auth tests: user sees error on invalid credentials
  - [ ] 5.10 Write auth tests: user is redirected to dashboard after login
  - [ ] 5.11 Write auth tests: user session persists after page refresh
  - [ ] 5.12 Write auth tests: user can logout and is redirected to login
  - [ ] 5.13 Write auth tests: unauthenticated user is redirected from /dashboard
  - [ ] 5.14 Write todo tests: user sees empty state when no todos
  - [ ] 5.15 Write todo tests: user can create a new todo
  - [ ] 5.16 Write todo tests: user can toggle todo completion
  - [ ] 5.17 Write todo tests: user can edit a todo
  - [ ] 5.18 Write todo tests: user cannot edit completed todos
  - [ ] 5.19 Write todo tests: user can delete a todo
  - [ ] 5.20 **Verify**: All E2E tests pass with `npx nx e2e client-next-e2e`

- [ ] 6.0 Angular Cleanup & Removal
  - [ ] 6.1 **After 2.21 verified**: Remove `libs/client/feature-login/` directory
  - [ ] 6.2 **After 2.21 verified**: Remove `libs/client/feature-register/` directory
  - [ ] 6.3 **After 3.18 verified**: Remove `libs/client/feature-dashboard/` directory
  - [ ] 6.4 **After 4.11 verified**: Remove `libs/client/ui-components/` directory
  - [ ] 6.5 **After 4.11 verified**: Remove `libs/client/ui-style/` directory
  - [ ] 6.6 **After 5.20 verified**: Remove `libs/client/data-access/` directory
  - [ ] 6.7 **After 5.20 verified**: Remove `libs/client/util/` directory
  - [ ] 6.8 **After 5.20 verified**: Remove `apps/client/` directory
  - [ ] 6.9 **After 5.20 verified**: Remove `apps/client-e2e/` directory (Cypress)
  - [ ] 6.10 Remove Angular dependencies from `package.json` (see list in PRD section 10)
  - [ ] 6.11 Remove `@storybook/angular` and related Angular Storybook configs
  - [ ] 6.12 Remove `cypress` from devDependencies
  - [ ] 6.13 Remove Angular-specific entries from `nx.json` generators and targets
  - [ ] 6.14 Run `npm install` to clean up node_modules
  - [ ] 6.15 Run `npx nx build client-next` to verify build still works
  - [ ] 6.16 Run `npx nx e2e client-next-e2e` to verify all tests still pass
  - [ ] 6.17 Update README.md to reflect new Next.js client
  - [ ] 6.18 **Final Verify**: Full application works end-to-end with no Angular code remaining

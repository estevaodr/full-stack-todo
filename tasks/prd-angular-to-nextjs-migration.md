# PRD: Angular to Next.js 15 Migration

## 1. Introduction/Overview

### Problem Statement
The current frontend is built with Angular 21, which works well but presents challenges for team scalability and ecosystem alignment. The React/Next.js ecosystem offers broader developer availability, a more extensive component library ecosystem (Shadcn UI, Radix), and better alignment with modern full-stack patterns like Server Components.

### Solution
Migrate the Angular client application to Next.js 15 with App Router, adopting:
- **Tailwind CSS** for utility-first styling
- **Shadcn UI** for accessible, customizable components
- **React Query (TanStack Query)** for server state management
- **Zustand** for client state (theme, modals)
- **Zod** for runtime validation
- **Playwright** for E2E testing

### Migration Approach
Incremental removal of Angular code after each feature is verified in the new Next.js application, ensuring zero downtime and feature parity.

---

## 2. Current State Analysis

### Angular Application Structure

| Layer | Location | Purpose |
|-------|----------|---------|
| App Shell | `apps/client/src/app/app.ts` | Root component with auth state, header, logout |
| Routes | `apps/client/src/app/app.routes.ts` | `/login`, `/register`, `/dashboard` |
| Auth Service | `libs/client/data-access/src/lib/auth.ts` | JWT handling, localStorage, BehaviorSubject |
| API Service | `libs/client/data-access/src/lib/api.ts` | Todo CRUD operations |
| Auth Guard | `libs/client/data-access/src/lib/guards/auth-guard.ts` | Route protection |
| User Service | `libs/client/data-access/src/lib/user.ts` | User registration |
| Login Feature | `libs/client/feature-login/` | Login form with validation |
| Register Feature | `libs/client/feature-register/` | Registration with password matching |
| Dashboard Feature | `libs/client/feature-dashboard/` | Todo list with edit dialog |
| UI Components | `libs/client/ui-components/` | `ToDoComponent`, `ThemeToggle`, `EditTodoDialog` |
| Styles | `libs/client/ui-style/` | SCSS with Nord theme, custom properties |

### Shared Libraries (To Be Preserved)

```
libs/shared/domain/src/lib/models/
├── todo.interface.ts      # ITodo, ICreateTodo, IUpdateTodo
├── user.interface.ts      # IUser, ICreateUser, IPublicUserData
├── jwt-payload.interface.ts   # IAccessTokenPayload
├── login-payload.interface.ts # ILoginPayload
└── token-response.interface.ts # ITokenResponse
```

These shared types will continue to be imported by the Next.js app to maintain type consistency with the NestJS backend.

### API Endpoints (No Changes Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/login` | User login, returns JWT |
| POST | `/api/v1/users` | User registration |
| GET | `/api/v1/todos` | Get all todos for authenticated user |
| POST | `/api/v1/todos` | Create new todo |
| PATCH | `/api/v1/todos/:id` | Partial update todo |
| PUT | `/api/v1/todos/:id` | Full update/upsert todo |
| DELETE | `/api/v1/todos/:id` | Delete todo |

### Current Testing Setup
- **E2E**: Cypress (`apps/client-e2e/`) - Will be replaced by Playwright
- **Unit**: Jest with `jest-preset-angular`
- **Stories**: Storybook with `@storybook/angular`

---

## 3. Goals & Success Metrics

### Goals

1. **Feature Parity**: All Angular functionality reproduced in Next.js
2. **Modern Stack**: Next.js 15 App Router with React 19 features
3. **Fresh Design**: New UI using Tailwind CSS and Shadcn UI
4. **Type Safety**: Zod schemas matching backend DTOs
5. **Testing Coverage**: Playwright E2E tests covering all user flows
6. **Clean Removal**: Angular code removed incrementally after verification

### Success Metrics

| Metric | Target |
|--------|--------|
| Feature parity | 100% of Angular features working in Next.js |
| E2E test coverage | All critical paths (auth, CRUD) covered |
| Build success | `nx build client-next` passes |
| Lighthouse Performance | Score ≥ 90 |
| Bundle size | < 200KB initial JS |
| Angular removal | All Angular client code removed after migration |

---

## 4. User Stories

### Authentication
- **US-1**: As a user, I want to register with my email and password so I can create an account.
- **US-2**: As a user, I want to log in with my credentials so I can access my todos.
- **US-3**: As a user, I want to stay logged in after refreshing the page so I don't have to re-authenticate.
- **US-4**: As a user, I want to log out so I can secure my session.

### Todo Management
- **US-5**: As a user, I want to view my todos separated by completion status (incomplete vs completed).
- **US-6**: As a user, I want to create a new todo with a title and description.
- **US-7**: As a user, I want to toggle a todo's completion status.
- **US-8**: As a user, I want to edit a todo's title and description.
- **US-9**: As a user, I want to delete a todo I no longer need.

### UI/UX
- **US-10**: As a user, I want to toggle between light and dark themes.
- **US-11**: As a user, I want the app to be responsive on mobile devices.

---

## 5. Functional Requirements

### 5.1 Authentication

| ID | Requirement | Reference |
|----|-------------|-----------|
| FR-1.1 | Login form with email and password fields | `libs/client/feature-login/` |
| FR-1.2 | Email validation (required, valid format) | Uses `Validators.email` in Angular |
| FR-1.3 | Password validation (required) | Uses `Validators.required` |
| FR-1.4 | Display server error messages on failed login | `errorMessage$` in login component |
| FR-1.5 | Show loading state during form submission | `isSubmitting$` in login component |
| FR-1.6 | Redirect to `/dashboard` on successful login | `router.navigate(['/dashboard'])` |
| FR-1.7 | Store JWT in localStorage | `TOKEN_STORAGE_KEY` constant |
| FR-1.8 | Load JWT from localStorage on app init | `auth.loadToken()` in `app.ts` |

| ID | Requirement | Reference |
|----|-------------|-----------|
| FR-2.1 | Registration form with email, password, confirm password | `libs/client/feature-register/` |
| FR-2.2 | Password matching validation | `matchingPasswordsValidator` |
| FR-2.3 | Redirect to `/login` on successful registration | `router.navigate(['/login'])` |

| ID | Requirement | Reference |
|----|-------------|-----------|
| FR-3.1 | Protect `/dashboard` route from unauthenticated users | `authGuard` |
| FR-3.2 | Redirect to `/login` if token is expired or missing | `isTokenExpired()` check |
| FR-3.3 | Logout clears token and redirects to `/login` | `auth.logoutUser()` |

### 5.2 Todo Management

| ID | Requirement | Reference |
|----|-------------|-----------|
| FR-4.1 | Fetch all todos on dashboard load | `apiService.getAllToDoItems()` |
| FR-4.2 | Display todos in two columns: Incomplete and Completed | `FeatureDashboard.html` |
| FR-4.3 | Each todo shows title, description, completion indicator | `ToDoComponent` |
| FR-4.4 | Toggle completion status via checkbox/indicator | `toggleComplete()` |
| FR-4.5 | Edit todo via modal dialog | `EditTodoDialogComponent` |
| FR-4.6 | Delete todo with immediate removal from list | `deleteTodo()` |
| FR-4.7 | Prevent editing completed todos | `if (todo.completed) return` |
| FR-4.8 | Refresh list after any mutation | `refreshItems()` |

### 5.3 UI/UX

| ID | Requirement | Reference |
|----|-------------|-----------|
| FR-5.1 | App header with title, user greeting, logout button | `app.html` |
| FR-5.2 | Theme toggle (light/dark) | `ThemeToggleComponent` |
| FR-5.3 | Responsive layout for mobile/tablet/desktop | Current SCSS media queries |
| FR-5.4 | Form validation error messages displayed inline | Current form templates |

---

## 6. Non-Goals (Out of Scope)

- **Backend changes**: The NestJS API remains unchanged
- **New features**: No new functionality beyond current Angular app
- **Mobile app**: Web only
- **SSR for authenticated routes**: Dashboard will be client-rendered (protected route)
- **Database migrations**: No schema changes
- **User profile editing**: Not in current app

---

## 7. Technical Architecture

### 7.1 Next.js 15 App Router Structure

```
apps/client-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Redirect to /dashboard
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Register page
│   │   └── dashboard/
│   │       └── page.tsx        # Dashboard (protected)
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── todo/
│   │   │   ├── todo-item.tsx
│   │   │   ├── todo-list.tsx
│   │   │   ├── add-todo-dialog.tsx
│   │   │   └── edit-todo-dialog.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── providers/
│   │       ├── query-provider.tsx
│   │       └── theme-provider.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts       # Axios instance
│   │   │   ├── auth.ts         # Auth API calls
│   │   │   ├── todos.ts        # Todo API calls
│   │   │   └── users.ts        # User API calls
│   │   ├── hooks/
│   │   │   ├── use-auth.ts     # Auth React Query hooks
│   │   │   └── use-todos.ts    # Todo React Query hooks
│   │   ├── stores/
│   │   │   ├── auth-store.ts   # Zustand auth state
│   │   │   └── theme-store.ts  # Zustand theme state
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts  # Zod schemas for login/register
│   │   │   └── todo.schema.ts  # Zod schemas for todo CRUD
│   │   └── utils/
│   │       └── constants.ts    # TOKEN_STORAGE_KEY, etc.
│   └── middleware.ts           # Route protection
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── project.json                # Nx project config
└── tsconfig.json
```

### 7.2 State Management

| State Type | Tool | Purpose |
|------------|------|---------|
| Server State | React Query | Todos fetching, mutations, caching, optimistic updates |
| Auth State | Zustand | JWT token, user data, login/logout actions |
| Theme State | Zustand + next-themes | Dark/light mode persistence |
| Form State | React Hook Form | Form handling with Zod validation |

### 7.3 Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.6.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "next-themes": "^0.4.0",
    "jwt-decode": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@nx/next": "22.3.3",
    "@playwright/test": "^1.48.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### 7.4 Shared Library Integration

The Next.js app will import types from `@full-stack-todo/shared/domain`:

```typescript
import { ITodo, ICreateTodo, IUpdateTodo } from '@full-stack-todo/shared/domain';
import { ILoginPayload, IAccessTokenPayload } from '@full-stack-todo/shared/domain';
```

This requires updating `tsconfig.base.json` paths to ensure the Next.js app can resolve these imports.

---

## 8. UI/UX Requirements

### 8.1 Design System

| Element | Specification |
|---------|---------------|
| Color Scheme | Shadcn UI default (neutral grays) with custom accent |
| Dark Mode | `next-themes` with system preference detection |
| Typography | Tailwind defaults (Inter or system fonts) |
| Spacing | Tailwind spacing scale |
| Border Radius | Shadcn UI defaults (rounded-md, rounded-lg) |
| Shadows | Tailwind shadow utilities |

### 8.2 Components (Shadcn UI)

| Component | Usage |
|-----------|-------|
| `Button` | Submit buttons, action buttons |
| `Input` | Form text inputs |
| `Label` | Form labels |
| `Card` | Todo items, form containers |
| `Dialog` | Edit todo modal, add todo modal |
| `Checkbox` | Todo completion toggle |
| `Form` | Form wrapper with validation |
| `Alert` | Error messages |
| `DropdownMenu` | Theme toggle, user menu |

### 8.3 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Single column, stacked todo lists |
| Tablet (640px - 1024px) | Two columns side by side |
| Desktop (> 1024px) | Two columns with max-width container |

---

## 9. Testing Strategy

### 9.1 Playwright E2E Tests

Location: `apps/client-next-e2e/`

| Test Suite | Coverage |
|------------|----------|
| `auth.spec.ts` | Register, login, logout, session persistence |
| `todos.spec.ts` | Create, read, update, delete, toggle completion |
| `navigation.spec.ts` | Route protection, redirects |
| `theme.spec.ts` | Dark/light mode toggle, persistence |

### 9.2 Test Scenarios

**Authentication Flow:**
1. User can register with valid credentials
2. User cannot register with invalid email
3. User cannot register with mismatched passwords
4. User can login with valid credentials
5. User sees error on invalid credentials
6. User is redirected to dashboard after login
7. User session persists after page refresh
8. User can logout and is redirected to login
9. Unauthenticated user is redirected from /dashboard to /login

**Todo Management:**
1. User sees empty state when no todos exist
2. User can create a new todo
3. New todo appears in incomplete column
4. User can toggle todo completion
5. Completed todo moves to completed column
6. User can edit todo title and description
7. User cannot edit completed todos
8. User can delete a todo
9. Deleted todo is removed from list

### 9.3 Cypress Removal

After Playwright tests are verified, remove:
- `apps/client-e2e/` directory
- `cypress` from `package.json` devDependencies
- Any Cypress-related configs

---

## 10. Migration & Cleanup Plan

### Phase 1: Setup (No Angular Changes)
1. Install `@nx/next` plugin
2. Generate `client-next` application
3. Configure Tailwind CSS, Shadcn UI
4. Set up providers (React Query, Theme)
5. Configure shared library imports

### Phase 2: Core Features
1. Implement auth store and API client
2. Build login page and form
3. Build register page and form
4. Implement route protection middleware
5. **Verify**: Login/register flows work

### Phase 3: Todo Features
1. Implement todo API hooks with React Query
2. Build todo list and item components
3. Build add/edit dialogs
4. Implement dashboard page
5. **Verify**: All CRUD operations work

### Phase 4: UI Polish
1. Implement theme toggle
2. Add responsive styles
3. Polish animations and transitions
4. **Verify**: UI matches requirements

### Phase 5: Testing
1. Set up Playwright
2. Write E2E tests for auth flow
3. Write E2E tests for todo CRUD
4. **Verify**: All tests pass

### Phase 6: Angular Removal (Incremental)

After each verification step, remove corresponding Angular code:

| After Verifying | Remove |
|-----------------|--------|
| Login works | `libs/client/feature-login/` |
| Register works | `libs/client/feature-register/` |
| Dashboard works | `libs/client/feature-dashboard/` |
| All UI works | `libs/client/ui-components/`, `libs/client/ui-style/` |
| All features work | `libs/client/data-access/`, `libs/client/util/` |
| E2E tests pass | `apps/client-e2e/` (Cypress) |
| Final verification | `apps/client/`, Angular deps from `package.json` |

### Angular Dependencies to Remove (Final Phase)

```
@angular/common
@angular/compiler
@angular/core
@angular/forms
@angular/platform-browser
@angular/router
@angular-devkit/build-angular
@angular-devkit/core
@angular-devkit/schematics
@angular/build
@angular/cli
@angular/compiler-cli
@angular/language-service
@angular/platform-browser-dynamic
@schematics/angular
@storybook/angular
jest-preset-angular
angular-eslint
zone.js
@nx/angular
```

---

## 11. Implementation Notes

### 11.1 Nx Workspace Integration

The new application will be generated using:
```bash
npx nx add @nx/next
npx nx g @nx/next:app client-next --directory=apps/client-next
```

### 11.2 Proxy Configuration

The Next.js app needs to proxy API requests to the NestJS backend. Configure in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};
```

### 11.3 Environment Variables

Create `.env.local` for Next.js:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 11.4 Zod Schemas (Matching Backend DTOs)

```typescript
// schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// schemas/todo.schema.ts
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});
```

### 11.5 File Mapping (Angular → Next.js)

| Angular File | Next.js Equivalent |
|--------------|-------------------|
| `apps/client/src/app/app.ts` | `apps/client-next/src/app/layout.tsx` |
| `apps/client/src/app/app.routes.ts` | File-based routing in `app/` |
| `libs/client/data-access/src/lib/auth.ts` | `lib/stores/auth-store.ts` + `lib/api/auth.ts` |
| `libs/client/data-access/src/lib/api.ts` | `lib/api/todos.ts` + `lib/hooks/use-todos.ts` |
| `libs/client/data-access/src/lib/guards/auth-guard.ts` | `middleware.ts` |
| `libs/client/feature-login/` | `app/login/page.tsx` + `components/forms/login-form.tsx` |
| `libs/client/feature-register/` | `app/register/page.tsx` + `components/forms/register-form.tsx` |
| `libs/client/feature-dashboard/` | `app/dashboard/page.tsx` |
| `libs/client/ui-components/src/lib/to-do.ts` | `components/todo/todo-item.tsx` |
| `libs/client/ui-components/src/lib/theme-toggle/` | `components/layout/theme-toggle.tsx` |
| `libs/client/ui-components/src/lib/edit-todo-dialog/` | `components/todo/edit-todo-dialog.tsx` |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Shared lib import issues | Test imports early in Phase 1 |
| JWT handling differences | Mirror Angular logic exactly in Zustand store |
| API proxy configuration | Test all endpoints before feature work |
| Tailwind conflicts with existing styles | Next.js app is isolated in separate directory |
| E2E test flakiness | Use Playwright best practices, proper waits |

---

*This PRD provides a complete specification for a junior developer to implement the Angular to Next.js migration with feature parity and incremental Angular removal.*

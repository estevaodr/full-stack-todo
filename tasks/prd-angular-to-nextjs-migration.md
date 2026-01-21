# PRD: Angular to Next.js 15 Migration

## 1. Introduction/Overview

This document outlines the migration of the existing Angular 21 client application to Next.js 15 with Tailwind CSS. The migration aims to modernize the frontend stack while maintaining feature parity with the current application, leveraging Next.js's App Router, React Server Components, and modern authentication patterns.

**Current Stack:** Angular 21, SCSS, RxJS, Nx Monorepo
**Target Stack:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, React Query, React Hook Form

The migration will replace the Angular client in `apps/client/` with a Next.js application while keeping the NestJS backend unchanged.

---

## 2. Goals

1. **Migrate to Next.js 15** with App Router for improved performance, SEO, and developer experience
2. **Implement Tailwind CSS** with shadcn/ui for a modern, accessible component library
3. **Improve security** by moving from localStorage JWT storage to HTTP-only cookies with middleware protection
4. **Maintain feature parity** with the current Angular application (MVP scope)
5. **Preserve monorepo structure** by replacing the Angular client in place within the Nx workspace
6. **Establish patterns** for future feature development on the new stack

---

## 3. User Stories

### Authentication
- **US-1:** As a user, I want to register for an account with my email and password so that I can access the application
- **US-2:** As a user, I want to log in with my email and password so that I can access my todos
- **US-3:** As a user, I want to remain logged in across page refreshes until my session expires
- **US-4:** As a user, I want to be redirected to the login page when my session expires
- **US-5:** As a user, I want to log out so that I can end my session securely

### Todo Management
- **US-6:** As a user, I want to see all my todos organized by completion status (incomplete/complete columns)
- **US-7:** As a user, I want to toggle the completion status of a todo by clicking on it
- **US-8:** As a user, I want to edit a todo's title and description (only for incomplete todos)
- **US-9:** As a user, I want to delete a todo

### Theme
- **US-10:** As a user, I want to toggle between light and dark themes

---

## 4. Current State Analysis

### Existing Angular Architecture

**Routes (from `apps/client/src/app/app.routes.ts`):**
```typescript
{ path: 'login', children: featureLoginRoutes },
{ path: 'register', children: featureRegisterRoutes },
{ path: 'dashboard', children: featureDashboardRoutes },
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
```

**Feature Libraries (from `libs/client/`):**
| Library | Purpose | Key Files |
|---------|---------|-----------|
| `feature-dashboard` | Main todo list page | `FeatureDashboard.ts`, `FeatureDashboard.html` |
| `feature-login` | Login form | `client-feature-login.component.ts` |
| `feature-register` | Registration form | `feature-register.ts` |
| `ui-components` | Reusable components | `to-do.ts`, `edit-todo-dialog.ts`, `theme-toggle.ts` |
| `data-access` | API services | `api.ts`, `auth.ts`, `user.ts`, `auth-guard.ts` |
| `ui-style` | SCSS design system | `_custom-properties.scss`, `_button.scss` |

**Shared Domain Models (from `libs/shared/domain/`):**
- `ITodo`, `ICreateTodo`, `IUpdateTodo`, `IUpsertTodo`
- `IUser`, `ICreateUser`, `IPublicUserData`
- `ILoginPayload`, `ITokenResponse`, `IAccessTokenPayload`

**Backend API Endpoints (NestJS - unchanged):**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | Public | User login, returns JWT |
| POST | `/api/v1/users` | Public | User registration |
| GET | `/api/v1/users/:id` | Protected | Get user by ID |
| GET | `/api/v1/todos` | Protected | Get all user's todos |
| POST | `/api/v1/todos` | Protected | Create todo |
| PATCH | `/api/v1/todos/:id` | Protected | Update todo |
| DELETE | `/api/v1/todos/:id` | Protected | Delete todo |

**Current Styling:**
- SCSS with BEM methodology
- Nord color palette via CSS custom properties
- Dark/light theme support via `[data-theme]` attribute

---

## 5. Functional Requirements

### FR-1: Project Setup
- **FR-1.1:** Initialize Next.js 15 application with App Router in `apps/client/`
- **FR-1.2:** Configure Tailwind CSS with custom theme matching Nord color palette
- **FR-1.3:** Install and configure shadcn/ui components
- **FR-1.4:** Configure TypeScript with strict mode
- **FR-1.5:** Set up ESLint and Prettier matching existing project configuration
- **FR-1.6:** Configure environment variables for API URL (server-only `API_URL`, not exposed to client)

### FR-2: Authentication
- **FR-2.1:** Create login page at `/login` with email and password form
- **FR-2.2:** Create registration page at `/register` with email, password, and confirm password
- **FR-2.3:** Implement Next.js API routes for session management:
  - `POST /api/auth/login` - Proxy to backend, set HTTP-only cookie
  - `POST /api/auth/logout` - Clear session cookie
  - `GET /api/auth/session` - Validate and return session data
- **FR-2.4:** Implement middleware for route protection (`middleware.ts`)
- **FR-2.5:** Store JWT in HTTP-only, secure, SameSite cookie
- **FR-2.6:** Implement AuthContext for client-side auth state

### FR-3: Todo Dashboard
- **FR-3.1:** Create dashboard page at `/dashboard` (protected route)
- **FR-3.2:** Display todos in two-column layout: "Incomplete" and "Completed"
- **FR-3.3:** Implement TodoCard component with:
  - Title display
  - Description display
  - Completion toggle button
  - Edit button (disabled for completed todos)
  - Delete button
- **FR-3.4:** Implement EditTodoDialog modal for editing title and description
- **FR-3.5:** Use React Query for data fetching and cache management

### FR-4: Theme Toggle
- **FR-4.1:** Implement ThemeToggle component using `next-themes`
- **FR-4.2:** Persist theme preference in localStorage
- **FR-4.3:** Support system preference detection
- **FR-4.4:** Implement dark/light themes in Tailwind config

### FR-5: Form Handling
- **FR-5.1:** Use React Hook Form for all forms
- **FR-5.2:** Use Zod for schema validation
- **FR-5.3:** Display validation errors using shadcn/ui Form components
- **FR-5.4:** Show loading states during form submission

### FR-6: API Integration
- **FR-6.1:** Create API client using fetch with base URL from server-only environment variable
- **FR-6.2:** Implement automatic cookie inclusion for authenticated requests
- **FR-6.3:** Create React Query hooks for:
  - `useTodos()` - Fetch all todos
  - `useCreateTodo()` - Create mutation
  - `useUpdateTodo()` - Update mutation
  - `useDeleteTodo()` - Delete mutation
- **FR-6.4:** Implement optimistic updates where appropriate

### FR-7: Security Hardening
- **FR-7.1:** Configure security headers in `next.config.js`:
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
- **FR-7.2:** Implement secure cookie settings:
  - `httpOnly: true` - Prevent JavaScript access
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 604800` - 7 day expiration
- **FR-7.3:** Validate `SESSION_SECRET` is at least 32 characters on application startup
- **FR-7.4:** Implement secure error handling:
  - Return generic error messages to clients (e.g., "Invalid credentials")
  - Log detailed errors server-side only
  - Never expose stack traces in production
  - Prevent user enumeration (same error for invalid email vs wrong password)
- **FR-7.5:** Implement session expiration with configurable timeout (default: 7 days)
- **FR-7.6:** Use server-only environment variable for `API_URL` (not `NEXT_PUBLIC_`)

### FR-8: Database Documentation
- **FR-8.1:** Create comprehensive database schema documentation in `docs/database/`:
  - Entity Relationship Diagram (ERD) showing all tables and relationships
  - Document all entities: `User`, `Todo`, and any related entities
  - Include field descriptions, data types, and constraints
- **FR-8.2:** Document entity definitions:
  - `User` entity: fields, validations, indexes, and relationships
  - `Todo` entity: fields, validations, indexes, and relationships to User
- **FR-8.3:** Document database design decisions:
  - Primary key strategy (UUID vs auto-increment)
  - Timestamp handling (created_at, updated_at)
  - Soft delete vs hard delete approach (if applicable)
  - Index strategy for query optimization
- **FR-8.4:** Create data model reference:
  - Map TypeORM entities to PostgreSQL schema
  - Document migration strategy and versioning
  - Include sample queries for common operations
- **FR-8.5:** Document data relationships:
  - User-to-Todo relationship (one-to-many)
  - Cascade behaviors (on delete, on update)
  - Foreign key constraints

### FR-9: Test-Driven Development (TDD)
- **FR-9.1:** Follow TDD methodology for all new implementations:
  - Write failing tests first (Red phase)
  - Implement minimal code to pass tests (Green phase)
  - Refactor while keeping tests passing (Refactor phase)
- **FR-9.2:** Unit tests for core logic:
  - `lib/session.ts` - Session encryption/decryption tests
  - `lib/validations.ts` - Zod schema validation tests
  - `lib/api-client.ts` - API client function tests
  - `hooks/use-todos.ts` - React Query hook tests
  - `hooks/use-auth.ts` - Authentication hook tests
- **FR-9.3:** Component tests:
  - `components/todo-card.tsx` - Todo card rendering and interactions
  - `components/edit-todo-dialog.tsx` - Dialog behavior and form submission
  - `components/login-form.tsx` - Form validation and submission
  - `components/register-form.tsx` - Registration flow and validation
  - `components/theme-toggle.tsx` - Theme switching behavior
- **FR-9.4:** API route tests:
  - `api/auth/login/route.ts` - Login endpoint tests (success, failure, validation)
  - `api/auth/logout/route.ts` - Logout endpoint tests
  - `api/auth/session/route.ts` - Session validation tests
- **FR-9.5:** Integration tests:
  - Authentication flow (register → login → access protected route → logout)
  - Todo CRUD operations (create, read, update, delete)
  - Error handling and edge cases
- **FR-9.6:** Test configuration:
  - Configure Vitest or Jest for Next.js 15
  - Set up React Testing Library for component tests
  - Configure MSW (Mock Service Worker) for API mocking
  - Set up test coverage reporting (minimum 80% coverage target)

### FR-10: E2E Testing with Playwright (Cypress Migration)
- **FR-10.1:** Replace Cypress with Playwright for E2E testing:
  - Remove Cypress configuration and dependencies
  - Set up Playwright with Next.js integration
  - Configure multiple browser support (Chromium, Firefox, WebKit)
- **FR-10.2:** Migrate existing E2E test scenarios:
  - Authentication flow tests (login, register, logout)
  - Todo CRUD operation tests
  - Theme toggle functionality tests
  - Protected route access tests
- **FR-10.3:** Playwright configuration:
  - Configure `playwright.config.ts` with Next.js dev server
  - Set up test fixtures for authenticated/unauthenticated states
  - Configure screenshot and video capture on failure
  - Set up parallel test execution
- **FR-10.4:** E2E test structure:
  - `e2e/auth.spec.ts` - Authentication flow tests
  - `e2e/todo.spec.ts` - Todo management tests
  - `e2e/theme.spec.ts` - Theme switching tests
  - `e2e/navigation.spec.ts` - Route protection and navigation tests
- **FR-10.5:** Page Object Model (POM):
  - Create page objects for reusable test interactions
  - `e2e/pages/login.page.ts` - Login page interactions
  - `e2e/pages/register.page.ts` - Register page interactions
  - `e2e/pages/dashboard.page.ts` - Dashboard page interactions
- **FR-10.6:** CI/CD integration:
  - Configure Playwright to run in CI pipeline
  - Set up test sharding for faster execution
  - Configure artifact storage for test reports

---

## 6. Non-Goals (Out of Scope)

The following are explicitly **NOT** part of this MVP migration:

1. **Create Todo Form** - Users cannot create new todos (only view, edit, delete existing)
2. **User Profile/Settings** - No profile page or user settings
3. **Password Reset** - No forgot password functionality
4. **Email Verification** - No email verification flow
5. **Storybook Migration** - Component documentation will be added later
6. **Angular Unit Test Migration** - Existing Angular Jest tests will not be migrated (new TDD tests for Next.js are in scope)
8. **Animation/Transitions** - Micro-interactions will be added later
9. **Responsive Design Enhancements** - Basic mobile support only
10. **SEO Optimization** - Metadata and SEO will be enhanced later
11. **Performance Optimization** - Core Web Vitals optimization deferred
12. **Internationalization (i18n)** - No multi-language support

---

## 7. Design Considerations

### UI Components (shadcn/ui)
The following shadcn/ui components will be used:

| Component | Usage |
|-----------|-------|
| `Button` | Primary, secondary, danger, icon-only variants |
| `Input` | Text and email inputs |
| `Form` | Form wrapper with validation |
| `Card` | Todo card container |
| `Dialog` | Edit todo modal |
| `Label` | Form field labels |
| `Separator` | Visual dividers |

### Color Palette (Tailwind Theme)
Migrate Nord colors to Tailwind CSS custom properties:

```javascript
// tailwind.config.js colors (based on Nord palette)
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))', // Nord10 - #5E81AC
    foreground: 'hsl(var(--primary-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))', // Nord11 - #BF616A
    foreground: 'hsl(var(--destructive-foreground))',
  },
  // ... etc
}
```

### Layout
- Two-column grid on desktop (incomplete | complete)
- Single column stack on mobile
- Header with title and theme toggle
- Max-width container (1400px)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Focus indicators
- ARIA labels on interactive elements
- Semantic HTML structure

---

## 8. Technical Considerations

### Directory Structure

```
apps/client/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── route.ts
│   │   │       ├── logout/
│   │   │       │   └── route.ts
│   │   │       └── session/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── todo-card.tsx
│   │   ├── todo-list.tsx
│   │   ├── edit-todo-dialog.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── session.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-todos.ts
│   │   └── use-auth.ts
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── auth-provider.tsx
│   └── types/
│       └── index.ts      # Re-export from shared/domain
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── project.json
└── package.json
```

### Authentication Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API     │────▶│  NestJS Backend │
│             │     │  Route Handler   │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
      │                      │                        │
      │  1. POST /api/auth/login                      │
      │  (email, password)   │                        │
      │─────────────────────▶│                        │
      │                      │  2. POST /api/v1/auth/login
      │                      │─────────────────────────────▶│
      │                      │                        │
      │                      │  3. Return JWT token   │
      │                      │◀─────────────────────────────│
      │                      │                        │
      │  4. Set HTTP-only    │                        │
      │     cookie with JWT  │                        │
      │◀─────────────────────│                        │
      │                      │                        │
      │  5. Redirect to      │                        │
      │     /dashboard       │                        │
      │─────────────────────▶│                        │
```

### Middleware Pattern (from Context7)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/register', '/']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && session?.userId && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
```

### React Query Setup (from Context7)

```typescript
// providers/query-provider.tsx
'use client'

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### Form Validation with shadcn/ui (from Context7)

```typescript
// lib/validations.ts - Centralized validation schemas
import { z } from 'zod'

// Login schema - validates existing user credentials
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
})

// Registration schema - enforces password requirements for new accounts
export const registerSchema = z.object({
  email: z.string()
    .email('Please enter a valid email')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
```

```typescript
// Example login form structure
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormData } from '@/lib/validations'

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormData) {
    // Call login API
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password field... */}
        <Button type="submit">Login</Button>
      </form>
    </Form>
  )
}
```

### Dependencies

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.60.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "next-themes": "^0.4.0",
    "jose": "^5.9.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "msw": "^2.6.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.49.0"
  }
}
```

### Environment Variables

```env
# .env.local

# Server-only variables (NOT exposed to browser)
API_URL=http://localhost:3000

# Session encryption secret - MUST be at least 32 characters
# Generate with: openssl rand -base64 32
SESSION_SECRET=your-32-character-secret-key-here
```

**Important Security Notes:**
- `API_URL` is server-only (no `NEXT_PUBLIC_` prefix) - backend URL is never exposed to client
- `SESSION_SECRET` must be at least 32 characters for secure encryption
- Never commit `.env.local` to version control
- Use different secrets for each environment (development, staging, production)

### Session Encryption Implementation

```typescript
// lib/session.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Session payload interface
export interface SessionPayload {
  userId: string
  email: string
  expiresAt: Date
}

// Validate secret on module load
const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters')
}

const secretKey = new TextEncoder().encode(SESSION_SECRET)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    // Token invalid or expired - return null, don't expose error details
    return null
  }
}

export async function createSession(userId: string, email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const session = await encrypt({ userId, email, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  return decrypt(cookie)
}
```

### Security Headers Configuration

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
```

### Shared Types Integration

The existing shared domain types from `libs/shared/domain/` will be imported:

```typescript
// types/index.ts
export type {
  ITodo,
  ICreateTodo,
  IUpdateTodo,
  IUser,
  ICreateUser,
  ILoginPayload,
  ITokenResponse,
  IAccessTokenPayload,
} from '@full-stack-todo/shared/domain'
```

Update `tsconfig.json` to include path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@full-stack-todo/shared/domain": ["../../libs/shared/domain/src/index.ts"]
    }
  }
}
```

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Parity | 100% MVP features working | Manual testing checklist |
| Build Success | Zero build errors | CI pipeline |
| Type Safety | Zero TypeScript errors | `tsc --noEmit` |
| Linting | Zero ESLint errors | `eslint --max-warnings 0` |
| Authentication | Secure cookie-based auth | Security review checklist |
| Responsiveness | Works on mobile/tablet/desktop | Manual testing |
| Security Headers | All headers configured | Browser DevTools verification |
| Dependency Security | No high/critical vulnerabilities | `npm audit` |
| Database Documentation | All entities documented with ERD | Documentation review checklist |
| Test Coverage | Minimum 80% code coverage | `vitest --coverage` |
| TDD Compliance | Tests written before implementation | Code review verification |
| E2E Tests | All critical user flows covered | `npx playwright test` |
| Cross-Browser | Tests pass on Chromium, Firefox, WebKit | Playwright multi-browser run |

---

## 10. Implementation Notes

### Key Files to Create/Modify

#### New Files (Next.js App)
| File | Purpose |
|------|---------|
| `apps/client/next.config.js` | Next.js configuration |
| `apps/client/tailwind.config.js` | Tailwind CSS configuration |
| `apps/client/middleware.ts` | Route protection |
| `apps/client/src/app/layout.tsx` | Root layout with providers |
| `apps/client/src/app/(auth)/login/page.tsx` | Login page |
| `apps/client/src/app/(auth)/register/page.tsx` | Register page |
| `apps/client/src/app/(protected)/dashboard/page.tsx` | Dashboard page |
| `apps/client/src/app/api/auth/login/route.ts` | Login API route |
| `apps/client/src/app/api/auth/logout/route.ts` | Logout API route |
| `apps/client/src/lib/session.ts` | Session encryption/decryption with jose |
| `apps/client/src/lib/validations.ts` | Zod schemas for form validation |
| `apps/client/src/lib/api-client.ts` | API client wrapper |
| `apps/client/src/components/todo-card.tsx` | Todo item component |
| `apps/client/src/components/edit-todo-dialog.tsx` | Edit modal |
| `apps/client/src/hooks/use-todos.ts` | React Query hooks |

#### New Files (Database Documentation)
| File | Purpose |
|------|---------|
| `docs/database/README.md` | Database documentation overview and index |
| `docs/database/SCHEMA.md` | Complete database schema documentation |
| `docs/database/ENTITIES.md` | TypeORM entity definitions and mappings |
| `docs/database/ERD.md` | Entity Relationship Diagram (Mermaid format) |
| `docs/database/MIGRATIONS.md` | Migration strategy and versioning guide |

#### New Files (Tests - TDD)
| File | Purpose |
|------|---------|
| `apps/client/vitest.config.ts` | Vitest configuration for Next.js |
| `apps/client/src/lib/__tests__/session.test.ts` | Session encryption/decryption tests |
| `apps/client/src/lib/__tests__/validations.test.ts` | Zod schema validation tests |
| `apps/client/src/lib/__tests__/api-client.test.ts` | API client tests |
| `apps/client/src/hooks/__tests__/use-todos.test.ts` | Todo hooks tests |
| `apps/client/src/hooks/__tests__/use-auth.test.ts` | Auth hooks tests |
| `apps/client/src/components/__tests__/todo-card.test.tsx` | Todo card component tests |
| `apps/client/src/components/__tests__/edit-todo-dialog.test.tsx` | Edit dialog tests |
| `apps/client/src/components/__tests__/login-form.test.tsx` | Login form tests |
| `apps/client/src/components/__tests__/register-form.test.tsx` | Register form tests |
| `apps/client/src/app/api/auth/__tests__/login.test.ts` | Login API route tests |
| `apps/client/src/app/api/auth/__tests__/logout.test.ts` | Logout API route tests |
| `apps/client/src/__tests__/integration/auth-flow.test.ts` | Auth flow integration tests |
| `apps/client/src/__tests__/integration/todo-crud.test.ts` | Todo CRUD integration tests |
| `apps/client/src/mocks/handlers.ts` | MSW request handlers |
| `apps/client/src/mocks/server.ts` | MSW server setup |

#### New Files (E2E Tests - Playwright)
| File | Purpose |
|------|---------|
| `apps/client/playwright.config.ts` | Playwright configuration |
| `apps/client/e2e/auth.spec.ts` | Authentication E2E tests |
| `apps/client/e2e/todo.spec.ts` | Todo CRUD E2E tests |
| `apps/client/e2e/theme.spec.ts` | Theme toggle E2E tests |
| `apps/client/e2e/navigation.spec.ts` | Route protection E2E tests |
| `apps/client/e2e/pages/login.page.ts` | Login page object |
| `apps/client/e2e/pages/register.page.ts` | Register page object |
| `apps/client/e2e/pages/dashboard.page.ts` | Dashboard page object |
| `apps/client/e2e/fixtures/auth.fixture.ts` | Authentication test fixtures |

#### Files to Delete (Angular)
All files in `apps/client/src/` will be replaced with Next.js structure.

#### Files to Delete (Cypress - replaced by Playwright)
| File/Directory | Reason |
|----------------|--------|
| `apps/ui-components-e2e/` | Cypress E2E tests replaced by Playwright |
| `apps/ui-components-e2e/cypress.config.ts` | Cypress configuration |
| `apps/ui-components-e2e/src/` | Cypress test files and support |

#### Files to Modify
| File | Changes |
|------|---------|
| `apps/client/project.json` | Update for Next.js targets |
| `apps/client/tsconfig.json` | Next.js TypeScript config |
| `package.json` | Add Next.js and related dependencies |

### Testing Strategy

**Manual Testing Checklist (MVP):**

*Authentication:*
- [ ] User can register a new account
- [ ] User can log in with valid credentials
- [ ] Invalid login shows generic error message (no user enumeration)
- [ ] Weak password rejected during registration (min 8 chars, uppercase, lowercase, number)
- [ ] Unauthenticated users are redirected to login
- [ ] Authenticated users are redirected from login to dashboard
- [ ] Logout clears session and redirects to login
- [ ] Session persists across page refresh

*Todo Management:*
- [ ] Dashboard loads with user's todos
- [ ] Todos are separated into incomplete/complete columns
- [ ] Clicking completion toggle updates todo status
- [ ] Edit button opens modal with pre-filled data
- [ ] Save edit updates todo and closes modal
- [ ] Delete button removes todo from list

*Theme:*
- [ ] Theme toggle switches between light/dark
- [ ] Theme persists across page refresh

**Playwright E2E Testing Checklist:**
- [ ] `npx playwright test` passes on all browsers (Chromium, Firefox, WebKit)
- [ ] Authentication flow E2E tests pass
- [ ] Todo CRUD E2E tests pass
- [ ] Theme toggle E2E tests pass
- [ ] Route protection E2E tests pass
- [ ] Test reports generated successfully
- [ ] Screenshots captured on test failure

**Security Testing Checklist:**
- [ ] Session cookie has `httpOnly` flag (check in DevTools > Application > Cookies)
- [ ] Session cookie has `secure` flag in production
- [ ] Session cookie has `sameSite` attribute set to `lax`
- [ ] Security headers are present (check in DevTools > Network > Response Headers)
- [ ] `API_URL` is not exposed in client-side JavaScript
- [ ] Error messages don't reveal sensitive information
- [ ] Invalid/expired tokens redirect to login without errors
- [ ] `npm audit` shows no high or critical vulnerabilities

### Migration Approach

1. **Phase 1:** Create Next.js app alongside Angular (development)
2. **Phase 2:** Verify all MVP features work
3. **Phase 3:** Remove Angular files and configuration
4. **Phase 4:** Update Nx project configuration

---

## 11. Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| App Router vs Pages Router? | **App Router** - Modern RSC-first approach |
| State management? | **Context API + React Query** - Minimal dependencies |
| Authentication storage? | **HTTP-only cookies with middleware** - More secure |
| Styling approach? | **Tailwind + shadcn/ui** - Accessible, customizable |
| Backend integration? | **Direct API calls with server-only environment variable** |
| Monorepo structure? | **Replace Angular in place** (`apps/client/`) |
| Feature scope? | **Minimal MVP first** - Auth + basic todo CRUD |
| Form handling? | **React Hook Form + Zod** - Similar to Angular reactive forms |

---

## 12. Security Considerations

### Password Requirements
| Requirement | Rule |
|-------------|------|
| Minimum length | 8 characters |
| Uppercase | At least one uppercase letter (A-Z) |
| Lowercase | At least one lowercase letter (a-z) |
| Numbers | At least one digit (0-9) |

### Cookie Security Settings
| Setting | Value | Purpose |
|---------|-------|---------|
| `httpOnly` | `true` | Prevent JavaScript access (XSS protection) |
| `secure` | `true` (production) | HTTPS-only transmission |
| `sameSite` | `'lax'` | CSRF protection |
| `path` | `'/'` | Available site-wide |
| `maxAge` | `604800` (7 days) | Session expiration |

### Error Handling Guidelines
- **Client-facing errors:** Always use generic messages
  - "Invalid email or password" (not "User not found" or "Wrong password")
  - "Something went wrong. Please try again." (not stack traces)
- **Server-side logging:** Log detailed errors with correlation IDs for debugging
- **Production:** Never expose stack traces or internal error details

### Security Headers
| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |

### Dependency Security
- Run `npm audit` before each deployment
- Pin major versions to prevent unexpected breaking changes
- Review and update dependencies quarterly

---

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Current Angular implementation: `libs/client/`
- Shared domain models: `libs/shared/domain/`
- Backend API: `libs/server/feature-*`

---

**Document Version:** 1.4  
**Created:** January 21, 2026  
**Updated:** January 21, 2026  
**Status:** Ready for Implementation  
**Security Review:** Completed

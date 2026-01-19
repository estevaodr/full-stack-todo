# Tasks: Angular to Next.js Migration

## Relevant Files

- `apps/client-next/src/app/layout.tsx` - Root layout (providers, fonts).
- `apps/client-next/src/app/page.tsx` - Dashboard/Home page.
- `apps/client-next/src/app/login/page.tsx` - Login page.
- `apps/client-next/src/app/register/page.tsx` - Registration page.
- `apps/client-next/src/lib/api.ts` - Axios instance and interceptors.
- `apps/client-next/src/lib/query-client.ts` - React Query client setup.
- `apps/client-next/src/store/use-auth-store.ts` - Zustand store for auth state.
- `apps/client-next/src/store/use-theme-store.ts` - Zustand store for theme.
- `apps/client-next/src/components/ui/*` - Shadcn UI components.
- `apps/client-next/src/features/todo/components/*` - Todo-specific components.
- `apps/client-next/src/features/auth/components/*` - Auth forms.
- `libs/shared/src/lib/todo.dto.ts` - Shared DTOs (reference for Zod schemas).

### Notes
- Zod schemas should mirror existing DTOs where possible.
- Tests will be written using Playwright for E2E and Vitest for unit tests where complex logic exists.

## Tasks

- [ ] 1.0 Project Setup & Infrastructure
  - [ ] 1.1 Generate new Next.js application in Nx workspace (`apps/client-next`) with App Router.
  - [ ] 1.2 Install dependencies: `tanstack/react-query`, `zustand`, `axios`, `clsx`, `tailwind-merge`, `lucide-react`, `zod`, `react-hook-form`, `@hookform/resolvers`.
  - [ ] 1.3 Configure Tailwind CSS and `postcss.config.js`.
  - [ ] 1.4 Set up absolute imports/aliases in `tsconfig.json` (if not auto-generated).
  - [ ] 1.5 Configure Shadcn UI (init and add basic components: Button, Input, Card, Form, Label, Dialog).
  - [ ] 1.6 Create `QueryClientProvider` wrapper and add to Root Layout.
  - [ ] 1.7 Set up Axios instance with base URL (referencing environment variables) and interceptors.

- [ ] 2.0 UI Foundation & Components
  - [ ] 2.1 Implement ThemeProvider using `next-themes` and a Zustand store (if needed for custom logic) for dark/light mode.
  - [ ] 2.2 Create a responsive App Shell/Layout (Header with Theme Toggle, Logout).
  - [ ] 2.3 Create shared UI components from Shadcn that aren't auto-generated (e.g., specific layout containers).

- [ ] 3.0 Authentication Module
  - [ ] 3.1 Define Zod schemas for Login and Registration forms (matching backend DTOs).
  - [ ] 3.2 Implement `useAuthStore` with Zustand for managing user session and tokens.
  - [ ] 3.3 Create `LoginForm` component with React Hook Form + Zod validation.
  - [ ] 3.4 Create `RegisterForm` component with React Hook Form + Zod validation (ensure password matching).
  - [ ] 3.5 Build `/login` and `/register` pages using the forms.
  - [ ] 3.6 Implement API calls for login/register in `apps/client-next/src/features/auth/api.ts`.
  - [ ] 3.7 Add middleware or HOC to protect private routes (dashboard) and redirect unauthenticated users.

- [ ] 4.0 Todo Feature Implementation
  - [ ] 4.1 Define Zod schemas for Creating/Editing Todos.
  - [ ] 4.2 Create React Query hooks (`useTodos`, `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`) with optimistic updates.
  - [ ] 4.3 Build `TodoItem` component (display, toggle status, delete button, edit button).
  - [ ] 4.4 Build `TodoList` component (render list of `TodoItem`s).
  - [ ] 4.5 Build `AddTodoDialog` component (using Shadcn Dialog and Form).
  - [ ] 4.6 Assemble the Dashboard page (`/`) with `TodoList` and `AddTodoDialog`.
  - [ ] 4.7 Implement `EditTodoDialog` or inline editing functionality.

- [ ] 5.0 Testing & Quality Assurance
  - [ ] 5.1 Set up Playwright for `apps/client-next-e2e`.
  - [ ] 5.2 Write E2E test: Authentication flow (Register -> Login -> Logout).
  - [ ] 5.3 Write E2E test: Todo lifecycle (Create -> Read -> Update -> Delete).
  - [ ] 5.4 Verify feature parity with existing Angular app manually.
  - [ ] 5.5 Fix any linting errors and ensure build success.

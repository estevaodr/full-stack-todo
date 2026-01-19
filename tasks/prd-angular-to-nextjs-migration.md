# PRD: Refactor Angular Client to Next.js

## 1. Introduction/Overview
The goal of this project is to completely replace the existing Angular client application with a modern, performant Next.js application. This migration aims to leverage the latest React ecosystem advancements, improve developer experience, and enhance application performance using the App Router architecture. The existing NestJS backend (`apps/server`) will remain the API provider.

## 2. Goals
*   **Complete Replacement**: Fully migrate all features from the Angular client to Next.js.
*   **Modern Architecture**: Implement Next.js 14+ with App Router.
*   **Enhanced Styling**: Transition from SCSS to Tailwind CSS and adopt Shadcn UI for consistent, accessible components.
*   **Optimized State Management**: Use React Query for server state and Zustand for client state, replacing RxJS patterns.
*   **Robust Testing**: Establish a comprehensive E2E testing suite using Playwright.
*   **Monorepo Integration**: Ensure seamless integration within the existing Nx workspace.

## 3. User Stories
*   **As a User**, I want to register and login to the application so that I can access my private todo list.
*   **As a User**, I want to view my dashboard with my tasks so that I can manage my day.
*   **As a User**, I want to create, edit, delete, and toggle the status of my todos.
*   **As a User**, I want to toggle between light and dark themes.
*   **As a Developer**, I want to use a typed, component-based architecture (React) that is easy to maintain and extend.

## 4. Functional Requirements

### 4.1. Authentication
1.  **Login Page**: Recreate the login form with validation. Implement JWT-based authentication using the existing backend endpoints.
2.  **Register Page**: Recreate the registration form with validation (including password matching).
3.  **Protected Routes**: Implement middleware or higher-order components to protect dashboard and todo routes, redirecting unauthenticated users to login.
4.  **Auth Persistence**: Handle JWT token storage (secure cookies or local storage as appropriate) and session restoration on reload.

### 4.2. Dashboard & Todo Management
5.  **Dashboard View**: Display the user's todo list.
6.  **Add Todo**: Provide a mechanism (modal or inline form) to create new todos.
7.  **Edit Todo**: Allow users to edit existing todo details.
8.  **Delete Todo**: Allow users to remove todos.
9.  **Toggle Status**: Allow users to mark todos as done/pending.
10. **Optimistic Updates**: Use React Query to reflect changes immediately in the UI before the server response confirms them.

### 4.3. UI/UX
11. **Theme Toggle**: Recreate the theme switcher using Tailwind's dark mode and Zustand for state persistence.
12. **Responsive Design**: Ensure the application is fully responsive across mobile, tablet, and desktop using Tailwind classes.
13. **Components**: Replace existing Angular components with Shadcn UI equivalents (Buttons, Inputs, Dialogs, Cards).

## 5. Non-Goals (Out of Scope)
*   **Backend Changes**: No changes to the `apps/server` or API contract are planned.
*   **Mobile App**: This is strictly a web application migration.
*   **New Features**: No new functional features should be added during the migration (1:1 parity first).

## 6. Design Considerations
*   **Framework**: Next.js (latest stable) with App Router (`app/` directory).
*   **Styling**: Tailwind CSS for utility-first styling.
*   **Component Library**: Shadcn UI (based on Radix UI) for accessible primitives.
*   **Icons**: Lucide React (standard with Shadcn).

## 7. Technical Considerations
*   **Nx Workspace**: The new app should be generated as an Nx application (`apps/client-next` or similar).
*   **State Management**:
    *   **Server State**: TanStack Query (React Query) v5.
    *   **Client State**: Zustand for global UI state (theme, modals).
*   **Forms**: React Hook Form + Zod for schema validation (matching DTOs where possible).
*   **Testing**: Playwright for E2E tests, replacing Cypress. Vitest for unit testing if needed.
*   **Linting/Formatting**: Eslint and Prettier configurations should match the workspace standards.

## 8. Success Metrics
*   **Feature Parity**: All existing Cypress tests (translated to Playwright) pass on the new application.
*   **Performance**: Improved Core Web Vitals (LCP, CLS, INP) compared to the Angular app.
*   **Code Volume**: Reduction in boilerplate code due to React functional components and hooks.

## 9. Open Questions
*   Are there any specific "directives" or complex DOM manipulations in the Angular app that need special attention in React?
*   Should we maintain the exact same route structure URLs for SEO purposes? (Assumed yes).


# Full-Stack Todo - Client Application Documentation

## 1. Overview

### What this code/feature does
The `client` application is the frontend piece for the Full-Stack Todo app. It is a modern web interface built with React, Next.js, and styled using Tailwind CSS and Radix UI primitives. It lets users create, read, update, and delete (CRUD) their todo items. It also handles secure user authentication (login, registration) and routing protection.

### Why it exists and its purpose
This application exists to provide an interactive, fast, and responsive user experience for managing personal tasks. It serves as the visual presentation layer that consumes the underlying Todo API backend, coordinating user sessions and ensuring smooth real-time visual updates. 

### Key concepts and terminology
- **Next.js App Router (`src/app`)**: The framework's directory-based routing system handling paths like `/login`, `/register`, and `/dashboard`. Layouts (like `(protected)` and `(auth)`) partition the app visually and functionally.
- **Provider Pattern**: Used extensively globally (e.g., `AuthProvider`, `QueryClientProvider`, `ThemeProvider`) to manage session state and overall app configuration.
- **Data Mutation & Querying**: We utilize `@tanstack/react-query` to fetch data from the backend seamlessly. This handles our fetching lifecycle, background polling, and cache invalidation.
- **UI Primitives**: Fundamental building blocks from Radix UI and Shadcn UI (found in `src/components/ui`) built to be accessible out of the box and fully styled with Tailwind CSS.

---

## 2. API Documentation

Our main interaction with backend data and session lies in custom React Hooks. Below are the primary hooks found in `src/hooks`.

### `useTodos`
Retrieves the list of Todos from the backend API, caching them using React Query.

- **Function Signature:** `function useTodos(): UseQueryResult<ITodo[], Error>`
- **Parameters:** Defaults to a static query key `['todos']`.
- **Return Value:** Returns a standard React Query object containing `data` (an array of `ITodo`), `isLoading`, `error`, etc.
- **Error Handling/Edge Cases:** If the network request fails or returns a non-2xx status, tracking halts and the `error` state is populated.

### `useCreateTodo`
Exposes the mutation for creating a new task.

- **Function Signature:** `function useCreateTodo(): UseMutationResult<ITodo, Error, { title: string; description?: string }>`
- **Parameters:** None for the hook itself. The `mutate` function accepts `{ title, description }`.
- **Return Value:** React Query mutation object containing the `mutate` and `mutateAsync` functions.
- **Error Handling/Edge Cases:** Errors yield a standard Error object. On success, `onSettled` guarantees invalidation of the `['todos']` key to instantly trigger a re-fetch.

### `useAuth`
Coordinates user session state mapping, exposing properties on the current user and functions to act on the session (login, register, logout).

- **Function Signature:** `function useAuth(): { user: IUser | null, isLoading: boolean, error: string | null, setError: (e: string | null) => void, login: (e, p) => Promise<void>, logout: () => Promise<void>, register: (e, p) => Promise<void> }`
- **Parameters:** None. Internally pulls from `useAuthContext()`.
- **Return Value:** An object spanning the entire authentication lifecycle context. 
- **Error Handling/Edge Cases:** 
  - Submits valid JSON. Automatically extracts fallback or API error messages (`data.message`). 
  - Prevents routing if error arises.
  - Exposes `error` and `setError` back to the component to show localized feedback messages.

### Example Usage with Code Snippets

```tsx
import { useTodos, useCreateTodo } from '@/hooks/use-todos';

export function TodoDashboard() {
  const { data: todos, isLoading } = useTodos();
  const { mutate: createTodo } = useCreateTodo();

  const handleAdd = () => {
    createTodo({ title: "New Task", description: "This is a new task." });
  };

  if (isLoading) return <p>Loading tasks...</p>;

  return (
    <div>
      <button onClick={handleAdd}>Add Todo</button>
      <ul>
        {todos?.map(todo => <li key={todo.id}>{todo.title}</li>)}
      </ul>
    </div>
  );
}
```

---

## 3. Implementation Details

### Architecture overview
The application utilizes Next.js primarily for its routing, SSR, and API route proxying mechanisms (e.g., intercepting HTTP to handle logging). The structure isolates domain logic via custom Hooks, encapsulating the underlying fetch layer and React Query behavior. This frees the visual components to operate cleanly strictly on "state and props."

- `src/app/`: The Next.js Router (defines pages and layouts).
- `src/components/`: Reusable presentation components. Elements in `/ui` are raw building blocks (buttons, dialogs). Larger blocks (like forms) reside in the root of components.
- `src/hooks/`: Where data mutations and API abstractions are bound.
- `src/providers/`: Context wrapping logic bridging different global states (Themes, Auth, Query parameters).

### Important design decisions
- **Optimistic Updates & Cache Invalidations:** The `useTodos` queries update their cache optimistically (`onMutate`) on patch/delete calls. This makes the UI feel infinitely fast—avoiding network blocking on minor edits.
- **Pino for Logging:** Production ready logger is set up in Next.js to replace standard console traces. This bridges client and server log handling explicitly through Next.js proxy middleware.
- **Client-Side Auth State (`useAuthContext`)**: Global auth state is pushed to React Context to prevent prop drilling globally.

### Dependencies and integrations
- **React / Next.js**: Core framework.
- **Tailwind CSS + Tailwind PostCSS**: Styling utility pipeline.
- **Lucide React**: For scalable SVG icons (e.g., in dialogs, warnings).
- **React Hook Form & Zod**: For managing robust, typing-safe forms (`login-form.tsx`).
- **Axios & Fetch API**: HTTP request handling dynamically coupled with React Query.

---

## 4. Examples

### Common use cases with full examples

**Use Case: Managing Auth Protection (Protected Layouts)**

We wrap the dashboard in a protected context. If an unauthenticated user forces their way there, we bounce them out seamlessly using our Provider/Hook structure. 

```tsx
// src/app/(protected)/protected-layout-client.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Checking session...</div>;
  if (!user) return null; // Wait for redirect to happen

  return <>{children}</>;
}
```

### Best practices and patterns
- **Colocate Types and Validation:** Maintain `Zod` schemas close to their corresponding UI forms in `/components` allowing for rapid local troubleshooting. 
- **Query Keys in Constants:** Notice `const TODOS_QUERY_KEY = ['todos'] as const;` in hooks. Doing this avoids typos and mismatched invalidation logic across multiple mutation endpoints.
- **Server/Client Separation:** Always include `'use client'` strictly when dealing with interactivity, React hooks, or context. Use Server Components by default where data fetching or SEO requires it. 

### Common pitfalls to avoid
- **Forgetting `credentials: 'include'`**: When rolling custom fetch logic, remember that secure HTTP cookies bind session states across the platform. Forgetting this property will drop session context.
- **Leaking Server Dependencies to the Client**: Attempting to import Pino node server dependencies inside React UI components will crash the client bundle. Always proxy via explicit `/api/` Next.js routes using `pino-http`.
- **Race Condition in Optimistic UI**: If your backend behaves unexpectedly or modifies identifiers abruptly, the optimistic `queryClient.setQueryData` might briefly drift from reality. The `onError` rollback defined in the mutation hooks is crucial to handle correctly. 

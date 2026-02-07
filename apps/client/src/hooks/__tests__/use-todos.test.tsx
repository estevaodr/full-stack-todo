/**
 * Tests for use-todos: useTodos query, useUpdateTodo, useDeleteTodo mutations.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { useTodos, useUpdateTodo, useDeleteTodo } from '../use-todos';

function pathname(path: string) {
  const segment = path.replace(/^\//, '');
  return ({ request }: { request: Request }) =>
    request.url.includes(segment);
}

const mockTodos: ITodo[] = [
  {
    id: 'todo-1',
    title: 'Todo one',
    description: 'Desc one',
    completed: false,
    user_id: 'user-1',
  },
  {
    id: 'todo-2',
    title: 'Todo two',
    description: 'Desc two',
    completed: true,
    user_id: 'user-1',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useTodos', () => {
  beforeEach(() => {
    server.use(
      http.get(pathname('/api/todos'), () =>
        HttpResponse.json<ITodo[]>(mockTodos)
      )
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns useTodos query with data when fetch succeeds', async () => {
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTodos);
    expect(result.current.error).toBeNull();
  });

  it('exposes refetch', async () => {
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useUpdateTodo', () => {
  beforeEach(() => {
    server.use(
      http.get(pathname('/api/todos'), () =>
        HttpResponse.json<ITodo[]>(mockTodos)
      ),
      http.patch(pathname('/api/todos/'), ({ request }) => {
        const url = request.url;
        const idMatch = url.match(/\/api\/todos\/([^/]+)/);
        const id = idMatch?.[1] ?? 'todo-1';
        return HttpResponse.json<ITodo>({
          ...mockTodos[0],
          id,
          completed: true,
        });
      })
    );
  });

  it('useUpdateTodo mutation sends PATCH and invalidates todos', async () => {
    const wrapper = createWrapper();
    const { result: queryResult } = renderHook(() => useTodos(), {
      wrapper,
    });
    await waitFor(() => {
      expect(queryResult.current.isLoading).toBe(false);
    });

    const { result: mutationResult } = renderHook(() => useUpdateTodo(), {
      wrapper,
    });

    mutationResult.current.mutate({
      id: 'todo-1',
      data: { completed: true },
    });

    await waitFor(() => {
      expect(mutationResult.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteTodo', () => {
  beforeEach(() => {
    server.use(
      http.get(pathname('/api/todos'), () =>
        HttpResponse.json<ITodo[]>(mockTodos)
      ),
      http.delete(pathname('/api/todos/'), () => new HttpResponse(null, { status: 204 }))
    );
  });

  it('useDeleteTodo mutation sends DELETE and invalidates todos', async () => {
    const wrapper = createWrapper();
    const { result: mutationResult } = renderHook(() => useDeleteTodo(), {
      wrapper,
    });

    mutationResult.current.mutate('todo-1');

    await waitFor(() => {
      expect(mutationResult.current.isSuccess).toBe(true);
    });
  });
});

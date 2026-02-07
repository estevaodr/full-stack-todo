'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { ITodo, IUpdateTodo } from '@full-stack-todo/shared/domain';

const TODOS_QUERY_KEY = ['todos'] as const;

async function fetchTodos(): Promise<ITodo[]> {
  const res = await fetch('/api/todos', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export function useTodos() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: fetchTodos,
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: IUpdateTodo;
    }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update todo');
      return res.json() as Promise<ITodo>;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<ITodo[]>(TODOS_QUERY_KEY) ?? [];
      queryClient.setQueryData<ITodo[]>(TODOS_QUERY_KEY, (old = []) =>
        old.map((t) =>
          t.id === id ? { ...t, ...data } as ITodo : t
        )
      );
      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos != null) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<ITodo[]>(TODOS_QUERY_KEY) ?? [];
      queryClient.setQueryData<ITodo[]>(TODOS_QUERY_KEY, (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTodos != null) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });
}

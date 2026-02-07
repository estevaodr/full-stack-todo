/**
 * Integration tests for todo CRUD: fetch list, toggle completion, edit, delete.
 * Uses MSW to mock /api/todos and renders TodoList with QueryClientProvider.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { TodoList } from '@/components/todo-list';
import { server } from '@/mocks/server';

function pathname(segment: string) {
  return ({ request }: { request: Request }) =>
    request.url.includes(segment);
}

const initialTodos: ITodo[] = [
  {
    id: 'todo-1',
    title: 'First todo',
    description: 'First description',
    completed: false,
    user_id: 'user-1',
  },
  {
    id: 'todo-2',
    title: 'Second todo',
    description: 'Second description',
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
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('Todo CRUD integration', () => {
  let todos: ITodo[];

  beforeEach(() => {
    todos = initialTodos.map((t) => ({ ...t }));
    server.use(
      http.get(pathname('api/todos'), () => HttpResponse.json<ITodo[]>(todos)),
      http.patch(pathname('api/todos'), async ({ request }) => {
        const url = request.url;
        const idMatch = url.match(/\/api\/todos\/([^/]+)/);
        const id = idMatch?.[1] ?? '';
        const body = (await request.json()) as Partial<ITodo>;
        const index = todos.findIndex((t) => t.id === id);
        if (index === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        todos[index] = { ...todos[index], ...body } as ITodo;
        return HttpResponse.json(todos[index]);
      }),
      http.delete(pathname('api/todos'), ({ request }) => {
        const url = request.url;
        const idMatch = url.match(/\/api\/todos\/([^/]+)/);
        const id = idMatch?.[1] ?? '';
        const index = todos.findIndex((t) => t.id === id);
        if (index !== -1) todos.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );
  });

  it('fetches and displays todo list', async () => {
    render(createElement(createWrapper(), null, createElement(TodoList)));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /incomplete/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /completed/i })).toBeInTheDocument();
    });

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('toggle completion moves todo between columns', async () => {
    const user = userEvent.setup();
    render(createElement(createWrapper(), null, createElement(TodoList)));

    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const incompleteSection = screen.getByRole('main', { name: /todo items/i });
    const firstCard = within(incompleteSection).getByText('First todo').closest('li');
    expect(firstCard).toBeInTheDocument();
    const checkbox = within(firstCard!).getByRole('checkbox', { name: /toggle completion/i });
    await user.click(checkbox);

    await waitFor(() => {
      expect(todos.find((t) => t.id === 'todo-1')?.completed).toBe(true);
    });
    await waitFor(() => {
      const completedHeading = screen.getByRole('heading', { name: /^completed$/i });
      const completedList = completedHeading.closest('section')?.querySelector('[role="list"]');
      expect(completedList).toHaveTextContent('First todo');
    });
  });

  it('edit todo updates title', async () => {
    const user = userEvent.setup();
    render(createElement(createWrapper(), null, createElement(TodoList)));

    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const firstCard = screen.getByText('First todo').closest('li');
    const editButton = within(firstCard!).getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Updated title')).toBeInTheDocument();
    });
  });

  it('delete todo removes it from list', async () => {
    const user = userEvent.setup();
    render(createElement(createWrapper(), null, createElement(TodoList)));

    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('First todo')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { EditTodoDialog } from '../edit-todo-dialog';

const mockUpdateTodo = vi.fn();

vi.mock('@/hooks/use-todos', () => ({
  useTodos: () => ({ data: [], isLoading: false, error: null, refetch: vi.fn() }),
  useUpdateTodo: () => ({
    mutate: (...args: unknown[]) => mockUpdateTodo(...args),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
  useDeleteTodo: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

const todo: ITodo = {
  id: 'todo-1',
  title: 'Buy milk',
  description: 'From the store',
  completed: false,
  user_id: 'user-1',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('EditTodoDialog', () => {
  beforeEach(() => {
    mockUpdateTodo.mockReset();
  });

  it('when open is false, dialog content is not visible', () => {
    render(
      <EditTodoDialog todo={todo} open={false} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('when open is true, dialog is visible with form', () => {
    render(
      <EditTodoDialog todo={todo} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /title/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /description/i })
    ).toBeInTheDocument();
  });

  it('form is pre-filled with todo title and description when open', () => {
    render(
      <EditTodoDialog todo={todo} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const descriptionInput = screen.getByRole('textbox', {
      name: /description/i,
    });

    expect(titleInput).toHaveValue('Buy milk');
    expect(descriptionInput).toHaveValue('From the store');
  });

  it('save calls useUpdateTodo with id and form data', async () => {
    const user = userEvent.setup();
    render(
      <EditTodoDialog todo={todo} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Buy bread');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    expect(mockUpdateTodo).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 'todo-1',
        data: expect.objectContaining({ title: 'Buy bread' }),
      }),
      expect.any(Object)
    );
  });

  it('cancel or close calls onOpenChange with false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <EditTodoDialog todo={todo} open onOpenChange={onOpenChange} />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

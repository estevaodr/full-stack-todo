import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { MutationFeedbackProvider } from '@/components/mutation-feedback';
import { TodoCard } from '../todo-card';

const mockUpdateTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockUpdateState = vi.hoisted(() => ({ isPending: false }));
const mockDeleteState = vi.hoisted(() => ({ isPending: false }));

vi.mock('@/hooks/use-todos', () => ({
  useTodos: () => ({ data: [], isLoading: false, error: null, refetch: vi.fn() }),
  useUpdateTodo: () => ({
    mutate: (...args: unknown[]) => mockUpdateTodo(...args),
    mutateAsync: vi.fn(),
    isPending: mockUpdateState.isPending,
    isSuccess: false,
    isError: false,
  }),
  useDeleteTodo: () => ({
    mutate: (...args: unknown[]) => mockDeleteTodo(...args),
    mutateAsync: vi.fn(),
    isPending: mockDeleteState.isPending,
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
      createElement(MutationFeedbackProvider, null, children)
    );
  };
}

describe('TodoCard', () => {
  beforeEach(() => {
    mockUpdateTodo.mockReset();
    mockDeleteTodo.mockReset();
    mockUpdateState.isPending = false;
    mockDeleteState.isPending = false;
  });

  it('renders todo title and description', () => {
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('From the store')).toBeInTheDocument();
  });

  it('shows mark as complete button for incomplete todo', () => {
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    const btn = screen.getByRole('button', { name: /mark as complete/i });
    expect(btn).toBeInTheDocument();
  });

  it('toggle completion calls useUpdateTodo with inverted completed', async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /mark as complete/i }));

    expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    expect(mockUpdateTodo).toHaveBeenCalledWith(
      {
        id: 'todo-1',
        data: { completed: true },
      },
      expect.any(Object)
    );
  });

  it('when todo is completed, toggle calls useUpdateTodo with completed false', async () => {
    const user = userEvent.setup();
    render(
      <TodoCard todo={{ ...todo, completed: true }} />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('button', { name: /mark as incomplete/i }));

    expect(mockUpdateTodo).toHaveBeenCalledWith(
      {
        id: 'todo-1',
        data: { completed: false },
      },
      expect.any(Object)
    );
  });

  it('edit and delete buttons are always visible when onEdit is provided', () => {
    render(<TodoCard todo={todo} onEdit={vi.fn()} />, { wrapper: createWrapper() });

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /^delete$/i });

    expect(editButton).toBeVisible();
    expect(deleteButton).toBeVisible();
  });

  it('disables actions while update is pending', () => {
    mockUpdateState.isPending = true;

    render(<TodoCard todo={todo} onEdit={vi.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /mark as complete/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeDisabled();
  });

  it('renders long titles with truncation-friendly layout', () => {
    const longTitle = 'Review pull request with a very long unbroken title '.repeat(4).trim();
    render(
      <TodoCard todo={{ ...todo, title: longTitle }} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTitle(longTitle)).toBeInTheDocument();
  });

  it('delete button opens confirm dialog and calls useDeleteTodo on confirm', async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete todo/i }));

    expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1', expect.any(Object));
  });
});

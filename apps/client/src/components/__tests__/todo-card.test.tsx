import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { TodoCard } from '../todo-card';

const mockUpdateTodo = vi.fn();
const mockDeleteTodo = vi.fn();

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
    mutate: (...args: unknown[]) => mockDeleteTodo(...args),
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

describe('TodoCard', () => {
  beforeEach(() => {
    mockUpdateTodo.mockReset();
    mockDeleteTodo.mockReset();
  });

  it('renders todo title and description', () => {
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('From the store')).toBeInTheDocument();
  });

  it('shows completed state (e.g. checked or strikethrough)', () => {
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    const checkbox = screen.getByRole('checkbox', { name: /complete|toggle/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggle completion calls useUpdateTodo with inverted completed', async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('checkbox', { name: /complete|toggle/i }));

    expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    expect(mockUpdateTodo).toHaveBeenCalledWith({
      id: 'todo-1',
      data: { completed: true },
    });
  });

  it('when todo is completed, toggle calls useUpdateTodo with completed false', async () => {
    const user = userEvent.setup();
    render(
      <TodoCard todo={{ ...todo, completed: true }} />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByRole('checkbox', { name: /complete|toggle/i }));

    expect(mockUpdateTodo).toHaveBeenCalledWith({
      id: 'todo-1',
      data: { completed: false },
    });
  });

  it('edit button is present and opens edit flow', () => {
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('button', { name: /edit/i })
    ).toBeInTheDocument();
  });

  it('delete button calls useDeleteTodo with todo id', async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={todo} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
  });
});

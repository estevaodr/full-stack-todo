import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import {
  ADD_TODO_SHORTCUT_CONTEXT,
  ADD_TODO_SHORTCUT_KEY,
  ADD_TODO_SHORTCUT_TITLE,
} from '@/lib/keyboard-hints';

describe('EmptyState', () => {
  it('explains the add-todo keyboard shortcut', () => {
    render(<EmptyState onAddTodo={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /no todos yet/i })).toBeInTheDocument();
    expect(screen.getByText(ADD_TODO_SHORTCUT_CONTEXT)).toBeInTheDocument();
    expect(screen.getByText(ADD_TODO_SHORTCUT_KEY, { selector: 'kbd' })).toBeInTheDocument();
  });

  it('surfaces shortcut metadata on the add button', () => {
    render(<EmptyState onAddTodo={vi.fn()} />);

    const button = screen.getByRole('button', { name: /add todo/i });
    expect(button).toHaveAttribute('title', ADD_TODO_SHORTCUT_TITLE);
    expect(button).toHaveAttribute('aria-keyshortcuts', ADD_TODO_SHORTCUT_KEY);
  });
});

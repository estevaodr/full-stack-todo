'use client';

import { Button } from '@/components/ui/button';
import {
  ADD_TODO_SHORTCUT_CONTEXT,
  ADD_TODO_SHORTCUT_KEY,
  ADD_TODO_SHORTCUT_TITLE,
} from '@/lib/keyboard-hints';

interface EmptyStateProps {
  onAddTodo?: () => void;
}

function EmptyListIcon() {
  return (
    <svg
      className="size-8 shrink-0 text-muted-foreground/30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
    </svg>
  );
}

export function EmptyState({ onAddTodo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-20">
      <EmptyListIcon />
      <div className="flex flex-col gap-2 max-w-md">
        <h2 className="text-[22px] font-semibold text-balance">No todos yet</h2>
        <p className="text-base text-muted-foreground text-pretty">
          Create your first todo below, or press{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
            {ADD_TODO_SHORTCUT_KEY}
          </kbd>{' '}
          for a quick add.
        </p>
        <p className="text-sm text-muted-foreground text-pretty">{ADD_TODO_SHORTCUT_CONTEXT}</p>
      </div>
      {onAddTodo ? (
        <Button
          type="button"
          onClick={onAddTodo}
          className="h-10 px-6 rounded-[6px]"
          title={ADD_TODO_SHORTCUT_TITLE}
          aria-keyshortcuts={ADD_TODO_SHORTCUT_KEY}
        >
          <AddIcon />
          <span>Add Todo</span>
        </Button>
      ) : null}
    </div>
  );
}

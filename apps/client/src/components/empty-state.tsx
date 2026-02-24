'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddTodo?: () => void;
}

function ClipboardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
        fill="currentColor"
        className="text-muted-foreground/50"
      />
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
      <div className="w-12 h-12 flex items-center justify-center text-muted-foreground/50">
        <ClipboardIcon />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold">No todos yet</h2>
        <p className="text-base text-muted-foreground">
          Create your first todo to get started
        </p>
      </div>
      {onAddTodo ? (
        <Button
          type="button"
          onClick={onAddTodo}
          className="h-10 px-6 rounded-[6px]"
        >
          <AddIcon />
          <span>Add Todo</span>
        </Button>
      ) : null}
    </div>
  );
}

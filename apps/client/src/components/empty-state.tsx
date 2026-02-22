'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddTodo?: () => void;
}

export function EmptyState({ onAddTodo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-20">
      <div className="w-12 h-12 flex items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-muted-foreground/50">
          content_paste
        </span>
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
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add Todo</span>
        </Button>
      ) : null}
    </div>
  );
}

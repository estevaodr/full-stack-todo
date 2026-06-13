'use client';

import { useState, useMemo, type ReactNode } from 'react';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { useTodos } from '@/hooks/use-todos';
import { TodoCard } from '@/components/todo-card';
import { EditTodoDialog } from '@/components/edit-todo-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorBanner } from '@/components/error-banner';
import { cn } from '@/lib/utils';

export interface TodoListProps {
  onAddTodo?: () => void;
}

const sectionHeadingClasses = 'text-[22px] font-semibold flex items-center gap-2 text-balance';

const countBadgeBaseClasses =
  'text-sm font-medium px-2 py-0.5 rounded-full tabular-nums';

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L6.41 12 8 10.41l3 3 6-6L17.59 9 11 15.59z"
        fill="currentColor"
      />
    </svg>
  );
}

function AllCaughtUpBanner() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3"
      role="status"
    >
      <div className="shrink-0 text-success">
        <CheckCircleIcon />
      </div>
      <p className="text-sm font-medium text-foreground">All caught up — nothing left to do.</p>
    </div>
  );
}

interface TodoColumnProps {
  headingId: string;
  title: string;
  count: number;
  countVariant?: 'default' | 'success';
  isSecondary?: boolean;
  twoColumns?: boolean;
  children: ReactNode;
}

function TodoColumn({
  headingId,
  title,
  count,
  countVariant = 'default',
  isSecondary = false,
  twoColumns = false,
  children,
}: TodoColumnProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex min-w-0 flex-col gap-3',
        twoColumns && isSecondary && 'md:border-l md:border-border md:pl-6'
      )}
    >
      <h2 id={headingId} className={sectionHeadingClasses}>
        {title}
        <span
          className={cn(
            countBadgeBaseClasses,
            countVariant === 'success'
              ? 'bg-success/20 text-success border border-success/30'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function TodoListSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading todos">
      <div className="h-7 w-40 rounded bg-muted motion-safe:animate-pulse" />
      <ul className="flex flex-col gap-4">
        {[0, 1, 2].map((key) => (
          <li
            key={key}
            className="list-none rounded-lg border border-border bg-card p-4 motion-safe:animate-pulse"
          >
            <div className="mb-2 h-5 w-2/3 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TodoList({ onAddTodo }: TodoListProps) {
  const { data: todos = [], isLoading, isError, error } = useTodos();
  const [editingTodo, setEditingTodo] = useState<ITodo | null>(null);

  const { incomplete, complete } = useMemo(() => {
    const incomplete: ITodo[] = [];
    const complete: ITodo[] = [];
    for (const todo of todos) {
      if (todo.completed) complete.push(todo);
      else incomplete.push(todo);
    }
    return { incomplete, complete };
  }, [todos]);

  if (isLoading) {
    return <TodoListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorBanner
        message={
          error instanceof Error ? error.message : 'Failed to load todos. Please try again later.'
        }
      />
    );
  }

  if (todos.length === 0) {
    return <EmptyState onAddTodo={onAddTodo} />;
  }

  const hasIncomplete = incomplete.length > 0;
  const hasComplete = complete.length > 0;
  const twoColumns = hasIncomplete && hasComplete;
  const allComplete = !hasIncomplete && hasComplete;

  return (
    <>
      <div className="flex flex-col gap-6">
        {allComplete ? <AllCaughtUpBanner /> : null}

        <section
          className={cn(
            'grid items-start gap-y-8',
            twoColumns
              ? 'grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:gap-x-6'
              : 'grid-cols-1'
          )}
          aria-label="Todo items"
        >
          {hasIncomplete ? (
            <TodoColumn headingId="incomplete-heading" title="Incomplete" count={incomplete.length}>
              <ul className="flex flex-col gap-4">
                {incomplete.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} onEdit={setEditingTodo} />
                ))}
              </ul>
            </TodoColumn>
          ) : null}

          {hasComplete ? (
            <TodoColumn
              headingId="completed-heading"
              title="Completed"
              count={complete.length}
              countVariant="success"
              isSecondary
              twoColumns={twoColumns}
            >
              <ul className="flex flex-col gap-4">
                {complete.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} onEdit={setEditingTodo} />
                ))}
              </ul>
            </TodoColumn>
          ) : null}
        </section>
      </div>

      {editingTodo ? (
        <EditTodoDialog
          todo={editingTodo}
          open={true}
          onOpenChange={(open) => !open && setEditingTodo(null)}
        />
      ) : null}
    </>
  );
}

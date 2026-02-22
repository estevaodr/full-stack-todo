'use client';

import { useState, useMemo } from 'react';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { useTodos } from '@/hooks/use-todos';
import { TodoCard } from '@/components/todo-card';
import { EditTodoDialog } from '@/components/edit-todo-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorBanner } from '@/components/error-banner';

export function TodoList() {
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
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground" role="status">
          Loading todos…
        </p>
      </div>
    );
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
    return <EmptyState />;
  }

  return (
    <>
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        aria-label="Todo items"
      >
        {/* Incomplete Column */}
        <section aria-labelledby="incomplete-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2
              id="incomplete-heading"
              className="text-[22px] font-semibold flex items-center gap-2"
            >
              Incomplete
              <span className="text-sm font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {incomplete.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {incomplete.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onEdit={setEditingTodo} />
            ))}
          </div>
        </section>

        {/* Completed Column */}
        <section aria-labelledby="completed-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2
              id="completed-heading"
              className="text-[22px] font-semibold flex items-center gap-2"
            >
              Completed
              <span className="text-sm font-medium bg-nord-success/20 text-nord-success px-2 py-0.5 rounded-full border border-nord-success/30">
                {complete.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {complete.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onEdit={setEditingTodo} />
            ))}
          </div>
        </section>
      </section>

      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          open={true}
          onOpenChange={(open) => !open && setEditingTodo(null)}
        />
      )}
    </>
  );
}

'use client';

import { useState, useMemo } from 'react';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { useTodos } from '@/hooks/use-todos';
import { TodoCard } from '@/components/todo-card';
import { EditTodoDialog } from '@/components/edit-todo-dialog';

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
      <p className="text-muted-foreground" role="status">
        Loading todos…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive" role="alert">
        {error instanceof Error ? error.message : 'Failed to load todos'}
      </p>
    );
  }

  return (
    <section
      className="grid gap-8 md:grid-cols-2"
      role="main"
      aria-label="Todo items"
    >
      <section aria-labelledby="incomplete-heading">
        <h2 id="incomplete-heading" className="mb-4 text-lg font-semibold">
          Incomplete
        </h2>
        <ul className="space-y-3" role="list">
          {incomplete.map((todo) => (
            <li key={todo.id} role="listitem">
              <TodoCard todo={todo} onEdit={setEditingTodo} />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="completed-heading">
        <h2 id="completed-heading" className="mb-4 text-lg font-semibold">
          Completed
        </h2>
        <ul className="space-y-3" role="list">
          {complete.map((todo) => (
            <li key={todo.id} role="listitem">
              <TodoCard todo={todo} onEdit={setEditingTodo} />
            </li>
          ))}
        </ul>
      </section>
      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          open={true}
          onOpenChange={(open) => !open && setEditingTodo(null)}
        />
      )}
    </section>
  );
}

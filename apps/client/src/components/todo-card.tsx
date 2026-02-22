'use client';

import type { ITodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos';

export interface TodoCardProps {
  todo: ITodo;
  onEdit?: (todo: ITodo) => void;
}

export function TodoCard({ todo, onEdit }: TodoCardProps) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  function handleToggle() {
    updateTodo.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  }

  function handleDelete() {
    deleteTodo.mutate(todo.id);
  }

  if (todo.completed) {
    return (
      <div className="bg-card/60 dark:bg-slate-800/60 p-4 rounded-lg border border-border opacity-75">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleToggle}
            className="mt-1 size-6 rounded-full bg-nord-success flex items-center justify-center flex-shrink-0"
            aria-label="Mark as incomplete"
          >
            <span className="material-symbols-outlined text-white text-sm font-bold filled-icon">
              check
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-semibold text-muted-foreground line-through truncate mb-1">
              {todo.title}
            </p>
            {todo.description ? (
              <p className="text-[16px] text-slate-400 dark:text-slate-500 italic line-clamp-2">
                {todo.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
            className="text-nord-danger/60 hover:text-nord-danger transition-colors self-start"
            aria-label="Delete"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow group">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleToggle}
          className="mt-1 size-6 rounded-full border-2 border-slate-400 hover:border-primary transition-colors flex items-center justify-center flex-shrink-0"
          aria-label="Mark as complete"
        >
          <span className="material-symbols-outlined text-transparent group-hover:text-primary text-sm">
            check
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-semibold truncate mb-1">
            {todo.title}
          </p>
          {todo.description ? (
            <p className="text-[16px] text-muted-foreground leading-snug line-clamp-2">
              {todo.description}
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider"
                aria-label="Edit"
              >
                <span className="material-symbols-outlined text-sm">edit</span>{' '}
                Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteTodo.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-nord-danger uppercase tracking-wider"
              aria-label="Delete"
            >
              <span className="material-symbols-outlined text-sm">delete</span>{' '}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { ITodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos';

// Inline SVG icons — same geometric style as logo.svg
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 16.17L5.33 12l-1.42 1.41L9.5 19 21 7.41 19.59 6 9.5 16.17z" fill="#FFFFFF" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
    </svg>
  );
}

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
      <div role="listitem" className="bg-card/60 p-4 rounded-lg border border-border opacity-75">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleToggle}
            className="mt-1 size-6 rounded-full bg-nord-success flex items-center justify-center flex-shrink-0"
            aria-label="Mark as incomplete"
          >
            <CheckIcon />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-semibold text-muted-foreground line-through truncate mb-1">
              {todo.title}
            </p>
            {todo.description ? (
              <p className="text-[16px] text-muted-foreground italic line-clamp-2">
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
            <DeleteIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="listitem" className="bg-card p-4 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow group">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleToggle}
          className="mt-1 size-6 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center flex-shrink-0 hover:bg-primary/10"
          aria-label="Mark as complete"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9.5 16.17L5.33 12l-1.42 1.41L9.5 19 21 7.41 19.59 6 9.5 16.17z" fill="currentColor" />
            </svg>
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-semibold text-card-foreground truncate mb-1">
            {todo.title}
          </p>
          {todo.description ? (
            <p className="text-[16px] text-foreground/60 leading-snug line-clamp-2">
              {todo.description}
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="flex items-center gap-1 text-xs font-semibold text-primary tracking-wider"
                aria-label="Edit"
              >
                <EditIcon />
                <span className="uppercase">Edit</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteTodo.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-nord-danger tracking-wider"
              aria-label="Delete"
            >
              <DeleteIcon />
              <span className="uppercase">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

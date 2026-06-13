'use client';

import { useState } from 'react';
import type { ITodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos';
import {
  DELETE_TODO_DIALOG_SUBMIT_LABEL,
  DELETE_TODO_DIALOG_SUBMIT_PENDING_LABEL,
} from '@/lib/dialog-labels';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  mutationErrorMessage,
  useMutationFeedback,
} from '@/components/mutation-feedback';
import { cn } from '@/lib/utils';

function CompletionCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-3.5 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
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

const focusRingClasses =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const actionButtonClasses = `flex items-center gap-1 text-xs font-semibold tracking-wider rounded-sm disabled:opacity-50 disabled:pointer-events-none ${focusRingClasses}`;

/** 24px visual circle inside a 44px hit area — touch-first without changing card layout. */
function CompletionToggle({
  completed,
  disabled,
  onToggle,
}: {
  completed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`group/toggle relative -m-2.5 flex size-11 shrink-0 items-center justify-center self-start rounded-full disabled:opacity-50 disabled:pointer-events-none ${focusRingClasses}`}
      aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 items-center justify-center rounded-full',
          'motion-safe:transition-[background-color,border-color,transform] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]',
          'motion-safe:group-active/toggle:scale-95',
          completed
            ? 'bg-success text-success-foreground'
            : 'border-2 border-border bg-transparent text-primary/60 group-hover/toggle:border-primary group-hover/toggle:bg-primary/10 group-hover/toggle:text-primary group-active/toggle:border-primary group-active/toggle:bg-primary/15 group-active/toggle:text-primary'
        )}
      >
        <CompletionCheckIcon
          className={cn(
            'motion-safe:transition-opacity motion-safe:duration-150',
            completed ? 'opacity-100' : 'opacity-70 group-hover/toggle:opacity-100'
          )}
        />
      </span>
    </button>
  );
}

export interface TodoCardProps {
  todo: ITodo;
  onEdit?: (todo: ITodo) => void;
}

export function TodoCard({ todo, onEdit }: TodoCardProps) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { showFeedback } = useMutationFeedback();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isBusy = updateTodo.isPending || deleteTodo.isPending;

  function handleToggle() {
    updateTodo.mutate(
      {
        id: todo.id,
        data: { completed: !todo.completed },
      },
      {
        onSuccess: () =>
          showFeedback(
            todo.completed ? 'Todo marked incomplete' : 'Todo completed'
          ),
        onError: (error) =>
          showFeedback(mutationErrorMessage(error), 'error'),
      }
    );
  }

  function handleDeleteConfirm() {
    deleteTodo.mutate(todo.id, {
      onSuccess: () => showFeedback('Todo deleted'),
      onError: (error) => {
        showFeedback(mutationErrorMessage(error), 'error');
        setDeleteConfirmOpen(false);
      },
      onSettled: () => setDeleteConfirmOpen(false),
    });
  }

  if (todo.completed) {
    return (
      <>
        <li
          className="bg-card/60 p-4 rounded-lg border border-border opacity-75"
          aria-busy={isBusy || undefined}
        >
          <div className="flex gap-4">
            <CompletionToggle
              completed
              disabled={isBusy}
              onToggle={handleToggle}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-[18px] font-semibold text-muted-foreground line-through truncate mb-1 break-words"
                title={todo.title}
              >
                {todo.title}
              </p>
              {todo.description ? (
                <p className="text-[16px] text-description-completed italic leading-snug line-clamp-2 break-words">
                  {todo.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isBusy}
              className={`relative flex size-11 shrink-0 items-center justify-center self-start text-nord-danger/60 hover:text-nord-danger transition-colors disabled:opacity-50 ${focusRingClasses}`}
              aria-label="Delete"
            >
              <DeleteIcon />
            </button>
          </div>
        </li>

        <DeleteTodoDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title={todo.title}
          onConfirm={handleDeleteConfirm}
          isPending={deleteTodo.isPending}
        />
      </>
    );
  }

  return (
    <>
      <li
        className="bg-card p-4 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow"
        aria-busy={isBusy || undefined}
      >
        <div className="flex gap-4">
          <CompletionToggle
            completed={false}
            disabled={isBusy}
            onToggle={handleToggle}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-[18px] font-semibold text-card-foreground truncate mb-1 break-words"
              title={todo.title}
            >
              {todo.title}
            </p>
            {todo.description ? (
              <p className="text-[16px] text-description leading-snug line-clamp-2 break-words">
                {todo.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(todo)}
                  disabled={isBusy}
                  className={`${actionButtonClasses} text-primary`}
                  aria-label="Edit"
                >
                  <EditIcon />
                  <span className="uppercase">Edit</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isBusy}
                className={`${actionButtonClasses} text-nord-danger`}
                aria-label="Delete"
              >
                <DeleteIcon />
                <span className="uppercase">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </li>

      <DeleteTodoDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={todo.title}
        onConfirm={handleDeleteConfirm}
        isPending={deleteTodo.isPending}
      />
    </>
  );
}

interface DeleteTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteTodoDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
  isPending,
}: DeleteTodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] bg-card rounded-xl modal-shadow p-6">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold tracking-tight">
            Delete todo?
          </DialogTitle>
          <DialogDescription asChild>
            <p>
              <span className="line-clamp-2 break-words font-medium text-foreground" title={title}>
                &ldquo;{title}&rdquo;
              </span>{' '}
              will be removed permanently. This cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? DELETE_TODO_DIALOG_SUBMIT_PENDING_LABEL
              : DELETE_TODO_DIALOG_SUBMIT_LABEL}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

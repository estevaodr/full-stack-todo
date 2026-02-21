'use client';

import type { ITodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          aria-label="Toggle completion"
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <div className="flex-1 space-y-1.5">
          <CardTitle
            className={cn(
              'text-base font-semibold',
              todo.completed && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </CardTitle>
          {todo.description ? (
            <CardDescription
              className={cn(
                todo.completed && 'line-through text-muted-foreground/80'
              )}
            >
              {todo.description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardFooter className="flex gap-2 pt-0">
        {onEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(todo)}
            aria-label="Edit"
          >
            Edit
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Edit"
            disabled
          >
            Edit
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          aria-label="Delete"
          disabled={deleteTodo.isPending}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { ITodo, IUpdateTodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo } from '@/hooks/use-todos';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export interface EditTodoDialogProps {
  todo: ITodo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditTodoFormValues {
  title: string;
  description: string;
}

export function EditTodoDialog({
  todo,
  open,
  onOpenChange,
}: EditTodoDialogProps) {
  const updateTodo = useUpdateTodo();
  const form = useForm<EditTodoFormValues>({
    defaultValues: { title: todo.title, description: todo.description ?? '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: todo.title, description: todo.description ?? '' });
    }
  }, [open, todo.id, todo.title, todo.description, form]);

  function onSubmit(values: EditTodoFormValues) {
    const data: IUpdateTodo = {
      title: values.title,
      description: values.description,
    };
    updateTodo.mutate(
      { id: todo.id, data },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} aria-label="Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} aria-label="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTodo.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

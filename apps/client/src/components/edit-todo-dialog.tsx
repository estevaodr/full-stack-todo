'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { ITodo, IUpdateTodo } from '@full-stack-todo/shared/domain';
import { useUpdateTodo } from '@/hooks/use-todos';
import {
  mutationErrorMessage,
  useMutationFeedback,
} from '@/components/mutation-feedback';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
  const { showFeedback } = useMutationFeedback();
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
      {
        onSuccess: () => {
          showFeedback('Todo updated');
          onOpenChange(false);
        },
        onError: (error) => {
          showFeedback(mutationErrorMessage(error), 'error');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] bg-card rounded-xl modal-shadow p-6"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold tracking-tight">
            Edit Todo
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-sm font-medium text-muted-foreground">
                    Title
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      aria-label="Title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-sm font-medium text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full p-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                      aria-label="Description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTodo.isPending}>
                {updateTodo.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

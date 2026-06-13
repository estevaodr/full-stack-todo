'use client';

import { useForm } from 'react-hook-form';
import { useCreateTodo } from '@/hooks/use-todos';
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

export interface AddTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AddTodoFormValues {
  title: string;
  description: string;
}

export function AddTodoDialog({ open, onOpenChange }: AddTodoDialogProps) {
  const createTodo = useCreateTodo();
  const { showFeedback } = useMutationFeedback();
  const form = useForm<AddTodoFormValues>({
    defaultValues: { title: '', description: '' },
  });

  function onSubmit(values: AddTodoFormValues) {
    createTodo.mutate(
      { title: values.title, description: values.description || undefined },
      {
        onSuccess: () => {
          showFeedback('Todo added');
          form.reset();
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
            Add New Todo
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
                      placeholder="e.g., Weekly Sync"
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
                      placeholder="Enter task details..."
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
              <Button type="submit" disabled={createTodo.isPending}>
                {createTodo.isPending ? 'Saving…' : 'Save Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

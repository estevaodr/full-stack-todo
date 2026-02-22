'use client';

import { useForm } from 'react-hook-form';
import { useCreateTodo } from '@/hooks/use-todos';
import {
  Dialog,
  DialogContent,
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
  const form = useForm<AddTodoFormValues>({
    defaultValues: { title: '', description: '' },
  });

  function onSubmit(values: AddTodoFormValues) {
    createTodo.mutate(
      { title: values.title, description: values.description || undefined },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
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
                      className="w-full h-12 px-4 rounded-lg bg-white dark:bg-slate-900 border border-border text-foreground placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
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
                      className="w-full p-4 rounded-lg bg-white dark:bg-slate-900 border border-border text-foreground placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                      aria-label="Description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 rounded-lg border border-border font-medium text-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTodo.isPending}
                className="h-10 px-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                Save Task
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

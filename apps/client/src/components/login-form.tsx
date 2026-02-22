'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function LoginForm() {
  const { login, error } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: LoginFormData) {
    login(data.email, data.password);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-5"
        noValidate
      >
        {error && (
          <div
            className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive rounded-lg"
            role="alert"
          >
            <span className="material-symbols-outlined text-sm text-destructive">
              error
            </span>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-[14px] font-medium text-muted-foreground ml-1">
                Email
              </FormLabel>
              <FormControl>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 rounded-[10px] text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-[14px] font-medium text-muted-foreground ml-1">
                Password
              </FormLabel>
              <FormControl>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 rounded-[10px] text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          className="w-full h-[40px] bg-primary hover:bg-[#4C7099] active:scale-[0.98] text-primary-foreground font-bold rounded-lg transition-all flex items-center justify-center"
        >
          Log In
        </button>
      </form>
    </Form>
  );
}

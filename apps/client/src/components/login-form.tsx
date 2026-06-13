'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

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
              <FormLabel className="text-[14px] font-bold text-[hsl(var(--foreground))] ml-1">
                Email
              </FormLabel>
              <FormControl>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 bg-background border border-border rounded-[10px] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
              <div className="flex items-center justify-between ml-1">
                <FormLabel className="text-[14px] font-bold text-[hsl(var(--foreground))]">
                  Password
                </FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <FormControl>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-12 px-4 bg-background border border-border rounded-[10px] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2 mt-2 mb-4">
          <input
            type="checkbox"
            id="keep-logged"
            className="size-4 rounded border-2 border-border bg-background text-primary focus-visible:ring-2 focus-visible:ring-ring checked:bg-primary checked:border-primary transition-colors"
          />
          <label
            htmlFor="keep-logged"
            className="text-[13px] font-medium text-foreground cursor-pointer"
          >
            Keep me logged in
          </label>
        </div>
        <Button type="submit" className="w-full h-12 rounded-xl text-[15px] font-bold">
          Log In
        </Button>
      </form>
    </Form>
  );
}

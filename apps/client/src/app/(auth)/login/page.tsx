import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="w-full max-w-[400px] bg-card dark:bg-slate-800 rounded-lg shadow-nord p-8 flex flex-col items-center">
      {/* App Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <span className="material-symbols-outlined text-4xl text-primary mb-2">
          task_alt
        </span>
        <h1 className="text-[28px] font-bold text-primary tracking-tight">
          TodoApp
        </h1>
        <p className="text-base text-muted-foreground mt-1">Welcome back</p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-[14px] text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

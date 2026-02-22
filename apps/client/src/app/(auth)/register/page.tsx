import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
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
        <p className="text-base text-muted-foreground mt-1">
          Create your account
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-[14px] text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

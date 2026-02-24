import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="w-full max-w-[400px] bg-card rounded-3xl p-10 flex flex-col items-center shadow-nord">
      {/* App Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <Image 
          src="/logo.svg" 
          alt="Todo App Logo" 
          width={64} 
          height={64} 
          className="mb-4 drop-shadow-sm transition-transform hover:scale-105" 
          priority
        />
        <h1 className="text-[28px] font-bold text-primary tracking-tight">
          TodoApp
        </h1>
        <p className="text-[15px] font-medium mt-1 text-[hsl(var(--foreground))]">Welcome back</p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="mt-6 text-center w-full">
        <p className="text-[14px] font-medium text-[hsl(var(--foreground))]">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

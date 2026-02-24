import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
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
        <p className="text-[15px] text-muted-foreground font-medium mt-1">
          Create your account
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Footer */}
      <div className="mt-8 text-center w-full">
        <p className="text-[14px] font-medium text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

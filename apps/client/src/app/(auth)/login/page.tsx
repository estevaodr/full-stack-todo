import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="w-full max-w-[400px] bg-[#F2F4F7] dark:bg-slate-800 rounded-3xl p-10 flex flex-col items-center">
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
        <h1 className="text-[28px] font-bold text-[#6686B3] tracking-tight">
          Todo App
        </h1>
        <p className="text-[15px] text-slate-500 font-medium mt-1">Welcome back</p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="mt-8 text-center w-full">
        <p className="text-[14px] font-medium text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[#6686B3] font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

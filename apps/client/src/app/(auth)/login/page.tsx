import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="w-full max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
      <LoginForm />
    </main>
  );
}

import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <main className="w-full max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Register</h1>
      <RegisterForm />
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function ProtectedLayoutClient() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4"
      role="banner"
    >
      <h1 className="text-xl font-semibold">Todo Dashboard</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}

'use client';

import Image from 'next/image';
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
      className="h-16 bg-card border-b border-border fixed top-0 w-full z-50 flex items-center justify-between px-8"
      role="banner"
    >
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="TodoApp logo" width={32} height={32} className="rounded-lg" priority />
        <h1 className="text-xl font-bold tracking-tight">TodoApp</h1>
      </div>
      <div className="flex items-center gap-4">
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

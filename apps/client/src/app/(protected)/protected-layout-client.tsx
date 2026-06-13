'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
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
      className="fixed top-0 z-50 w-full border-b border-border bg-card pt-[env(safe-area-inset-top,0px)]"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between gap-3 px-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo.svg"
            alt="TodoApp logo"
            width={32}
            height={32}
            className="shrink-0 rounded-lg"
            priority
          />
          <h1 className="truncate text-xl font-bold tracking-tight">TodoApp</h1>
        </div>
        <div
          className="flex shrink-0 items-center gap-2 sm:gap-3"
          role="group"
          aria-label="Account and display settings"
        >
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            className="size-11 shrink-0 touch-manipulation p-0 sm:h-11 sm:w-auto sm:gap-2 sm:px-4"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

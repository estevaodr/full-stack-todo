'use client';

import { useCallback } from 'react';
import { useAuthContext } from '@/providers/auth-provider';

export function useAuth() {
  const { user, isLoading, refresh } = useAuthContext();

  const login = useCallback(
    async (email: string, password: string) => {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    await refresh();
  }, [refresh]);

  const register = useCallback(
    async (email: string, password: string) => {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      await refresh();
    },
    [refresh]
  );

  return {
    user,
    isLoading,
    refresh,
    login,
    logout,
    register,
  };
}

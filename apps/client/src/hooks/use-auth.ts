'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';

const GENERIC_LOGIN_ERROR = 'Invalid email or password.';
const GENERIC_REGISTER_ERROR = 'Registration failed. Please check your details.';

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, error, setError, refresh } = useAuthContext();

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.message as string) ?? GENERIC_LOGIN_ERROR);
        return;
      }
      await refresh();
      router.push('/dashboard');
    },
    [refresh, setError, router]
  );

  const logout = useCallback(async () => {
    setError(null);
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    await refresh();
    router.push('/login');
  }, [refresh, setError, router]);

  const register = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.message as string) ?? GENERIC_REGISTER_ERROR);
        return;
      }
      await refresh();
      router.push('/dashboard');
    },
    [refresh, setError, router]
  );

  return {
    user,
    isLoading,
    error,
    setError,
    refresh,
    login,
    logout,
    register,
  };
}

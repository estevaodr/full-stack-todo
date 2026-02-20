'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wraps next-themes ThemeProvider. Theme preference persists across page
 * refreshes via next-themes' default localStorage (key: "theme").
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}

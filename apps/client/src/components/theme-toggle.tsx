'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    if (resolvedTheme === 'dark') setTheme('light');
    else if (resolvedTheme === 'light') setTheme('system');
    else setTheme('dark');
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      aria-label={`Theme: ${theme ?? 'system'}. Switch theme.`}
    >
      {resolvedTheme === 'dark' ? 'Dark' : resolvedTheme === 'light' ? 'Light' : 'System'}
    </Button>
  );
}

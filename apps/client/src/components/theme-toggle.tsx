'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function cycleTheme() {
    if (resolvedTheme === 'dark') setTheme('light');
    else if (resolvedTheme === 'light') setTheme('system');
    else setTheme('dark');
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Theme: system. Switch theme."
      >
        System
      </Button>
    );
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

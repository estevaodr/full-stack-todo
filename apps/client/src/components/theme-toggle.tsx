'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-lg bg-white/50 dark:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
          light_mode
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="p-2 rounded-lg bg-white/50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors"
      onClick={toggleTheme}
      aria-label={`Theme: ${resolvedTheme}. Switch theme.`}
    >
      <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
        {resolvedTheme === 'dark' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}

'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
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

  const getIcon = () => {
    if (theme === 'dark') return 'dark_mode';
    if (theme === 'light') return 'light_mode';
    return 'auto';
  };

  return (
    <button
      type="button"
      className="p-2 rounded-lg bg-white/50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors"
      onClick={toggleTheme}
      aria-label={`Theme: ${theme}. Switch theme.`}
      title={`Current: ${theme}`}
    >
      <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
        {getIcon()}
      </span>
    </button>
  );
}

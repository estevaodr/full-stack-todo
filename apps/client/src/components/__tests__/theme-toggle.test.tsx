import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../theme-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders dark_mode icon when resolved theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      systemTheme: 'dark',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /theme: dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme: dark/i }).querySelector('svg')).toBeInTheDocument();
  });

  it('renders light_mode icon when resolved theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /theme: light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme: light/i }).querySelector('svg')).toBeInTheDocument();
  });

  it('calls setTheme("light") when clicked and current theme is dark', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      systemTheme: 'dark',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme("dark") when clicked and current theme is light', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

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

  it('renders moon icon and switch label when resolved theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      systemTheme: 'dark',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('size-11');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders sun icon and switch label when resolved theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light',
      themes: ['light', 'dark'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button.querySelector('svg')).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));

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
    await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

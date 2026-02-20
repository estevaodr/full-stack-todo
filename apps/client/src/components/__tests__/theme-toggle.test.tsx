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

  it('renders "Dark" when resolved theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      systemTheme: 'dark',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /theme: dark\. switch theme/i })).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('renders "Light" when resolved theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /theme: light\. switch theme/i })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('renders "System" when resolved theme is not light or dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: undefined,
      systemTheme: 'light',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /theme: system\. switch theme/i })).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme("light") when clicked and current theme is dark', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      systemTheme: 'dark',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /switch theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme("system") when clicked and current theme is light', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /switch theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('calls setTheme("dark") when clicked and current theme is system', async () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: undefined,
      systemTheme: 'light',
      themes: ['light', 'dark', 'system'],
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /switch theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

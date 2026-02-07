import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../login-form';

const mockLogin = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    refresh: vi.fn(),
    login: (...args: unknown[]) => mockLogin(...args),
    logout: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders email input, password input, and submit button', () => {
    render(<LoginForm />);

    expect(
      screen.getByRole('textbox', { name: /email/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in|log in/i })
    ).toBeInTheDocument();
  });

  it('shows validation error for invalid email on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'not-an-email'
    );
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    await user.click(screen.getByRole('button', { name: /sign in|log in/i }));

    expect(
      await screen.findByText(/please enter a valid email/i)
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error when password is empty on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.click(screen.getByRole('button', { name: /sign in|log in/i }));

    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with email and password on valid submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    render(<LoginForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in|log in/i }));

    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
  });
});

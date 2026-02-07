import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../register-form';

const mockRegister = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    refresh: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: (...args: unknown[]) => mockRegister(...args),
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('renders email, password, confirm password inputs and submit button', () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole('textbox', { name: /email/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm.*password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /register|sign up/i })
    ).toBeInTheDocument();
  });

  it('shows validation error for invalid email on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'not-an-email'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(
      screen.getByLabelText(/confirm.*password/i),
      'Password1'
    );
    await user.click(
      screen.getByRole('button', { name: /register|sign up/i })
    );

    expect(
      await screen.findByText(/please enter a valid email/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error when password is too short on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Short1');
    await user.type(screen.getByLabelText(/confirm.*password/i), 'Short1');
    await user.click(
      screen.getByRole('button', { name: /register|sign up/i })
    );

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error when password lacks uppercase on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'password1');
    await user.type(screen.getByLabelText(/confirm.*password/i), 'password1');
    await user.click(
      screen.getByRole('button', { name: /register|sign up/i })
    );

    expect(
      await screen.findByText(/at least one uppercase letter/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error when passwords do not match on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm.*password/i), 'Password2');
    await user.click(
      screen.getByRole('button', { name: /register|sign up/i })
    );

    expect(
      await screen.findByText(/passwords don't match/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with email and password on valid submit', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);
    render(<RegisterForm />);

    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm.*password/i), 'Password1');
    await user.click(
      screen.getByRole('button', { name: /register|sign up/i })
    );

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith('user@example.com', 'Password1');
  });
});

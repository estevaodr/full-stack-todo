/**
 * Integration tests for auth flow: register → login → access dashboard → logout.
 * Uses MSW to mock the Next.js auth API routes and a test wrapper with AuthProvider.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '@/providers/auth-provider';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { useAuth } from '@/hooks/use-auth';
import { server } from '@/mocks/server';

function pathname(path: string) {
  const segment = path.replace(/^\//, '');
  return ({ request }: { request: Request }) =>
    request.url.includes(segment);
}

function SessionGate({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  if (isLoading) return createElement('p', null, 'Loading...');
  if (user) {
    return createElement(
      'div',
      null,
      createElement('p', { 'data-testid': 'dashboard' }, `Dashboard: ${user.email}`),
      createElement('button', { type: 'button', onClick: () => logout() }, 'Logout'),
      children
    );
  }
  return createElement('div', null, children);
}

function AuthFlowTestApp() {
  return createElement(
    AuthProvider,
    null,
    createElement(
      SessionGate,
      null,
      createElement('div', { 'data-testid': 'auth-forms' },
        createElement('div', { 'data-testid': 'register-section' },
          createElement('h2', null, 'Register'),
          createElement(RegisterForm)
        ),
        createElement('div', { 'data-testid': 'login-section' },
          createElement('h2', null, 'Login'),
          createElement(LoginForm)
        )
      )
    )
  );
}

describe('Auth flow integration', () => {
  let sessionUser: { userId: string; email: string } | null = null;

  beforeEach(() => {
    sessionUser = null;
    server.use(
      http.post(pathname('/api/auth/register'), async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };
        sessionUser = { userId: 'user-1', email: body.email };
        return HttpResponse.json({ ok: true }, { status: 201 });
      }),
      http.post(pathname('/api/auth/login'), async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };
        sessionUser = { userId: 'user-1', email: body.email };
        return HttpResponse.json({ ok: true }, { status: 200 });
      }),
      http.get(pathname('/api/auth/session'), () => {
        if (sessionUser) {
          return HttpResponse.json({
            userId: sessionUser.userId,
            email: sessionUser.email,
          });
        }
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post(pathname('/api/auth/logout'), () => {
        sessionUser = null;
        return HttpResponse.json({ ok: true }, { status: 200 });
      })
    );
  });

  it('register → access dashboard → logout', async () => {
    const user = userEvent.setup();
    render(createElement(AuthFlowTestApp));

    await waitFor(() => {
      expect(screen.getByTestId('auth-forms')).toBeInTheDocument();
    });

    const registerSection = screen.getByTestId('register-section');
    await user.type(
      within(registerSection).getByRole('textbox', { name: /email/i }),
      'new@example.com'
    );
    await user.type(
      within(registerSection).getByLabelText(/^password$/i),
      'Password1'
    );
    await user.type(
      within(registerSection).getByLabelText(/confirm.*password/i),
      'Password1'
    );
    await user.click(
      within(registerSection).getByRole('button', { name: /register/i })
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText(/new@example\.com/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      expect(screen.getByTestId('auth-forms')).toBeInTheDocument();
    });
  });

  it('login → access dashboard → logout', async () => {
    const user = userEvent.setup();
    render(createElement(AuthFlowTestApp));

    await waitFor(() => {
      expect(screen.getByTestId('auth-forms')).toBeInTheDocument();
    });

    const loginSection = screen.getByTestId('login-section');
    await user.type(
      within(loginSection).getByRole('textbox', { name: /email/i }),
      'user@example.com'
    );
    await user.type(
      within(loginSection).getByLabelText(/^password$/i),
      'password123'
    );
    await user.click(within(loginSection).getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText(/user@example\.com/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });
});

import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Navigation / Route protection', () => {
  test('unauthenticated user visiting /dashboard is redirected to /login', async ({
    unauthenticated,
  }) => {
    await unauthenticated.goto('/dashboard');

    await expect(unauthenticated).toHaveURL(/\/login/);
    const loginPage = new LoginPage(unauthenticated);
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('authenticated user visiting /login is redirected to /dashboard', async ({
    authenticated,
  }) => {
    await authenticated.goto('/login');

    await expect(authenticated).toHaveURL(/\/dashboard/);
    const dashboard = new DashboardPage(authenticated);
    await expect(dashboard.mainSection).toBeVisible();
  });

  test('authenticated user visiting /register is redirected to /dashboard', async ({
    authenticated,
  }) => {
    await authenticated.goto('/register');

    await expect(authenticated).toHaveURL(/\/dashboard/);
    const dashboard = new DashboardPage(authenticated);
    await expect(dashboard.mainSection).toBeVisible();
  });
});

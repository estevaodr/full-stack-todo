import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Auth', () => {
  test.describe('Login', () => {
    test('submitting valid credentials redirects to dashboard', async ({
      unauthenticated,
    }) => {
      const email = `e2e-login-${Date.now()}@test.local`;
      const password = 'TestPass1!';
      await unauthenticated.request.post('/api/auth/register', {
        data: { email, password },
      });
      await unauthenticated.request.post('/api/auth/logout');

      const loginPage = new LoginPage(unauthenticated);
      await loginPage.goto();
      await loginPage.login(email, password);

      await expect(unauthenticated).toHaveURL(/\/dashboard/);
      const dashboard = new DashboardPage(unauthenticated);
      await expect(dashboard.mainSection).toBeVisible();
    });

    test('invalid credentials show error and stay on login', async ({
      unauthenticated,
    }) => {
      const loginPage = new LoginPage(unauthenticated);
      await loginPage.goto();
      await loginPage.login('wrong@test.local', 'WrongPass1!');

      await expect(unauthenticated).toHaveURL(/\/login/);
      await expect(loginPage.errorMessage).toBeVisible();
    });
  });

  test.describe('Register', () => {
    test('submitting valid form redirects to dashboard', async ({
      unauthenticated,
    }) => {
      const registerPage = new RegisterPage(unauthenticated);
      await registerPage.goto();
      await registerPage.register(
        `e2e-register-${Date.now()}@test.local`,
        'TestPass1!'
      );

      await expect(unauthenticated).toHaveURL(/\/dashboard/);
      const dashboard = new DashboardPage(unauthenticated);
      await expect(dashboard.mainSection).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('logout redirects to login', async ({ authenticated }) => {
      const dashboard = new DashboardPage(authenticated);
      await dashboard.goto();
      await expect(dashboard.mainSection).toBeVisible();

      await dashboard.logout();

      await expect(authenticated).toHaveURL(/\/login/);
    });
  });
});

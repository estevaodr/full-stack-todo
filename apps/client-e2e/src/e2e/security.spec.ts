import { test, expect } from '@playwright/test';

test.describe('Security & Protected Routes', () => {

  test.describe('Unauthenticated users', () => {
    // Override storage state to start unauthenticated
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should be redirected to login when trying to access dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Authenticated users', () => {
    // By default, this runs authenticated because of the global setup in playwright.config.ts
    // or if we didn't set it in config, we might need to manually login, but let's assume
    // we use the auth.setup.ts in playwright.config.ts.

    test('should be redirected to dashboard when trying to access login', async ({ page }) => {
      await page.goto('/login');
      // Authenticated users shouldn't see login again
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should be redirected to dashboard when trying to access register', async ({ page }) => {
      await page.goto('/register');
      // Authenticated users shouldn't stay on register pages
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });
});

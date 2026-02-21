import { test as base, expect, type Page } from '@playwright/test';

/**
 * E2E auth fixtures: authenticated and unauthenticated contexts.
 *
 * - **authenticated**: Registers a unique test user via /api/auth/register (which creates
 *   the user and logs in), so the page has a valid session cookie and can access /dashboard.
 * - **unauthenticated**: A plain page with no session (default); use for login/register
 *   flows and route-protection tests.
 *
 * Requires the Next.js app and the backend API to be running (webServer in config starts
 * Next.js; ensure the API server is up for E2E that uses authenticated).
 */
const test = base.extend<{
  authenticated: Page;
  unauthenticated: Page;
}>({
  authenticated: async ({ page }, use) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@test.local`;
    const password = 'TestPass1!';
    const res = await page.request.post('/api/auth/register', {
      data: { email, password },
    });
    if (!res.ok()) {
      throw new Error(
        `Auth fixture: register failed ${res.status()} ${await res.text()}`
      );
    }
    await use(page);
  },

  unauthenticated: async ({ page }, use) => {
    await use(page);
  },
});

export { test, expect };

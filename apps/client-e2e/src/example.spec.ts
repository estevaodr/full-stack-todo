import { test, expect } from '@playwright/test';

/**
 * Example test - Basic smoke test to verify the application loads
 * This is a simple test to ensure the app is accessible
 */
test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain the app title
  await expect(page.locator('h1')).toContainText('Todo App');
});

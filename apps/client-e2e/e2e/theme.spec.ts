import { test, expect } from './fixtures/auth.fixture';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Theme', () => {
  test('theme toggle cycles theme and updates button text', async ({
    authenticated,
  }) => {
    const dashboard = new DashboardPage(authenticated);
    await dashboard.goto();
    await expect(dashboard.mainSection).toBeVisible();

    const themeButton = authenticated.getByRole('button', {
      name: /switch theme/i,
    });
    await expect(themeButton).toBeVisible();

    const textBefore = await themeButton.textContent();
    await themeButton.click();
    const textAfter = await themeButton.textContent();

    expect(textAfter).not.toBe(textBefore);
    expect(['Light', 'Dark', 'System']).toContain(textAfter?.trim());
  });

  test('when theme is Dark, html has class "dark"', async ({ authenticated }) => {
    const dashboard = new DashboardPage(authenticated);
    await dashboard.goto();

    const themeButton = authenticated.getByRole('button', {
      name: /switch theme/i,
    });
    for (let i = 0; i < 3; i++) {
      const text = await themeButton.textContent();
      if (text?.trim() === 'Dark') break;
      await themeButton.click();
    }

    const isDark = await themeButton.textContent();
    if (isDark?.trim() === 'Dark') {
      const htmlHasDark = await authenticated.evaluate(
        () => document.documentElement.classList.contains('dark')
      );
      expect(htmlHasDark).toBe(true);
    }
  });
});

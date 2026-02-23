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

    const textBefore = await themeButton.getAttribute('title');
    await themeButton.click();
    const textAfter = await themeButton.getAttribute('title');

    expect(textAfter).not.toBe(textBefore);
    expect(['Current: light', 'Current: dark', 'Current: system']).toContain(textAfter);
  });

  test('when theme is Dark, html has class "dark"', async ({ authenticated }) => {
    const dashboard = new DashboardPage(authenticated);
    await dashboard.goto();

    const themeButton = authenticated.getByRole('button', {
      name: /switch theme/i,
    });
    for (let i = 0; i < 3; i++) {
      const text = await themeButton.getAttribute('title');
      if (text === 'Current: dark') break;
      await themeButton.click();
    }

    const isDark = await themeButton.getAttribute('title');
    if (isDark === 'Current: dark') {
      const htmlHasDark = await authenticated.evaluate(
        () => document.documentElement.classList.contains('dark')
      );
      expect(htmlHasDark).toBe(true);
    }
  });
});

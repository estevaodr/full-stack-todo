import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';
import { LoginPage } from '../pages/login.page';

// Override global storage state to start unauthenticated for these tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Flows', () => {
  test('should allow a new user to register successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const email = `newuser_${Date.now()}@example.com`;
    await registerPage.register(email, 'SecurePa$$word1');

    // On success, user should be redirected to the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    // There should be some indication they are on the dashboard
    // We can check if "Log out" button or a Dashboard heading is visible
  });

  test('should display an error when registering with a duplicate email', async ({ page }) => {
    const email = `duplicate_${Date.now()}@example.com`;
    const registerPage = new RegisterPage(page);
    
    // Register the first time
    await registerPage.goto();
    await registerPage.register(email, 'SecurePa$$word1');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Clear cookies explicitly if needed, but going to register page directly might work if no auth guard redirects them. 
    // We could also just create a new context.
    const browser = page.context().browser();
    if (!browser) throw new Error('Browser is null');
    const context = await browser.newContext();
    const newPage = await context.newPage();
    
    const newRegisterPage = new RegisterPage(newPage);
    await newRegisterPage.goto();
    await newRegisterPage.register(email, 'SecurePa$$word1');

    await expect(newRegisterPage.errorMessage).toBeVisible();
    await expect(newRegisterPage.errorMessage).toContainText(/already exists|in use/i);
    
    await context.close();
  });

  test('should allow an existing user to log in successfully', async ({ page }) => {
    // 1. Create a user
    const email = `login_${Date.now()}@example.com`;
    const password = 'SecurePa$$word1';
    
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(email, password);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Open login page in fresh context
    const browser = page.context().browser();
    if (!browser) throw new Error('Browser is null');
    const context = await browser.newContext();
    const newPage = await context.newPage();
    
    const loginPage = new LoginPage(newPage);
    await loginPage.goto();
    await loginPage.login(email, password);

    await expect(newPage).toHaveURL(/.*\/dashboard/);
    await context.close();
  });

  test('should display an error for invalid login credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('nonexistent@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid|incorrect/i);
  });
});

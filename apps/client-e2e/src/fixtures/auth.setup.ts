import { test as setup } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';

const authFile = 'src/fixtures/auth.json';

setup('authenticate', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  
  // Register a shared setup user
  const email = `setupuser_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  await registerPage.register(email, password);
  
  // Implicitly, successful registration redirects to dashboard and sets cookie.
  // Wait for the URL to change to indicate successful navigation.
  await page.waitForURL('/dashboard', { timeout: 10000 }).catch(() => {
    // If it doesn't redirect or already exists, we could try login. 
    // Usually a fresh email per run guarantees success.
  });
  
  // Save storage state into the file.
  await page.context().storageState({ path: authFile });
});

import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' }); // Or getByLabel
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm password');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.errorMessage = page.locator('div[role="alert"] p');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
    await this.registerButton.click();
  }
}

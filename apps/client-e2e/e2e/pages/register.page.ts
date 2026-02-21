import type { Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly path = '/register';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.path);
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Password');
  }

  get confirmPasswordInput() {
    return this.page.getByLabel('Confirm password');
  }

  get registerButton() {
    return this.page.getByRole('button', { name: /register/i });
  }

  get errorMessage() {
    return this.page.getByRole('alert');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async submit() {
    await this.registerButton.click();
  }

  /** Fill email, password, confirm password and submit. */
  async register(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.submit();
  }
}

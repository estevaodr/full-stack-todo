import type { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly path = '/login';

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

  get signInButton() {
    return this.page.getByRole('button', { name: /sign in/i });
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

  async submit() {
    await this.signInButton.click();
  }

  /** Fill email and password and submit. */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}

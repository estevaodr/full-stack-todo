import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly path = '/dashboard';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.path);
  }

  get mainSection() {
    return this.page.getByRole('main', { name: 'Todo items' });
  }

  get loadingMessage() {
    return this.page.getByRole('status', { name: /loading todos/i });
  }

  get errorMessage() {
    return this.page.getByRole('alert');
  }

  get logoutButton() {
    return this.page.getByRole('button', { name: /log out/i });
  }

  /** Todo card that contains the given title (incomplete or completed list). */
  todoCard(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  /** Checkbox to toggle completion for the todo with the given title. */
  todoCheckbox(title: string): Locator {
    return this.todoCard(title).getByRole('checkbox', {
      name: 'Toggle completion',
    });
  }

  /** Edit button for the todo with the given title. */
  todoEditButton(title: string): Locator {
    return this.todoCard(title).getByRole('button', { name: /edit/i });
  }

  /** Delete button for the todo with the given title. */
  todoDeleteButton(title: string): Locator {
    return this.todoCard(title).getByRole('button', { name: /delete/i });
  }

  async toggleTodo(title: string) {
    await this.todoCheckbox(title).click();
  }

  async clickEditTodo(title: string) {
    await this.todoEditButton(title).click();
  }

  async clickDeleteTodo(title: string) {
    await this.todoDeleteButton(title).click();
  }

  /** Open edit dialog, fill title/description, save. */
  async editTodo(
    title: string,
    updates: { title?: string; description?: string }
  ) {
    await this.clickEditTodo(title);
    const dialog = this.page.getByRole('dialog', { name: 'Edit todo' });
    await dialog.waitFor({ state: 'visible' });
    if (updates.title != null) {
      await dialog.getByRole('textbox', { name: /title/i }).fill(updates.title);
    }
    if (updates.description != null) {
      await dialog
        .getByRole('textbox', { name: /description/i })
        .fill(updates.description);
    }
    await dialog.getByRole('button', { name: /save/i }).click();
    await dialog.waitFor({ state: 'hidden' });
  }

  async deleteTodo(title: string) {
    await this.clickDeleteTodo(title);
  }

  async logout() {
    await this.logoutButton.click();
  }
}

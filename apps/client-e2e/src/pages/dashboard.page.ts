import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly floatAddButton: Locator;
  readonly dialogTitleInput: Locator;
  readonly dialogDescriptionInput: Locator;
  readonly dialogSaveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.floatAddButton = page.getByRole('button', { name: 'Add Todo' });
    this.dialogTitleInput = page.getByLabel('Title');
    this.dialogDescriptionInput = page.getByLabel('Description');
    this.dialogSaveButton = page.getByRole('button', { name: 'Save Task' });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async openAddDialog() {
    await this.floatAddButton.click();
    await expect(this.dialogTitleInput).toBeVisible();
  }

  async addTask(title: string, description?: string) {
    await this.openAddDialog();
    await this.dialogTitleInput.fill(title);
    if (description) {
      await this.dialogDescriptionInput.fill(description);
    } else {
      await this.dialogDescriptionInput.fill('Generated description');
    }
    await this.dialogSaveButton.click();
    // Wait for dialog to close
    await expect(this.dialogTitleInput).toBeHidden();
  }

  getTaskItem(title: string) {
    return this.page.locator('[role="listitem"]').filter({ hasText: title });
  }

  async toggleTaskStatus(title: string, toComplete: boolean) {
    const task = this.getTaskItem(title);
    const label = toComplete ? 'Mark as complete' : 'Mark as incomplete';
    const button = task.getByRole('button', { name: label });
    await button.click();
    // Verify it changed
    const newLabel = toComplete ? 'Mark as incomplete' : 'Mark as complete';
    await expect(task.getByRole('button', { name: newLabel })).toBeVisible();
  }

  async deleteTask(title: string) {
    const task = this.getTaskItem(title);
    const deleteBtn = task.getByRole('button', { name: 'Delete' });
    
    // Some buttons only appear on hover, Playwright `.click()` handles hover automatically if it's css-based,
    // but just in case we can hover first.
    await task.hover();
    await deleteBtn.click();
    // Wait for the task to be removed from the DOM
    await expect(task).toBeHidden();
  }
}

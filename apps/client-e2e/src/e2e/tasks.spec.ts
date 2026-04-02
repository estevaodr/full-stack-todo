import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Task Lifecycle Flows', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should allow a user to create a new task correctly', async () => {
    const taskTitle = `New Task ${Date.now()}`;
    const taskDesc = 'Test description';

    await dashboardPage.addTask(taskTitle, taskDesc);

    const taskItem = dashboardPage.getTaskItem(taskTitle);
    await expect(taskItem).toBeVisible();
    await expect(taskItem).toContainText(taskDesc);
  });

  test('should allow a user to toggle a task as completed and incomplete', async ({ page }) => {
    const taskTitle = `Toggle Task ${Date.now()}`;
    await dashboardPage.addTask(taskTitle);

    const taskItem = dashboardPage.getTaskItem(taskTitle);
    await expect(taskItem).toBeVisible();

    // Mark as complete
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'PATCH'),
      dashboardPage.toggleTaskStatus(taskTitle, true),
    ]);

    // Verify it stays complete across reloads
    await dashboardPage.goto();
    const taskItemReloaded = dashboardPage.getTaskItem(taskTitle);
    await expect(taskItemReloaded.getByRole('button', { name: 'Mark as incomplete' })).toBeVisible();

    // Mark as incomplete
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'PATCH'),
      dashboardPage.toggleTaskStatus(taskTitle, false),
    ]);
    await expect(taskItemReloaded.getByRole('button', { name: 'Mark as complete' })).toBeVisible();
  });

  test('should allow a user to delete a task', async ({ page }) => {
    const taskTitle = `Delete Task ${Date.now()}`;
    await dashboardPage.addTask(taskTitle);

    const taskItem = dashboardPage.getTaskItem(taskTitle);
    await expect(taskItem).toBeVisible();

    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'DELETE'),
      dashboardPage.deleteTask(taskTitle),
    ]);

    // Verify it does not show up even after reload
    await dashboardPage.goto();
    await expect(dashboardPage.getTaskItem(taskTitle)).toBeHidden();
  });
});

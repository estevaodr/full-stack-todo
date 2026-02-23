import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/auth.fixture';
import { DashboardPage } from './pages/dashboard.page';

async function createTodo(
  page: Page,
  title: string,
  description?: string
) {
  const res = await page.request.post('/api/todos', {
    data: { title, description: description ?? '' },
  });
  if (!res.ok()) {
    throw new Error(`Create todo failed ${res.status()} ${await res.text()}`);
  }
}

test.describe('Todo', () => {
  test.describe('Toggle completion', () => {
    test('toggling checkbox moves todo to completed and updates UI', async ({
      authenticated,
    }) => {
      const title = `E2E Toggle ${Date.now()}`;
      await createTodo(authenticated, title);

      const dashboard = new DashboardPage(authenticated);
      await dashboard.goto();
      await expect(dashboard.todoCard(title)).toBeVisible();

      await dashboard.toggleTodo(title);

      await expect(dashboard.todoCard(title)).toBeVisible();
      await expect(dashboard.todoCheckbox(title)).toHaveAttribute('aria-label', 'Mark as incomplete');
    });
  });

  test.describe('Edit', () => {
    test('edit dialog updates title and saves', async ({ authenticated }) => {
      const title = `E2E Edit ${Date.now()}`;
      const newTitle = 'E2E Edit Updated';
      await createTodo(authenticated, title);

      const dashboard = new DashboardPage(authenticated);
      await dashboard.goto();
      await expect(dashboard.todoCard(title)).toBeVisible();

      await dashboard.editTodo(title, { title: newTitle });

      await expect(dashboard.todoCard(newTitle)).toBeVisible();
      await expect(dashboard.todoCard(title)).not.toBeVisible();
    });
  });

  test.describe('Delete', () => {
    test('delete removes todo from list', async ({ authenticated }) => {
      const title = `E2E Delete ${Date.now()}`;
      await createTodo(authenticated, title);

      const dashboard = new DashboardPage(authenticated);
      await dashboard.goto();
      await expect(dashboard.todoCard(title)).toBeVisible();

      await dashboard.deleteTodo(title);

      await expect(dashboard.todoCard(title)).not.toBeVisible();
    });
  });
});

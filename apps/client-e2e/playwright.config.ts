import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Playwright E2E config for the Next.js client app.
 * Lives in apps/client-e2e; webServer runs both server and Next.js client.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './e2e' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'npx nx serve server',
      cwd: workspaceRoot,
      url: 'http://localhost:3000/api/v1',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npx nx serve client',
      cwd: workspaceRoot,
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});

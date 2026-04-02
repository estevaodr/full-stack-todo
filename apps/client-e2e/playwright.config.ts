import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

// Ensure asdf-managed Node is found in child processes spawned by Playwright.
// Playwright does not load shell profiles, so PATH must be set explicitly.
const asdfShims = path.join(process.env.HOME ?? '', '.asdf', 'shims');
const asdfBin = path.join(process.env.HOME ?? '', '.asdf', 'bin');
const resolvedPath = [asdfShims, asdfBin, process.env.PATH].filter(Boolean).join(':');

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testDir: './src/fixtures', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npx nx run-many --target=serve --projects=server,client --parallel',
    cwd: path.resolve(__dirname, '../..'),
    url: 'http://localhost:3000/api/v1',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      PATH: resolvedPath,
    } as Record<string, string>,
  },
});

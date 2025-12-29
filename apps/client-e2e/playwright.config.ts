import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  /* 
   * IMPORTANT: For E2E tests to work, both server and client must be running.
   * 
   * Option 1 (Recommended): Start servers manually before running tests:
   *   make run
   *   # Then in another terminal:
   *   make e2e-client
   * 
   * Option 2: Let Playwright start the client (server must be running separately):
   *   make server  # In one terminal
   *   make e2e-client  # In another terminal (Playwright will start client)
   */
  webServer: {
    // Start only the client (assumes server is already running on port 3000)
    // For full automation, start both with: make run
    command: 'npx nx serve client',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI, // Reuse in local dev, don't reuse in CI
    cwd: workspaceRoot,
    timeout: 120000, // Give server time to start
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});

# Phase 1: Quickstart for E2E Tests

If you are a developer looking to run, inspect, or build upon the E2E tests:

1. **Install Dependencies**: `npm install` (already satisfied via Nx generator)
2. **Execute Headless**: `nx e2e client-e2e` to run the suite gracefully. Playwright `webServer` will handle bootup natively.
3. **Execute via UI App**: `nx e2e client-e2e --ui` to open the Playwright inspection wizard, allowing targeted and debug test running.
4. **View Traces of Failures**: `npx playwright show-report`

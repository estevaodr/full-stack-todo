# E2E Testing Strategy

This document defines the strategy for End-to-End (E2E) testing across the Full-Stack Todo application.

## 1. Objectives

- **Verify critical user journeys**: Ensure that core features (Auth, Todo management) work correctly from a user's perspective.
- **Ensure system integration**: Validate that the React/Next.js client correctly interacts with the NestJS API.
- **Prevent regressions**: Catch breaking changes early in the development cycle.

## 2. Testing Framework

We use **Playwright** as our primary E2E testing framework to take advantage of:
- **Fast execution** via parallelization.
- **Reliability** with auto-waiting and stable selectors.
- **Rich tooling** including Trace Viewer and CodeGen.

## 3. Best Practices

### Selectors
- Use **User-Facing Locators** (e.g., `getByRole`, `getByLabel`, `getByText`) whenever possible.
- Use `data-testid` only when semantic role-based selectors are insufficient.
- **Avoid** brittle CSS selectors or deep DOM paths.

### Test Isolation
- Each test should start with a clean state.
- Use **Global Setup** for authentication to avoid repeated login steps across all tests.
- Use **Fixtures** to inject test data and manage page objects.

### Page Object Model (POM)
- Encapsulate page logic and selectors in Page Object classes.
- Keep tests focused on behavior and assertions rather than DOM manipulation.

## 4. Automation & CI/CD

- Tests should run automatically on every Pull Request.
- Store traces and screenshots for failed tests in the CI environment.
- Use sharding to reduce execution time in a cloud environment.

## 5. Maintenance

- Regularly review and prune tests that are redundant or flaky.
- Debug flakiness by analyzing traces and increasing retries for known environmental issues.
- Keep test data strategy simple; prefer creating fresh data for each test rather than relying on a complex pre-seeded database.

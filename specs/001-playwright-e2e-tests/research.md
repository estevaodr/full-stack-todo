# Phase 0: Outline & Research

## E2E Testing Framework & Monorepo Integration
- **Decision**: Use `@nx/playwright` to scaffold the `client-e2e` application.
- **Rationale**: `nx` natively provides testing generators that seamlessly integrate Playwright dependencies, targets, and configurations into the workspace, respecting the codebase's existing structures.
- **Alternatives considered**: Raw Playwright installation in the `apps/client` project. Rejected because it violates Nx separation of testing concerns and bloats the application dependencies.

## E2E Authentication Management
- **Decision**: Use `@playwright/test` storage state caching (global setup) to inject pre-authenticated contexts into tests that need it.
- **Rationale**: Per `FR-004`, we must avoid UI login overhead for task tests to meet the under 3 minutes execution criterion (`SC-002`).
- **Alternatives considered**: Logging in through the UI for every test. Rejected due to execution time costs.

## State/Data Seeding Strategy
- **Decision**: Test-level semantic isolation. Each test creates localized data via the API and validates its effects via the UI.
- **Rationale**: Per the `E2E_TESTING_STRATEGY.md` and Constitution (DRY, KISS, YAGNI), keeping test data simple and isolated prevents cross-suite flakiness without needing complex database seeding infrastructure before each run.
- **Alternatives considered**: Resetting the PostgreSQL database before each test. Rejected as it prevents heavy local parallelization.

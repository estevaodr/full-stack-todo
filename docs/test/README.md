# Testing Documentation

Welcome to the testing documentation directory. This project follows a comprehensive testing strategy that includes Unit, Integration, and End-to-End (E2E) tests.

## Documentation Index

1. [BDD Scenarios](./BDD_SCENARIOS.md)
   Defines the user journeys and behavior-driven scenarios that guide our test automation.

2. [E2E Testing Strategy](./E2E_TESTING_STRATEGY.md)
   Outlines our approach to high-level testing, including framework selection, best practices, and automation rules.

3. [API Integration Testing](./API_INTEGRATION_TESTING.md)
   Deep dive into server-side integration testing using NestJS and Supertest.

## Quick Commands

### Unit Tests
```bash
# Run all unit tests
npx nx run-many --target=test --all

# Run tests for a specific library
npx nx test server-feature-todo
```

### Future E2E Tests
*Note: E2E infrastructure is currently being revitalized.*
- **Planned target**: `npx nx e2e client-e2e`
- **Planned engine**: Playwright

## Coverage Goals

- **Unit Tests**: >80% code coverage for core business logic in services and controllers.
- **E2E Tests**: 100% coverage of the critical paths defined in `BDD_SCENARIOS.md`.

# Testing Documentation

This directory contains comprehensive documentation about testing in the Full Stack Todo project.

## Documentation Files

### [Running Tests](./RUNNING_TESTS.md)
Complete guide on how to run tests, including:
- Quick start commands
- Running specific test suites
- Test coverage
- Understanding test output
- Troubleshooting common issues
- Best practices

## Quick Reference

### Run All Unit Tests
```bash
npx nx run-many --target=test --all
```

### Run All Integration Tests (E2E)
```bash
npx nx run-many --target=e2e --all
```

### Run Tests for a Project
```bash
# Unit tests
npx nx test server-feature-todo

# Integration tests
npx nx e2e server-e2e
```

### Run Tests with Coverage
```bash
npx nx test server-feature-todo --coverage
```

### Run Tests in Watch Mode
```bash
npx nx test server-feature-todo --watch
```

## Test Structure

The project uses:
- **Jest** as the test runner
- **Nx** for test orchestration
- **NestJS Testing Module** for dependency injection in unit tests
- **Supertest** for HTTP integration testing
- **TypeORM Mocks** for database operations in unit tests

## Test Types

### Unit Tests
Test individual components in isolation:
- **Controller Tests**: `libs/server/feature-todo/src/lib/*.controller.spec.ts`
- **Service Tests**: `libs/server/feature-todo/src/lib/*.service.spec.ts`
- **Component Tests**: `libs/client/**/*.spec.ts`

### Integration Tests (E2E)
Test multiple components working together:
- **Server Integration Tests**: `apps/server-e2e/src/server/todo-controller.spec.ts`
  - Tests full HTTP request/response cycle
  - Includes validation pipes and middleware
  - Verifies API endpoints work correctly end-to-end
- **Client Integration Tests**: `apps/client-e2e/src/**/*.spec.ts`
  - Tests full application flow from user's perspective

## Test Locations

- **Unit Tests**: `libs/**/src/**/*.spec.ts`
- **Integration Tests**: `apps/*-e2e/src/**/*.spec.ts`

## Learning Resources

The test files include extensive comments for junior developers, explaining:
- What unit tests are and why we use them
- What integration tests are and how they differ from unit tests
- How mocks work and when to use them
- Dependency injection in NestJS
- Testing patterns and best practices
- Error handling in tests
- HTTP testing with Supertest

Start by reading the test files themselves - they contain educational comments!

### Key Test Files to Review

1. **Unit Test Example**: `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts`
   - Shows how to test controllers in isolation
   - Demonstrates mocking dependencies

2. **Integration Test Example**: `apps/server-e2e/src/server/todo-controller.spec.ts`
   - Shows how to test the full HTTP request/response cycle
   - Demonstrates testing with validation pipes and middleware
   - Includes comprehensive API endpoint testing

## Related Documentation

- [Seed Script Documentation](../scripts/SEED_SCRIPT.md) - Database seeding
- [Full Stack Development Series Part 7](../references/full_stack_developmen_series_part_7.md) - Testing guide from the blog series



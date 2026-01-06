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

### Run All Tests
```bash
npx nx run-many --target=test --all
```

### Run Tests for a Project
```bash
npx nx test server-feature-todo
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
- **NestJS Testing Module** for dependency injection in tests
- **TypeORM Mocks** for database operations

## Test Locations

- **Controller Tests**: `libs/server/feature-todo/src/lib/*.controller.spec.ts`
- **Service Tests**: `libs/server/feature-todo/src/lib/*.service.spec.ts`
- **E2E Tests**: `apps/*-e2e/src/**/*.spec.ts`

## Learning Resources

The test files include extensive comments for junior developers, explaining:
- What unit tests are and why we use them
- How mocks work and when to use them
- Dependency injection in NestJS
- Testing patterns and best practices
- Error handling in tests

Start by reading the test files themselves - they contain educational comments!

## Related Documentation

- [Seed Script Documentation](../scripts/SEED_SCRIPT.md) - Database seeding
- [Full Stack Development Series Part 7](../references/full_stack_developmen_series_part_7.md) - Testing guide from the blog series



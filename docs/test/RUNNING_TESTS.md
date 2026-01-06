# Running Tests - Complete Guide

This guide explains how to run tests in the Full Stack Todo project, covering different scenarios and options.

## Table of Contents

- [Quick Start](#quick-start)
- [Running Tests with Nx](#running-tests-with-nx)
- [Running Integration Tests (E2E)](#running-integration-tests-e2e)
- [Running Specific Test Suites](#running-specific-test-suites)
- [Running Individual Tests](#running-individual-tests)
- [Test Coverage](#test-coverage)
- [Understanding Test Output](#understanding-test-output)
- [Test Types](#test-types)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Quick Start

The fastest way to run all tests in the project:

```bash
npx nx run-many --target=test --all
```

Or to run tests for a specific project:

```bash
npx nx test server-feature-todo
```

## Running Tests with Nx

### Run All Tests

Run all tests across the entire workspace:

```bash
npx nx run-many --target=test --all
```

This will execute all test suites in the project and show you a summary of results.

### Run Tests for a Specific Project

To run tests for a specific project, use the project name:

```bash
# Run tests for the server-feature-todo library
npx nx test server-feature-todo

# Run tests for the server application
npx nx test server

# Run tests for the client application
npx nx test client
```

### Run Tests in Watch Mode

Watch mode automatically re-runs tests when files change. This is great for development:

```bash
npx nx test server-feature-todo --watch
```

**Tip:** Press `a` to run all tests, `f` to run only failed tests, `q` to quit watch mode.

### Run Tests with Verbose Output

Get more detailed information about what's happening:

```bash
npx nx test server-feature-todo --verbose
```

## Running Integration Tests (E2E)

Integration tests verify that multiple components work together correctly, testing the full HTTP request/response cycle.

### Run Server Integration Tests

Run all server integration tests:

```bash
npx nx e2e server-e2e
```

Or using the Makefile:

```bash
make e2e-server
```

### Run Client Integration Tests

Run all client integration tests:

```bash
npx nx e2e client-e2e
```

Or using the Makefile:

```bash
make e2e-client
```

### Run All Integration Tests

Run both server and client integration tests:

```bash
npx nx run-many --target=e2e --all
```

Or using the Makefile:

```bash
make e2e
```

### What Integration Tests Cover

The server integration tests (`apps/server-e2e/src/server/todo-controller.spec.ts`) verify:

- **GET /api/v1/todos** - Retrieving all todos
- **POST /api/v1/todos** - Creating new todos with validation
- **GET /api/v1/todos/:id** - Retrieving a specific todo
- **PUT /api/v1/todos/:id** - Full update of a todo
- **PATCH /api/v1/todos/:id** - Partial update of a todo
- **DELETE /api/v1/todos/:id** - Deleting a todo
- **Validation** - Request validation using ValidationPipe
- **Error Handling** - Proper HTTP status codes and error messages
- **API Contract** - Endpoints match expected client behavior

Integration tests use `supertest` to make actual HTTP requests and verify the complete request/response cycle, including middleware, validation pipes, and error handling.

## Running Specific Test Suites

### Run Only Controller Tests

If you want to run only the controller tests:

```bash
npx nx test server-feature-todo --testPathPattern=controller
```

### Run Only Service Tests

To run only the service tests:

```bash
npx nx test server-feature-todo --testPathPattern=service
```

### Run Only Integration Tests

To run only integration tests:

```bash
# Server integration tests
npx nx e2e server-e2e

# Client integration tests
npx nx e2e client-e2e
```

### Run Tests Matching a Pattern

Run tests that match a specific pattern in their name:

```bash
# Run tests with "getAll" in the name
npx nx test server-feature-todo --testNamePattern="getAll"

# Run tests with "update" in the name
npx nx test server-feature-todo --testNamePattern="update"

# Run integration tests matching a pattern
npx nx e2e server-e2e --testNamePattern="should return"
```

## Running Individual Tests

### Run a Single Test File

Run tests from a specific file:

```bash
npx nx test server-feature-todo --testPathPattern=server-feature-todo.controller.spec
```

### Run a Single Test Case

To run a specific test by name:

```bash
npx nx test server-feature-todo --testNamePattern="should return an array of to-do items"
```

## Test Coverage

### Generate Coverage Report

See how much of your code is covered by tests:

```bash
npx nx test server-feature-todo --coverage
```

This will:
1. Run all tests
2. Generate a coverage report
3. Display a summary in the terminal
4. Create an HTML report in `coverage/` directory

### View Coverage Report

After generating coverage, open the HTML report:

```bash
# On macOS
open coverage/libs/server/feature-todo/index.html

# On Linux
xdg-open coverage/libs/server/feature-todo/index.html

# On Windows
start coverage/libs/server/feature-todo/index.html
```

The HTML report shows:
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of code branches (if/else) executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Thresholds

You can set minimum coverage requirements in `jest.config.ts`:

```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

## Test Types

The project includes three types of tests:

### Unit Tests

Test individual components in isolation:
- **Controller Tests**: `libs/server/feature-todo/src/lib/*.controller.spec.ts`
- **Service Tests**: `libs/server/feature-todo/src/lib/*.service.spec.ts`
- **Component Tests**: `libs/client/**/*.spec.ts`

Unit tests use mocks to isolate components and test them independently.

### Integration Tests (E2E)

Test multiple components working together:
- **Server Integration Tests**: `apps/server-e2e/src/server/todo-controller.spec.ts`
  - Tests the full HTTP request/response cycle
  - Includes validation pipes and middleware
  - Verifies API endpoints work correctly end-to-end
  - Uses `supertest` for HTTP testing
- **Client Integration Tests**: `apps/client-e2e/src/**/*.spec.ts`
  - Tests the full application flow from the user's perspective

Integration tests verify that components work together correctly and that the API contract matches client expectations.

## Understanding Test Output

### Successful Test Run

When tests pass, you'll see output like this:

```
> nx run server-feature-todo:test

> jest

PASS server-feature-todo src/lib/server-feature-todo.controller.spec.ts
PASS server-feature-todo src/lib/server-feature-todo.service.spec.ts

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        2.009 s
Ran all test suites.
```

**What this means:**
- **Test Suites**: Groups of related tests (usually one per file)
- **Tests**: Individual test cases
- **Snapshots**: Used for UI component testing (not used here)
- **Time**: How long the tests took to run

### Failed Test Run

When a test fails, you'll see detailed error information:

```
FAIL server-feature-todo src/lib/server-feature-todo.controller.spec.ts
  ● should return an array of to-do items

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 0

      68 |     const res = await controller.getAll();
      69 |
    > 70 |     expect(res.length).toBe(5);
         |                       ^
      71 |   });
```

**Understanding the error:**
- The test name that failed
- What was expected vs. what was received
- The exact line where the assertion failed
- A stack trace showing where the error occurred

## Troubleshooting

### Tests Not Found

**Problem:** `Cannot find configuration for task server-feature-todo:test`

**Solution:** Make sure the project has:
1. A `jest.config.cts` file in the project directory
2. A `tsconfig.spec.json` file
3. Test files with `.spec.ts` or `.test.ts` extension

### Import Errors

**Problem:** `Cannot find module '@full-stack-todo/...'`

**Solution:** 
1. Check that path mappings are correct in `tsconfig.base.json`
2. Ensure the library exports are correct in the library's `index.ts`
3. Try running `npx nx reset` to clear the Nx cache

### Tests Running Slowly

**Problem:** Tests take a long time to run

**Solutions:**
1. Run only the tests you need (use `--testPathPattern` or `--testNamePattern`)
2. Use watch mode only for the file you're editing
3. Check if you're accidentally connecting to a real database (should use mocks)
4. Run tests in parallel: `npx nx run-many --target=test --all --parallel=3`

### TypeScript Errors in Tests

**Problem:** TypeScript compilation errors in test files

**Solution:**
1. Check that `tsconfig.spec.json` extends the base config correctly
2. Ensure all imports use the correct path aliases
3. Run `npx nx test server-feature-todo --no-cache` to clear cached types

### Mock Not Working

**Problem:** Mock functions not being called or returning wrong values

**Solution:**
1. Make sure you're calling `jest.spyOn()` or `mockReturnValue()` before the test
2. Check that you're awaiting async functions
3. Verify the mock is set up in `beforeEach` if needed for multiple tests
4. Use `jest.clearAllMocks()` in `beforeEach` if mocks persist between tests

## Best Practices

### 1. Run Tests Before Committing

Always run tests before committing code:

```bash
# Run all tests
npx nx run-many --target=test --all

# Or run tests for the project you changed
npx nx test server-feature-todo
```

### 2. Use Watch Mode During Development

When actively writing code, use watch mode:

```bash
npx nx test server-feature-todo --watch
```

This automatically re-runs tests when you save files, giving you immediate feedback.

### 3. Write Tests First (TDD)

Consider writing tests before implementing features (Test-Driven Development):
1. Write a failing test
2. Write code to make it pass
3. Refactor if needed
4. Repeat

### 4. Keep Tests Focused

Each test should verify one specific behavior:

```typescript
// ✅ Good: Tests one thing
it('should return an array of todos', async () => {
  // ...
});

// ❌ Bad: Tests multiple things
it('should return todos and handle errors and validate input', async () => {
  // ...
});
```

### 5. Use Descriptive Test Names

Test names should clearly describe what they're testing:

```typescript
// ✅ Good: Clear and specific
it('should throw NotFoundException when todo is not found', async () => {
  // ...
});

// ❌ Bad: Vague
it('should work', async () => {
  // ...
});
```

### 6. Test Both Success and Error Cases

Don't just test the "happy path". Also test error scenarios:

```typescript
// Test success case
it('should return a todo when found', async () => {
  // ...
});

// Test error case
it('should throw NotFoundException when todo not found', async () => {
  // ...
});
```

### 7. Keep Tests Independent

Each test should be able to run on its own without depending on other tests:

```typescript
// ✅ Good: Each test sets up its own data
beforeEach(() => {
  // Fresh setup for each test
});

// ❌ Bad: Tests depend on each other
it('test 1', () => {
  // Creates data
});

it('test 2', () => {
  // Depends on data from test 1 - will fail if test 1 fails!
});
```

### 8. Use Mocks Appropriately

Mock external dependencies (database, APIs, services) but test your actual code:

```typescript
// ✅ Good: Mock the database, test the service
const repoMock = { find: jest.fn() };
const service = new Service(repoMock);

// ❌ Bad: Mock the service you're testing
const service = { getAll: jest.fn() };
```

## Common Commands Reference

```bash
# Run all unit tests
npx nx run-many --target=test --all

# Run all integration tests (E2E)
npx nx run-many --target=e2e --all

# Run tests for specific project
npx nx test server-feature-todo

# Run server integration tests
npx nx e2e server-e2e

# Run client integration tests
npx nx e2e client-e2e

# Run tests in watch mode
npx nx test server-feature-todo --watch

# Run tests with coverage
npx nx test server-feature-todo --coverage

# Run specific test file
npx nx test server-feature-todo --testPathPattern=controller

# Run tests matching name pattern
npx nx test server-feature-todo --testNamePattern="should return"

# Run tests with verbose output
npx nx test server-feature-todo --verbose

# Clear Nx cache (if tests behave strangely)
npx nx reset
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Nx Testing Documentation](https://nx.dev/recipes/testing/jest)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](./TESTING_BEST_PRACTICES.md)

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review test files in `libs/server/feature-todo/src/lib/*.spec.ts` for examples
3. Check the [Nx Documentation](https://nx.dev)
4. Review [Jest Documentation](https://jestjs.io/docs/getting-started)


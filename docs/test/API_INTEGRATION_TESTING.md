# API Integration Testing (Server E2E)

This document describes our approach to testing the NestJS API in isolation, using "Server E2E" tests (also known as API Integration Tests). 

Unlike unit tests that mock dependencies, these tests exercise the entire request/response lifecycle, including controllers, services, guards, pipes, and database interactions.

## 1. Overview & Purpose

The goal of API integration testing is to ensure that all parts of the server work together correctly. We use **Jest** as the runner and **Supertest** to simulate HTTP requests.

### Key Benefits
- **Guard Verification**: Ensure that `@UseGuards(JwtAuthGuard)` actually blocks unauthorized requests.
- **Payload Validation**: Verify that `ValidationPipe` correctly rejects malformed `DTOs` with a 400 status.
- **Database Integration**: Confirm that data is correctly persisted in PostgreSQL and retrieved as expected.
- **Contract Testing**: Ensure the API returns the correct JSON structure for the client.

## 2. Tools & Frameworks

- **NestJS Testing Module**: To create the application instance in a test environment.
- **Supertest**: For making HTTP calls against the running application instance.
- **TypeORM**: Used with a test database configuration to verify persistence.

## 3. Test Structure

Tests are located in an Nx project (e.g., `apps/server-e2e`) to keep them separate from the core business logic.

### Standard Test Workflow
1. **Setup**: Initialize the NestJS application within `beforeAll`.
2. **Execution**: Make a request using `request(app.getHttpServer())`.
3. **Assertions**: Use Jest expectations to check status codes and response bodies.
4. **Teardown**: Close the application and database connections in `afterAll`.

## 4. Best Practices

- **Test Isolation**: Every test should create its own data. Avoid relying on a shared state that might change between test runs.
- **Testing Status Codes**: Always assert the correct HTTP status code (e.g., 201 for Created, 401 for Unauthorized).
- **Mocking External Services**: While we use a real database, we still mock external third-party APIs (like email or payment providers) to avoid external dependencies.
- **Seed Data Strategy**: Use a dedicated setup script or factory to seed only the data needed for the specific test case.

## 5. Example Test Case

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TodoController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/api/v1/todos (POST) - Success', () => {
    return request(app.getHttpServer())
      .post('/api/v1/todos')
      .send({ title: 'New E2E Task', isCompleted: false })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toEqual('New E2E Task');
      });
  });

  it('/api/v1/todos (POST) - Validation Failure', () => {
    return request(app.getHttpServer())
      .post('/api/v1/todos')
      .send({ title: '' }) // Invalid title
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 6. Running Tests

To run the server integration tests:

```bash
npx nx e2e server-e2e
```

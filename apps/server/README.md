# Full-Stack Todo - Server Application Documentation

## 1. Overview

### What this code/feature does
The `server` application provides the backend REST API for the Full-Stack Todo application. It handles core business logic, database operations, user authentication, and data validation. Built with NestJS, it offers a robust, scalable, and versioned API that the frontend client and other prospective services can consume.

### Why it exists and its purpose
This application exists to act as the single source of truth for the Todo application's data. It securely handles user credentials, issues JWTs for authentication, persists todo items to a PostgreSQL database, and enforces authorization rules so users can only access their own data.

### Key concepts and terminology
- **NestJS Modules**: The structural building blocks of the app (e.g., `AppModule`), organizing the application into cohesive blocks of functionality.
- **Controllers**: Classes that handle incoming HTTP requests and map them to specific endpoints (e.g., `/api/v1/todos`).
- **Providers/Services**: Classes decorated with `@Injectable()` that encapsulate the core business logic and interact with the database.
- **TypeORM**: The Object-Relational Mapper used to interact with the PostgreSQL database.
- **Global Pipes & Guards**: Interceptors that apply globally to all routes. For example, a global `ValidationPipe` ensures all incoming payloads match their defined DTOs, and a global `JwtAuthGuard` ensures requests are authenticated by default.

---

## 2. API Documentation

The server exposes a versioned API under the `/api/v1` prefix. Detailed interactive documentation is automatically generated using Swagger OpenAPI and is available at `http://localhost:<PORT>/api/v1` when running locally.

### Key Global Configurations
- **Global Validation**: `app.useGlobalPipes(new ValidationPipe({...}))` strips non-whitelisted properties and automatically transforms payloads to DTO instances.
- **Versioning**: Uses URI versioning (`v1`).
- **Global Auth Guard**: The `JwtAuthGuard` is registered globally in `AppModule`. All routes require a valid Bearer JWT unless explicitly bypassed with the `@SkipAuth()` decorator.

### Example usage with code snippets

**Swagger API documentation setup (`main.ts`):**
```typescript
const config = new DocumentBuilder()
  .setTitle(`Full Stack To-Do REST API`)
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/v1', app, document);
```

**Skipping global authentication:**
```typescript
import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from '@full-stack-todo/server/util';

@Controller('public')
export class PublicController {
  @SkipAuth() // Bypasses the global JwtAuthGuard
  @Get('status')
  getStatus() {
    return { status: 'Server is running' };
  }
}
```

### Error handling and edge cases
- **Validation Errors**: If a client sends an invalid payload (e.g., missing a required field or wrong data type), the global `ValidationPipe` automatically catches it and returns a `400 Bad Request` with structured details.
- **Authentication/Authorization**: Missing or invalid JWTs automatically result in a `401 Unauthorized` response triggered by the global `JwtAuthGuard`.
- **Database Errors**: Unhandled TypeORM exceptions (like unique constraint violations) are typically mapped to internal abstractions or caught by global exception filters to prevent leaking sensitive database schemas.

---

## 3. Implementation Details

### Architecture overview
The server follows the standard NestJS modular architecture, deeply integrating with Nx workspace libraries for feature isolation:
- `AppModule` serves as the root. It configures the environment validation, the database connection, and registers the global `JwtAuthGuard`.
- Feature modules (e.g., `ServerFeatureTodoModule`, `ServerFeatureUserModule`, `ServerFeatureAuthModule`) are imported from the monorepo workspace libraries to handle specific domain boundaries.

### Important design decisions
- **Environment Validation (Fail Fast)**: The `ConfigModule` uses `Joi` to assert that all required environment variables (like `DATABASE_URL` and `JWT_SECRET`) are present and properly formatted at startup. This prevents confusing runtime crashes later on.
- **Default Secure Philosophy**: By binding authentication globally via `APP_GUARD`, newly added endpoints are secure by default. Developers must explicitly opt-in to make an endpoint public using `@SkipAuth()`.
- **Monorepo Feature Libraries**: Instead of placing all logic inside `apps/server/src/app`, the business logic is decoupled into Nx libraries (`@full-stack-todo/server/feature-*`). The `server` application primarily acts as the entry point that bundles these libraries together.

### Dependencies and integrations
- **@nestjs/core & @nestjs/common**: The foundational framework.
- **@nestjs/typeorm & pg**: PostgreSQL database integration.
- **@nestjs/swagger**: Automated OpenAPI documentation generation.
- **Joi**: Environment variable validation.
- **Passport & JWT**: Standardized token-based authentication.

---

## 4. Examples

### Common use cases with full examples

**Use Case: Connecting to the Database Safely**
Within `AppModule`, the `TypeOrmModule` is configured asynchronously to ensure environment variables are fully loaded and validated before a connection is attempted.

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    synchronize: process.env.NODE_ENV !== 'production', // Caution: false in prod
    logging: config.get('LOG_LEVEL') === 'DEBUG',
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
}),
```

### Best practices and patterns
- **Data Transfer Objects (DTOs)**: Always use DTOs with `class-validator` decorators to define the shape and rules of incoming data.
- **ConfigService**: Never use `process.env` directly inside services. Always inject `ConfigService` to read validated configuration securely.
- **Dependency Injection**: Keep controllers lean by pushing business logic into `@Injectable()` services. Mock these services when testing controllers.

### Common pitfalls to avoid
- **`synchronize: true` in Production**: The `TypeOrmModule` has `synchronize` enabled for basic development. In a production environment, this must be `false`, and structured migrations should dictate schema changes to avoid accidental table drops or data loss.
- **Forgetting `@SkipAuth()`**: If creating a login or registration endpoint, if you forget to add `@SkipAuth()`, the endpoint will demand a JWT, making it impossible for new users to log in.
- **Ignoring DTO Transformation**: If you expect a database ID parameter as a number, ensure `transform: true` is enabled in your validation pipe, or explicitly cast it; otherwise, it will be treated as a string and cause TypeORM queries to fail.

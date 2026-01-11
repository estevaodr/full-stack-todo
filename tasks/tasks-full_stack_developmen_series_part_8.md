# Task List: User Authentication and JWT Support in NestJS

Generated from: `docs/references/full_stack_developmen_series_part_8.md`

## Relevant Files

### Domain Models (Shared)
- `libs/shared/domain/src/lib/models/user.interface.ts` - User domain interface with types (IUser, ICreateUser, IUpdateUser, IUpsertUser, IPublicUserData)
- `libs/shared/domain/src/lib/models/token-response.interface.ts` - JWT token response interface (ITokenResponse)
- `libs/shared/domain/src/lib/models/jwt-payload.interface.ts` - JWT payload structure interface (IAccessTokenPayload)
- `libs/shared/domain/src/lib/models/todo.interface.ts` - Update ITodo to include optional user and user_id fields
- `libs/shared/domain/src/index.ts` - Export new domain interfaces

### Database Schemas (Data Access)
- `libs/server/data-access-todo/src/lib/database/schemas/user.entity-schema.ts` - User entity schema with one-to-many relation to todos
- `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts` - Update Todo schema with many-to-one relation to user, add user_id column, update unique constraint
- `libs/server/data-access-todo/src/lib/database.module.ts` - Register UserEntitySchema in TypeORM
- `libs/server/data-access-todo/src/index.ts` - Export UserEntitySchema

### DTOs (Data Access)
- `libs/server/data-access-todo/src/lib/dtos/user.dto.ts` - UserResponseDto and CreateUserDto with validation
- `libs/server/data-access-todo/src/lib/dtos/auth.dto.ts` - LoginRequestDto and LoginResponseDto
- `libs/server/data-access-todo/src/index.ts` - Export DTOs

### Feature Libraries
- `libs/server/feature-user/src/lib/server-feature-user.service.ts` - User service with getOne, getOneByEmail, create methods
- `libs/server/feature-user/src/lib/server-feature-user.service.spec.ts` - Unit tests for user service
- `libs/server/feature-user/src/lib/server-feature-user.controller.ts` - User controller with POST /users and GET /users/:id endpoints
- `libs/server/feature-user/src/lib/server-feature-user.controller.spec.ts` - Unit tests for user controller
- `libs/server/feature-user/src/lib/server-feature-user.module.ts` - User feature module
- `libs/server/feature-user/src/index.ts` - Export user module, service, controller
- `libs/server/feature-auth/src/lib/server-feature-auth.service.ts` - Auth service with validateUser and generateAccessToken methods
- `libs/server/feature-auth/src/lib/server-feature-auth.service.spec.ts` - Unit tests for auth service
- `libs/server/feature-auth/src/lib/server-feature-auth.controller.ts` - Auth controller with POST /auth/login endpoint
- `libs/server/feature-auth/src/lib/server-feature-auth.controller.spec.ts` - Unit tests for auth controller
- `libs/server/feature-auth/src/lib/jwt-strategy.service.ts` - JWT Passport strategy implementation
- `libs/server/feature-auth/src/lib/server-feature-auth.module.ts` - Auth feature module with JwtModule configuration
- `libs/server/feature-auth/src/index.ts` - Export auth module, service, controller

### Authentication Infrastructure (Util)
- `libs/server/util/src/lib/decorators/req-user.decorator.ts` - @ReqUser() and @ReqUserId() parameter decorators
- `libs/server/util/src/lib/skip-auth.ts` - @SkipAuth() decorator and SKIP_AUTH_KEY constant
- `libs/server/util/src/lib/guards/jwt.auth-guard.ts` - JwtAuthGuard extending AuthGuard('jwt')
- `libs/server/util/src/index.ts` - Export decorators and guard

### Application Configuration
- `apps/server/src/app/app.module.ts` - Import feature modules, add APP_GUARD provider for JwtAuthGuard, update ConfigModule validation
- `apps/server/src/main.ts` - Add .addBearerAuth() to Swagger DocumentBuilder

### Todo Feature Updates
- `libs/server/feature-todo/src/lib/server-feature-todo.service.ts` - Update all methods to accept userId parameter and filter by user
- `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts` - Update unit tests to include userId parameter
- `libs/server/feature-todo/src/lib/server-feature-todo.controller.ts` - Add @ApiBearerAuth() decorator, add @ReqUserId() to all route handlers
- `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts` - Update controller tests to mock @ReqUserId() decorator

### E2E Tests
- `apps/server-e2e/src/server/auth-controller.spec.ts` - E2E tests for auth endpoints (login, validation)
- `apps/server-e2e/src/server/user-controller.spec.ts` - E2E tests for user endpoints (create, get, unauthorized access)
- `apps/server-e2e/src/server/todo-controller.spec.ts` - E2E tests for todo endpoints with authentication (new file, don't overwrite existing)

### Configuration
- `package.json` - Add dependencies: @nestjs/passport, passport, passport-jwt, @nestjs/jwt, bcrypt, @types/passport-jwt, @types/bcrypt

### Notes

- Unit tests should be placed alongside the code files they are testing (e.g., `server-feature-user.service.ts` and `server-feature-user.service.spec.ts` in the same directory).
- Use `npx nx test [project-name]` to run unit tests for specific projects.
- Use `npx nx e2e server-e2e` to run E2E tests.
- Follow dependency order: Domain models → Database schemas → DTOs → Services → Controllers → Guards/Decorators
- Keep feature boundaries clear: feature-user and feature-auth are separate libraries
- Reuse existing patterns from feature-todo for consistency

## Tasks

- [x] 1.0 Domain Models and Database Schema Setup
  - [x] 1.1 Create `libs/shared/domain/src/lib/models/user.interface.ts` with IUser interface (id, email, password, todos), and types: ICreateUser, IUpdateUser, IUpsertUser, IPublicUserData
  - [x] 1.2 Create `libs/shared/domain/src/lib/models/token-response.interface.ts` with ITokenResponse interface (access_token: string)
  - [x] 1.3 Create `libs/shared/domain/src/lib/models/jwt-payload.interface.ts` with IAccessTokenPayload interface (email, sub)
  - [x] 1.4 Update `libs/shared/domain/src/lib/models/todo.interface.ts` to add optional `user?: IUser` and `user_id?: string` fields
  - [x] 1.5 Update `libs/shared/domain/src/index.ts` to export all new interfaces
  - [x] 1.6 Create `libs/server/data-access-todo/src/lib/database/schemas/user.entity-schema.ts` with UserEntitySchema (id: uuid, email: unique, password), and one-to-many relation to todos with cascade delete
  - [x] 1.7 Update `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts` to add user_id column, many-to-one relation to user with joinColumn, and unique constraint on ['title', 'user_id'] (remove title unique constraint)
  - [x] 1.8 Update `libs/server/data-access-todo/src/lib/database.module.ts` to register UserEntitySchema in TypeOrmModule.forFeature()
  - [x] 1.9 Update `libs/server/data-access-todo/src/index.ts` to export UserEntitySchema

- [ ] 2.0 Authentication Infrastructure and Dependencies
  - [x] 2.1 Install dependencies: `npm install --save @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt`
  - [x] 2.2 Install dev dependencies: `npm install --save-dev @types/passport-jwt @types/bcrypt`
  - [x] 2.3 Create `libs/server/data-access-todo/src/lib/dtos/user.dto.ts` with UserResponseDto (implements IPublicUserData) and CreateUserDto (implements ICreateUser) with @IsEmail(), @IsStrongPassword() validation and Swagger decorators
  - [x] 2.4 Create `libs/server/data-access-todo/src/lib/dtos/auth.dto.ts` with LoginRequestDto (email, password) and LoginResponseDto (implements ITokenResponse) with validation and Swagger decorators
  - [x] 2.5 Update `libs/server/data-access-todo/src/index.ts` to export user and auth DTOs
  - [x] 2.6 Create `libs/server/util/src/lib/decorators/req-user.decorator.ts` with @ReqUser() and @ReqUserId() parameter decorators using createParamDecorator
  - [x] 2.7 Create `libs/server/util/src/lib/skip-auth.ts` with SKIP_AUTH_KEY constant and @SkipAuth() decorator using SetMetadata
  - [x] 2.8 Create `libs/server/util/src/lib/guards/jwt.auth-guard.ts` with JwtAuthGuard extending AuthGuard('jwt'), using Reflector to check for SKIP_AUTH_KEY metadata
  - [x] 2.9 Update `libs/server/util/src/index.ts` to export decorators and guard

- [ ] 3.0 User and Auth Feature Libraries Implementation
  - [x] 3.1 Generate feature-user library: `npx nx generate @nx/nest:library --name=feature-user --controller --service --directory=libs/server --importPath=@full-stack-todo/server/feature-user --strict --tags=type:feature,scope:server`
  - [x] 3.2 Generate feature-auth library: `npx nx generate @nx/nest:library --name=feature-auth --controller --service --directory=libs/server --importPath=@full-stack-todo/server/feature-auth --strict --tags=type:feature,scope:server`
  - [x] 3.3 Implement `libs/server/feature-user/src/lib/server-feature-user.service.ts` with getOne(id), getOneByEmail(email), and create(user) methods using bcrypt for password hashing (10 rounds)
  - [x] 3.4 Update `libs/server/feature-user/src/lib/server-feature-user.module.ts` to import DataAccessTodoModule and TypeOrmModule.forFeature([UserEntitySchema]), export ServerFeatureUserService
  - [x] 3.5 Implement `libs/server/feature-user/src/lib/server-feature-user.controller.ts` with POST /users (public, @SkipAuth()) and GET /users/:id (protected, @ApiBearerAuth(), verify reqUserId === id)
  - [x] 3.6 Write unit tests in `libs/server/feature-user/src/lib/server-feature-user.service.spec.ts` for getOne, getOneByEmail, create methods
  - [x] 3.7 Write unit tests in `libs/server/feature-user/src/lib/server-feature-user.controller.spec.ts` for createUser and getUser methods
  - [x] 3.8 Create `libs/server/feature-auth/src/lib/jwt-strategy.service.ts` extending PassportStrategy(Strategy) with jwtFromRequest, secretOrKey from ConfigService, and validate() method returning { userId: sub, ...rest }
  - [x] 3.9 Implement `libs/server/feature-auth/src/lib/server-feature-auth.service.ts` with validateUser(email, password) and generateAccessToken(user) methods, using forwardRef for ServerFeatureUserService
  - [x] 3.10 Update `libs/server/feature-auth/src/lib/server-feature-auth.module.ts` to import JwtModule.registerAsync() with ConfigService, PassportModule, ServerFeatureUserModule (with forwardRef), provide JwtStrategy, export ServerFeatureAuthService
  - [x] 3.11 Implement `libs/server/feature-auth/src/lib/server-feature-auth.controller.ts` with POST /auth/login (public, @SkipAuth()) endpoint
  - [x] 3.12 Write unit tests in `libs/server/feature-auth/src/lib/server-feature-auth.service.spec.ts` for validateUser and generateAccessToken methods
  - [x] 3.13 Write unit tests in `libs/server/feature-auth/src/lib/server-feature-auth.controller.spec.ts` for login method

- [ ] 4.0 Protect Todo Endpoints with JWT Authentication
  - [x] 4.1 Update `apps/server/src/app/app.module.ts` to import ServerFeatureUserModule and ServerFeatureAuthModule, add APP_GUARD provider with JwtAuthGuard, update ConfigModule validationSchema to include JWT_SECRET (required) and JWT_ACCESS_TOKEN_EXPIRES_IN (default: '600s')
  - [x] 4.2 Update `apps/server/src/main.ts` to add .addBearerAuth() to DocumentBuilder configuration
  - [x] 4.3 Update `libs/server/feature-todo/src/lib/server-feature-todo.service.ts` to add userId: string as first parameter to all methods (getAll, getOne, create, update, upsert, delete), update queries to filter by user: { id: userId }
  - [x] 4.4 Update `libs/server/feature-todo/src/lib/server-feature-todo.controller.ts` to add @ApiBearerAuth() at controller level, add @ReqUserId() userId: string parameter to all route handlers, pass userId to service methods
  - [x] 4.5 Update `libs/server/feature-todo/src/lib/server-feature-todo.service.spec.ts` to include userId parameter in all test cases and verify todos are filtered by user
  - [x] 4.6 Update `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts` to mock @ReqUserId() decorator or use @ReqUser() mock in tests

- [ ] 5.0 Testing and Documentation Updates
  - [ ] 5.1 Create `apps/server-e2e/src/server/auth-controller.spec.ts` with E2E tests for POST /api/v1/auth/login (success, invalid credentials), setup test user and access token in beforeAll()
  - [ ] 5.2 Create `apps/server-e2e/src/server/user-controller.spec.ts` with E2E tests for POST /api/v1/users (create user, validation errors), GET /api/v1/users/:id (success, unauthorized, not found)
  - [ ] 5.3 Create `apps/server-e2e/src/server/todo-controller.spec.ts` (new file) with E2E tests for all todo endpoints using authentication: setup user and token in beforeAll(), test unauthorized requests, test user isolation (user A can't access user B's todos), test all CRUD operations with .auth(access_token, { type: 'bearer' })
  - [ ] 5.4 Verify all unit tests pass: `npx nx test server-feature-user`, `npx nx test server-feature-auth`, `npx nx test server-feature-todo`
  - [ ] 5.5 Verify all E2E tests pass: `npx nx e2e server-e2e`
  - [ ] 5.6 Test manually: start server, create user via Swagger, login and get token, test protected endpoints with and without tokens, verify user isolation

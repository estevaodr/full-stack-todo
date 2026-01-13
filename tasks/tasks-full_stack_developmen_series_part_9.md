# Task List: User Authentication and JWT Support in Angular

Generated from: `docs/references/full_stack_developmen_series_part_9.md`

## Relevant Files

### Domain Interfaces (Shared)
- `libs/shared/domain/src/lib/models/login-payload.interface.ts` - ILoginPayload interface for login requests (email, password)
- `libs/shared/domain/src/index.ts` - Export ILoginPayload interface

### Utility Library
- `libs/client/util/src/lib/constants.ts` - TOKEN_STORAGE_KEY constant for localStorage
- `libs/client/util/src/index.ts` - Export constants

### Data Access Services
- `libs/client/data-access/src/lib/auth.service.ts` - AuthService for JWT handling, login, logout, token management
- `libs/client/data-access/src/lib/auth.service.spec.ts` - Unit tests for AuthService
- `libs/client/data-access/src/lib/user.service.ts` - UserService for user information retrieval
- `libs/client/data-access/src/lib/user.service.spec.ts` - Unit tests for UserService
- `libs/client/data-access/src/lib/interceptors/jwt.interceptor.ts` - Functional HTTP interceptor to add JWT to requests
- `libs/client/data-access/src/lib/guards/auth.guard.ts` - Functional route guard to protect routes
- `libs/client/data-access/src/index.ts` - Export services, interceptor, and guard

### Login Feature
- `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.ts` - Login component with reactive form
- `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.html` - Login template with validation
- `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.scss` - Login component styles
- `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.spec.ts` - Unit tests for login component
- `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.stories.ts` - Storybook stories for login component
- `libs/client/feature-login/src/lib/lib.routes.ts` - Login feature routes
- `libs/client/feature-login/project.json` - Update build-storybook target with style library configuration

### Registration Feature
- `libs/client/feature-register/src/lib/matching-passwords.validator.ts` - Custom validator for password matching
- `libs/client/feature-register/src/lib/feature-register.component.ts` - Registration component with reactive form
- `libs/client/feature-register/src/lib/feature-register.component.html` - Registration template with validation
- `libs/client/feature-register/src/lib/feature-register.component.scss` - Registration component styles
- `libs/client/feature-register/src/lib/feature-register.component.spec.ts` - Unit tests for registration component
- `libs/client/feature-register/src/lib/feature-register.stories.ts` - Storybook stories for registration component
- `libs/client/feature-register/src/lib/lib.routes.ts` - Registration feature routes
- `libs/client/feature-register/project.json` - Update build-storybook target with style library configuration

### Style Library Updates
- `libs/client/ui-style/src/lib/scss/components/_form_control.scss` - Form validation styles (input-group--invalid, validation-text)

### Application Configuration
- `apps/client/src/main.ts` - Add jwtInterceptor to provideHttpClient(withInterceptors([...]))
- `apps/client/src/app/app.routes.ts` - Add login and register routes
- `apps/client/src/app/app.ts` - Add logout functionality and user display
- `apps/client/src/app/app.html` - Add logout button and user greeting in header

### Dashboard Feature Updates
- `libs/client/feature-dashboard/src/lib/lib.routes.ts` - Add authGuard to protect dashboard route

### Configuration
- `package.json` - Add jwt-decode dependency

### Notes

- Unit tests should be placed alongside the code files they are testing (e.g., `auth.service.ts` and `auth.service.spec.ts` in the same directory).
- Use `npx nx test [project-name]` to run unit tests for specific projects.
- The JWT interceptor should use `take(1)` to prevent duplicate requests (see Speed Bumps in documentation).
- Follow existing patterns from feature-dashboard for consistency.
- Use OnPush change detection strategy for performance.
- Storybook configuration should include style library paths for SCSS compilation.

## Tasks

- [ ] 1.0 Authentication Infrastructure Setup
  - [x] 1.1 Create `libs/shared/domain/src/lib/models/login-payload.interface.ts` with ILoginPayload interface (email: string, password: string)
  - [x] 1.2 Update `libs/shared/domain/src/index.ts` to export ILoginPayload
  - [ ] 1.3 Generate client util library: `npx nx generate @nx/node:library --name=util --directory=libs/client --importPath=@full-stack-todo/client/util --strict --tags=type:util,scope:client --unitTestRunner=none`
  - [ ] 1.4 Create `libs/client/util/src/lib/constants.ts` with TOKEN_STORAGE_KEY constant ('fst-token-storage')
  - [ ] 1.5 Update `libs/client/util/src/index.ts` to export constants
  - [ ] 1.6 Install jwt-decode: `npm install jwt-decode`
  - [ ] 1.7 Generate Auth service: `npx nx generate @schematics/angular:service Auth --project=client-data-access --path=libs/client/data-access/src/lib`
  - [ ] 1.8 Generate User service: `npx nx generate @schematics/angular:service User --project=client-data-access --path=libs/client/data-access/src/lib`
  - [ ] 1.9 Implement `libs/client/data-access/src/lib/auth.service.ts` with BehaviorSubjects for accessToken$ and userData$, methods: setToken, clearToken, loadToken, loginUser, logoutUser, isTokenExpired, decodeToken (using jwt-decode)
  - [ ] 1.10 Implement `libs/client/data-access/src/lib/user.service.ts` with getUser method (if needed based on backend API)
  - [ ] 1.11 Write unit tests in `libs/client/data-access/src/lib/auth.service.spec.ts` for all AuthService methods, mocking localStorage and HttpClient
  - [ ] 1.12 Write unit tests in `libs/client/data-access/src/lib/user.service.spec.ts` for UserService methods
  - [ ] 1.13 Update `libs/client/data-access/src/index.ts` to export AuthService and UserService

- [ ] 2.0 Login Feature Implementation
  - [ ] 2.1 Generate login feature library: `npx nx generate @nx/angular:library --name=feature-login --directory=libs/client --changeDetection=OnPush --importPath=@full-stack-todo/client/feature-login --skipModule --standalone --style=scss --tags=type:feature,scope:client`
  - [ ] 2.2 Generate Storybook configuration: `npx nx generate @nx/angular:storybook-configuration client-feature-login --tsConfiguration --configureTestRunner`
  - [ ] 2.3 Update `libs/client/feature-login/project.json` build-storybook target to include styles from `apps/client/src/styles.scss` and stylePreprocessorOptions with includePaths to `libs/client/ui-style/src/lib/scss`
  - [ ] 2.4 Create login component template `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.html` with form structure (email and password inputs, submit button)
  - [ ] 2.5 Implement `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.ts` with FormGroup, FormControls for email and password, validation (required, email), getters for form state, submitForm method with error handling
  - [ ] 2.6 Update login template with formControlName bindings, validation error messages, error display using BehaviorSubject
  - [ ] 2.7 Create `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.scss` with layout styles for login container
  - [ ] 2.8 Update `libs/client/ui-style/src/lib/scss/components/_form_control.scss` with input-group--invalid styles and validation-text styles (error, warning, visible modifiers)
  - [ ] 2.9 Create Storybook story `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.stories.ts` with componentWrapperDecorator for visualization
  - [ ] 2.10 Create `libs/client/feature-login/src/lib/lib.routes.ts` with login route
  - [ ] 2.11 Write unit tests in `libs/client/feature-login/src/lib/client-feature-login/client-feature-login.component.spec.ts` for form validation, submission, error handling
  - [ ] 2.12 Update `libs/client/feature-login/src/index.ts` to export login component and routes

- [ ] 3.0 JWT Interceptor and Guard Implementation
  - [ ] 3.1 Generate JWT interceptor: `npx nx generate @schematics/angular:interceptor Jwt --project=client-data-access --functional --path=libs/client/data-access/src/lib/interceptors`
  - [ ] 3.2 Implement `libs/client/data-access/src/lib/interceptors/jwt.interceptor.ts` as functional interceptor using HttpInterceptorFn, inject AuthService, use accessToken$ with take(1), clone request with Authorization header
  - [ ] 3.3 Generate Auth guard: `npx nx generate @schematics/angular:guard Auth --project=client-data-access --functional --path=libs/client/data-access/src/lib/guards`
  - [ ] 3.4 Implement `libs/client/data-access/src/lib/guards/auth.guard.ts` as functional guard using CanActivateFn, check isTokenExpired, redirect to /login with returnUrl query param if expired
  - [ ] 3.5 Update `libs/client/data-access/src/index.ts` to export jwtInterceptor and authGuard
  - [ ] 3.6 Update `apps/client/src/main.ts` to add jwtInterceptor to provideHttpClient(withInterceptors([jwtInterceptor]))
  - [ ] 3.7 Update `libs/client/feature-dashboard/src/lib/lib.routes.ts` to add canActivate: [authGuard] to dashboard route
  - [ ] 3.8 Update `apps/client/src/app/app.routes.ts` to include login routes from feature-login

- [ ] 4.0 Registration Feature Implementation
  - [ ] 4.1 Generate registration feature library: `npx nx generate @nx/angular:library --name=feature-register --directory=libs/client --routing --changeDetection=OnPush --flat --importPath=@full-stack-todo/client/feature-register --simpleName --skipModule --standalone --style=scss --tags=type:feature,scope:client`
  - [ ] 4.2 Generate Storybook configuration: `npx nx generate @nx/angular:storybook-configuration client-feature-register --configureTestRunner`
  - [ ] 4.3 Update `libs/client/feature-register/project.json` build-storybook target with style library configuration
  - [ ] 4.4 Create `libs/client/feature-register/src/lib/matching-passwords.validator.ts` with MatchingPasswords validator function that compares two FormControl values
  - [ ] 4.5 Create registration component template `libs/client/feature-register/src/lib/feature-register.component.html` with form (email, password, confirmPassword fields)
  - [ ] 4.6 Implement `libs/client/feature-register/src/lib/feature-register.component.ts` with FormGroup, FormControls, MatchingPasswords validator, submitForm method
  - [ ] 4.7 Create `libs/client/feature-register/src/lib/feature-register.component.scss` with layout styles
  - [ ] 4.8 Create Storybook story `libs/client/feature-register/src/lib/feature-register.stories.ts`
  - [ ] 4.9 Create `libs/client/feature-register/src/lib/lib.routes.ts` with register route
  - [ ] 4.10 Write unit tests in `libs/client/feature-register/src/lib/feature-register.component.spec.ts` for form validation, password matching, submission
  - [ ] 4.11 Update `libs/client/feature-register/src/index.ts` to export registration component and routes
  - [ ] 4.12 Update `apps/client/src/app/app.routes.ts` to include register routes

- [ ] 5.0 Integration and Testing
  - [ ] 5.1 Update `apps/client/src/app/app.ts` to inject AuthService and Router, add user$ observable, add logout() method
  - [ ] 5.2 Update `apps/client/src/app/app.html` to add header with user greeting, logout button, and login link (using *ngIf with async pipe)
  - [ ] 5.3 Ensure AuthService.loadToken() is called on app initialization (consider APP_INITIALIZER or component ngOnInit)
  - [ ] 5.4 Verify all unit tests pass: `npx nx test client-data-access`, `npx nx test client-feature-login`, `npx nx test client-feature-register`
  - [ ] 5.5 Test manually: start server and client, test login flow, test logout, test protected routes, test registration, verify JWT is stored and sent in requests
  - [ ] 5.6 Verify Storybook stories render correctly for login and register components

/**
 * Unit Tests for ServerFeatureAuthController
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the controller separately from the database, network, and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like a database or service) that we control.
 * Instead of connecting to a real database (slow, requires setup), we use a mock that
 * pretends to be the database. This makes tests:
 * - Fast (no database queries)
 * - Reliable (no network issues)
 * - Isolated (tests don't affect each other)
 */

// NestJS testing utilities - helps us create a test environment
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
// The controller we're testing
import { ServerFeatureAuthController } from './server-feature-auth.controller';
// The service the controller uses (we'll mock its methods)
import { ServerFeatureAuthService } from './server-feature-auth.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ITokenResponse, IPublicUserData } from '@full-stack-todo/shared/domain';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { LoginRequestDto } from '@full-stack-todo/server/data-access-todo';

/**
 * Helper function to create fake public user data
 */
function createMockPublicUser(): IPublicUserData {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
    todos: [],
  };
}

/**
 * Test Suite: ServerFeatureAuthController
 * 
 * WHAT IS A TEST SUITE?
 * =====================
 * A group of related tests. All tests in this describe() block test the controller.
 * 
 * TEST STRUCTURE:
 * ==============
 * 1. Setup (beforeEach) - Prepare the test environment
 * 2. Tests (it blocks) - Individual test cases
 * 3. Assertions (expect) - Check that results are correct
 */
describe('ServerFeatureAuthController', () => {
  // These variables will hold our controller and service instances
  // We declare them here so all tests can use them
  let controller: ServerFeatureAuthController;
  let service: ServerFeatureAuthService;

  /**
   * beforeEach - Runs before EACH test in this suite
   * 
   * WHAT DOES THIS DO?
   * ==================
   * Sets up a fresh test environment for every test. This ensures:
   * - Tests don't interfere with each other
   * - Each test starts with a clean slate
   * - Mocks are reset between tests
   * 
   * HOW IT WORKS:
   * ============
   * 1. Test.createTestingModule() - Creates a NestJS module just for testing
   * 2. providers - Tells NestJS what services to create
   *    - We provide a mock service object with the methods we need
   * 3. controllers - Tells NestJS which controller to test
   * 4. .compile() - Builds the test module
   * 5. module.get() - Gets instances of the controller and service
   * 
   * NOTE: In controller tests, we mock the SERVICE, not the dependencies.
   * This is different from service tests where we mock the dependencies.
   */
  beforeEach(async () => {
    // Create a mock service with the methods we need
    const mockService = {
      validateUser: jest.fn(),
      generateAccessToken: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerFeatureAuthService,
          useValue: mockService,
        },
      ],
      controllers: [ServerFeatureAuthController],
    }).compile();

    // Get instances from the test module
    controller = module.get(ServerFeatureAuthController);
    service = module.get(ServerFeatureAuthService);
  });

  /**
   * Test: POST /api/v1/auth/login - Should return access token when credentials are valid
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * We're testing that when someone calls login() on the controller with valid credentials,
   * it returns a JWT access token.
   * 
   * HOW DOES IT WORK?
   * ================
   * 1. We "spy" on the service's validateUser() and generateAccessToken() methods
   *    - A spy watches a function and can control what it returns
   *    - We tell validateUser() to return a fake user (valid credentials)
   *    - We tell generateAccessToken() to return a fake token
   * 2. We call the controller's login() method
   * 3. We check (assert) that:
   *    - The result contains an access_token
   *    - The service methods were called correctly
   * 
   * WHY MOCK THE SERVICE?
   * ====================
   * We're testing the CONTROLLER, not the service. By mocking the service,
   * we ensure that:
   * - If the service has bugs, it doesn't break this test
   * - We're only testing the controller's logic
   * - The test runs faster (no database calls, no JWT signing)
   */
  it('should return access token when credentials are valid', async () => {
    // Create fake login data and user
    const loginData: LoginRequestDto = {
      email: 'user@example.com',
      password: 'SecureP@ssw0rd123!',
    };
    const user = createMockPublicUser();
    const mockToken: ITokenResponse = {
      access_token: 'mock.jwt.token.here',
    };

    // Mock the service methods
    jest.spyOn(service, 'validateUser').mockReturnValue(
      new Promise((res) => {
        res(user);
      })
    );
    jest.spyOn(service, 'generateAccessToken').mockReturnValue(
      new Promise((res) => {
        res(mockToken);
      })
    );

    // Call the controller method
    const result = await controller.login(loginData);

    // ASSERTIONS - Check that the result is what we expect
    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBe(mockToken.access_token);
    
    // Verify that the service methods were called correctly
    expect(service.validateUser).toHaveBeenCalledWith(
      loginData.email,
      loginData.password
    );
    expect(service.generateAccessToken).toHaveBeenCalledWith(user);
  });

  /**
   * Test: POST /api/v1/auth/login - Should throw UnauthorizedException when credentials are invalid
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Error handling! When credentials are invalid, the controller should throw
   * UnauthorizedException. This is a critical security feature.
   * 
   * WHY TEST ERRORS?
   * ===============
   * Error handling is just as important as happy path (success) scenarios.
   * We need to make sure the controller handles errors correctly.
   * 
   * HOW TO TEST ERRORS:
   * ==================
   * Use expect().rejects.toThrow() to check that a Promise rejects (fails) with an error.
   */
  it('should throw UnauthorizedException when credentials are invalid', async () => {
    // Create fake login data with invalid credentials
    const loginData: LoginRequestDto = {
      email: 'user@example.com',
      password: 'wrongPassword',
    };

    // Mock the service to return null (invalid credentials)
    jest.spyOn(service, 'validateUser').mockReturnValue(
      new Promise((res) => {
        res(null);
      })
    );

    // Use rejects.toThrow() to check that the Promise fails with UnauthorizedException
    // await expect() waits for the Promise and checks if it throws an error
    await expect(controller.login(loginData)).rejects.toThrow(
      UnauthorizedException
    );

    // Verify that validateUser was called
    expect(service.validateUser).toHaveBeenCalledWith(
      loginData.email,
      loginData.password
    );
    
    // Verify that generateAccessToken was NOT called (credentials were invalid)
    expect(service.generateAccessToken).not.toHaveBeenCalled();
  });

  /**
   * Test: POST /api/v1/auth/login - Should throw UnauthorizedException when user doesn't exist
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the controller correctly handles the case where a user with the given
   * email doesn't exist. This should also throw UnauthorizedException.
   */
  it('should throw UnauthorizedException when user does not exist', async () => {
    // Create fake login data for non-existent user
    const loginData: LoginRequestDto = {
      email: 'nonexistent@example.com',
      password: 'anyPassword',
    };

    // Mock the service to return null (user doesn't exist)
    jest.spyOn(service, 'validateUser').mockReturnValue(
      new Promise((res) => {
        res(null);
      })
    );

    // Check that login() throws UnauthorizedException
    await expect(controller.login(loginData)).rejects.toThrow(
      UnauthorizedException
    );

    // Verify that validateUser was called
    expect(service.validateUser).toHaveBeenCalledWith(
      loginData.email,
      loginData.password
    );
    
    // Verify that generateAccessToken was NOT called
    expect(service.generateAccessToken).not.toHaveBeenCalled();
  });

  /**
   * Test: POST /api/v1/auth/login - Should call service methods correctly
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the controller calls both service methods when credentials are valid:
   * 1. validateUser() to check credentials
   * 2. generateAccessToken() to generate the token
   * 
   * WHY IS THIS IMPORTANT?
   * =====================
   * This ensures the authentication flow is correct and secure.
   */
  it('should call both service methods when credentials are valid', async () => {
    const loginData: LoginRequestDto = {
      email: 'user@example.com',
      password: 'SecureP@ssw0rd123!',
    };
    const user = createMockPublicUser();
    const mockToken: ITokenResponse = {
      access_token: 'mock.jwt.token.here',
    };

    // Mock the service methods
    jest.spyOn(service, 'validateUser').mockReturnValue(
      new Promise((res) => {
        res(user);
      })
    );
    jest.spyOn(service, 'generateAccessToken').mockReturnValue(
      new Promise((res) => {
        res(mockToken);
      })
    );

    // Call the controller method
    await controller.login(loginData);

    // Verify both methods were called
    expect(service.validateUser).toHaveBeenCalled();
    expect(service.generateAccessToken).toHaveBeenCalled();
    
    // Verify generateAccessToken was called with the user from validateUser
    expect(service.generateAccessToken).toHaveBeenCalledWith(user);
  });
});

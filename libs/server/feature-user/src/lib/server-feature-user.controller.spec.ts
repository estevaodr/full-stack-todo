/**
 * Unit Tests for ServerFeatureUserController
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
import { NotFoundException } from '@nestjs/common';
// The controller we're testing
import { ServerFeatureUserController } from './server-feature-user.controller';
// The service the controller uses (we'll mock its methods)
import { ServerFeatureUserService } from './server-feature-user.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { IUser, IPublicUserData } from '@full-stack-todo/shared/domain';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { CreateUserDto } from '@full-stack-todo/server/data-access-todo';

/**
 * Helper function to create fake users
 */
function createMockUser(): IUser {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
    password: 'hashedPassword123', // This is a hashed password, not the actual password
    todos: [],
  };
}

/**
 * Test Suite: ServerFeatureUserController
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
describe('ServerFeatureUserController', () => {
  // These variables will hold our controller and service instances
  // We declare them here so all tests can use them
  let controller: ServerFeatureUserController;
  let service: ServerFeatureUserService;

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
   * NOTE: In controller tests, we mock the SERVICE, not the repository.
   * This is different from service tests where we mock the repository.
   */
  beforeEach(async () => {
    // Create a mock service with the methods we need
    const mockService = {
      create: jest.fn(),
      getOne: jest.fn(),
      getOneByEmail: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerFeatureUserService,
          useValue: mockService,
        },
      ],
      controllers: [ServerFeatureUserController],
    }).compile();

    // Get instances from the test module
    controller = module.get(ServerFeatureUserController);
    service = module.get(ServerFeatureUserService);
  });

  /**
   * Test: POST /api/v1/users - Should create a new user
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * We're testing that when someone calls createUser() on the controller,
   * it creates a user and returns the user data without the password.
   * 
   * HOW DOES IT WORK?
   * ================
   * 1. We "spy" on the service's create() method
   *    - A spy watches a function and can control what it returns
   *    - We tell it to return a Promise with a fake user
   * 2. We call the controller's createUser() method
   * 3. We check (assert) that:
   *    - The result doesn't contain the password field
   *    - The result contains all other user fields
   * 
   * WHY MOCK THE SERVICE?
   * ====================
   * We're testing the CONTROLLER, not the service. By mocking the service,
   * we ensure that:
   * - If the service has bugs, it doesn't break this test
   * - We're only testing the controller's logic
   * - The test runs faster (no database calls)
   */
  it('should create a new user and exclude password from response', async () => {
    // Create a fake user that will be "created"
    const newUser = createMockUser();
    const userData: CreateUserDto = {
      email: newUser.email,
      password: 'plainPassword123', // This is the plain password (will be hashed by service)
    };
    
    // Mock the service to return our fake user when create() is called
    jest.spyOn(service, 'create').mockReturnValue(
      new Promise((res) => {
        res(newUser);
      })
    );

    // Call the controller's createUser() method
    const result = await controller.createUser(userData);

    // ASSERTIONS - Check that the result is what we expect
    // The password should NOT be in the response
    expect(result).not.toHaveProperty('password');
    // But all other fields should be present
    expect(result.id).toBe(newUser.id);
    expect(result.email).toBe(newUser.email);
    expect(result.todos).toEqual(newUser.todos);
    // Verify that the service's create method was called with the correct data
    expect(service.create).toHaveBeenCalledWith(userData);
  });

  /**
   * Test: GET /api/v1/users/:id - Should return a user when IDs match
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that getUser() returns a user when the authenticated user ID (reqUserId)
   * matches the requested user ID. This ensures users can only access their own data.
   * 
   * SECURITY CHECK:
   * ==============
   * This test verifies the authorization logic: users can only see their own data.
   */
  it('should return a user when reqUserId matches id', async () => {
    // Create a fake user
    const user = createMockUser();
    const userId = user.id; // The authenticated user's ID (from JWT token)
    
    // Mock the service to return our fake user
    jest.spyOn(service, 'getOne').mockReturnValue(
      new Promise((res) => {
        res(user);
      })
    );

    // Call the controller method with matching IDs
    // In the real app, @ReqUserId() extracts userId from the JWT token
    // In tests, we pass it directly as a parameter
    const result = await controller.getUser(userId, userId);

    // Check that we got back the user data without password
    expect(result).not.toHaveProperty('password');
    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.todos).toEqual(user.todos);
    // Verify that the service's getOne method was called with the correct ID
    expect(service.getOne).toHaveBeenCalledWith(userId);
  });

  /**
   * Test: GET /api/v1/users/:id - Should throw NotFoundException when IDs don't match
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Security test: When a user tries to access another user's data (reqUserId !== id),
   * the controller should throw NotFoundException. This prevents unauthorized access.
   * 
   * WHY IS THIS IMPORTANT?
   * =====================
   * This is a critical security feature. Without this check, any authenticated user
   * could access any other user's data by guessing or knowing their user ID.
   */
  it('should throw NotFoundException when reqUserId does not match id', async () => {
    const authenticatedUserId = 'user-123'; // The user making the request (from JWT)
    const requestedUserId = 'user-456'; // The user they're trying to access (from URL)
    
    // The service should NOT be called when IDs don't match
    // (The controller throws an error before calling the service)
    jest.spyOn(service, 'getOne');

    // Call the controller method with mismatched IDs
    // This should throw NotFoundException
    await expect(
      controller.getUser(authenticatedUserId, requestedUserId)
    ).rejects.toThrow(NotFoundException);

    // Verify that the service was NOT called
    // (The controller should reject the request before calling the service)
    expect(service.getOne).not.toHaveBeenCalled();
  });

  /**
   * Test: GET /api/v1/users/:id - Should exclude password from response
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Security test: Ensure that passwords are never exposed in API responses,
   * even when the user is accessing their own data.
   * 
   * WHY IS THIS IMPORTANT?
   * =====================
   * Passwords (even hashed ones) should never be sent to the client.
   * This prevents potential security vulnerabilities.
   */
  it('should exclude password from response', async () => {
    const user = createMockUser();
    const userId = user.id;
    
    // Mock the service to return our fake user
    jest.spyOn(service, 'getOne').mockReturnValue(
      new Promise((res) => {
        res(user);
      })
    );

    // Call the controller method
    const result = await controller.getUser(userId, userId);

    // CRITICAL: Verify that password is NOT in the response
    expect(result).not.toHaveProperty('password');
    // Verify that all other fields are present
    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.todos).toEqual(user.todos);
  });
});

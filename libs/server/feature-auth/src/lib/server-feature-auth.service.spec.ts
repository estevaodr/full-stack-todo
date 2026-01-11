/**
 * Unit Tests for ServerFeatureAuthService
 * 
 * WHAT ARE WE TESTING HERE?
 * =========================
 * We're testing the SERVICE layer, which contains the business logic.
 * Unlike controller tests (which mock the service), here we test the service itself
 * by mocking its DEPENDENCIES (UserService and JwtService).
 * 
 * WHY TEST THE SERVICE SEPARATELY?
 * ================================
 * 1. Services contain important business logic that needs to be correct
 * 2. We can test error handling (like "invalid credentials")
 * 3. We can verify the service calls dependencies correctly
 * 4. We can verify JWT token generation is working correctly
 * 5. If the controller tests fail, we know if it's a controller or service problem
 * 
 * KEY DIFFERENCE FROM CONTROLLER TESTS:
 * ====================================
 * - Controller tests: Mock the SERVICE, test the CONTROLLER
 * - Service tests: Mock the DEPENDENCIES, test the SERVICE
 */

import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ServerFeatureAuthService } from './server-feature-auth.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { IUser, IPublicUserData, ITokenResponse } from '@full-stack-todo/shared/domain';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ServerFeatureUserService } from '@full-stack-todo/server/feature-user';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

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
 * Helper function to create public user data (without password)
 */
function createMockPublicUser(): IPublicUserData {
  const user = createMockUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicUserData } = user;
  return publicUserData;
}

/**
 * Test Suite: ServerFeatureAuthService
 */
describe('ServerFeatureAuthService', () => {
  // Variables to hold our service and mocked dependencies
  let service: ServerFeatureAuthService;
  let userServiceMock: jest.Mocked<ServerFeatureUserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  /**
   * beforeEach - Setup for each test
   * 
   * We mock the dependencies (UserService and JwtService) so we can control
   * their behavior in our tests.
   */
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock implementations
    const mockUserService = {
      getOneByEmail: jest.fn(),
      getOne: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureAuthService,
        {
          provide: ServerFeatureUserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    // Get the service instance
    service = module.get(ServerFeatureAuthService);
    // Get the mocked dependencies so we can control them in our tests
    userServiceMock = module.get(ServerFeatureUserService);
    jwtServiceMock = module.get(JwtService);
  });

  /**
   * Test: validateUser() - Should return user data when credentials are valid
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly validates user credentials and returns
   * public user data (without password) when credentials are valid.
   */
  it('should return public user data when credentials are valid', async () => {
    const user = createMockUser();
    const plainPassword = 'plainPassword123';
    const email = user.email;

    // Mock userService to return the user
    userServiceMock.getOneByEmail.mockResolvedValue(user);
    // Mock bcrypt.compare to return true (password matches)
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Call the service method
    const result = await service.validateUser(email, plainPassword);

    // Check that we got back public user data (without password)
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('password');
    expect(result?.id).toBe(user.id);
    expect(result?.email).toBe(user.email);
    expect(result?.todos).toEqual(user.todos);

    // Verify that userService.getOneByEmail was called with the correct email
    expect(userServiceMock.getOneByEmail).toHaveBeenCalledWith(email);
    // Verify that bcrypt.compare was called with the plain password and hashed password
    expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, user.password);
  });

  /**
   * Test: validateUser() - Should return null when user doesn't exist
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service returns null (not an error) when a user with the
   * given email doesn't exist. This prevents user enumeration attacks.
   */
  it('should return null when user does not exist', async () => {
    const email = 'nonexistent@example.com';
    const password = 'anyPassword';

    // Mock userService to return null (user not found)
    userServiceMock.getOneByEmail.mockResolvedValue(null);

    // Call the service method
    const result = await service.validateUser(email, password);

    // Check that null was returned
    expect(result).toBeNull();
    // Verify that userService.getOneByEmail was called
    expect(userServiceMock.getOneByEmail).toHaveBeenCalledWith(email);
    // Verify that bcrypt.compare was NOT called (user doesn't exist)
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  /**
   * Test: validateUser() - Should return null when password is invalid
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service returns null (not an error) when the password doesn't match.
   * This prevents user enumeration and timing attacks.
   */
  it('should return null when password is invalid', async () => {
    const user = createMockUser();
    const wrongPassword = 'wrongPassword123';
    const email = user.email;

    // Mock userService to return the user
    userServiceMock.getOneByEmail.mockResolvedValue(user);
    // Mock bcrypt.compare to return false (password doesn't match)
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Call the service method
    const result = await service.validateUser(email, wrongPassword);

    // Check that null was returned
    expect(result).toBeNull();
    // Verify that userService.getOneByEmail was called
    expect(userServiceMock.getOneByEmail).toHaveBeenCalledWith(email);
    // Verify that bcrypt.compare was called with the wrong password
    expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, user.password);
  });

  /**
   * Test: validateUser() - Should exclude password from response
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Security check: Ensure that passwords (even hashed ones) are never
   * returned in the response, even when credentials are valid.
   */
  it('should exclude password from response', async () => {
    const user = createMockUser();
    const plainPassword = 'plainPassword123';
    const email = user.email;

    // Mock userService to return the user
    userServiceMock.getOneByEmail.mockResolvedValue(user);
    // Mock bcrypt.compare to return true
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Call the service method
    const result = await service.validateUser(email, plainPassword);

    // CRITICAL: Verify that password is NOT in the response
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('password');
    // Verify that all other fields are present
    expect(result?.id).toBe(user.id);
    expect(result?.email).toBe(user.email);
    expect(result?.todos).toEqual(user.todos);
  });

  /**
   * Test: generateAccessToken() - Should generate JWT token with correct payload
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly generates a JWT token with the expected payload
   * structure (email and sub claim with user ID).
   */
  it('should generate JWT token with correct payload', async () => {
    const user = createMockPublicUser();
    const mockToken = 'mock.jwt.token.here';

    // Mock jwtService to return a token
    jwtServiceMock.signAsync.mockResolvedValue(mockToken);

    // Call the service method
    const result = await service.generateAccessToken(user);

    // Check that we got back a token response
    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBe(mockToken);

    // Verify that jwtService.signAsync was called
    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
    
    // Get the payload that was passed to signAsync
    const signAsyncCall = (jwtServiceMock.signAsync as jest.Mock).mock.calls[0];
    const payload = signAsyncCall[0];

    // Verify the payload structure
    expect(payload).toHaveProperty('email', user.email);
    expect(payload).toHaveProperty('sub', user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.sub).toBe(user.id);
  });

  /**
   * Test: generateAccessToken() - Should return ITokenResponse format
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service returns the token in the correct format (ITokenResponse)
   * with the access_token property.
   */
  it('should return token in ITokenResponse format', async () => {
    const user = createMockPublicUser();
    const mockToken = 'another.mock.token';

    // Mock jwtService
    jwtServiceMock.signAsync.mockResolvedValue(mockToken);

    // Call the service method
    const result: ITokenResponse = await service.generateAccessToken(user);

    // Verify the response format
    expect(result).toHaveProperty('access_token');
    expect(typeof result.access_token).toBe('string');
    expect(result.access_token).toBe(mockToken);
  });
});

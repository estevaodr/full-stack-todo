/**
 * Unit Tests for ServerFeatureUserService
 * 
 * WHAT ARE WE TESTING HERE?
 * =========================
 * We're testing the SERVICE layer, which contains the business logic.
 * Unlike controller tests (which mock the service), here we test the service itself
 * by mocking the DATABASE REPOSITORY.
 * 
 * WHY TEST THE SERVICE SEPARATELY?
 * ================================
 * 1. Services contain important business logic that needs to be correct
 * 2. We can test error handling (like "user not found")
 * 3. We can verify the service calls the repository correctly
 * 4. We can verify password hashing is working correctly
 * 5. If the controller tests fail, we know if it's a controller or service problem
 * 
 * KEY DIFFERENCE FROM CONTROLLER TESTS:
 * ====================================
 * - Controller tests: Mock the SERVICE, test the CONTROLLER
 * - Service tests: Mock the REPOSITORY, test the SERVICE
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ServerFeatureUserService } from './server-feature-user.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { UserEntitySchema } from '@full-stack-todo/server/data-access-todo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { IUser, ICreateUser } from '@full-stack-todo/shared/domain';

/**
 * MockType - A TypeScript utility type for creating mock objects
 * 
 * This creates a type where every property is optional and is a Jest mock function.
 */
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

/**
 * repositoryMockFactory - Creates a fake database repository for testing
 * 
 * This function creates a fake version of a TypeORM Repository. Instead of talking
 * to a real database, it returns fake data that we control.
 */
export const repositoryMockFactory: () => MockType<Repository<IUser>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    findOneBy: jest.fn(() => ({})),
    save: jest.fn((entity) => entity),
    findOneOrFail: jest.fn(() => ({})),
    delete: jest.fn(() => null),
    find: jest.fn((entities) => entities),
    remove: jest.fn((entity) => entity),
  })
);

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
 * Test Suite: ServerFeatureUserService
 */
describe('ServerFeatureUserService', () => {
  // Variables to hold our service and mocked repository
  let service: ServerFeatureUserService;
  let repoMock: MockType<Repository<IUser>>; // The fake database repository

  /**
   * beforeEach - Setup for each test
   * 
   * KEY DIFFERENCE FROM CONTROLLER TESTS:
   * =====================================
   * - We don't include the controller here (we're testing the service directly)
   * - We get a reference to the mocked repository so we can control what it returns
   */
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureUserService,
        {
          provide: getRepositoryToken(UserEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    // Get the service instance
    service = module.get(ServerFeatureUserService);
    // Get the mocked repository so we can control it in our tests
    repoMock = module.get(getRepositoryToken(UserEntitySchema));
  });

  /**
   * Test: getOne() - Should return a single user
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly finds a user by ID and returns it.
   */
  it('should return a single user', async () => {
    const user = createMockUser();
    
    // Mock the repository to return our fake user when findOneBy() is called
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(user));

    // Call the service method
    const result = await service.getOne(user.id);

    // Check the result
    expect(result).toEqual(user);
    // Verify that findOneBy() was called with the correct ID
    // This ensures the service is passing the right parameters to the repository
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ id: user.id });
  });

  /**
   * Test: getOne() - Should throw error when user not found
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Error handling! When a user doesn't exist, the service should throw a NotFoundException.
   * 
   * WHY TEST ERRORS?
   * ===============
   * Error handling is just as important as happy path (success) scenarios.
   * We need to make sure the service handles errors correctly.
   */
  it('should throw NotFoundException when user is not found', async () => {
    // Mock the repository to return null (user not found)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(null));

    // Use rejects.toThrow() to check that the Promise fails with NotFoundException
    // await expect() waits for the Promise and checks if it throws an error
    await expect(service.getOne('non-existent-id')).rejects.toThrow(
      NotFoundException
    );
  });

  /**
   * Test: getOneByEmail() - Should return a user by email
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly finds a user by email and returns it.
   */
  it('should return a user by email', async () => {
    const user = createMockUser();
    
    // Mock the repository to return our fake user when findOneBy() is called
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(user));

    // Call the service method
    const result = await service.getOneByEmail(user.email);

    // Check the result
    expect(result).toEqual(user);
    // Verify that findOneBy() was called with the correct email
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ email: user.email });
  });

  /**
   * Test: getOneByEmail() - Should return null when user not found
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service returns null (not an error) when a user with the given email doesn't exist.
   * This is different from getOne() which throws an error.
   */
  it('should return null when user is not found by email', async () => {
    // Mock the repository to return null (user not found)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(null));

    // Call the service method
    const result = await service.getOneByEmail('nonexistent@example.com');

    // Check that null was returned (not an error)
    expect(result).toBeNull();
    // Verify that findOneBy() was called with the correct email
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
  });

  /**
   * Test: create() - Should create a new user with hashed password
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service:
   * 1. Hashes the password using bcrypt before saving
   * 2. Saves the user with the hashed password (not the plain password)
   * 3. Initializes the todos array as empty
   * 
   * WHY TEST PASSWORD HASHING?
   * ==========================
   * Password security is critical! We must ensure passwords are never stored in plain text.
   */
  it('should create a new user with hashed password', async () => {
    const plainPassword = 'SecureP@ssw0rd123!';
    const userData: ICreateUser = {
      email: 'newuser@example.com',
      password: plainPassword,
    };
    
    // Mock bcrypt.hash to return a hashed password
    const hashedPassword = 'hashedPassword123';
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    
    // Mock the repository to return the saved user
    const savedUser: IUser = {
      id: 'user-123',
      email: userData.email,
      password: hashedPassword,
      todos: [],
    };
    repoMock.save?.mockReturnValue(Promise.resolve(savedUser));

    // Call create with the user data
    const result = await service.create(userData);

    // Verify that bcrypt.hash was called with the plain password and 10 rounds
    expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
    
    // Verify that save was called with the hashed password (not the plain password)
    expect(repoMock.save).toHaveBeenCalledWith({
      email: userData.email,
      password: hashedPassword, // Should be hashed, not plain
      todos: [], // Should initialize todos as empty array
    });
    
    // Check that we got back the saved user
    expect(result).toEqual(savedUser);
    // Verify that the password in the result is hashed (not the original plain password)
    expect(result.password).toBe(hashedPassword);
    expect(result.password).not.toBe(plainPassword);
  });

  /**
   * Test: create() - Should not store plain text password
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Security check: Ensure the plain password is never saved to the database.
   * This is a critical security requirement.
   */
  it('should not store plain text password', async () => {
    const plainPassword = 'MySecretPassword123!';
    const userData: ICreateUser = {
      email: 'testuser@example.com',
      password: plainPassword,
    };
    
    // Mock bcrypt.hash to return a hashed password
    const hashedPassword = 'hashedPassword456';
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    
    // Mock the repository
    const savedUser: IUser = {
      id: 'user-456',
      email: userData.email,
      password: hashedPassword,
      todos: [],
    };
    repoMock.save?.mockReturnValue(Promise.resolve(savedUser));

    // Call create
    await service.create(userData);

    // Verify that save was called
    expect(repoMock.save).toHaveBeenCalled();
    
    // Get the arguments passed to save
    const saveCallArgs = (repoMock.save as jest.Mock).mock.calls[0][0];
    
    // CRITICAL: Verify that the plain password was NOT saved
    expect(saveCallArgs.password).not.toBe(plainPassword);
    // Verify that a hashed password WAS saved
    expect(saveCallArgs.password).toBe(hashedPassword);
  });
});

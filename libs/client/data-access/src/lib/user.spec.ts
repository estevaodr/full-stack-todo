/**
 * Unit Tests for User Service (Data Access Library)
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the User service separately from the actual HTTP network calls, backend server,
 * and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 5. Ensure API endpoints are called correctly with the right parameters
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like HttpClient) that we control.
 * Instead of making real HTTP requests (slow, requires network, backend server), we use
 * a mock that pretends to be HttpClient. This makes tests:
 * - Fast (no network calls)
 * - Reliable (no network issues or server downtime)
 * - Isolated (tests don't affect each other)
 * - Predictable (we control what the mock returns)
 * 
 * HOW DO WE MOCK HTTPCLIENT?
 * ==========================
 * We use `jest.spyOn()` to watch HttpClient methods and `mockReturnValue()` to tell them
 * what to return. Since HttpClient returns Observables, we wrap our fake data with `of()`
 * from RxJS to create an Observable that immediately emits our test data.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from './user';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { IPublicUserData } from '@full-stack-todo/shared/domain';

/**
 * Helper function to create a mock user (public data without password)
 * 
 * @returns IPublicUserData - A mock user with public data
 */
function createMockUser(): IPublicUserData {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
    todos: [],
  };
}

/**
 * Test Suite: User Service
 * 
 * WHAT IS A TEST SUITE?
 * =====================
 * A group of related tests. All tests in this describe() block test the User service.
 * 
 * TEST STRUCTURE:
 * ==============
 * 1. Setup (beforeEach) - Prepare the test environment
 * 2. Tests (it blocks) - Individual test cases
 * 3. Assertions (expect) - Check that results are correct
 * 
 * WHAT DOES BEFOREEACH DO?
 * =========================
 * The `beforeEach` function runs before every test. It sets up:
 * - TestBed: Angular's testing framework that creates a test environment
 * - provideHttpClientTesting: Provides a fake HttpClient for testing
 * - Service instance: The User service we're testing
 * - HttpClient reference: So we can spy on and mock its methods
 */
describe('User', () => {
  let service: User;
  let http: HttpClient;
  let httpSpy: jest.SpyInstance | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [User, provideHttpClient(), provideHttpClientTesting()],
    });

    // Get references to the service and HttpClient so we can use them in tests
    service = TestBed.inject(User);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    // Clean up spies after each test to prevent interference between tests
    if (httpSpy) {
      httpSpy.mockRestore();
      httpSpy = null;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test: GET /api/v1/users/:id - Should get a single user by ID
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that getUser() correctly calls the GET endpoint with the user ID
   * in the URL and returns a single user object (without password).
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake user object (public data without password)
   * 2. Mock HttpClient.get() to return our fake user wrapped in an Observable
   * 3. Call the service method with the user's ID
   * 4. Verify the response matches our fake user
   * 5. Verify HttpClient.get() was called with the correct URL including the ID
   */
  it('should get a single user by ID', (done) => {
    const user = createMockUser();
    
    httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(user));
    
    service.getUser(user.id).subscribe({
      next: (val) => {
        expect(val).toStrictEqual(user);
        expect(val.id).toBe(user.id);
        expect(val.email).toBe(user.email);
        // Verify password is not included in the response
        expect((val as any).password).toBeUndefined();
        // Check spy before calling done() to ensure assertions complete
        expect(httpSpy).toHaveBeenCalledTimes(1);
        expect(httpSpy).toHaveBeenCalledWith(`/api/v1/users/${user.id}`);
        done();
      },
      error: done.fail,
    });
  });

  /**
   * Test: GET /api/v1/users/:id - Should handle different user IDs correctly
   * 
   * This test verifies that the service correctly constructs the URL
   * with different user IDs and doesn't mix up requests.
   */
  it('should handle different user IDs correctly', (done) => {
    const user1 = createMockUser();
    const user2 = createMockUser();
    
    httpSpy = jest.spyOn(http, 'get').mockImplementation((url: string) => {
      if (url === `/api/v1/users/${user1.id}`) {
        return of(user1);
      } else if (url === `/api/v1/users/${user2.id}`) {
        return of(user2);
      }
      return of({} as IPublicUserData);
    });
    
    service.getUser(user1.id).subscribe({
      next: (val) => {
        expect(val.id).toBe(user1.id);
        expect(val.email).toBe(user1.email);
        done();
      },
      error: done.fail,
    });
  });
});

/**
 * Unit Tests for Auth Service (Data Access Library)
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the Auth service separately from the actual HTTP network calls, backend server,
 * localStorage, and JWT decoding.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 5. Ensure authentication logic works correctly
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like HttpClient, localStorage, jwtDecode) that we control.
 * Instead of making real HTTP requests, accessing real browser storage, or decoding real tokens,
 * we use mocks that pretend to be these things. This makes tests:
 * - Fast (no network calls, no browser APIs)
 * - Reliable (no network issues or browser differences)
 * - Isolated (tests don't affect each other)
 * - Predictable (we control what the mocks return)
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Auth } from './auth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ILoginPayload, ITokenResponse, IAccessTokenPayload } from '@full-stack-todo/shared/domain';
import { TOKEN_STORAGE_KEY } from '@full-stack-todo/client/util';
// Mock jwtDecode - using manual mock from __mocks__ directory
jest.mock('jwt-decode');
import { jwtDecode } from 'jwt-decode';

/**
 * Helper function to create a mock JWT token payload
 * 
 * @returns IAccessTokenPayload - A mock token payload with user data
 */
function createMockTokenPayload(): IAccessTokenPayload {
  return {
    email: 'test@example.com',
    sub: 'user-123',
    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
  };
}

/**
 * Helper function to create a mock login payload
 * 
 * @returns ILoginPayload - Mock login credentials
 */
function createMockLoginPayload(): ILoginPayload {
  return {
    email: 'test@example.com',
    password: 'password123',
  };
}

/**
 * Helper function to create a mock token response
 * 
 * @returns ITokenResponse - Mock token response from backend
 */
function createMockTokenResponse(): ITokenResponse {
  return {
    access_token: 'mock-jwt-token-string',
  // checkov:skip=CKV_SECRET_6: ADD REASON
  };
}

describe('Auth', () => {
  let service: Auth;
  let http: HttpClient;
  let httpSpy: jest.SpyInstance | null;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    Storage.prototype.getItem = jest.fn((key: string) => {
      return localStorageMock[key] || null;
    });
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });
    Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {};
    });

    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    // Clean up spies and localStorage mock
    if (httpSpy) {
      httpSpy.mockRestore();
      httpSpy = null;
    }
    localStorageMock = {};
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test: setToken - Should store token in BehaviorSubject and localStorage
   */
  it('should set token and store in localStorage', () => {
    const token = 'test-jwt-token';
    const mockPayload = createMockTokenPayload();
    
    (jwtDecode as jest.Mock).mockReturnValue(mockPayload);

    service.setToken(token);

    // Check that token is stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, token);
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBe(token);

    // Check that token is emitted via Observable
    let emittedToken: string | null = null;
    service.accessToken$.subscribe((t) => {
      emittedToken = t;
    });
    expect(emittedToken).toBe(token);

    // Check that user data is decoded and emitted
    let emittedUserData: IAccessTokenPayload | null = null;
    service.userData$.subscribe((data) => {
      emittedUserData = data;
    });
    expect(emittedUserData).toEqual(mockPayload);
    expect(jwtDecode).toHaveBeenCalledWith(token);
  });

  /**
   * Test: clearToken - Should remove token from BehaviorSubject and localStorage
   */
  it('should clear token from BehaviorSubject and localStorage', () => {
    const token = 'test-jwt-token';
    const mockPayload = createMockTokenPayload();
    
    (jwtDecode as jest.Mock).mockReturnValue(mockPayload);
    
    // First set a token
    service.setToken(token);
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBe(token);

    // Then clear it
    service.clearToken();

    // Check that token is removed from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBeUndefined();

    // Check that token Observable emits null
    let emittedToken: string | null = null;
    service.accessToken$.subscribe((t) => {
      emittedToken = t;
    });
    expect(emittedToken).toBeNull();

    // Check that userData Observable emits null
    let emittedUserData: IAccessTokenPayload | null = null;
    service.userData$.subscribe((data) => {
      emittedUserData = data;
    });
    expect(emittedUserData).toBeNull();
  });

  /**
   * Test: loadToken - Should load token from localStorage if it exists
   */
  it('should load token from localStorage if it exists', (done) => {
    const token = 'stored-jwt-token';
    const mockPayload = createMockTokenPayload();
    
    // Set token in localStorage mock
    localStorageMock[TOKEN_STORAGE_KEY] = token;
    
    (jwtDecode as jest.Mock).mockReturnValue(mockPayload);

    service.loadToken();

    // Check that token is loaded and emitted
    service.accessToken$.subscribe({
      next: (t) => {
        expect(t).toBe(token);
        done();
      },
      error: done.fail,
    });

    // Check that user data is decoded and emitted
    service.userData$.subscribe({
      next: (data) => {
        expect(data).toEqual(mockPayload);
        expect(jwtDecode).toHaveBeenCalledWith(token);
      },
      error: done.fail,
    });
  });

  /**
   * Test: loadToken - Should not load token if localStorage is empty
   */
  it('should not load token if localStorage is empty', () => {
    // Ensure localStorage is empty
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBeUndefined();

    service.loadToken();

    // Check that token Observable still emits null
    let emittedToken: string | null = null;
    service.accessToken$.subscribe((t) => {
      emittedToken = t;
    });
    expect(emittedToken).toBeNull();

    // jwtDecode should not be called
    expect(jwtDecode).not.toHaveBeenCalled();
  });

  /**
   * Test: loginUser - Should call login endpoint and store token on success
   */
  it('should login user and store token on success', (done) => {
    const loginData = createMockLoginPayload();
    const tokenResponse = createMockTokenResponse();
    const mockPayload = createMockTokenPayload();

    httpSpy = jest.spyOn(http, 'post').mockReturnValue(of(tokenResponse));
    (jwtDecode as jest.Mock).mockReturnValue(mockPayload);

    service.loginUser(loginData).subscribe({
      next: (response) => {
        expect(response).toEqual(tokenResponse);
        // Check that token was stored
        expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, tokenResponse.access_token);
        expect(httpSpy).toHaveBeenCalledWith('/api/v1/auth/login', loginData);
        done();
      },
      error: done.fail,
    });
  });

  /**
   * Test: logoutUser - Should clear token
   */
  it('should logout user and clear token', () => {
    const token = 'test-jwt-token';
    const mockPayload = createMockTokenPayload();
    
    (jwtDecode as jest.Mock).mockReturnValue(mockPayload);
    
    // First set a token
    service.setToken(token);
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBe(token);

    // Then logout
    service.logoutUser();

    // Check that token is cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(localStorageMock[TOKEN_STORAGE_KEY]).toBeUndefined();
  });

  /**
   * Test: isTokenExpired - Should return true if token is expired
   */
  it('should return true if token is expired', () => {
    const expiredPayload: IAccessTokenPayload & { exp: number } = {
      email: 'test@example.com',
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
    };

    const token = 'expired-token';
    (jwtDecode as jest.Mock).mockReturnValue(expiredPayload);
    service.setToken(token);

    expect(service.isTokenExpired()).toBe(true);
  });

  /**
   * Test: isTokenExpired - Should return false if token is not expired
   */
  it('should return false if token is not expired', () => {
    const validPayload: IAccessTokenPayload & { exp: number } = {
      email: 'test@example.com',
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    };

    const token = 'valid-token';
    (jwtDecode as jest.Mock).mockReturnValue(validPayload);
    service.setToken(token);

    expect(service.isTokenExpired()).toBe(false);
  });

  /**
   * Test: isTokenExpired - Should return true if token will expire within 5 seconds (grace period)
   */
  it('should return true if token will expire within 5 seconds', () => {
    const soonToExpirePayload: IAccessTokenPayload & { exp: number } = {
      email: 'test@example.com',
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3, // Expires in 3 seconds (within 5 second grace period)
    };

    const token = 'soon-to-expire-token';
    (jwtDecode as jest.Mock).mockReturnValue(soonToExpirePayload);
    service.setToken(token);

    expect(service.isTokenExpired()).toBe(true);
  });

  /**
   * Test: isTokenExpired - Should return true if no user data exists
   */
  it('should return true if no user data exists', () => {
    // Don't set any token
    expect(service.isTokenExpired()).toBe(true);
  });

  /**
   * Test: decodeToken - Should handle invalid token gracefully
   */
  it('should handle invalid token gracefully', () => {
    const invalidToken = 'invalid-token';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    service.setToken(invalidToken);

    // Should not throw, but should log error
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error decoding token:', expect.any(Error));

    // User data should be null
    let emittedUserData: IAccessTokenPayload | null = null;
    service.userData$.subscribe((data) => {
      emittedUserData = data;
    });
    expect(emittedUserData).toBeNull();

    consoleErrorSpy.mockRestore();
  });
});

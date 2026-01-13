import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ILoginPayload, ITokenResponse, IAccessTokenPayload } from '@full-stack-todo/shared/domain';
import { TOKEN_STORAGE_KEY } from '@full-stack-todo/client/util';

/**
 * Authentication Service for JWT handling and user authentication
 * 
 * This service manages JWT tokens, user authentication state, and provides
 * methods for logging in and logging out users. It stores tokens in localStorage
 * to persist authentication across page refreshes.
 * 
 * @Injectable decorator with 'root' means this service is a singleton available app-wide
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);

  /**
   * Private BehaviorSubject for managing the access token state.
   * This is the source of truth for the current JWT token.
   */
  private accessTokenSubject$ = new BehaviorSubject<string | null>(null);

  /**
   * Private BehaviorSubject for managing decoded user data from the JWT.
   * This contains user information extracted from the token payload.
   */
  private userDataSubject$ = new BehaviorSubject<IAccessTokenPayload | null>(null);

  /**
   * Public Observable for the encoded access token.
   * The token is stored so that it can be used by an interceptor
   * and injected as a header in HTTP requests.
   * 
   * Note: This is exposed as a read-only Observable to prevent external
   * code from directly modifying the token state.
   */
  readonly accessToken$ = this.accessTokenSubject$.asObservable();

  /**
   * Public Observable for decoded user data from the JWT.
   * Data from the decoded JWT including a user's ID (sub) and email address.
   * 
   * Components can subscribe to this to display user information
   * and determine authentication state.
   */
  readonly userData$ = this.userDataSubject$.asObservable();

  /**
   * Sets the JWT token and stores it in both the BehaviorSubject and localStorage.
   * 
   * @param val - The JWT token string to store
   */
  setToken(val: string): void {
    this.accessTokenSubject$.next(val);
    localStorage.setItem(TOKEN_STORAGE_KEY, val);
    // Decode and store user data when token is set
    this.userDataSubject$.next(this.decodeToken(val));
  }

  /**
   * Clears the JWT token from both the BehaviorSubject and localStorage.
   * This is called when a user logs out.
   */
  clearToken(): void {
    this.accessTokenSubject$.next(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.userDataSubject$.next(null);
  }

  /**
   * Loads the JWT token from localStorage on application initialization.
   * This allows users to remain authenticated across page refreshes.
   * 
   * Should be called during app initialization (e.g., in APP_INITIALIZER
   * or in the root component's ngOnInit).
   */
  loadToken(): void {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      this.accessTokenSubject$.next(token);
      this.userDataSubject$.next(this.decodeToken(token));
    }
  }

  /**
   * Authenticates a user by sending login credentials to the backend.
   * 
   * On successful login, the JWT token is automatically stored and
   * user data is decoded and made available via the userData$ Observable.
   * 
   * @param data - Login credentials (email and password)
   * @returns Observable that emits the token response from the server
   */
  loginUser(data: ILoginPayload): Observable<ITokenResponse> {
    return this.http
      .post<ITokenResponse>(`/api/v1/auth/login`, data)
      .pipe(
        tap(({ access_token }) => {
          this.setToken(access_token);
        })
      );
  }

  /**
   * Logs out the current user by clearing the token and user data.
   * This should be called when the user explicitly logs out.
   */
  logoutUser(): void {
    this.clearToken();
  }

  /**
   * Checks if the current JWT token is expired.
   * 
   * Compares the `exp` field of a token to the current time.
   * Returns a boolean with a 5 second grace period to account for
   * clock skew and network delays.
   * 
   * @returns true if the token is expired (or will expire within 5 seconds), false otherwise
   */
  isTokenExpired(): boolean {
    const userData = this.userDataSubject$.value;
    if (userData && 'exp' in userData) {
      const expiryTime = (userData as any).exp;
      if (expiryTime) {
        // Convert expiry time (seconds) to milliseconds and compare with current time
        // Add 5000ms (5 seconds) grace period
        return 1000 * +expiryTime - new Date().getTime() < 5000;
      }
    }
    return true; // Consider expired if no expiry time is present
  }

  /**
   * Decodes a JWT token and extracts the payload.
   * 
   * @param token - The JWT token string to decode, or null
   * @returns The decoded token payload, or null if token is invalid/missing
   */
  private decodeToken(token: string | null): IAccessTokenPayload | null {
    if (token) {
      try {
        return jwtDecode<IAccessTokenPayload>(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
}

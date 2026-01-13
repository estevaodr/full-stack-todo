/**
 * Client-side constants used across the Angular application.
 * 
 * These constants are shared utilities that don't belong to any
 * specific feature but are used application-wide.
 */

/**
 * Storage key for JWT access tokens in localStorage.
 * 
 * This key is used to store and retrieve JWT tokens from the browser's
 * localStorage, allowing users to remain authenticated across page refreshes.
 * 
 * Note: Storing JWTs in localStorage is a common pattern, but be aware
 * of security considerations. See documentation for more details.
 */
export const TOKEN_STORAGE_KEY = 'fst-token-storage';
  // checkov:skip=CKV_SECRET_6: ADD REASON

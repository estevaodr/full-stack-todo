/**
 * Interface representing a JWT token response from authentication endpoints.
 * This is the core domain model shared between frontend and backend.
 */
export interface ITokenResponse {
  /** The JWT access token string */
  access_token: string;
}

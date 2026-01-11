/**
 * Interface representing the payload structure of a JWT access token.
 * This is the core domain model shared between frontend and backend.
 */
export interface IAccessTokenPayload {
  /** User's email address */
  email: string;

  /**
   * User's ID will be used as the subject (sub) claim in the JWT.
   * This follows the JWT standard where 'sub' represents the subject
   * of the token (typically the user ID).
   */
  sub: string;
}

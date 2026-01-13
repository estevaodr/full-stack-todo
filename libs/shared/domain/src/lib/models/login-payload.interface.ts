/**
 * Interface representing the payload for user login requests.
 * This is the core domain model shared between frontend and backend.
 * 
 * Used when a user attempts to authenticate by providing their
 * email address and password credentials.
 */
export interface ILoginPayload {
  /** User's email address used for authentication */
  email: string;

  /** User's password (plain text, will be hashed/verified on the backend) */
  password: string;
}

import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IPublicUserData, ITokenResponse, IAccessTokenPayload } from '@full-stack-todo/shared/domain';
import { ServerFeatureUserService } from '@full-stack-todo/server/feature-user';

/**
 * Service for handling authentication operations.
 * 
 * This service is responsible for:
 * - Validating user credentials (email and password)
 * - Generating JWT access tokens for authenticated users
 * 
 * Authentication Flow:
 * 1. User provides email and password via login endpoint
 * 2. validateUser() checks credentials against database
 * 3. If valid, generateAccessToken() creates a JWT token
 * 4. Token is returned to client for use in subsequent requests
 * 
 * Circular Dependency Note:
 * =======================
 * This service uses forwardRef() to inject ServerFeatureUserService
 * to avoid circular dependencies between auth and user modules.
 * This is a common pattern when modules depend on each other.
 */
@Injectable()
export class ServerFeatureAuthService {
  private readonly logger = new Logger(ServerFeatureAuthService.name);

  constructor(
    /**
     * Use forwardRef to inject ServerFeatureUserService to avoid circular dependencies.
     * The auth module depends on the user module, and potentially vice versa.
     */
    @Inject(forwardRef(() => ServerFeatureUserService))
    private userService: ServerFeatureUserService,
    
    /**
     * JwtService from @nestjs/jwt is used to sign JWT tokens.
     * It must be configured in the module with JWT_SECRET and expiration settings.
     */
    private jwtService: JwtService
  ) {}

  /**
   * Validates user credentials by checking email and password.
   * 
   * This method:
   * 1. Looks up the user by email
   * 2. Compares the provided password with the stored hash using bcrypt
   * 3. Returns public user data if credentials are valid, null otherwise
   * 
   * @param email - The user's email address
   * @param password - The plain text password to validate
   * @returns Promise that resolves to IPublicUserData if credentials are valid, null otherwise
   * 
   * Security Notes:
   * - Uses bcrypt.compare() to securely compare passwords (timing-safe)
   * - Never returns the password hash in the response
   * - Returns null (not an error) for invalid credentials to prevent user enumeration
   */
  async validateUser(
    email: string,
    password: string
  ): Promise<IPublicUserData | null> {
    // Look up user by email
    const user = await this.userService.getOneByEmail(email);
    
    // If user doesn't exist, return null
    if (!user) {
      this.logger.debug(`Authentication failed: user with email '${email}' not found`);
      return null;
    }
    
    // Compare the provided password with the stored hash
    // bcrypt.compare() is timing-safe and handles the comparison securely
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      this.logger.debug(`User '${email}' authenticated successfully`);
      // Exclude password from response - return only public user data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...publicUserData } = user;
      return publicUserData;
    }
    
    // Password doesn't match
    this.logger.debug(`Authentication failed: invalid password for user '${email}'`);
    return null;
  }

  /**
   * Generates a JWT access token for an authenticated user.
   * 
   * This method:
   * 1. Creates a JWT payload with user's email and ID (as 'sub' claim)
   * 2. Signs the token using JwtService
   * 3. Returns the token in the standard ITokenResponse format
   * 
   * @param user - Public user data (without password) to include in the token
   * @returns Promise that resolves to ITokenResponse containing the access token
   * 
   * Token Structure:
   * - email: User's email address
   * - sub: User's ID (subject claim, JWT standard)
   * 
   * The token expiration is configured in the module's JwtModule configuration.
   */
  async generateAccessToken(user: IPublicUserData): Promise<ITokenResponse> {
    // Create JWT payload following IAccessTokenPayload interface
    const payload: IAccessTokenPayload = {
      email: user.email,
      sub: user.id, // 'sub' is the JWT standard claim for subject (user ID)
    };
    
    // Sign the token asynchronously and return in standard format
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

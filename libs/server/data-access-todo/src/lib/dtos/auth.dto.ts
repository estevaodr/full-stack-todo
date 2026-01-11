/**
 * Data Transfer Objects (DTOs) for Authentication operations
 * 
 * DTOs are objects that define how data is structured when it's transferred
 * between different layers of an application (e.g., from client to server,
 * or from API to database). They serve multiple purposes:
 * 
 * 1. Validation: Ensure incoming data meets requirements before processing
 * 2. Documentation: Provide Swagger/OpenAPI documentation for API endpoints
 * 3. Type Safety: Enforce TypeScript types at runtime through decorators
 * 4. Data Transformation: Control what data is exposed/expected in different contexts
 * 
 * This file contains DTOs for:
 * - User login requests (LoginRequestDto)
 * - Authentication token responses (LoginResponseDto)
 */

// class-validator decorators: Validate data at runtime
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// @nestjs/swagger decorator: Generates OpenAPI/Swagger documentation
import { ApiProperty } from '@nestjs/swagger';

// Domain interfaces: The domain models that define the structure
import { ITokenResponse } from '@full-stack-todo/shared/domain';

/**
 * Data Transfer Object for user login requests.
 * 
 * This DTO is used when a client wants to authenticate and receive a JWT token.
 * It requires email and password to verify the user's credentials.
 * 
 * Validation Strategy:
 * - Email must be a valid email format
 * - Password must be provided (not empty)
 * - Both fields are required
 * 
 * Usage: POST /api/v1/auth/login
 */
export class LoginRequestDto {
  /**
   * The user's email address
   * 
   * Validation Rules:
   * - @IsEmail(): Must be a valid email format
   * - @IsNotEmpty(): Cannot be null, undefined, or an empty string
   * 
   * The `!` (non-null assertion) tells TypeScript this property will always
   * have a value after validation, even though it's not initialized in the class.
   */
  @ApiProperty({
    type: String,
    example: 'user@example.com',
    required: true,
    description: 'The user\'s email address',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /**
   * The user's password (plain text, will be verified against stored hash)
   * 
   * Validation Rules:
   * - @IsString(): Must be a string type
   * - @IsNotEmpty(): Cannot be null, undefined, or an empty string
   * 
   * Note: This is the plain text password sent by the client. It will be
   * compared against the hashed password stored in the database using bcrypt.
   */
  @ApiProperty({
    type: String,
    example: 'SecureP@ssw0rd123!',
    required: true,
    description: 'The user\'s password',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

/**
 * Data Transfer Object for authentication token responses.
 * 
 * This DTO is returned after successful authentication and contains the JWT
 * access token that the client can use for subsequent authenticated requests.
 * 
 * TypeScript: Implements ITokenResponse to ensure type safety and consistency
 * 
 * Usage: Response from POST /api/v1/auth/login
 */
export class LoginResponseDto implements ITokenResponse {
  /**
   * The JWT access token string
   * 
   * This token should be included in the Authorization header of subsequent
   * requests as: Authorization: Bearer <access_token>
   */
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    required: true,
    description: 'JWT access token for authenticated requests',
  })
  @IsString()
  @IsNotEmpty()
  access_token!: string;
}

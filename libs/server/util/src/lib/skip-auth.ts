import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to mark routes that should skip JWT authentication.
 * 
 * This constant is used in conjunction with the JwtAuthGuard to identify
 * routes that should be publicly accessible without requiring a valid JWT token.
 */
export const SKIP_AUTH_KEY = 'skipAuth';

/**
 * Decorator used to mark routes that should skip JWT authentication.
 * 
 * When applied to a route handler or controller, this decorator sets metadata
 * that the JwtAuthGuard will check. If the metadata is present, the guard will
 * skip authentication for that route, allowing public access.
 * 
 * This is useful for public endpoints such as:
 * - User registration (POST /users)
 * - User login (POST /auth/login)
 * - Public API documentation
 * 
 * @example
 * ```typescript
 * @Post('')
 * @SkipAuth()
 * async createUser(@Body() userData: CreateUserDto) {
 *   return this.userService.create(userData);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * @Controller('auth')
 * @SkipAuth()
 * export class AuthController {
 *   // All routes in this controller will skip authentication
 * }
 * ```
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);

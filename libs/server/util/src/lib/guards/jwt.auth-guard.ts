import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_AUTH_KEY } from '../skip-auth';

/**
 * JWT Authentication Guard that extends Passport's JWT strategy guard.
 * 
 * This guard is responsible for protecting routes by validating JWT tokens.
 * It can be configured to skip authentication for specific routes using the
 * @SkipAuth() decorator.
 * 
 * How it works:
 * 1. Checks for SKIP_AUTH_KEY metadata on the route handler or controller
 * 2. If the metadata is present (route is marked with @SkipAuth()), authentication is skipped
 * 3. Otherwise, it calls the parent AuthGuard('jwt') to validate the JWT token
 * 
 * The guard uses Reflector to read metadata set by decorators. This allows
 * routes to opt-out of authentication when needed (e.g., public endpoints).
 * 
 * @example
 * ```typescript
 * // In app.module.ts
 * providers: [
 *   {
 *     provide: APP_GUARD,
 *     useClass: JwtAuthGuard,
 *   },
 * ]
 * ```
 * 
 * @example
 * ```typescript
 * // Public route (skips authentication)
 * @Post('login')
 * @SkipAuth()
 * async login(@Body() loginDto: LoginRequestDto) {
 *   return this.authService.login(loginDto);
 * }
 * 
 * // Protected route (requires authentication)
 * @Get('profile')
 * async getProfile(@ReqUser() user: any) {
 *   return user;
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Overrides the canActivate method to check for SKIP_AUTH_KEY metadata.
   * 
   * If a route is decorated with @SkipAuth(), this method will return true
   * (allowing the request to proceed without authentication). Otherwise, it
   * delegates to the parent AuthGuard('jwt') to validate the JWT token.
   * 
   * @param ctx - The execution context containing request and route information
   * @returns true if authentication should be skipped, otherwise the result of super.canActivate()
   */
  override canActivate(ctx: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    
    if (skipAuth) {
      return true;
    }
    
    return super.canActivate(ctx);
  }
}

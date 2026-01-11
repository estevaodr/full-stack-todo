import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAccessTokenPayload } from '@full-stack-todo/shared/domain';

/**
 * JWT Strategy for Passport authentication
 * 
 * This strategy extends Passport's JWT strategy to validate JWT tokens
 * in incoming requests. It extracts the token from the Authorization header
 * and validates it using the JWT secret from configuration.
 * 
 * How it works:
 * 1. Extracts JWT from Authorization header as Bearer token
 * 2. Validates the token signature using JWT_SECRET from ConfigService
 * 3. Decodes the token payload
 * 4. Calls validate() method with the decoded payload
 * 5. Returns user object that gets attached to the request
 * 
 * The validate() method transforms the JWT payload into a user object
 * that will be available in route handlers via @ReqUser() or @ReqUserId() decorators.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extract JWT from Authorization header as Bearer token
      // Format: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Don't ignore token expiration - expired tokens should be rejected
      ignoreExpiration: false,
      
      // Get the JWT secret from ConfigService
      // This must match the secret used to sign tokens
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload and returns user data to be attached to the request.
   * 
   * This method is called by Passport after it has:
   * 1. Verified the JWT signature
  2. Decoded the token
   * 3. Checked token expiration
   * 
   * Since the token was signed by our application, we can trust that:
   * - The payload is valid
   * - The user exists (we created the token for them)
   * - The token hasn't been tampered with
   * 
   * The return value becomes the `user` property on the request object,
   * which can be accessed via @ReqUser() or @ReqUserId() decorators.
   * 
   * @param payload - The decoded JWT payload (IAccessTokenPayload)
   * @returns User object with userId (from sub claim) and other payload properties
   * 
   * @example
   * If the JWT payload is: { sub: "user-123", email: "user@example.com" }
   * This method returns: { userId: "user-123", email: "user@example.com" }
   */
  async validate(
    payload: IAccessTokenPayload
  ): Promise<{ userId: string; [key: string]: unknown }> {
    // Extract the 'sub' claim (subject/user ID) and rename it to 'userId'
    // The 'sub' claim is a JWT standard for the subject of the token
    const { sub, ...rest } = payload;
    
    // Return user object with userId and all other payload properties
    // This object will be attached to the request as request.user
    return { userId: sub, ...rest };
  }
}

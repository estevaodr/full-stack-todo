import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServerFeatureUserModule } from '@full-stack-todo/server/feature-user';
import { ServerFeatureAuthController } from './server-feature-auth.controller';
import { ServerFeatureAuthService } from './server-feature-auth.service';
import { JwtStrategy } from './jwt-strategy.service';

/**
 * NestJS module for the Authentication feature.
 * 
 * This module encapsulates authentication-related functionality including:
 * - User login and token generation
 * - JWT token validation strategy
 * - Integration with Passport for authentication
 * 
 * Module Dependencies:
 * - ConfigModule: Provides access to environment variables (JWT_SECRET, etc.)
 * - JwtModule: Provides JwtService for signing and verifying JWT tokens
 * - PassportModule: Provides Passport integration for authentication strategies
 * - ServerFeatureUserModule: Provides user service for credential validation
 *   (uses forwardRef to avoid circular dependencies)
 * 
 * Exports:
 * - ServerFeatureAuthService: Makes the auth service available to other modules
 */
@Module({
  imports: [
    // ConfigModule is global, but we import it here for clarity
    // It provides ConfigService for reading environment variables
    ConfigModule,
    
    /**
     * JwtModule Configuration
     * 
     * Configures JWT token signing and validation.
     * Uses registerAsync() to inject ConfigService for dynamic configuration.
     * 
     * Configuration:
     * - secret: JWT_SECRET from environment (required)
     * - expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN from environment (defaults to '600s')
     * 
     * The secret must match the one used in JwtStrategy for token validation.
     */
    JwtModule.registerAsync({
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn = config.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '600s';
        return {
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            // Type assertion needed: jsonwebtoken's StringValue type is more restrictive than plain string,
            // but the runtime library accepts string values like '600s' without issue
            // @ts-expect-error - StringValue type mismatch, but runtime accepts string values
            expiresIn: expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    
    /**
     * PassportModule
     * 
     * Required for Passport authentication strategies.
     * This enables the JWT strategy to work with Passport.
     */
    PassportModule,
    
    /**
     * ServerFeatureUserModule
     * 
     * Provides ServerFeatureUserService for validating user credentials.
     * Uses forwardRef() to avoid circular dependencies between auth and user modules.
     * 
     * Circular Dependency Note:
     * - Auth module needs UserService to validate credentials
     * - User module might need AuthService in the future
     * - forwardRef() allows both modules to reference each other safely
     */
    forwardRef(() => ServerFeatureUserModule),
  ],
  
  controllers: [ServerFeatureAuthController],
  
  providers: [
    ServerFeatureAuthService,
    /**
     * JwtStrategy
     * 
     * Passport strategy for validating JWT tokens.
     * This strategy:
     * - Extracts JWT from Authorization header
     * - Validates token signature using JWT_SECRET
     * - Transforms token payload into user object
     * - Makes user data available via @ReqUser() and @ReqUserId() decorators
     */
    JwtStrategy,
  ],
  
  /**
   * Exports
   * 
   * Makes ServerFeatureAuthService available to other modules that import this module.
   * This allows other modules to use authentication functionality if needed.
   */
  exports: [ServerFeatureAuthService],
})
export class ServerFeatureAuthModule {}

import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ITokenResponse } from '@full-stack-todo/shared/domain';
import { LoginRequestDto, LoginResponseDto } from '@full-stack-todo/server/data-access-todo';
import { SkipAuth } from '@full-stack-todo/server/util';
import { ServerFeatureAuthService } from './server-feature-auth.service';

/**
 * Controller for handling HTTP requests related to Authentication.
 * All routes are prefixed with 'auth' and will be accessible
 * at /api/v1/auth (the /api/v1 prefix is set globally in main.ts with versioning)
 * 
 * Swagger/OpenAPI decorators:
 * - @ApiTags('auth') - Groups all endpoints under the 'auth' tag in Swagger UI
 * - @ApiOkResponse - Documents successful responses with their types
 * - @ApiOperation - Provides summary and description for each endpoint
 * 
 * Authentication:
 * - POST /auth/login is public (marked with @SkipAuth()) - anyone can attempt to login
 * - This endpoint validates credentials and returns a JWT token if successful
 */
@ApiTags('auth')
@Controller('auth')
export class ServerFeatureAuthController {
  constructor(private serverFeatureAuthService: ServerFeatureAuthService) {}

  /**
   * POST /api/v1/auth/login
   * Authenticates a user and returns a JWT access token (public endpoint)
   * 
   * This endpoint:
   * 1. Validates user credentials (email and password)
   * 2. If valid, generates and returns a JWT access token
   * 3. If invalid, returns an UnauthorizedException
   * 
   * @param loginData - The login credentials (email and password) from the request body
   * @returns Promise that resolves to ITokenResponse containing the access token
   * @throws UnauthorizedException if credentials are invalid
   * 
   * Security Notes:
   * - This endpoint is public (no authentication required)
   * - Returns generic error message to prevent user enumeration
   * - The access token should be included in subsequent requests as: Authorization: Bearer <token>
   */
  @Post('login')
  @Version('1')
  @SkipAuth()
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Returns a JWT access token for authenticated requests',
  })
  @ApiOperation({
    summary: 'Authenticate user and get access token',
    description: 'Validates user credentials (email and password) and returns a JWT access token if valid. The token can be used in subsequent requests by including it in the Authorization header as: Authorization: Bearer <token>',
  })
  async login(
    @Body() loginData: LoginRequestDto
  ): Promise<ITokenResponse> {
    // Validate user credentials
    const user = await this.serverFeatureAuthService.validateUser(
      loginData.email,
      loginData.password
    );
    
    // If credentials are invalid, throw UnauthorizedException
    // Using a generic message to prevent user enumeration attacks
    if (!user) {
      throw new UnauthorizedException('Email or password is invalid');
    }
    
    // Generate and return JWT access token
    return await this.serverFeatureAuthService.generateAccessToken(user);
  }
}

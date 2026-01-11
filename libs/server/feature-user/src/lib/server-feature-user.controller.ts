import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPublicUserData } from '@full-stack-todo/shared/domain';
import { CreateUserDto, UserResponseDto } from '@full-stack-todo/server/data-access-todo';
import { ReqUserId, SkipAuth } from '@full-stack-todo/server/util';
import { ServerFeatureUserService } from './server-feature-user.service';

/**
 * Controller for handling HTTP requests related to User entities.
 * All routes are prefixed with 'users' and will be accessible
 * at /api/v1/users (the /api/v1 prefix is set globally in main.ts with versioning)
 * 
 * Swagger/OpenAPI decorators:
 * - @ApiTags('users') - Groups all endpoints under the 'users' tag in Swagger UI
 * - @ApiOkResponse - Documents successful responses with their types
 * - @ApiOperation - Provides summary and description for each endpoint
 * - @ApiBearerAuth() - Indicates that the endpoint requires JWT authentication
 * 
 * Authentication:
 * - POST /users is public (marked with @SkipAuth()) - anyone can create an account
 * - GET /users/:id is protected (marked with @ApiBearerAuth()) - requires valid JWT token
 * - GET /users/:id verifies that the authenticated user can only access their own data
 */
@ApiTags('users')
@Controller('users')
export class ServerFeatureUserController {
  constructor(private serverFeatureUserService: ServerFeatureUserService) {}

  /**
   * POST /api/v1/users
   * Creates a new user account (public endpoint)
   * @param data - The user data (email and password) from the request body
   * @returns Promise that resolves to the newly created user (without password)
   */
  @Post('')
  @Version('1')
  @SkipAuth()
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Returns the newly created user (password excluded)',
  })
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Creates a new user account in the database. The password will be hashed before storage. This is a public endpoint that does not require authentication.',
  })
  async createUser(@Body() data: CreateUserDto): Promise<IPublicUserData> {
    const user = await this.serverFeatureUserService.create(data);
    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUserData } = user;
    return publicUserData;
  }

  /**
   * GET /api/v1/users/:id
   * Retrieves a single user by ID (protected endpoint)
   * Users can only access their own data - the authenticated user ID must match the requested ID
   * @param reqUserId - The authenticated user's ID (extracted from JWT token)
   * @param id - The unique identifier of the user to retrieve
   * @returns Promise that resolves to the user data (without password)
   * @throws NotFoundException if the user ID doesn't match the authenticated user or user not found
   */
  @Get(':id')
  @Version('1')
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Returns a single user (password excluded)',
  })
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Retrieves a single user by its unique identifier. Users can only access their own data - the authenticated user ID must match the requested ID.',
  })
  async getUser(
    @ReqUserId() reqUserId: string,
    @Param('id') id: string
  ): Promise<IPublicUserData> {
    // Verify that the authenticated user can only access their own data
    if (reqUserId !== id) {
      throw new NotFoundException(`User could not be found!`);
    }
    
    const user = await this.serverFeatureUserService.getOne(id);
    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUserData } = user;
    return publicUserData;
  }
}

import { ITodo } from '@full-stack-todo/shared/domain';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseFilters,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto, UpdateTodoDto, UpsertTodoDto, TodoDto } from '@full-stack-todo/shared';
import { QueryErrorFilter, ReqUserId } from '@full-stack-todo/server/util';
import { ServerFeatureTodoService } from './server-feature-todo.service';

/**
 * Controller for handling HTTP requests related to Todo items.
 * All routes are prefixed with 'todos' and will be accessible
 * at /api/v1/todos (the /api/v1 prefix is set globally in main.ts with versioning)
 * 
 * Swagger/OpenAPI decorators:
 * - @ApiTags('todos') - Groups all endpoints under the 'todos' tag in Swagger UI
 * - @ApiBearerAuth() - Indicates that all endpoints require JWT authentication
 * - @ApiOkResponse - Documents successful responses with their types
 * - @ApiOperation - Provides summary and description for each endpoint
 * 
 * Authentication:
 * - All endpoints are protected by JWT authentication (via global JwtAuthGuard)
 * - @ReqUserId() decorator extracts the user ID from the JWT token
 * - All operations are scoped to the authenticated user's todos
 * 
 * Exception Filters:
 * - @UseFilters(QueryErrorFilter) - Handles database query errors, especially unique
 *   constraint violations. When a duplicate todo is created, this filter catches the
 *   error and returns a user-friendly error response.
 * 
 * There are many decorators available for different HTTP status codes, but error
 * handling decorators (like @ApiBadRequestResponse) will be covered in a future post.
 */
@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
@UseFilters(QueryErrorFilter)
export class ServerFeatureTodoController {
  constructor(private serverFeatureTodoService: ServerFeatureTodoService) {}

  /**
   * GET /api/v1/todos
   * Retrieves all todo items from the database for the authenticated user
   * @param userId - The user ID extracted from the JWT token
   * @returns Promise that resolves to an array of all todo items for the user
   */
  @Get('')
  @Version('1')
  @ApiOkResponse({
    type: TodoDto,
    isArray: true,
    description: 'Returns all to-do items for the authenticated user',
  })
  @ApiOperation({
    summary: 'Returns all to-do items',
    description: 'Retrieves a list of all todo items from the database for the authenticated user',
  })
  async getAll(@ReqUserId() userId: string): Promise<ITodo[]> {
    return await this.serverFeatureTodoService.getAll(userId);
  }

  /**
   * GET /api/v1/todos/:id
   * Retrieves a single todo item by its ID from the database for the authenticated user
   * @param userId - The user ID extracted from the JWT token
   * @param id - The unique identifier of the todo item
   * @returns Promise that resolves to the todo item with the specified ID
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   */
  @Get(':id')
  @Version('1')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns a single to-do item',
  })
  @ApiOperation({
    summary: 'Get a to-do item by ID',
    description: 'Retrieves a single todo item by its unique identifier for the authenticated user',
  })
  async getOne(@ReqUserId() userId: string, @Param('id') id: string): Promise<ITodo> {
    return await this.serverFeatureTodoService.getOne(userId, id);
  }

  /**
   * POST /api/v1/todos
   * Creates a new todo item in the database for the authenticated user
   * @param userId - The user ID extracted from the JWT token
   * @param data - The todo data (title and description) from the request body
   * @returns Promise that resolves to the newly created todo item with generated UUID
   */
  @Post('')
  @Version('1')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the newly created to-do item',
  })
  @ApiOperation({
    summary: 'Create a new to-do item',
    description: 'Creates a new todo item in the database with a generated UUID for the authenticated user',
  })
  async create(@ReqUserId() userId: string, @Body() data: CreateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.create(userId, data);
  }

  /**
   * PUT /api/v1/todos/:id
   * Creates or updates a todo item (upsert operation) in the database for the authenticated user
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param userId - The user ID extracted from the JWT token
   * @param data - The complete todo data including ID from the request body
   * @returns Promise that resolves to the created or updated todo item
   */
  @Put(':id')
  @Version('1')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the created or updated to-do item',
  })
  @ApiOperation({
    summary: 'Create or update a to-do item',
    description: 'Creates a new todo item if the ID does not exist, or updates an existing one for the authenticated user',
  })
  async upsertOne(@ReqUserId() userId: string, @Body() data: UpsertTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.upsert(userId, data);
  }

  /**
   * PATCH /api/v1/todos/:id
   * Partially updates an existing todo item in the database for the authenticated user
   * Only the provided fields will be updated
   * @param userId - The user ID extracted from the JWT token
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data from the request body (only fields to update)
   * @returns Promise that resolves to the updated todo item
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   */
  @Patch(':id')
  @Version('1')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the updated to-do item',
  })
  @ApiOperation({
    summary: 'Partially update a to-do item',
    description: 'Updates only the provided fields of an existing todo item for the authenticated user',
  })
  async update(@ReqUserId() userId: string, @Param('id') id: string, @Body() data: UpdateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.update(userId, id, data);
  }

  /**
   * DELETE /api/v1/todos/:id
   * Deletes a todo item by its ID from the database for the authenticated user
   * @param userId - The user ID extracted from the JWT token
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   */
  @Delete(':id')
  @Version('1')
  @ApiOkResponse({
    description: 'Successfully deleted the to-do item',
  })
  @ApiOperation({
    summary: 'Delete a to-do item',
    description: 'Deletes a todo item from the database by its unique identifier for the authenticated user',
  })
  async delete(@ReqUserId() userId: string, @Param('id') id: string): Promise<void> {
    return await this.serverFeatureTodoService.delete(userId, id);
  }
}


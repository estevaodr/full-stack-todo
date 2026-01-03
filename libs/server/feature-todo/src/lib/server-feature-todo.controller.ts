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
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto, UpdateTodoDto, UpsertTodoDto, TodoDto } from '@full-stack-todo/shared';
import { ServerFeatureTodoService } from './server-feature-todo.service';

/**
 * Controller for handling HTTP requests related to Todo items.
 * All routes are prefixed with 'todos' and will be accessible
 * at /api/v1/todos (the /api/v1 prefix is set globally in main.ts with versioning)
 * 
 * Swagger/OpenAPI decorators:
 * - @ApiTags('todos') - Groups all endpoints under the 'todos' tag in Swagger UI
 * - @ApiOkResponse - Documents successful responses with their types
 * - @ApiOperation - Provides summary and description for each endpoint
 * 
 * There are many decorators available for different HTTP status codes, but error
 * handling decorators (like @ApiBadRequestResponse) will be covered in a future post.
 */
@ApiTags('todos')
@Controller('todos')
export class ServerFeatureTodoController {
  constructor(private serverFeatureTodoService: ServerFeatureTodoService) {}

  /**
   * GET /api/v1/todos
   * Retrieves all todo items from the database
   * @returns Promise that resolves to an array of all todo items
   */
  @Get('')
  @ApiOkResponse({
    type: TodoDto,
    isArray: true,
    description: 'Returns all to-do items',
  })
  @ApiOperation({
    summary: 'Returns all to-do items',
    description: 'Retrieves a list of all todo items from the database',
  })
  async getAll(): Promise<ITodo[]> {
    return await this.serverFeatureTodoService.getAll();
  }

  /**
   * GET /api/v1/todos/:id
   * Retrieves a single todo item by its ID from the database
   * @param id - The unique identifier of the todo item
   * @returns Promise that resolves to the todo item with the specified ID
   * @throws NotFoundException if the todo item is not found
   */
  @Get(':id')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns a single to-do item',
  })
  @ApiOperation({
    summary: 'Get a to-do item by ID',
    description: 'Retrieves a single todo item by its unique identifier',
  })
  async getOne(@Param('id') id: string): Promise<ITodo> {
    return await this.serverFeatureTodoService.getOne(id);
  }

  /**
   * POST /api/v1/todos
   * Creates a new todo item in the database
   * @param data - The todo data (title and description) from the request body
   * @returns Promise that resolves to the newly created todo item with generated UUID
   */
  @Post('')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the newly created to-do item',
  })
  @ApiOperation({
    summary: 'Create a new to-do item',
    description: 'Creates a new todo item in the database with a generated UUID',
  })
  async create(@Body() data: CreateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.create(data);
  }

  /**
   * PUT /api/v1/todos/:id
   * Creates or updates a todo item (upsert operation) in the database
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param data - The complete todo data including ID from the request body
   * @returns Promise that resolves to the created or updated todo item
   */
  @Put(':id')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the created or updated to-do item',
  })
  @ApiOperation({
    summary: 'Create or update a to-do item',
    description: 'Creates a new todo item if the ID does not exist, or updates an existing one',
  })
  async upsertOne(@Body() data: UpsertTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.upsert(data);
  }

  /**
   * PATCH /api/v1/todos/:id
   * Partially updates an existing todo item in the database
   * Only the provided fields will be updated
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data from the request body (only fields to update)
   * @returns Promise that resolves to the updated todo item
   * @throws NotFoundException if the todo item is not found
   */
  @Patch(':id')
  @ApiOkResponse({
    type: TodoDto,
    description: 'Returns the updated to-do item',
  })
  @ApiOperation({
    summary: 'Partially update a to-do item',
    description: 'Updates only the provided fields of an existing todo item',
  })
  async update(@Param('id') id: string, @Body() data: UpdateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.update(id, data);
  }

  /**
   * DELETE /api/v1/todos/:id
   * Deletes a todo item by its ID from the database
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found
   */
  @Delete(':id')
  @ApiOkResponse({
    description: 'Successfully deleted the to-do item',
  })
  @ApiOperation({
    summary: 'Delete a to-do item',
    description: 'Deletes a todo item from the database by its unique identifier',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.serverFeatureTodoService.delete(id);
  }
}


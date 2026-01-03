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
import { CreateTodoDto, UpdateTodoDto, UpsertTodoDto } from './dtos/todo.dto';
import { ServerFeatureTodoService } from './server-feature-todo.service';

/**
 * Controller for handling HTTP requests related to Todo items.
 * All routes are prefixed with 'todos' and will be accessible
 * at /api/todos (the /api prefix is set globally in main.ts)
 */
@Controller('todos')
export class ServerFeatureTodoController {
  constructor(private serverFeatureTodoService: ServerFeatureTodoService) {}

  /**
   * GET /api/todos
   * Retrieves all todo items from the database
   * @returns Promise that resolves to an array of all todo items
   */
  @Get('')
  async getAll(): Promise<ITodo[]> {
    return await this.serverFeatureTodoService.getAll();
  }

  /**
   * GET /api/todos/:id
   * Retrieves a single todo item by its ID from the database
   * @param id - The unique identifier of the todo item
   * @returns Promise that resolves to the todo item with the specified ID
   * @throws NotFoundException if the todo item is not found
   */
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ITodo> {
    return await this.serverFeatureTodoService.getOne(id);
  }

  /**
   * POST /api/todos
   * Creates a new todo item in the database
   * @param data - The todo data (title and description) from the request body
   * @returns Promise that resolves to the newly created todo item with generated UUID
   */
  @Post('')
  async create(@Body() data: CreateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.create(data);
  }

  /**
   * PUT /api/todos/:id
   * Creates or updates a todo item (upsert operation) in the database
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param data - The complete todo data including ID from the request body
   * @returns Promise that resolves to the created or updated todo item
   */
  @Put(':id')
  async upsertOne(@Body() data: UpsertTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.upsert(data);
  }

  /**
   * PATCH /api/todos/:id
   * Partially updates an existing todo item in the database
   * Only the provided fields will be updated
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data from the request body (only fields to update)
   * @returns Promise that resolves to the updated todo item
   * @throws NotFoundException if the todo item is not found
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTodoDto): Promise<ITodo> {
    return await this.serverFeatureTodoService.update(id, data);
  }

  /**
   * DELETE /api/todos/:id
   * Deletes a todo item by its ID from the database
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.serverFeatureTodoService.delete(id);
  }
}


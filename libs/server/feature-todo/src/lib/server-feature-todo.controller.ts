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
   * Retrieves all todo items
   * @returns Array of all todo items
   */
  @Get('')
  getAll(): ITodo[] {
    return this.serverFeatureTodoService.getAll();
  }

  /**
   * GET /api/todos/:id
   * Retrieves a single todo item by its ID
   * @param id - The unique identifier of the todo item
   * @returns The todo item with the specified ID
   * @throws NotFoundException if the todo item is not found
   */
  @Get(':id')
  getOne(@Param('id') id: string): ITodo {
    return this.serverFeatureTodoService.getOne(id);
  }

  /**
   * POST /api/todos
   * Creates a new todo item
   * @param data - The todo data (title and description) from the request body
   * @returns The newly created todo item with generated ID
   */
  @Post('')
  create(@Body() data: CreateTodoDto): ITodo {
    return this.serverFeatureTodoService.create(data);
  }

  /**
   * PUT /api/todos/:id
   * Creates or updates a todo item (upsert operation)
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param data - The complete todo data including ID from the request body
   * @returns The created or updated todo item
   */
  @Put(':id')
  upsertOne(@Body() data: UpsertTodoDto): ITodo {
    return this.serverFeatureTodoService.upsert(data);
  }

  /**
   * PATCH /api/todos/:id
   * Partially updates an existing todo item
   * Only the provided fields will be updated
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data from the request body (only fields to update)
   * @returns The updated todo item
   * @throws NotFoundException if the todo item is not found
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateTodoDto): ITodo {
    return this.serverFeatureTodoService.update(id, data);
  }

  /**
   * DELETE /api/todos/:id
   * Deletes a todo item by its ID
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found
   */
  @Delete(':id')
  delete(@Param('id') id: string): void {
    return this.serverFeatureTodoService.delete(id);
  }
}


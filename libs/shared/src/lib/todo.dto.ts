import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ITodo } from '@full-stack-todo/shared/domain';

/**
 * Data Transfer Object for creating a new todo item.
 * Uses the `Pick` utility type to extract only the properties we want for
 * new to-do items (title and description).
 * The ID and completed status are generated/set by the service.
 */
export class CreateTodoDto implements Pick<ITodo, 'title' | 'description'> {
  /** The title of the todo item - required and must be a non-empty string */
  @IsString()
  @IsNotEmpty()
  title!: string;

  /** The description of the todo item - required and must be a non-empty string */
  @IsString()
  @IsNotEmpty()
  description!: string;
}

/**
 * Data Transfer Object for upserting (create or update) a todo item.
 * Contains all properties of ITodo including the ID, which is required for upsert operations.
 */
export class UpsertTodoDto implements ITodo {
  /** The title of the todo item - required and must be a non-empty string */
  @IsString()
  @IsNotEmpty()
  title!: string;

  /** The description of the todo item - required and must be a non-empty string */
  @IsString()
  @IsNotEmpty()
  description!: string;

  /** The unique identifier of the todo item - required and must be a non-empty string */
  @IsString()
  @IsNotEmpty()
  id!: string;

  /** The completion status of the todo item - required and must be a boolean */
  @IsBoolean()
  @IsNotEmpty()
  completed!: boolean;
}

/**
 * Data Transfer Object for updating an existing todo item.
 * Uses `Partial<Omit<ITodo, 'id'>>` to allow updating any field except the ID.
 * All fields are optional, allowing partial updates.
 */
export class UpdateTodoDto implements Partial<Omit<ITodo, 'id'>> {
  /** The title of the todo item - optional, must be a string if provided */
  @IsString()
  @IsOptional()
  title!: string;

  /** The description of the todo item - optional, must be a string if provided */
  @IsString()
  @IsOptional()
  description!: string;

  /** The completion status of the todo item - optional, must be a boolean if provided */
  @IsBoolean()
  @IsOptional()
  completed!: boolean;
}


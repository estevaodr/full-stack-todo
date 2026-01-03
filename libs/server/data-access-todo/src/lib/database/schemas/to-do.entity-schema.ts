/**
 * To-Do Entity Schema
 * 
 * This file defines the database schema (structure) for the todo table using TypeORM's
 * EntitySchema approach. Instead of using class decorators (like @Entity(), @Column()),
 * we use a schema-based definition which can be easier to read and maintain.
 * 
 * The schema maps to the ITodo interface from our shared domain, ensuring type safety
 * between our database structure and our application code. This is a great example of
 * shared libraries keeping things in check - the schema properties are enforced by the
 * shared data structure.
 */
import { EntitySchema } from 'typeorm';
import { ITodo } from '@full-stack-todo/shared/domain';

/**
 * ToDoEntitySchema - Defines the structure of the 'todo' table in the database
 * 
 * @see https://docs.nestjs.com/techniques/database#separating-entity-definition
 */
export const ToDoEntitySchema = new EntitySchema<ITodo>({
  // The name of the table in the database
  name: 'todo',
  
  // Column definitions - these map to the properties in the ITodo interface
  columns: {
    /**
     * Primary key column
     * - type: 'uuid' - Stores a UUID (Universally Unique Identifier) string
     * - primary: true - Marks this as the primary key (unique identifier for each row)
     * - generated: 'uuid' - TypeORM will automatically generate a UUID when creating new records
     * 
     * Note: We use 'uuid' instead of true because SQLite requires AUTOINCREMENT only on INTEGER
     * primary keys. Since we're using UUID strings, we must explicitly tell TypeORM to generate
     * UUIDs rather than auto-incrementing integers.
     */
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    
    /**
     * Title column - The main text of the todo item
     * - type: String - Stores text data
     * - nullable: false - This field is required and cannot be null/empty
     */
    title: {
      type: String,
      nullable: false,
    },
    
    /**
     * Description column - Additional details about the todo item
     * - type: String - Stores text data
     * - nullable: true - This field is optional and can be null/empty
     */
    description: {
      type: String,
      nullable: true,
    },
    
    /**
     * Completed column - Tracks whether the todo item is done
     * - type: 'boolean' - Stores true/false values (NOT datetime - this was corrected from
     *   an initial datetime type implementation)
     * - default: false - New todos start as incomplete (not done)
     * - nullable: false - This field is required and must have a value
     */
    completed: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
  },
});


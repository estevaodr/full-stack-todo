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
     * Note: Title uniqueness is now enforced per user via the unique constraint on ['title', 'user_id']
     */
    title: {
      type: String,
      nullable: false,
    },

    /**
     * User ID column - Foreign key to the user who owns this todo
     * - type: 'uuid' - Stores a UUID string matching the user's id
     * - nullable: true - This field is optional (for backward compatibility during migration)
     * Note: This column is created automatically by the 'user' relation's joinColumn
     */
    user_id: {
      type: 'uuid',
      nullable: true,
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

  // Relation definitions - defines relationships with other entities
  relations: {
    /**
     * User relation - Many todos belong to one user
     * - type: 'many-to-one' - _many_ todos belong to _one_ user
     * - target: 'user' - Name of the database table we're associating with
     * - joinColumn.name: 'user_id' - Column name in this table where the foreign key
     *   of the associated table is referenced
     * - inverseSide: 'todos' - Name of the property on the user side that relates back to todos
     */
    user: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'user_id',
      },
      inverseSide: 'todos',
    },
  },

  // Unique constraints - ensures data integrity
  uniques: [
    {
      /**
       * UNIQUE_TITLE_USER - Adds a constraint to the table that ensures each
       * userID + title combination is unique. This allows multiple users to have
       * todos with the same title, but prevents a single user from having duplicate titles.
       */
      name: 'UNIQUE_TITLE_USER',
      columns: ['title', 'user_id'],
    },
  ],
});


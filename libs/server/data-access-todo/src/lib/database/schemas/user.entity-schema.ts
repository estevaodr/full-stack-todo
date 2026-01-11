/**
 * User Entity Schema
 *
 * This file defines the database schema (structure) for the user table using TypeORM's
 * EntitySchema approach. Instead of using class decorators (like @Entity(), @Column()),
 * we use a schema-based definition which can be easier to read and maintain.
 *
 * The schema maps to the IUser interface from our shared domain, ensuring type safety
 * between our database structure and our application code.
 */
import { EntitySchema } from 'typeorm';
import { IUser } from '@full-stack-todo/shared/domain';

/**
 * UserEntitySchema - Defines the structure of the 'user' table in the database
 *
 * @see https://docs.nestjs.com/techniques/database#separating-entity-definition
 */
export const UserEntitySchema = new EntitySchema<IUser>({
  // The name of the table in the database
  name: 'user',

  // Column definitions - these map to the properties in the IUser interface
  columns: {
    /**
     * Primary key column
     * - type: 'uuid' - Stores a UUID (Universally Unique Identifier) string
     * - primary: true - Marks this as the primary key (unique identifier for each row)
     * - generated: 'uuid' - TypeORM will automatically generate a UUID when creating new records
     */
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },

    /**
     * Email column - User's email address used as identifier
     * - type: String - Stores text data
     * - nullable: false - This field is required and cannot be null/empty
     * - unique: true - Make sure we don't have someone signing up with
     *   the same email multiple times!
     */
    email: {
      type: String,
      nullable: false,
      unique: true,
    },

    /**
     * Password column - Hashed password (NOT the actual password!)
     * - type: String - Stores text data (the hashed password string)
     * - nullable: false - This field is required and cannot be null/empty
     *
     * Note: This stores a hash of the password, not the actual password.
     * An API should never be storing the actual password, encrypted or not.
     */
    password: {
      type: String,
      nullable: false,
    },
  },

  // Relation definitions - defines relationships with other entities
  relations: {
    /**
     * Todos relation - One user has many to-do items
     * - type: 'one-to-many' - _one_ user has _many_ to-do items
     * - target: 'todo' - Name of the database table we're associating with
     * - cascade: true - If a user is removed, its to-do items should be removed as well
     * - inverseSide: 'user' - Name of the property on the to-do side that relates back to this user
     */
    todos: {
      type: 'one-to-many',
      target: 'todo',
      cascade: true,
      inverseSide: 'user',
    },
  },
});

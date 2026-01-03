/**
 * Public API for the data-access-todo library
 * 
 * This file exports all the public-facing modules, services, and types that other
 * parts of the application can import. It acts as the "barrel export" for this library.
 * 
 * When another module imports from '@fst/server/data-access-todo', they get access
 * to everything exported from this file.
 * 
 * Currently exports:
 * - DataAccessTodoModule: The main module to import in feature modules
 */
export * from './lib/data-access-todo.module';

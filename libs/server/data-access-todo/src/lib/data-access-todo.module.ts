/**
 * Data Access Todo Module
 * 
 * This is the main module for the data-access-todo library. It serves as the public API
 * for this library - any feature module that needs to interact with the todo database
 * should import this module.
 * 
 * Architecture pattern:
 * - This module imports DatabaseModule (which handles TypeORM setup)
 * - This module exports DatabaseModule (making it available to consumers)
 * - This creates a clean separation: feature modules only need to import one module
 * 
 * This follows Nx's data-access library pattern, where a single import provides all
 * the database-related providers needed by feature modules.
 * 
 * By importing and exporting DatabaseModule, we ensure that any module that imports
 * DataAccessTodoModule will have access to the todo repository and other database providers
 * without needing to directly import DatabaseModule.
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';

@Module({
  controllers: [],
  providers: [],
  
  // Import DatabaseModule to make its providers available in this module
  imports: [DatabaseModule],
  
  // Export DatabaseModule so that any module importing DataAccessTodoModule
  // will have access to the todo repository and other database providers
  exports: [DatabaseModule],
})
export class DataAccessTodoModule {}

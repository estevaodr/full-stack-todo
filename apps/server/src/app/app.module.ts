/**
 * AppModule - The Root Module of the NestJS Application
 * 
 * In NestJS, modules are the building blocks of the application. The AppModule
 * is the root module that ties everything together. Think of it as the main
 * configuration file that tells NestJS:
 * - What other modules to load
 * - What controllers handle HTTP requests
 * - What services provide business logic
 * - How to configure the database and other infrastructure
 */

// Import feature modules - these are separate modules that contain related functionality
// ServerFeatureTodoModule is a shared/feature module from the monorepo structure
import { ServerFeatureTodoModule } from '@full-stack-todo/server/feature-todo';

// @Module decorator is required to make this class a NestJS module
// This is how NestJS knows this class should be treated as a module
import { Module } from '@nestjs/common';

// ConfigModule and ConfigService are used for managing environment variables
// - ConfigModule: Sets up the configuration system
// - ConfigService: Injected service to read environment variables anywhere in the app
// This is injected into TypeOrmModule.forRootAsync to read DATABASE_PATH dynamically
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule is NestJS's integration with TypeORM (an Object-Relational Mapping library)
// It handles database connections, entity management, and database operations
// In this case, we're using SQLite (a file-based database, great for development)
import { TypeOrmModule } from '@nestjs/typeorm';

// Joi is a validation library used to validate and provide defaults for environment variables
// This ensures your app has the required config values and prevents runtime errors
import * as Joi from 'joi';

// Import local modules, controllers, and services from the same app
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';

/**
 * @Module decorator marks this class as a NestJS module
 * 
 * The decorator takes an object with these key properties:
 * - imports: Other modules this module depends on (like importing packages)
 * - controllers: Classes that handle HTTP requests (routes/endpoints)
 * - providers: Services that contain business logic (injectable classes)
 * - exports: What this module makes available to other modules (optional)
 */
@Module({
  imports: [
    /**
     * ConfigModule Configuration
     * 
     * This sets up environment variable management for the entire application.
     * 
     * Key points:
     * - forRoot(): Initializes the configuration module (call once in root module)
     * - isGlobal: true - Makes ConfigService available everywhere without importing ConfigModule
     *   This is a convenience feature so you don't have to import ConfigModule in every module
     * - validationSchema: Validates environment variables at startup
     *   If validation fails, the app won't start (fail fast principle)
     */
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService injectable in any module without importing ConfigModule
      
      /**
       * Validation Schema
       * 
       * This ensures DATABASE_PATH exists and has a valid value.
       * If DATABASE_PATH is not set in .env file, it defaults to 'tmp/db.sqlite'
       * 
       * Why validate? Prevents runtime errors from missing configuration.
       * Better to fail at startup than crash later when trying to connect to DB.
       */
      validationSchema: Joi.object({
        DATABASE_PATH: Joi.string().default('tmp/db.sqlite'),
        // You can add more environment variables here as your app grows
        // Example: PORT: Joi.number().default(3000),
      }),
    }),

    /**
     * TypeORM Database Configuration
     * 
     * forRootAsync() is used instead of forRoot() when you need to inject services
     * (like ConfigService) to configure the database connection dynamically.
     * 
     * Why async? Because we need ConfigService to read DATABASE_PATH from environment variables,
     * and ConfigService is only available after dependency injection happens.
     */
    TypeOrmModule.forRootAsync({
      /**
       * useFactory: A function that returns the database configuration object
       * 
       * The 'config' parameter is the injected ConfigService instance.
       * NestJS automatically provides this because we listed it in 'inject' array below.
       */
      useFactory: (config: ConfigService) => ({
        type: 'sqlite', // Database type: SQLite (file-based, no server needed)
        database: config.get('DATABASE_PATH'), // Path to the SQLite database file
        
        /**
         * synchronize: true
         * 
         * ⚠️ WARNING: Only use in development!
         * 
         * This automatically syncs your database schema with your entity classes.
         * It will create/update/delete tables based on your @Entity() classes.
         * 
         * In production, set this to false and use migrations instead.
         * Why? You don't want to accidentally drop tables or lose data!
         */
        synchronize: true,
        
        /**
         * logging: true
         * 
         * Enables SQL query logging to the console.
         * Useful for debugging - you'll see all SQL queries being executed.
         * Consider setting to false in production for performance.
         */
        logging: true,
        
        /**
         * autoLoadEntities: true
         * 
         * Automatically discovers and loads all entity classes (database models).
         * Without this, you'd have to manually register each entity.
         * 
         * Entities are classes decorated with @Entity() that represent database tables.
         */
        autoLoadEntities: true,
      }),
      
      /**
       * inject: [ConfigService]
       * 
       * Tells NestJS to inject ConfigService into the useFactory function.
       * This is how dependency injection works in NestJS - you declare what you need,
       * and NestJS provides it automatically.
       */
      inject: [ConfigService],
    }),

    /**
     * Feature Modules
     * 
     * These are other NestJS modules that contain related functionality.
     * By importing them here, we make their controllers, services, and providers
     * available to the application.
     * 
     * - ServerFeatureTodoModule: Shared todo feature module (from monorepo structure)
     * - TodoModule: Local todo module (app-specific implementation)
     */
    ServerFeatureTodoModule,
    TodoModule,
  ],

  /**
   * Controllers
   * 
   * Controllers handle HTTP requests and define your API endpoints.
   * They receive requests, call services for business logic, and return responses.
   * 
   * Example: AppController might have a GET /health endpoint
   */
  controllers: [AppController],

  /**
   * Providers
   * 
   * Providers are injectable classes (usually services) that contain business logic.
   * They can be injected into controllers or other services using dependency injection.
   * 
   * Example: AppService might have a getHello() method that returns a greeting
   */
  providers: [AppService],
})

/**
 * AppModule Class
 * 
 * This is the root module class. The @Module decorator above is what makes it special.
 * The class itself is usually empty - all the configuration is in the decorator.
 * 
 * NestJS will:
 * 1. Load this module when the app starts
 * 2. Process all imports, controllers, and providers
 * 3. Set up dependency injection
 * 4. Start the HTTP server
 */
export class AppModule {}

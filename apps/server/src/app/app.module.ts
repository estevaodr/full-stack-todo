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
import { ServerFeatureUserModule } from '@full-stack-todo/server/feature-user';
import { ServerFeatureAuthModule } from '@full-stack-todo/server/feature-auth';

// @Module decorator is required to make this class a NestJS module
// This is how NestJS knows this class should be treated as a module
import { Module } from '@nestjs/common';
// APP_GUARD is a special token that allows us to register a guard globally
// This means the guard will be applied to all routes by default
import { APP_GUARD } from '@nestjs/core';

// ConfigModule and ConfigService are used for managing environment variables
// - ConfigModule: Sets up the configuration system
// - ConfigService: Injected service to read environment variables anywhere in the app
// This is injected into TypeOrmModule.forRootAsync to read DATABASE_URL dynamically
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule is NestJS's integration with TypeORM (an Object-Relational Mapping library)
// It handles database connections, entity management, and database operations
// In this case, we're using PostgreSQL (a robust, production-ready database)
import { TypeOrmModule } from '@nestjs/typeorm';

// Joi is a validation library used to validate and provide defaults for environment variables
// This ensures your app has the required config values and prevents runtime errors
import * as Joi from 'joi';

// Import JWT authentication guard for protecting routes
import { JwtAuthGuard } from '@full-stack-todo/server/util';

// Import local modules, controllers, and services from the same app
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
       * This ensures required environment variables exist and have valid values.
       * If variables are not set in .env file, defaults are provided where applicable.
       * 
       * Why validate? Prevents runtime errors from missing configuration.
       * Better to fail at startup than crash later when trying to connect to DB or authenticate users.
       */
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string()
          .pattern(/^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^/]+$/)
          .required()
          .messages({
            'string.pattern.base': 'DATABASE_URL must be a valid PostgreSQL connection string (postgresql://user:password@host:port/database)',
  // checkov:skip=CKV_SECRET_4: ADD REASON
            'any.required': 'DATABASE_URL is required. Please set it in your .env file (e.g., postgresql://user:password@host:port/database)',
          }),
        // Logging configuration
        LOG_LEVEL: Joi.string().valid('INFO', 'DEBUG').default('INFO'), // Optional: Logging level (INFO=clean logs, DEBUG=includes SQL queries)
        // JWT configuration
        JWT_SECRET: Joi.string().required(), // Required: Secret key for signing JWT tokens
        JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('600s'), // Optional: Token expiration time (defaults to 10 minutes)
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
     * Why async? Because we need ConfigService to read DATABASE_URL from environment variables,
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
        type: 'postgres', // Database type: PostgreSQL
        url: config.get('DATABASE_URL'), // PostgreSQL connection string
        
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
         * logging: config.get('LOG_LEVEL') === 'DEBUG'
         * 
         * Enables SQL query logging only when LOG_LEVEL is set to DEBUG.
         * 
         * Log Levels:
         * - INFO: Clean logs without SQL queries (default)
         * - DEBUG: Includes all SQL queries for debugging
         * 
         * Set LOG_LEVEL=DEBUG in .env to see all SQL queries being executed.
         * Useful for debugging database issues.
         */
        logging: config.get('LOG_LEVEL') === 'DEBUG',
        
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
     *   This module provides versioned todo endpoints at /api/v1/todos
     * - ServerFeatureUserModule: User management module
     *   This module provides user endpoints at /api/v1/users
     * - ServerFeatureAuthModule: Authentication module
     *   This module provides authentication endpoints at /api/v1/auth
     */
    ServerFeatureTodoModule,
    ServerFeatureUserModule,
    ServerFeatureAuthModule,
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
   * 
   * APP_GUARD Provider:
   * This registers JwtAuthGuard as a global guard, meaning it will protect all routes
   * by default. Routes can opt-out of authentication by using the @SkipAuth() decorator.
   * 
   * This is a common pattern in NestJS for applying authentication globally while
   * allowing specific routes (like login) to be public.
   */
  providers: [
    AppService,
    /**
     * Global JWT Authentication Guard
     * 
     * This guard is applied to all routes by default. It:
     * - Validates JWT tokens from the Authorization header
     * - Extracts user information from the token
     * - Makes user data available via @ReqUser() and @ReqUserId() decorators
     * - Allows routes to skip authentication using @SkipAuth() decorator
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
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

/**
 * QueryErrorFilter - Exception Filter for Database Query Errors
 * 
 * WHAT IS AN EXCEPTION FILTER?
 * ============================
 * Exception filters in NestJS catch errors that occur during request processing
 * and transform them into proper HTTP responses. This allows you to handle
 * errors consistently across your application.
 * 
 * WHAT DOES THIS FILTER DO?
 * =========================
 * This filter specifically catches TypeORM QueryFailedError exceptions, which
 * occur when database operations fail (like unique constraint violations).
 * 
 * WHY DO WE NEED IT?
 * =================
 * When a unique constraint is violated (e.g., trying to create a todo with
 * a title that already exists), TypeORM throws a QueryFailedError. Without
 * this filter, NestJS would return a generic 500 error. This filter:
 * 1. Catches the error
 * 2. Checks if it's a unique constraint violation
 * 3. Returns a user-friendly error message with appropriate status code
 * 
 * HOW IT WORKS:
 * ============
 * - @Catch(QueryFailedError) - Only catches QueryFailedError exceptions
 * - Extends BaseExceptionFilter - Inherits default error handling behavior
 * - Checks error message for 'UNIQUE' keyword
 * - Returns 401 (Unauthorized) for unique constraint violations (as per documentation)
 * - Returns 500 (Internal Server Error) for other database errors
 */

import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

/**
 * QueryErrorFilter - Handles database query errors, especially unique constraint violations
 * 
 * This filter catches QueryFailedError exceptions from TypeORM and converts them
 * into user-friendly HTTP responses.
 * 
 * @example
 * // When trying to create a duplicate todo:
 * // POST /api/v1/todos { "title": "foo", "description": "bar" }
 * // If "foo" already exists, returns:
 * // {
 * //   "error": "Unique constraint failed",
 * //   "message": "Value for 'title' already exists, try again"
 * // }
 */
@Catch(QueryFailedError)
export class QueryErrorFilter extends BaseExceptionFilter {
  /**
   * catch - Handles the QueryFailedError exception
   * 
   * @param exception - The QueryFailedError thrown by TypeORM
   * @param host - ArgumentsHost provides access to request/response objects
   * @returns HTTP response with appropriate status code and error message
   */
  public override catch(exception: QueryFailedError, host: ArgumentsHost): any {
    // Log the full error for debugging (only in development)
    Logger.debug(JSON.stringify(exception, null, 2));
    // Log the error message
    Logger.error(exception.message);

    // Get the HTTP context (request and response objects)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if this is a unique constraint violation
    // TypeORM includes 'UNIQUE' in the error message for unique constraint failures
    if (exception.message.includes('UNIQUE')) {
      // Extract the field name from the error message
      // Error format is usually: "SQLITE_CONSTRAINT: UNIQUE constraint failed: todo.title"
      const invalidKey = exception.message.split(':').pop()?.trim();
      
      // Return a 401 (Unauthorized) status with a user-friendly message
      // Note: Following the documentation example which uses 401, though 409 (Conflict)
      // would be more semantically correct for duplicate resource errors
      response.status(HttpStatus.UNAUTHORIZED).json({
        error: `Unique constraint failed`,
        message: `Value for '${invalidKey}' already exists, try again`,
      });
    } else {
      // For other database errors, return a generic 500 error
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        path: request.url,
      });
    }
  }
}


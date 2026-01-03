import { Module } from '@nestjs/common';
import { DataAccessTodoModule } from '@full-stack-todo/server/data-access-todo';
import { ServerFeatureTodoController } from './server-feature-todo.controller';
import { ServerFeatureTodoService } from './server-feature-todo.service';

/**
 * NestJS module for the Todo feature.
 * This module encapsulates the Todo controller and service, making them
 * available to other modules that import this module.
 * The service is exported so it can be used by other modules if needed.
 * 
 * This module imports DataAccessTodoModule to gain access to the todo repository
 * and other database providers. This follows the proper library hierarchy where
 * feature modules import data-access modules, not the other way around.
 */
@Module({
  imports: [DataAccessTodoModule],
  controllers: [ServerFeatureTodoController],
  providers: [ServerFeatureTodoService],
  exports: [ServerFeatureTodoService],
})
export class ServerFeatureTodoModule {}


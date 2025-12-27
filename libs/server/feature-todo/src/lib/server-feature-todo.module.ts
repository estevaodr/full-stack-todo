import { Module } from '@nestjs/common';
import { ServerFeatureTodoController } from './server-feature-todo.controller';
import { ServerFeatureTodoService } from './server-feature-todo.service';

/**
 * NestJS module for the Todo feature.
 * This module encapsulates the Todo controller and service, making them
 * available to other modules that import this module.
 * The service is exported so it can be used by other modules if needed.
 */
@Module({
  controllers: [ServerFeatureTodoController],
  providers: [ServerFeatureTodoService],
  exports: [ServerFeatureTodoService],
})
export class ServerFeatureTodoModule {}


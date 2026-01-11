import { Module } from '@nestjs/common';
import { DataAccessTodoModule } from '@full-stack-todo/server/data-access-todo';
import { ServerFeatureUserController } from './server-feature-user.controller';
import { ServerFeatureUserService } from './server-feature-user.service';

/**
 * NestJS module for the User feature.
 * This module encapsulates the User controller and service, making them
 * available to other modules that import this module.
 * The service is exported so it can be used by other modules if needed.
 * 
 * This module imports DataAccessTodoModule to gain access to the user repository
 * and other database providers. This follows the proper library hierarchy where
 * feature modules import data-access modules, not the other way around.
 * 
 * Note: UserEntitySchema is registered in DatabaseModule (exported by DataAccessTodoModule),
 * so importing DataAccessTodoModule provides access to the UserEntitySchema repository.
 */
@Module({
  imports: [DataAccessTodoModule],
  controllers: [ServerFeatureUserController],
  providers: [ServerFeatureUserService],
  exports: [ServerFeatureUserService],
})
export class ServerFeatureUserModule {}

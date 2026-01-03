import { ServerFeatureTodoModule } from '@full-stack-todo/server/feature-todo';
import { Module } from '@nestjs/common';
// ConfigModule provides access to environment variables via ConfigService
import { ConfigModule } from '@nestjs/config';
// Joi is used for validating environment variables and providing defaults
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    // Configure ConfigModule to load environment variables from .env file
    // isGlobal: true makes ConfigService available throughout the entire application
    // without needing to import ConfigModule in every module that uses it
    ConfigModule.forRoot({
      isGlobal: true,
      // Validation schema ensures required environment variables are present
      // and provides default values if they're missing
      validationSchema: Joi.object({
        DATABASE_PATH: Joi.string().default('tmp/db.sqlite'),
      }),
    }),
    ServerFeatureTodoModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

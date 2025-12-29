import { ServerFeatureTodoModule } from '@full-stack-todo/server/feature-todo';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [ServerFeatureTodoModule, TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

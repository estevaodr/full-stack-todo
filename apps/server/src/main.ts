/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Set up API versioning
  // Versioning any API should be standard procedure - this means all endpoints
  // now use /api/v1 as the prefix instead of just /api
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Set up Swagger/OpenAPI documentation
  // Unlike other modules that are added to AppModule, Swagger needs to be initialized
  // during the bootstrap phase of the application. This provides a UI for testing
  // and exploring the API at http://localhost:3333/api/v1
  const config = new DocumentBuilder()
    .setTitle(`Full Stack To-Do REST API`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v1`,
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api/v1`,
  );
}

bootstrap();

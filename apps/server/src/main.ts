/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Global validation pipe - automatically validates all incoming requests
  // This ensures DTOs are validated and returns proper 400 Bad Request errors
  // when validation fails, instead of 500 Internal Server Error
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

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
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    })
    // No name parameter - this becomes the default bearer auth scheme
    // Works with @ApiBearerAuth() decorator without parameters
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

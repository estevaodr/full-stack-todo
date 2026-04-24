import { Body, Controller, Module, Post } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Logger, LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { loggingEnvSchemaFragment } from '../config/logging-env.schema';
import { createPinoParams } from '../config/create-pino-params';
import { LoggingInterceptor } from '../http/logging.interceptor';
import { PinoLevelSyncService } from '../config/pino-level-sync.service';
import { TestLogStream } from './test-log-stream';

const BEARER = 'Bearer super-secret-token-xyz';
const PASS = 'deep-secret-password-value';

@Controller('echo')
class EchoController {
  @Post()
  accept(@Body() body: unknown) {
    void body;
    return { ok: true };
  }
}

function buildRedactionHarness(logStream: TestLogStream) {
  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        validationSchema: Joi.object(loggingEnvSchemaFragment),
      }),
      LoggerModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (c: ConfigService) =>
          createPinoParams(c, { destination: logStream }),
      }),
    ],
    controllers: [EchoController],
    providers: [
      PinoLevelSyncService,
      LoggingInterceptor,
      { provide: APP_INTERCEPTOR, useExisting: LoggingInterceptor },
    ],
  })
  class RedactionHarnessModule {}
  return RedactionHarnessModule;
}

describe('HTTP redaction (integration, SC-003)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('does not leak Authorization bearer or password substrings', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env.LOG_LEVEL = 'info';

    const logStream = new TestLogStream();
    const RedactionHarnessModule = buildRedactionHarness(logStream);

    const moduleRef = await Test.createTestingModule({
      imports: [RedactionHarnessModule],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true, logger: false });
    app.useLogger(app.get(Logger));
    await app.init();

    for (let i = 0; i < 20; i += 1) {
      await request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', BEARER)
        .send({ user: { password: PASS, name: 'n' }, password: PASS })
        .expect(201);
    }

    const blob = logStream.raw();
    expect(blob).not.toContain('super-secret-token-xyz');
    expect(blob).not.toContain('deep-secret-password-value');
    expect(blob).toContain('[Redacted]');
  });
});

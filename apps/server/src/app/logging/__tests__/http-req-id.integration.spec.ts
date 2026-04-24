import {
  Controller,
  Get,
  InternalServerErrorException,
  Module,
} from '@nestjs/common';
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

@Controller()
class ReqIdHarnessController {
  @Get()
  ping() {
    return { ok: true };
  }

  @Get('boom')
  boom() {
    throw new InternalServerErrorException('nope');
  }
}

function buildHarnessModule(logStream: TestLogStream) {
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
    controllers: [ReqIdHarnessController],
    providers: [
      PinoLevelSyncService,
      LoggingInterceptor,
      { provide: APP_INTERCEPTOR, useExisting: LoggingInterceptor },
    ],
  })
  class ReqIdHarnessModule {}
  return ReqIdHarnessModule;
}

describe('HTTP reqId (integration)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('stable reqId from x-request-id when set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env.LOG_LEVEL = 'info';

    const logStream = new TestLogStream();
    const ReqIdHarnessModule = buildHarnessModule(logStream);

    const moduleRef = await Test.createTestingModule({
      imports: [ReqIdHarnessModule],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true, logger: false });
    app.useLogger(app.get(Logger));
    await app.init();

    await request(app.getHttpServer())
      .get('/')
      .set('x-request-id', 'from-client-99')
      .expect(200);

    expect(logStream.raw()).toContain('"reqId":"from-client-99"');
  });

  it('generated UUID when header absent', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env.LOG_LEVEL = 'info';

    const logStream = new TestLogStream();
    const ReqIdHarnessModule = buildHarnessModule(logStream);

    const moduleRef = await Test.createTestingModule({
      imports: [ReqIdHarnessModule],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true, logger: false });
    app.useLogger(app.get(Logger));
    await app.init();

    await request(app.getHttpServer()).get('/').expect(200);

    const row = logStream
      .raw()
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.startsWith('{') && l.includes('"reqId"'));
    expect(row).toBeDefined();
    const parsed = JSON.parse(row as string) as { reqId: string };
    expect(parsed.reqId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

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
class NdjsonHarnessController {
  @Get()
  ok() {
    return { ok: true };
  }

  @Get('err')
  err() {
    throw new InternalServerErrorException('x');
  }
}

function buildNdjsonHarness(logStream: TestLogStream) {
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
    controllers: [NdjsonHarnessController],
    providers: [
      PinoLevelSyncService,
      LoggingInterceptor,
      { provide: APP_INTERCEPTOR, useExisting: LoggingInterceptor },
    ],
  })
  class NdjsonHarnessModule {}
  return NdjsonHarnessModule;
}

function parseNdjsonLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

describe('stdout NDJSON sample (SC-001)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('parses ≥50 non-empty stdout lines as JSON objects under production json', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env.LOG_LEVEL = 'info';

    const logStream = new TestLogStream();
    const NdjsonHarnessModule = buildNdjsonHarness(logStream);

    const moduleRef = await Test.createTestingModule({
      imports: [NdjsonHarnessModule],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true, logger: false });
    app.useLogger(app.get(Logger));
    await app.init();

    for (let i = 0; i < 30; i += 1) {
      await request(app.getHttpServer()).get('/').expect(200);
    }
    for (let i = 0; i < 25; i += 1) {
      await request(app.getHttpServer()).get('/err').expect(500);
    }

    const nd = parseNdjsonLines(logStream.raw()).filter((l) => l.startsWith('{'));
    expect(nd.length).toBeGreaterThanOrEqual(50);
    for (const line of nd) {
      expect(() => JSON.parse(line)).not.toThrow();
      expect(JSON.parse(line)).toEqual(expect.any(Object));
    }
  });
});

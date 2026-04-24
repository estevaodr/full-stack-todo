import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { createPinoParams } from './config/create-pino-params';
import { LoggingInterceptor } from './http/logging.interceptor';
import { PinoLevelSyncService } from './config/pino-level-sync.service';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createPinoParams(config),
    }),
  ],
  providers: [
    PinoLevelSyncService,
    LoggingInterceptor,
    { provide: APP_INTERCEPTOR, useExisting: LoggingInterceptor },
  ],
})
export class LoggingModule {}

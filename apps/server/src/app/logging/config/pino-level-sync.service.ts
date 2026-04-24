import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

const ALLOWED = new Set([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
]);

const SYNC_MS = 1000;

@Injectable()
export class PinoLevelSyncService implements OnModuleInit, OnModuleDestroy {
  private interval?: ReturnType<typeof setInterval>;
  private lastGood = 'info';

  constructor(private readonly pino: PinoLogger) {}

  onModuleInit(): void {
    const initial = this.normalize(process.env.LOG_LEVEL);
    if (initial) {
      this.lastGood = initial;
    }
    this.applyLevel(this.lastGood);
    this.interval = setInterval(() => this.tick(), SYNC_MS);
  }

  onModuleDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private tick(): void {
    const next = this.normalize(process.env.LOG_LEVEL);
    if (next) {
      this.lastGood = next;
      this.applyLevel(next);
    } else {
      this.applyLevel(this.lastGood);
    }
  }

  private normalize(
    v: string | undefined,
  ): 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | undefined {
    if (v === undefined) return undefined;
    const t = String(v).trim().toLowerCase();
    if (!t) return undefined;
    if (!ALLOWED.has(t)) return undefined;
    return t as 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  }

  private applyLevel(level: string): void {
    this.pino.logger.level = level;
  }
}

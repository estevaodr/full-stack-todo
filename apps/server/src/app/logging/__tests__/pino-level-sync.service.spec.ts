import { PinoLogger } from 'nestjs-pino';
import { PinoLevelSyncService } from '../config/pino-level-sync.service';

describe('PinoLevelSyncService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('applies new process.env.LOG_LEVEL after sync interval', () => {
    const root = { level: 'info' };
    const pino = {
      get logger() {
        return root;
      },
    } as unknown as PinoLogger;

    const svc = new PinoLevelSyncService(pino);
    svc.onModuleInit();

    expect(root.level).toBe('info');

    process.env.LOG_LEVEL = 'error';
    jest.advanceTimersByTime(1100);

    expect(root.level).toBe('error');

    svc.onModuleDestroy();
  });
});

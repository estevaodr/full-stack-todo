import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { LoggingInterceptor } from '../http/logging.interceptor';

describe('LoggingInterceptor', () => {
  const mockLog = {
    info: jest.fn(),
    error: jest.fn(),
  };

  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: getLoggerToken(LoggingInterceptor.name), useValue: mockLog },
      ],
    }).compile();
    interceptor = mod.get(LoggingInterceptor);
  });

  function ctxForReq(req: { id?: string; method?: string; url?: string }) {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as ExecutionContext;
  }

  it('logs success with reqId', (done) => {
    const next: CallHandler = { handle: () => of({ ok: true }) };
    interceptor
      .intercept(
        ctxForReq({ id: 'rid-1', method: 'GET', url: '/' }),
        next,
      )
      .subscribe({
        complete: () => {
          expect(mockLog.info).toHaveBeenCalledWith(
            expect.objectContaining({
              reqId: 'rid-1',
              method: 'GET',
              path: '/',
            }),
            'request handled',
          );
          done();
        },
      });
  });

  it('logs error with reqId', (done) => {
    const err = new Error('boom');
    const next: CallHandler = {
      handle: () => throwError(() => err),
    };
    interceptor
      .intercept(
        ctxForReq({ id: 'rid-2', method: 'POST', url: '/x' }),
        next,
      )
      .subscribe({
        error: () => {
          expect(mockLog.error).toHaveBeenCalledWith(
            expect.objectContaining({
              reqId: 'rid-2',
              err,
            }),
            'request failed',
          );
          done();
        },
      });
  });
});

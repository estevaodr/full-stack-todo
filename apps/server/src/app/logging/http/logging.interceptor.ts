import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { Request } from 'express';
import { generateHttpReqId } from './http-req-id';
import { requestContext } from './request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggingInterceptor.name)
    private readonly log: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<
      Request & { id?: string | number }
    >();
    const reqId =
      req?.id !== undefined && req?.id !== ''
        ? String(req.id)
        : generateHttpReqId(req);

    return new Observable((subscriber) => {
      requestContext.run({ reqId }, () => {
        next
          .handle()
          .pipe(
            tap({
              next: () => {
                this.log.info(
                  {
                    reqId,
                    method: req.method,
                    path: req.url,
                  },
                  'request handled',
                );
              },
              error: (err: unknown) => {
                this.log.error(
                  {
                    reqId,
                    method: req.method,
                    path: req.url,
                    err,
                  },
                  'request failed',
                );
              },
            }),
          )
          .subscribe(subscriber);
      });
    });
  }
}

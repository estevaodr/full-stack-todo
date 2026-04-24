import type { Params } from 'nestjs-pino';
import type { DestinationStream } from 'pino';
import type { IncomingMessage } from 'node:http';
import { ConfigService } from '@nestjs/config';
import { resolveLogFormat } from './log-format';
import { generateHttpReqId } from '../http/http-req-id';
import { createReqSerializer } from '../http/request-serializer';

export function createPinoParams(
  config: ConfigService,
  options?: { destination?: DestinationStream },
): Params {
  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
  const logFormat = config.get<string>('LOG_FORMAT') ?? 'auto';
  const resolved = resolveLogFormat(nodeEnv, logFormat);
  const level = config.get<string>('LOG_LEVEL') ?? 'info';

  const pinoHttpOptions = {
    level,
    quietReqLogger: true as const,
    genReqId: (req: IncomingMessage) => generateHttpReqId(req),
    redact: {
      paths: ['req.headers.authorization'],
      censor: '[Redacted]',
    },
    serializers: {
      req: createReqSerializer(),
    },
    ...(resolved === 'pretty' && !options?.destination
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          },
        }
      : {}),
  };

  if (options?.destination) {
    return { pinoHttp: [pinoHttpOptions, options.destination] };
  }

  return { pinoHttp: pinoHttpOptions };
}

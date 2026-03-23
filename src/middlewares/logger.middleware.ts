// logger.middleware.ts
import { Injectable, NestMiddleware, LoggerService } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import moment from 'moment-timezone';
import DailyRotateFile from 'winston-daily-rotate-file';

// const consoleLogFormat = winston.format.combine(winston.format.colorize(), winston.format.simple());
const fileLogFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
const formattedTimeStamp = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

const stringify = (obj: unknown): string => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'undefined' ? 'undefined' : String(obj as string | number | boolean);
  }

  const cache = new Set();
  const jsonString = JSON.stringify(obj, (_key, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return; // 순환 참조 제거
      }
      cache.add(value);
    }
    return value;
  });
  cache.clear();
  return jsonString;
};

const logMessageFormat = winston.format.printf((info: TransformableInfo) => {
  const { level, message, ...rest } = info;
  const instance = process.env.NODE_APP_INSTANCE || 0;

  const messageParts = [message as string];
  for (const key in rest) {
    messageParts.push(stringify(rest[key]));
  }

  const logContent = messageParts.join(' ');

  return `${formattedTimeStamp} [Instance ${instance}] ${level}: ${logContent}`;
});

const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format((info: TransformableInfo) => {
    const args = info[Symbol.for('splat')] as unknown[] | undefined;
    if (args) {
      const msg = typeof info.message === 'string' ? info.message : stringify(info.message);
      const parts: string[] = [msg];
      args.forEach((arg) => {
        parts.push(typeof arg === 'object' ? stringify(arg) : String(arg as string | number | boolean));
      });
      info.message = parts.join(' ');
    }

    if (info.message && typeof info.message === 'object') {
      info.message = stringify(info.message);
    }
    return info;
  })(),
  logMessageFormat,
);

// const fileLogFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.errors({ stack: true }),
//   winston.format((info, opts) => {
//     const args = info[Symbol.for('splat')] as any;
//     if (args) {
//       args.forEach(arg => {
//         if (typeof arg === 'object') {
//           info.message += ' ' + stringify(arg);
//         } else {
//           info.message += ' ' + arg;
//         }
//       });
//     }
//
//     if (info.message && typeof info.message === 'object') {
//       info.message = stringify(info.message);
//     }
//     return info;
//   })(),
//   logMessageFormat,
// );

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'silly',
  // transports: [
  //   new winston.transports.Console({
  //     format: consoleLogFormat,
  //   }),
  //   new winston.transports.File({
  //     filename: `logs/combined.log`,
  //     format: fileLogFormat,
  //     maxsize: 1 * 1024 * 1024 * 1024, // 1GB
  //     maxFiles: 1,
  //   }),
  // ],
  transports: [
    new winston.transports.Console({
      format: consoleLogFormat,
    }),
    // error.log - 에러 전용
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1g',
      maxFiles: '30d',
      format: fileLogFormat,
    }),

    // warn.log - 경고 전용
    new DailyRotateFile({
      level: 'warn',
      filename: 'logs/warn/warn-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1g',
      maxFiles: '30d',
      format: fileLogFormat,
    }),

    // combined.log - 모든 레벨 포함
    new DailyRotateFile({
      filename: 'logs/combined/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1g',
      maxFiles: '14d',
      format: fileLogFormat,
    }),
  ],
});

export class WinstonLoggerService implements LoggerService {
  log(message: string, context?: string) {
    logger.log({ level: 'info', message, context });
  }

  error(message: string, trace?: string, context?: string) {
    logger.log({ level: 'error', message, trace, context });
  }

  warn(message: string, context?: string) {
    logger.log({ level: 'warn', message, context });
  }

  debug(message: string, context?: string) {
    logger.log({ level: 'debug', message, context });
  }

  verbose(message: string, context?: string) {
    logger.log({ level: 'verbose', message, context });
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new WinstonLoggerService();

  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl !== '/metrics') {
      this.requestLog(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const oldWrite = res.write;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const oldEnd = res.end;

      const chunks: Buffer[] = [];

      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
      (res as any).write = (...args: unknown[]): boolean => {
        const chunk = args[0];
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
        }
        return oldWrite.apply(res, args as Parameters<typeof oldWrite>);
      };

      (res as any).end = (...args: unknown[]): Response => {
        if (args[0]) {
          const chunk = args[0];
          if (Buffer.isBuffer(chunk)) {
            chunks.push(chunk);
          } else if (typeof chunk === 'string') {
            chunks.push(Buffer.from(chunk));
          }
        }
        return oldEnd.apply(res, args as Parameters<typeof oldEnd>);
      };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

      res.once('finish', () => {
        this.responseLog(res);
      });
    }

    next();
  }

  private requestLog(req: Request) {
    const { params, query } = req;
    const body = req.body as Record<string, unknown> | undefined;
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const messageLines = [
      '---------------------------------------------------------------------------------',
      `request [${req.method}] ${requestUrl}`,
      `request body: ${JSON.stringify(body) || ''}`,
      `request query: ${JSON.stringify(query) || ''}`,
      `request params: ${JSON.stringify(params) || ''}`,
      '---------------------------------------------------------------------------------',
    ];
    for (const line of messageLines) {
      this.logger.log(line);
    }
  }

  private responseLog(res: Response) {
    const { statusCode, req, locals } = res;
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const messageLines = [
      '---------------------------------------------------------------------------------',
      `response [${req.method}] ${requestUrl}`,
      `response status: ${JSON.stringify(statusCode)}`,
      `response body: ${JSON.stringify((locals?.originalBody as string) || '')}`,
      '---------------------------------------------------------------------------------',
    ];
    for (const line of messageLines) {
      this.logger.log(line);
    }
  }
}

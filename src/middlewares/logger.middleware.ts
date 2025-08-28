// logger.middleware.ts
import { Injectable, NestMiddleware, LoggerService } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import moment from 'moment-timezone';
import { join } from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ServiceUnavailableServerException } from '../common/exceptions/common.exception';

const logDir: string = join(__dirname, '../../../logs');

// const consoleLogFormat = winston.format.combine(winston.format.colorize(), winston.format.simple());
const fileLogFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
const formattedTimeStamp = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

const stringify = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const cache = new Set();
  const jsonString = JSON.stringify(obj, (key, value) => {
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

  const messageParts = [message];
  for (const key in rest) {
    messageParts.push(stringify(rest[key]));
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const logContent = messageParts.join(' ');

  return `${formattedTimeStamp} [Instance ${instance}] ${level}: ${logContent}`;
});

const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format((info: TransformableInfo, opts) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const args = info[Symbol.for('splat')] as any;
    if (args) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      args.forEach(arg => {
        if (typeof arg === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-plus-operands
          info.message += ' ' + stringify(arg);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-plus-operands
          info.message += ' ' + arg;
        }
      });
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
  log(message: any, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log({ level: 'info', message, context });
  }

  error(message: any, trace?: string, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log({ level: 'error', message, trace, context });
  }

  warn(message: any, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log({ level: 'warn', message, context });
  }

  debug(message: any, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log({ level: 'debug', message, context });
  }

  verbose(message: any, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.log({ level: 'verbose', message, context });
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new WinstonLoggerService();

  use(req: Request, res: Response, next: NextFunction) {
    // throw new ServiceUnavailableServerException('central-common');

    if (req.originalUrl !== '/metrics') {
      this.requestLog(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const oldWrite = res.write;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const oldEnd = res.end;

      const chunks: Buffer[] = [];

      res.write = (...args: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const chunk = args[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        chunks.push(chunk);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return oldWrite.apply(res, args);
      };

      res.end = (...args: any[]) => {
        if (args[0]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const chunk = args[0];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          chunks.push(chunk);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return oldEnd.apply(res, args);
      };

      res.once('finish', () => {
        const responseBody = Buffer.concat(chunks).toString('utf8');
        this.responseLog(res, responseBody);
      });
    }

    next();
  }

  private requestLog(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body, params, query } = req;
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

  private responseLog(res: Response, responseBody: string) {
    const { statusCode, req, locals } = res;
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const messageLines = [
      '---------------------------------------------------------------------------------',
      `response [${req.method}] ${requestUrl}`,
      `response status: ${JSON.stringify(statusCode)}`,
      `response body: ${JSON.stringify(locals?.originalBody || '')}`,
      '---------------------------------------------------------------------------------',
    ];
    for (const line of messageLines) {
      this.logger.log(line);
    }
  }
}

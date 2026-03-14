import { Injectable, Logger, Scope } from '@nestjs/common';

/**
 * LoggerFactory - 일관된 로거 인스턴스 생성을 위한 팩토리
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerFactory {
  private readonly loggers = new Map<string, Logger>();

  create(context: string): Logger {
    if (!this.loggers.has(context)) {
      this.loggers.set(context, new Logger(context));
    }
    return this.loggers.get(context)!;
  }

  createForClass(target: new (...args: unknown[]) => unknown): Logger {
    return this.create(target.name);
  }
}

/**
 * LoggingService - 구조화된 로깅을 위한 서비스
 */
@Injectable()
export class LoggingService {
  private readonly logger: Logger;

  constructor(private readonly loggerFactory: LoggerFactory) {
    this.logger = this.loggerFactory.create('Application');
  }

  info(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }
}

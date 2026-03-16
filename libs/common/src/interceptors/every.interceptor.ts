import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  data: T;
}

@Injectable()
export class EveryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EveryInterceptor.name);

  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    this.logger.log('Before...');
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const body = req.body;
    this.logger.log(`Request - Method: ${method}, URL: ${url}, Body: ${JSON.stringify(body)}`);
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}

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
  // intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    this.logger.log('Before...');
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = req.body;
    this.logger.log(`Request - Method: ${method}, URL: ${url}, Body: ${JSON.stringify(body)}`);
    const now = Date.now();
    return next.handle().pipe(
      // map(data => {
      //   // this.logger.log(`Response Data: ${JSON.stringify(data)}`);
      //   console.log('data', data);
      //   return data; // 데이터 변형 없이 그대로 반환
      // }),
      tap(() => {
        this.logger.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}

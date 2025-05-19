import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

export interface Response<T> {
  data: T;
}

export interface Request<T> {
  query: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // return next.handle().pipe(map((data) => ({ data })));
    return next.handle().pipe(
      map((data) => {
        console.log(data);
        return instanceToPlain(data);
        // return data;
      }),
    );
  }
  // intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Response<any>>> {

  // }
}

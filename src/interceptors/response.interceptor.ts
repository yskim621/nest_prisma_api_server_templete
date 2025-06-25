import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonResponse } from 'src/common/common.interface';
// import { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<CommonResponse<T>> {
    return next.handle().pipe(
      map((data: unknown): CommonResponse<T> => {
        if (typeof data !== 'object' || data === null || !('isSuccess' in data)) {
          return {
            isSuccess: false,
            code: '9999',
            message: 'This request is not processed successfully due to an unknown error.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: data as T,
          };
        }

        return data as CommonResponse<T>; // ✅ 안전한 단언
      }),
    );
  }
}

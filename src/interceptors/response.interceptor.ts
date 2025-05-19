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
        if (typeof data === 'object' && data !== null && 'success' in data) {
          return data as CommonResponse<T>; // ✅ 안전한 단언
        }

        return {
          success: true,
          message: '성공',
          code: 200,
          data: data as T,
        };
      }),
    );
  }
}

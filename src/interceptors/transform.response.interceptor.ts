import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse, ComSystem } from '../common/common.interface';
import { getDefaultResponse, getSuccessResponse } from '../common/common.response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<CommonResponse<T>> {
    return next.handle().pipe(
      map((res): CommonResponse<T> => {
        if (res === null || res === undefined) {
          return {
            isSuccess: false,
            code: '5000',
            message: 'There is no response data.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: null,
          };
        }

        if (typeof res !== 'object') {
          return {
            isSuccess: false,
            code: '9999',
            message: 'This request is not processed successfully due to an unknown error.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: res as T | T[],
          };
        }

        const { code, data, comSystem } = res as { code?: string; data?: T | T[]; comSystem?: ComSystem };
        if (!code) {
          return getDefaultResponse(res as T | T[]);
        }

        if (code !== '2000') {
          return res as CommonResponse<T>;
        }

        return getSuccessResponse(comSystem, data);
      }),
    );
  }
}

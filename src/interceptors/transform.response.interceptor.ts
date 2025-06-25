import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse } from 'src/common/common.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<CommonResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next.handle().pipe(
      map((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response = context.switchToHttp().getResponse();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        response.locals = response.locals || {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        response.locals.originalBody = res;

        if (res === null || res === undefined) {
          return {
            isSuccess: false,
            code: '9999',
            message: 'No response data.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: {},
          };
        }

        if (Array.isArray(res)) {
          return {
            isSuccess: true,
            code: '2000',
            message: 'Success.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: res as T,
          };
        }

        if (typeof res === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { data, pagination, result, ...rest } = res;
          if (Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return {
              isSuccess: result !== undefined ? !!result : true,
              code: '2000',
              message: 'Success.',
              resSystem: 'c',
              comSystem: 'central-common',
              resTime: new Date(),
              data: data as T,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              pagination,
              ...rest,
            };
          }
          if (typeof data === 'object' && data !== null) {
            return {
              isSuccess: result !== undefined ? !!result : true,
              code: '2000',
              message: 'Success.',
              resSystem: 'c',
              comSystem: 'central-common',
              resTime: new Date(),
              data: { ...data, ...rest } as T,
            };
          }
          if (!data && result !== undefined) {
            return {
              isSuccess: !!result,
              code: '2000',
              message: 'Success.',
              resSystem: 'c',
              comSystem: 'central-common',
              resTime: new Date(),
              data: {},
            };
          }
          if (data === null) {
            return {
              isSuccess: false,
              code: '9999',
              message: 'No data.',
              resSystem: 'c',
              comSystem: 'central-common',
              resTime: new Date(),
              data: {},
            };
          }
          return {
            isSuccess: true,
            code: '2000',
            message: 'Success.',
            resSystem: 'c',
            comSystem: 'central-common',
            resTime: new Date(),
            data: { ...res } as T,
          };
        }

        // Fallback for primitives
        return {
          isSuccess: true,
          code: '2000',
          message: 'Success.',
          resSystem: 'c',
          comSystem: 'central-common',
          resTime: new Date(),
          data: res as T,
        };
      }),
    );
  }
}

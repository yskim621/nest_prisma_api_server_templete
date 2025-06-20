/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CommonResponse } from 'src/common/common.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : '서버 에러 발생';

    const errorMessage = typeof message === 'string' ? message : ((message as any)?.message ?? '알 수 없는 에러');

    const result: CommonResponse<null> = {
      isSuccess: false,
      code: '5000',
      message: errorMessage,
      resSystem: 'c',
      comSystem: 'central-common',
      resTime: new Date(),
      data: null,
    };

    response.status(status).json(result);
  }
}

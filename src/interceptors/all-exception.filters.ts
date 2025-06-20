import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../prisma/generated/mindsai_platform';
// import { Prisma } from '@prisma/client';
import { sendNotification } from 'src/utils/notification';
import * as fs from 'fs';
import * as path from 'path';
import { CommonResponse } from '../common/common.interface';
import { Response } from 'express';

const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const packageName = packageJsonData.name;

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter<BadRequestException> {
  private logger = new Logger('ValidationExceptionFilter', { timestamp: true });
  public catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof BadRequestException ? exception.getStatus() : HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      result: false,
      statusCode: status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      message: exception.response.error,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      info: exception?.response?.message instanceof Array ? exception.response.message.map((data) => data.constraints) : exception?.response?.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();

    const result: CommonResponse<null> = {
      isSuccess: false,
      code: '5000',
      message: 'this request is not processed',
      resSystem: 'c',
      comSystem: 'central-common',
      resTime: new Date(),
      data: null,
    };

    response.status(status).json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('AllExceptionsFilter', { timestamp: true });
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const error =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Prisma.PrismaClientKnownRequestError
          ? 'Database Error'
          : exception instanceof Prisma.PrismaClientUnknownRequestError
            ? 'Unknown Database Error'
            : 'Internal Server Error';

    this.logger.error('exception', exception);

    if (status >= 500) {
      const errorMessage = `서버 에러가 발생했습니다. 
      \r\n Http Error Code: ${status} 
      \r\n Error Path: ${request.url} 
      \r\n ${packageName} 프로젝트 ${process.env.NODE_ENV}환경 
      \r\n 해당 프로젝트 담당자는 확인바랍니다. `;
      await sendNotification('error', 'Internal Server Error', errorMessage, exception);
    }

    const result: CommonResponse<null> = {
      isSuccess: false,
      code: '5000',
      message: error,
      resSystem: 'c',
      comSystem: 'central-common',
      resTime: new Date(),
      data: null,
    };

    response.status(status).json({
      ...result,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

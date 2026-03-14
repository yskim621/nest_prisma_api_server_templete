import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { sendNotification } from 'src/utils/notification';
import * as fs from 'fs';
import * as path from 'path';
import { CommonResponse } from '../common.interface';
import { Response } from 'express';
import { DbErrType } from '../common.type';
import { getQueryErrRes } from '../common.response';
import { QueryException, UnauthorizedClientException } from './common.exception';
import { errorHandle } from './common.error-handler';
import { Prisma } from 'prisma/generated/nest_prisma_template';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const packageJsonData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const packageName: string = packageJsonData?.name;

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter<BadRequestException> {
  private logger = new Logger('ValidationExceptionFilter', { timestamp: true });

  public catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus?.() ?? HttpStatus.UNPROCESSABLE_ENTITY;

    // Safely extract error and message info
    const exceptionResponse: any = exception.getResponse?.() ?? exception;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const message = exceptionResponse?.error ?? exception.message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    const info = Array.isArray(exceptionResponse?.message) ? exceptionResponse.message.map((data: any) => data.constraints) : exceptionResponse?.message;

    response.status(status).json({
      result: false,
      statusCode: status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      info,
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

@Catch(UnauthorizedClientException, ForbiddenException)
export class ForbiddenFilter implements ExceptionFilter {
  async catch(exception: UnauthorizedClientException | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const result = await errorHandle(exception, request.url, 'central-common');

    response.status(HttpStatus.FORBIDDEN).json({
      ...result,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const result = await errorHandle(exception, request.url, 'central-common');

    res.status(HttpStatus.OK).json({
      ...result,
      path: request.url,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('AllExceptionsFilter', { timestamp: true });

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let error = 'Internal Server Error';
    if (exception instanceof HttpException) {
      error = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      error = 'Database Error';
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      error = 'Unknown Database Error';
    }

    this.logger.error('exception', exception);

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

// Prisma error code to DbErrType mapping
const prismaCodeToDbErrType: Record<string, DbErrType> = {
  // connectionPool
  P1001: 'connectionPool',
  P1002: 'connectionPool',
  P1008: 'connectionPool',
  P1017: 'connectionPool',
  P6008: 'connectionPool',
  P2024: 'connectionPool',
  P2037: 'connectionPool',
  // typeMismatch
  P2000: 'typeMismatch',
  P2005: 'typeMismatch',
  P2006: 'typeMismatch',
  P2012: 'typeMismatch',
  P2013: 'typeMismatch',
  P2016: 'typeMismatch',
  P2019: 'typeMismatch',
  P2020: 'typeMismatch',
  P2023: 'typeMismatch',
  P2033: 'typeMismatch',
  // find
  P2001: 'find',
  P2025: 'find',
  P2015: 'find',
  P2018: 'find',
  // constraint
  P2002: 'constraint',
  P2003: 'constraint',
  P2004: 'constraint',
  P2011: 'constraint',
  // syntax
  P2010: 'syntax',
  // transaction
  P2034: 'transaction',
  // tableLock
  P2021: 'tableLock',
  P2022: 'tableLock',
};

@Catch(QueryException)
export class PrismaExceptionFilter implements ExceptionFilter {
  private logger = new Logger('PrismaExceptionFilter', { timestamp: true });

  async catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Map Prisma error code to DbErrType, fallback to 'unknown'
    const dbErrType: DbErrType = prismaCodeToDbErrType[exception.code] ?? 'unknown';

    this.logger.error('exception', exception);

    const errorMessage = `서버 에러가 발생했습니다.
      \r\n Http Error Code: ${status}
      \r\n Error Path: ${request.url}
      \r\n ${packageName} 프로젝트 ${process.env.NODE_ENV}환경
      \r\n 해당 프로젝트 담당자는 확인바랍니다. `;
    await sendNotification('error', 'Internal Server Error', errorMessage, exception);

    const errorResponse: CommonResponse = getQueryErrRes(dbErrType);

    response.status(HttpStatus.OK).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
      prismaCode: exception.code,
      prismaMessage: exception.message,
    });
  }
}

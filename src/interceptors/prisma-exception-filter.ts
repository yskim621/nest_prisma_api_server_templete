import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../prisma/generated/mindsai_platform';
import { CommonResponse } from '../common/common.interface';
import { DbErrType } from '../common/common.type';
import { getQueryErrRes } from '../common/common.response';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();


    // Map Prisma error codes to your DbErrType
    let dbErrType: DbErrType = 'unknown'; // default
    switch (exception.code) {
      case 'P1001':
        dbErrType = 'connectionPool';
        break;
      case 'P1008':
        dbErrType = 'connectionPool';
        break;
      case 'P2002':
        dbErrType = 'constraint';
        break;
      case 'P2003':
        dbErrType = 'constraint';
        break;
      case 'P2010':
        dbErrType = 'syntax';
        break;
      case 'P2025':
        dbErrType = 'find';
        break;
      case 'P2034':
        dbErrType = 'transaction';
        break;
      default:
        dbErrType = 'unknown';
        break;
    }

    const errorResponse: CommonResponse = getQueryErrRes(dbErrType);

    response.status(HttpStatus.OK).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

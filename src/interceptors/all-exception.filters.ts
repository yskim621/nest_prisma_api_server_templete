import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/mindsai_platform';
import { sendNotification } from 'src/utils/notification';
import * as fs from 'fs';
import * as path from 'path';
import { CommonResponse } from '../common/common.interface';
import { Response } from 'express';
import { DbErrType } from '../common/common.type';
import { getQueryErrRes } from '../common/common.response';
import { QueryException } from '../common/commom.exception';

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
  catch(exception: unknown, host: ArgumentsHost) {
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

@Catch(QueryException)
export class PrismaExceptionFilter implements ExceptionFilter {
  private logger = new Logger('PrismaExceptionFilter', { timestamp: true });

  async catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Map Prisma error codes to DbErrType
    let dbErrType: DbErrType;
    switch (exception.code) {
      case 'P1001':
      case 'P1002':
      case 'P1008':
      case 'P1017':
      case 'P6008':
        dbErrType = 'connectionPool';
        break;
      case 'P1003':
      case 'P1009':
      case 'P1013':
      case 'P1014':
      case 'P1015':
      case 'P1016':
      case 'P1018':
      case 'P1019':
      case 'P1020':
      case 'P1021':
      case 'P1022':
      case 'P1023':
      case 'P1024':
      case 'P1025':
      case 'P1026':
      case 'P1027':
      case 'P1028':
      case 'P1029':
      case 'P1030':
      case 'P1031':
      case 'P1032':
      case 'P1033':
      case 'P1034':
      case 'P1035':
      case 'P1036':
      case 'P1037':
      case 'P1038':
      case 'P1039':
      case 'P1040':
      case 'P1041':
      case 'P1042':
      case 'P1043':
      case 'P1044':
      case 'P1045':
      case 'P1046':
      case 'P1047':
      case 'P1048':
      case 'P1049':
      case 'P1050':
      case 'P1051':
      case 'P1052':
      case 'P1053':
      case 'P1054':
      case 'P1055':
      case 'P1056':
      case 'P1057':
      case 'P1058':
      case 'P1059':
      case 'P1060':
      case 'P1061':
      case 'P1062':
      case 'P1063':
      case 'P1064':
      case 'P1065':
      case 'P1066':
      case 'P1067':
      case 'P1068':
      case 'P1069':
      case 'P1070':
      case 'P1071':
      case 'P1072':
      case 'P1073':
      case 'P1074':
      case 'P1075':
      case 'P1076':
      case 'P1077':
      case 'P1078':
      case 'P1079':
      case 'P1080':
      case 'P1081':
      case 'P1082':
      case 'P1083':
      case 'P1084':
      case 'P1085':
      case 'P1086':
      case 'P1087':
      case 'P1088':
      case 'P1089':
      case 'P1090':
      case 'P1091':
      case 'P1092':
      case 'P1093':
      case 'P1094':
      case 'P1095':
      case 'P1096':
      case 'P1097':
      case 'P1098':
      case 'P1099':
        dbErrType = 'unknown';
        break;
      case 'P2000':
      case 'P2005':
      case 'P2006':
      case 'P2012':
      case 'P2013':
      case 'P2016':
      case 'P2019':
      case 'P2020':
      case 'P2023':
      case 'P2033':
        dbErrType = 'typeMismatch';
        break;
      case 'P2001':
      case 'P2025':
      case 'P2015':
      case 'P2018':
        dbErrType = 'find';
        break;
      case 'P2002':
      case 'P2003':
      case 'P2004':
      case 'P2011':
        dbErrType = 'constraint';
        break;
      case 'P2010':
        dbErrType = 'syntax';
        break;
      case 'P2034':
        dbErrType = 'transaction';
        break;
      case 'P2021':
      case 'P2022':
        dbErrType = 'tableLock';
        break;
      case 'P2024':
      case 'P2037':
        dbErrType = 'connectionPool';
        break;
      default:
        dbErrType = 'unknown';
        break;
    }

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

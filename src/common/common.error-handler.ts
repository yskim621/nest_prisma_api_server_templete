import { CommonResponse, ComSystem } from './common.interface';
import { getQueryErrRes, getClientErrRes, getServerErrRes, getUnknownErrResponse } from './common.response';
import * as Exceptions from './common.exception';
import { HttpException } from '@nestjs/common';
import type { DbErrType, ClientErrType, ServerErrType } from './common.type';
import { sendNotification } from '../utils/notification';
import path from 'path';
import fs from 'fs';

// Exception maps as objects
const dbExceptionMap = {
  create: Exceptions.CreateQueryException,
  update: Exceptions.UpdateQueryException,
  delete: Exceptions.DeleteQueryException,
  find: Exceptions.FindQueryException,
  findOne: Exceptions.FindOneQueryException,
  syntax: Exceptions.SyntaxQueryException,
  typeMismatch: Exceptions.TypeMismatchQueryException,
  constraint: Exceptions.ConstraintQueryException,
  packetLimit: Exceptions.PacketLimitQueryException,
  transaction: Exceptions.TransactionQueryException,
  encoding: Exceptions.EncodingQueryException,
  tableLock: Exceptions.TableLockQueryException,
  connectionPool: Exceptions.ConnectionPoolQueryException,
} as const;

const clientExceptionMap = {
  badRequest: Exceptions.BadRequestClientException,
  missingParameter: Exceptions.MissingParameterClientException,
  invalidDataFormat: Exceptions.InvalidDataFormatClientException,
  invalidData: Exceptions.InvalidDataClientException,
  credentials: Exceptions.CredentialsClientException,
  accountStatus: Exceptions.AccountStatusClientException,
  token: Exceptions.TokenClientException,
  session: Exceptions.SessionClientException,
  unauthorized: Exceptions.UnauthorizedClientException,
  forbidden: Exceptions.ForbiddenClientException,
  accessControl: Exceptions.AccessControlClientException,
  mfa: Exceptions.MfaClientException,
  apiKey: Exceptions.ApiKeyClientException,
  notRunning: Exceptions.NotRunningClientException,
  requestBlocked: Exceptions.RequestBlockedClientException,
} as const;

const serverExceptionMap = {
  internal: Exceptions.InternalServerException,
  badGateway: Exceptions.BadGatewayServerException,
  serviceUnavailable: Exceptions.ServiceUnavailableServerException,
  gatewayTimeout: Exceptions.GatewayTimeoutServerException,
  unhandledExceptions: Exceptions.UnhandledExceptionsServerException,
  dependencyInjection: Exceptions.DependencyInjectionServerException,
  setting: Exceptions.SettingServerException,
  outOfMemory: Exceptions.OutOfMemoryServerException,
  proxy: Exceptions.ProxyServerException,
  applicationDown: Exceptions.ApplicationDownServerException,
  applicationTimeout: Exceptions.ApplicationTimeoutServerException,
  externalService: Exceptions.ExternalServiceServerException,
  tooManyRequests: Exceptions.TooManyRequestsServerException,
  routePath: Exceptions.RoutePathServerException,
  unregisteredController: Exceptions.UnregisteredControllerServerException,
  unregisteredModule: Exceptions.UnregisteredModuleServerException,
  methodDecorator: Exceptions.MethodDecoratorServerException,
  unknown: Exceptions.UnknownServerException,
} as const;

const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const packageName = packageJsonData.name;

const getErrorMessage = (type: string, errPath?: string): string => {
  return `
    \r\n --------------------------------------------------------------------------------------------------------
    \r\n 서버 에러가 발생했습니다. 
    \r\n Error type: ${type} query error
    \r\n Error Path: ${errPath} 
    \r\n ${packageName} 프로젝트 ${process.env.NODE_ENV} 환경 
    \r\n 해당 프로젝트 담당자는 확인바랍니다.
  `;
};

export async function errorHandle(error: unknown, errPath?: string, comSystem: ComSystem = 'central-common'): Promise<CommonResponse> {
  for (const [type, ExceptionClass] of Object.entries(dbExceptionMap) as unknown as [DbErrType, typeof Error][]) {
    if (error instanceof ExceptionClass) {
      const errorMessage = getErrorMessage(type, errPath);
      await sendNotification('error', 'Internal Server Error', errorMessage, error);

      return getQueryErrRes(type, error);
    }
  }
  for (const [type, ExceptionClass] of Object.entries(clientExceptionMap) as unknown as [ClientErrType, typeof Error][]) {
    if (error instanceof ExceptionClass) {
      return getClientErrRes(type, comSystem);
    }
  }
  for (const [type, ExceptionClass] of Object.entries(serverExceptionMap) as unknown as [ServerErrType, typeof Error][]) {
    if (error instanceof ExceptionClass) {
      return getServerErrRes(type, comSystem);
    }
  }

  return getUnknownErrResponse();
}

function ThrowFoundException(error: HttpException): never {
  for (const ExceptionClass of Object.values(dbExceptionMap)) {
    if (error instanceof ExceptionClass) {
      throw new ExceptionClass(error);
    }
  }
  for (const ExceptionClass of Object.values(clientExceptionMap)) {
    if (error instanceof ExceptionClass) {
      throw new ExceptionClass('central-common', error);
    }
  }
  for (const ExceptionClass of Object.values(serverExceptionMap)) {
    if (error instanceof ExceptionClass) {
      throw new ExceptionClass('central-common', error);
    }
  }

  throw error;
}

export function generateException(error: HttpException): never {
  ThrowFoundException(error);
}

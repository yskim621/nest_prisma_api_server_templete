import { CommonResponse, ComSystem } from './common.interface';
import { getQueryErrRes, getClientErrRes, getServerErrRes, getUnknownErrResponse } from './common.response';
import * as Exceptions from './commom.exception';
import { HttpException } from '@nestjs/common';
import type { DbErrType, ClientErrType, ServerErrType } from './common.type';

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

export function errorHandle(error: unknown, comSystem: ComSystem = 'central-common'): CommonResponse {
  for (const [type, ExceptionClass] of Object.entries(dbExceptionMap) as unknown as [DbErrType, typeof Error][]) {
    if (error instanceof ExceptionClass) {
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

export function createException(error: HttpException): never {
  ThrowFoundException(error);
}

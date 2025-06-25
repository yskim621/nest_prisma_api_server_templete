import { CommonResponse, ComSystem } from './common.interface';
import { getDefaultResponse, getQueryErrRes, getClientErrRes, getServerErrRes } from './common.response';
import {
  CreateQueryException,
  UpdateQueryException,
  DeleteQueryException,
  FindQueryException,
  FindOneQueryException,
  SyntaxQueryException,
  TypeMismatchQueryException,
  ConstraintQueryException,
  PacketLimitQueryException,
  TransactionQueryException,
  EncodingQueryException,
  TableLockQueryException,
  ConnectionPoolQueryException,
  BadRequestClientException,
  MissingParameterClientException,
  InvalidDataFormatClientException,
  InvalidDataClientException,
  CredentialsClientException,
  AccountStatusClientException,
  TokenClientException,
  SessionClientException,
  UnauthorizedClientException,
  ForbiddenClientException,
  AccessControlClientException,
  MfaClientException,
  ApiKeyClientException,
  NotRunningClientException,
  RequestBlockedClientException,
  InternalServerException,
  BadGatewayServerException,
  ServiceUnavailableServerException,
  GatewayTimeoutServerException,
  UnhandledExceptionsServerException,
  DependencyInjectionServerException,
  SettingServerException,
  OutOfMemoryServerException,
  ProxyServerException,
  ApplicationDownServerException,
  ApplicationTimeoutServerException,
  ExternalServiceServerException,
  TooManyRequestsServerException,
  RoutePathServerException,
  UnregisteredControllerServerException,
  UnregisteredModuleServerException,
  MethodDecoratorServerException,
  UnknownServerException,
} from './commom.exception';
import { HttpException } from '@nestjs/common';

export function errorHandle(error: unknown, comSystem: ComSystem = 'central-common'): CommonResponse {
  // DB Exceptions
  if (error instanceof CreateQueryException) return getQueryErrRes('create', error);
  if (error instanceof UpdateQueryException) return getQueryErrRes('update', error);
  if (error instanceof DeleteQueryException) return getQueryErrRes('delete', error);
  if (error instanceof FindQueryException) return getQueryErrRes('find', error);
  if (error instanceof FindOneQueryException) return getQueryErrRes('findOne', error);
  if (error instanceof SyntaxQueryException) return getQueryErrRes('syntax', error);
  if (error instanceof TypeMismatchQueryException) return getQueryErrRes('typeMismatch', error);
  if (error instanceof ConstraintQueryException) return getQueryErrRes('constraint', error);
  if (error instanceof PacketLimitQueryException) return getQueryErrRes('packetLimit', error);
  if (error instanceof TransactionQueryException) return getQueryErrRes('transaction', error);
  if (error instanceof EncodingQueryException) return getQueryErrRes('encoding', error);
  if (error instanceof TableLockQueryException) return getQueryErrRes('tableLock', error);
  if (error instanceof ConnectionPoolQueryException) return getQueryErrRes('connectionPool', error);

  // Client Exceptions
  if (error instanceof BadRequestClientException) return getClientErrRes('badRequest', comSystem);
  if (error instanceof MissingParameterClientException) return getClientErrRes('missingParameter', comSystem);
  if (error instanceof InvalidDataFormatClientException) return getClientErrRes('invalidDataFormat', comSystem);
  if (error instanceof InvalidDataClientException) return getClientErrRes('invalidData', comSystem);
  if (error instanceof CredentialsClientException) return getClientErrRes('credentials', comSystem);
  if (error instanceof AccountStatusClientException) return getClientErrRes('accountStatus', comSystem);
  if (error instanceof TokenClientException) return getClientErrRes('token', comSystem);
  if (error instanceof SessionClientException) return getClientErrRes('session', comSystem);
  if (error instanceof UnauthorizedClientException) return getClientErrRes('unauthorized', comSystem);
  if (error instanceof ForbiddenClientException) return getClientErrRes('forbidden', comSystem);
  if (error instanceof AccessControlClientException) return getClientErrRes('accessControl', comSystem);
  if (error instanceof MfaClientException) return getClientErrRes('mfa', comSystem);
  if (error instanceof ApiKeyClientException) return getClientErrRes('apiKey', comSystem);
  if (error instanceof NotRunningClientException) return getClientErrRes('notRunning', comSystem);
  if (error instanceof RequestBlockedClientException) return getClientErrRes('requestBlocked', comSystem);

  // Server Exceptions
  if (error instanceof InternalServerException) return getServerErrRes('internal', comSystem);
  if (error instanceof BadGatewayServerException) return getServerErrRes('badGateway', comSystem);
  if (error instanceof ServiceUnavailableServerException) return getServerErrRes('serviceUnavailable', comSystem);
  if (error instanceof GatewayTimeoutServerException) return getServerErrRes('gatewayTimeout', comSystem);
  if (error instanceof UnhandledExceptionsServerException) return getServerErrRes('unhandledExceptions', comSystem);
  if (error instanceof DependencyInjectionServerException) return getServerErrRes('dependencyInjection', comSystem);
  if (error instanceof SettingServerException) return getServerErrRes('setting', comSystem);
  if (error instanceof OutOfMemoryServerException) return getServerErrRes('outOfMemory', comSystem);
  if (error instanceof ProxyServerException) return getServerErrRes('proxy', comSystem);
  if (error instanceof ApplicationDownServerException) return getServerErrRes('applicationDown', comSystem);
  if (error instanceof ApplicationTimeoutServerException) return getServerErrRes('applicationTimeout', comSystem);
  if (error instanceof ExternalServiceServerException) return getServerErrRes('externalService', comSystem);
  if (error instanceof TooManyRequestsServerException) return getServerErrRes('tooManyRequests', comSystem);
  if (error instanceof RoutePathServerException) return getServerErrRes('routePath', comSystem);
  if (error instanceof UnregisteredControllerServerException) return getServerErrRes('unregisteredController', comSystem);
  if (error instanceof UnregisteredModuleServerException) return getServerErrRes('unregisteredModule', comSystem);
  if (error instanceof MethodDecoratorServerException) return getServerErrRes('methodDecorator', comSystem);
  if (error instanceof UnknownServerException) return getServerErrRes('unknown', comSystem);

  // Fallback: unknown error
  return getDefaultResponse();
}

export function createException(error: HttpException) {
  // DB Exceptions
  if (error instanceof CreateQueryException) throw new CreateQueryException(error);
  if (error instanceof UpdateQueryException) throw new UpdateQueryException(error);
  if (error instanceof DeleteQueryException) throw new DeleteQueryException(error);
  if (error instanceof FindQueryException) throw new FindQueryException(error);
  if (error instanceof FindOneQueryException) throw new FindOneQueryException(error);
  if (error instanceof SyntaxQueryException) throw new SyntaxQueryException(error);
  if (error instanceof TypeMismatchQueryException) throw new TypeMismatchQueryException(error);
  if (error instanceof ConstraintQueryException) throw new ConstraintQueryException(error);
  if (error instanceof PacketLimitQueryException) throw new PacketLimitQueryException(error);
  if (error instanceof TransactionQueryException) throw new TransactionQueryException(error);
  if (error instanceof EncodingQueryException) throw new EncodingQueryException(error);
  if (error instanceof TableLockQueryException) throw new TableLockQueryException(error);
  if (error instanceof ConnectionPoolQueryException) throw new ConnectionPoolQueryException(error);

  // Client Exceptions
  if (error instanceof BadRequestClientException) throw new BadRequestClientException('central-common', error);
  if (error instanceof MissingParameterClientException) throw new MissingParameterClientException('central-common', error);
  if (error instanceof InvalidDataFormatClientException) throw new InvalidDataFormatClientException('central-common', error);
  if (error instanceof InvalidDataClientException) throw new InvalidDataClientException('central-common', error);
  if (error instanceof CredentialsClientException) throw new CredentialsClientException('central-common', error);
  if (error instanceof AccountStatusClientException) throw new AccountStatusClientException('central-common', error);
  if (error instanceof TokenClientException) throw new TokenClientException('central-common', error);
  if (error instanceof SessionClientException) throw new SessionClientException('central-common', error);
  if (error instanceof UnauthorizedClientException) throw new UnauthorizedClientException('central-common', error);
  if (error instanceof ForbiddenClientException) throw new ForbiddenClientException('central-common', error);
  if (error instanceof AccessControlClientException) throw new AccessControlClientException('central-common', error);
  if (error instanceof MfaClientException) throw new MfaClientException('central-common', error);
  if (error instanceof ApiKeyClientException) throw new ApiKeyClientException('central-common', error);
  if (error instanceof NotRunningClientException) throw new NotRunningClientException('central-common', error);
  if (error instanceof RequestBlockedClientException) throw new RequestBlockedClientException('central-common', error);

  // Server Exceptions
  if (error instanceof InternalServerException) throw new InternalServerException('central-common', error);
  if (error instanceof BadGatewayServerException) throw new BadGatewayServerException('central-common', error);
  if (error instanceof ServiceUnavailableServerException) throw new ServiceUnavailableServerException('central-common', error);
  if (error instanceof GatewayTimeoutServerException) throw new GatewayTimeoutServerException('central-common', error);
  if (error instanceof UnhandledExceptionsServerException) throw new UnhandledExceptionsServerException('central-common', error);
  if (error instanceof DependencyInjectionServerException) throw new DependencyInjectionServerException('central-common', error);
  if (error instanceof SettingServerException) throw new SettingServerException('central-common', error);
  if (error instanceof OutOfMemoryServerException) throw new OutOfMemoryServerException('central-common', error);
  if (error instanceof ProxyServerException) throw new ProxyServerException('central-common', error);
  if (error instanceof ApplicationDownServerException) throw new ApplicationDownServerException('central-common', error);
  if (error instanceof ApplicationTimeoutServerException) throw new ApplicationTimeoutServerException('central-common', error);
  if (error instanceof ExternalServiceServerException) throw new ExternalServiceServerException('central-common', error);
  if (error instanceof TooManyRequestsServerException) throw new TooManyRequestsServerException('central-common', error);
  if (error instanceof RoutePathServerException) throw new RoutePathServerException('central-common', error);
  if (error instanceof UnregisteredControllerServerException) throw new UnregisteredControllerServerException('central-common', error);
  if (error instanceof UnregisteredModuleServerException) throw new UnregisteredModuleServerException('central-common', error);
  if (error instanceof MethodDecoratorServerException) throw new MethodDecoratorServerException('central-common', error);
  if (error instanceof UnknownServerException) throw new UnknownServerException('central-common', error);

  // Fallback: rethrow original error
  throw error;
}

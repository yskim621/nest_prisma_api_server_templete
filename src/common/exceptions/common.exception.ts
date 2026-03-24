import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientErrType, DbErrType, ServerErrType } from '../common.type';
import { getQueryErrRes, getClientErrRes, getServerErrRes } from '../common.response';
import { ComSystem } from '../common.interface';

export class QueryException extends HttpException {
  constructor(type: DbErrType, error?: unknown) {
    super(getQueryErrRes(type), HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'QueryException';
    this.message = error instanceof Error ? error.message : undefined;
    this.stack = error instanceof Error ? error.stack : undefined;
  }
}

export class CreateQueryException extends QueryException {
  constructor(error?: unknown) {
    super('create', error);
    this.name = 'CreateQueryException';
  }
}

export class UpdateQueryException extends QueryException {
  constructor(error?: unknown) {
    super('update', error);
    this.name = 'UpdateQueryException';
  }
}

export class DeleteQueryException extends QueryException {
  constructor(error?: unknown) {
    super('delete', error);
    this.name = 'DeleteQueryException';
  }
}

export class FindQueryException extends QueryException {
  constructor(error?: unknown) {
    super('find', error);
    this.name = 'FindQueryException';
  }
}

export class FindOneQueryException extends QueryException {
  constructor(error?: unknown) {
    super('findOne', error);
    this.name = 'FindOneQueryException';
  }
}

export class SyntaxQueryException extends QueryException {
  constructor(error?: unknown) {
    super('syntax', error);
    this.name = 'SyntaxQueryException';
  }
}

export class TypeMismatchQueryException extends QueryException {
  constructor(error?: unknown) {
    super('typeMismatch', error);
    this.name = 'TypeMismatchQueryException';
  }
}

export class ConstraintQueryException extends QueryException {
  constructor(error?: unknown) {
    super('constraint', error);
    this.name = 'ConstraintQueryException';
  }
}

export class PacketLimitQueryException extends QueryException {
  constructor(error?: unknown) {
    super('packetLimit', error);
    this.name = 'PacketLimitQueryException';
  }
}

export class TransactionQueryException extends QueryException {
  constructor(error?: unknown) {
    super('transaction', error);
    this.name = 'TransactionQueryException';
  }
}

export class EncodingQueryException extends QueryException {
  constructor(error?: unknown) {
    super('encoding', error);
    this.name = 'EncodingQueryException';
  }
}

export class TableLockQueryException extends QueryException {
  constructor(error?: unknown) {
    super('tableLock', error);
    this.name = 'TableLockQueryException';
  }
}

export class ConnectionPoolQueryException extends QueryException {
  constructor(error?: unknown) {
    super('connectionPool', error);
    this.name = 'ConnectionPoolQueryException';
  }
}

export class ClientException extends HttpException {
  constructor(type: ClientErrType, comSystem: ComSystem, error?: unknown) {
    super(getClientErrRes(type, comSystem), HttpStatus.BAD_REQUEST);
    this.name = 'ClientException';
    this.message = error instanceof Error ? error.message : undefined;
    this.stack = error instanceof Error ? error.stack : undefined;
  }
}

export class BadRequestClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('badRequest', comSystem, error);
    this.name = 'BadRequestClientException';
  }
}

export class MissingParameterClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('missingParameter', comSystem, error);
    this.name = 'MissingParameterClientException';
  }
}

export class InvalidDataFormatClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('invalidDataFormat', comSystem, error);
    this.name = 'InvalidDataFormatClientException';
  }
}

export class InvalidDataClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('invalidData', comSystem, error);
    this.name = 'InvalidDataClientException';
  }
}

export class CredentialsClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('credentials', comSystem, error);
    this.name = 'CredentialsClientException';
  }
}

export class AccountStatusClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('accountStatus', comSystem, error);
    this.name = 'AccountStatusClientException';
  }
}

export class TokenClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('token', comSystem, error);
    this.name = 'TokenClientException';
  }
}

export class SessionClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('session', comSystem, error);
    this.name = 'SessionClientException';
  }
}

export class UnauthorizedClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('unauthorized', comSystem, error);
    this.name = 'UnauthorizedClientException';
  }
}

export class ForbiddenClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('forbidden', comSystem, error);
    this.name = 'ForbiddenClientException';
  }
}

export class AccessControlClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('accessControl', comSystem, error);
    this.name = 'AccessControlClientException';
  }
}

export class MfaClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('mfa', comSystem, error);
    this.name = 'MfaClientException';
  }
}

export class ApiKeyClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('apiKey', comSystem, error);
    this.name = 'ApiKeyClientException';
  }
}

export class NotRunningClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('notRunning', comSystem, error);
    this.name = 'NotRunningClientException';
  }
}

export class RequestBlockedClientException extends ClientException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('requestBlocked', comSystem, error);
    this.name = 'RequestBlockedClientException';
  }
}

export class ServerException extends HttpException {
  constructor(type: ServerErrType, comSystem: ComSystem, error?: unknown) {
    super(getServerErrRes(type, comSystem), HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'ServerException';
    this.message = error instanceof Error ? error.message : undefined;
    this.stack = error instanceof Error ? error.stack : undefined;
  }
}

export class InternalServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('internal', comSystem, error);
    this.name = 'InternalServerException';
  }
}

export class BadGatewayServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('badGateway', comSystem, error);
    this.name = 'BadGatewayServerException';
  }
}

export class ServiceUnavailableServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('serviceUnavailable', comSystem, error);
    this.name = 'ServiceUnavailableServerException';
  }
}

export class GatewayTimeoutServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('gatewayTimeout', comSystem, error);
    this.name = 'GatewayTimeoutServerException';
  }
}

export class UnhandledExceptionsServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('unhandledExceptions', comSystem, error);
    this.name = 'UnhandledExceptionsServerException';
  }
}

export class DependencyInjectionServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('dependencyInjection', comSystem, error);
    this.name = 'DependencyInjectionServerException';
  }
}

export class SettingServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('setting', comSystem, error);
    this.name = 'SettingServerException';
  }
}

export class OutOfMemoryServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('outOfMemory', comSystem, error);
    this.name = 'OutOfMemoryServerException';
  }
}

export class ProxyServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('proxy', comSystem, error);
    this.name = 'ProxyServerException';
  }
}

export class ApplicationDownServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('applicationDown', comSystem, error);
    this.name = 'ApplicationDownServerException';
  }
}

export class ApplicationTimeoutServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('applicationTimeout', comSystem, error);
    this.name = 'ApplicationTimeoutServerException';
  }
}

export class ExternalServiceServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('externalService', comSystem, error);
    this.name = 'ExternalServiceServerException';
  }
}

export class TooManyRequestsServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('tooManyRequests', comSystem, error);
    this.name = 'TooManyRequestsServerException';
  }
}

export class RoutePathServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('routePath', comSystem, error);
    this.name = 'RoutePathServerException';
  }
}

export class UnregisteredControllerServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('unregisteredController', comSystem, error);
    this.name = 'UnregisteredControllerServerException';
  }
}

export class UnregisteredModuleServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('unregisteredModule', comSystem, error);
    this.name = 'UnregisteredModuleServerException';
  }
}

export class MethodDecoratorServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('methodDecorator', comSystem, error);
    this.name = 'MethodDecoratorServerException';
  }
}

export class UnknownServerException extends ServerException {
  constructor(comSystem: ComSystem, error?: unknown) {
    super('unknown', comSystem, error);
    this.name = 'UnknownServerException';
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientErrType, DbErrType, ServerErrType } from './common.type';

export class QueryException extends HttpException {
  constructor(type: DbErrType, error?: unknown) {
    super(type, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export class ClientException extends HttpException {
  constructor(type: ClientErrType, error?: unknown) {
    super(type, HttpStatus.BAD_REQUEST, error);
  }
}

export class ServerException extends HttpException {
  constructor(type: ServerErrType, error?: unknown) {
    super(type, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}


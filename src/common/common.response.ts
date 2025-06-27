import { CommonResponse, ComSystem } from './common.interface';
import { Logger } from '@nestjs/common';
import { ClientErrType, DbErrType, ServerErrType } from './common.type';

const getCallerLine = (): { callerLine: string; stack: string } => {
  const logger = new Logger('common.response', { timestamp: true });

  const error = new Error();
  const stack = error.stack;
  let callerLine = 'unknown location';
  if (!error.stack) {
    return {
      callerLine,
      stack: 'unknown location',
    };
  }

  logger.debug(`Error: ${stack}`);

  // 0: Error
  // 1: at getCallerLine (common.response.ts:...) <- 에러 발생 위치
  // 2: at getQueryErrRes (common.response.ts:...) <- 에러 발생 위치
  // 3: at errorHandle (common.exception.ts:...) <- 에러 발생 위치
  // ...
  // Array.length-1: at [CALLER LOCATION] ← 이 함수(getCallerLine())를 호출한 위치 (실제 호출자)
  const errStackArr = stack.split('\n');
  const errStackArrLength = errStackArr.length;

  const idx = errStackArr.findIndex((line) => line.includes(errStackArr[errStackArrLength - 1].trim()));
  if (idx < 0) {
    return {
      callerLine,
      stack,
    };
  }

  callerLine = errStackArr[idx].trim();
  const callerLineWithOutAt = callerLine.startsWith('at ') ? callerLine.slice(3) : callerLine;

  return {
    callerLine: callerLineWithOutAt,
    stack,
  };
};

export function getDefaultResponse<T>(data: T | T[] = null): CommonResponse<T> {
  return {
    code: '2000',
    isSuccess: true,
    message: 'This request is processed',
    resSystem: 'c',
    comSystem: 'central-common',
    resTime: new Date(),
    data: data,
  };
}

export function getUnknownErrResponse<T>(): CommonResponse<T> {
  return {
    code: '9999',
    isSuccess: false,
    message: 'This request is not processed due to an unknown error',
    resSystem: 'c',
    comSystem: 'central-common',
    resTime: new Date(),
    data: null,
  };
}

export function getQueryErrRes<T>(errType: DbErrType, error?: Error): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  if (!errType) {
    return getUnknownErrResponse<T>();
  }

  let code = '9999'; // Default error code for unknown errors
  let errTypeDetail = 'Unknown';

  switch (errType) {
    case 'create':
      code = '5001';
      errTypeDetail = `Creating query`;
      break;
    case 'update':
      code = '5002';
      errTypeDetail = `Updating query`;
      break;
    case 'delete':
      code = '5003';
      errTypeDetail = `Deleting query`;
      break;
    case 'find':
      code = '5004';
      errTypeDetail = `finding all row query`;
      break;
    case 'findOne':
      code = '5005';
      errTypeDetail = `finding one raw query`;
      break;
    case 'syntax':
      code = '5006';
      errTypeDetail = `SQL Syntax`;
      break;
    case 'typeMismatch':
      code = '5007';
      errTypeDetail = `SQL Type Mismatch`;
      break;
    case 'constraint':
      code = '5008';
      errTypeDetail = `SQL Constraint Violation`;
      break;
    case 'packetLimit':
      code = '5009';
      errTypeDetail = `Query Packet Limit Exceeded[Over max_allowed_packet size]`;
      break;
    case 'transaction':
      code = '5010';
      errTypeDetail = `Query Transaction`;
      break;
    case 'encoding':
      code = '5011';
      errTypeDetail = `Query Character Encoding`;
      break;
    case 'tableLock':
      code = '5012';
      errTypeDetail = `Table Locking`;
      break;
    case 'connectionPool':
      code = '5013';
      errTypeDetail = `No Available Connection Pool`;
    default:
      code = '9999';
      errTypeDetail = `Unknown Server`;
      break;
  }

  return {
    code,
    isSuccess: false,
    message: `${errTypeDetail} Error Occurred at [${callerLine}] with error: ${stack}`,
    resSystem: 'c',
    comSystem: 'central-database',
    resTime: new Date(),
    data: null,
  };
}

export function getClientErrRes<T>(errType: ClientErrType, comSystem: ComSystem): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  if (!errType) {
    return getUnknownErrResponse<T>();
  }

  let code = '9999'; // Default error code for unknown errors
  let errTypeDetail = 'Unknown';

  switch (errType) {
    case 'badRequest':
      code = '5021';
      errTypeDetail = `Bad Request`;
      break;
    case 'missingParameter':
      code = '5022';
      errTypeDetail = `Missing Parameter`;
      break;
    case 'invalidDataFormat':
      code = '5023';
      errTypeDetail = `Invalid Data Format`;
      break;
    case 'invalidData':
      code = '5024';
      errTypeDetail = `Invalid Data`;
      break;
    case 'credentials':
      code = '5025';
      errTypeDetail = `Invalid Credentials`;
      break;
    case 'accountStatus':
      code = '5026';
      errTypeDetail = `Account Status Issues`;
      break;
    case 'token':
      code = '5027';
      errTypeDetail = `Invalid Token`;
      break;
    case 'session':
      code = '5028';
      errTypeDetail = `Session expired`;
      break;
    case 'unauthorized':
      code = '5029';
      errTypeDetail = `Unauthorized Access`;
      break;
    case 'forbidden':
      code = '5030';
      errTypeDetail = `Forbidden Access`;
      break;
    case 'accessControl':
      code = '5031';
      errTypeDetail = `Access Control Error`;
      break;
    case 'mfa':
      code = '5032';
      errTypeDetail = `Invalid Multi-Factor Authentication`;
      break;
    case 'apiKey':
      code = '5033';
      errTypeDetail = `Invalid API Key`;
      break;
    case 'notRunning':
      code = '5034';
      errTypeDetail = `Service Not Running`;
      break;
    case 'requestBlocked':
      code = '5035';
      errTypeDetail = `Request Blocked`;
      break;
    default:
      code = '9999';
      errTypeDetail = `Unknown Server`;
      break;
  }

  return {
    code,
    isSuccess: false,
    message: `${errTypeDetail} Error Occurred at [${callerLine}] with error: ${stack}`,
    resSystem: 'c',
    comSystem: comSystem,
    resTime: new Date(),
    data: null,
  };
}

export function getServerErrRes<T>(errType: ServerErrType, comSystem: ComSystem): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  if (!errType) {
    return getUnknownErrResponse<T>();
  }

  let code = '9999'; // Default error code for unknown errors
  let errTypeDetail = 'Unknown';

  switch (errType) {
    case 'internal':
      code = '5041';
      errTypeDetail = `Internal Server`;
      break;
    case 'badGateway':
      code = '5042';
      errTypeDetail = `Bad Gateway`;
      break;
    case 'serviceUnavailable':
      code = '5043';
      errTypeDetail = `Service Unavailable`;
      break;
    case 'gatewayTimeout':
      code = '5044';
      errTypeDetail = `Gateway Timeout`;
      break;
    case 'unhandledExceptions':
      code = '5045';
      errTypeDetail = `Unhandled Exceptions`;
      break;
    case 'dependencyInjection':
      code = '5046';
      errTypeDetail = `Dependency Injection Error`;
      break;
    case 'setting':
      code = '5047';
      errTypeDetail = `Server Setting Error`;
      break;
    case 'outOfMemory':
      code = '5048';
      errTypeDetail = `Out of Memory`;
      break;
    case 'proxy':
      code = '5049';
      errTypeDetail = `Proxy Error`;
      break;
    case 'applicationDown':
      code = '5050';
      errTypeDetail = `Application Down`;
      break;
    case 'applicationTimeout':
      code = '5051';
      errTypeDetail = `Application Timeout`;
      break;
    case 'externalService':
      code = '5052';
      errTypeDetail = `External Service Error`;
      break;
    case 'tooManyRequests':
      code = '5053';
      errTypeDetail = `Too Many Requests`;
      break;
    case 'routePath':
      code = '5054';
      errTypeDetail = `Route Path Error`;
      break;
    case 'unregisteredController':
      code = '5055';
      errTypeDetail = `Unregistered Controller`;
      break;
    case 'unregisteredModule':
      code = '5056';
      errTypeDetail = `Unregistered Module`;
      break;
    case 'methodDecorator':
      code = '5057';
      errTypeDetail = `Method Decorator Error`;
      break;
    default:
      code = '9999';
      errTypeDetail = `Unknown Server`;
      break;
  }

  return {
    code,
    isSuccess: false,
    message: `${errTypeDetail} Error Occurred at [${callerLine}] with error: ${stack}`,
    resSystem: 'c',
    comSystem: comSystem,
    resTime: new Date(),
    data: null,
  };
}



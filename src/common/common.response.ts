import { CommonResponse, ComSystem } from './common.interface';
import { Logger } from '@nestjs/common';
import { ClientErrType, DbErrType, ServerErrType } from './common.type';

const getCallerLine = (): { callerLine: string; stack: string } => {
  const logger = new Logger('common.response', { timestamp: true });
  const error = new Error();
  const stack = error.stack ?? 'unknown location';
  let callerLine = 'unknown location';

  if (!error.stack) {
    return { callerLine, stack };
  }

  logger.debug(`Error: ${stack}`);
  const errStackArr = stack.split('\n');
  const idx = errStackArr.findIndex((line) => line.includes(errStackArr[errStackArr.length - 1].trim()));
  if (idx >= 0) {
    callerLine = errStackArr[idx].trim();
    if (callerLine.startsWith('at ')) callerLine = callerLine.slice(3);
  }
  return { callerLine, stack };
};

export function getSuccessResponse<T>(comSystem: ComSystem = 'central-common', data: T | T[] = null): CommonResponse<T> {
  return {
    code: '2000',
    isSuccess: true,
    message: 'This request is processed',
    resSystem: 'c',
    comSystem: comSystem,
    resTime: new Date(),
    data,
  };
}

export function getDefaultResponse<T>(data: T | T[] = null): CommonResponse<T> {
  return {
    code: '2000',
    isSuccess: true,
    message: 'This request is processed',
    resSystem: 'c',
    comSystem: 'central-common',
    resTime: new Date(),
    data,
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

// Error code/detail maps
const dbErrMap: Record<DbErrType, { code: string; detail: string }> = {
  create: { code: '5001', detail: 'Creating query' },
  update: { code: '5002', detail: 'Updating query' },
  delete: { code: '5003', detail: 'Deleting query' },
  find: { code: '5004', detail: 'finding all row query' },
  findOne: { code: '5005', detail: 'finding one raw query' },
  syntax: { code: '5006', detail: 'SQL Syntax' },
  typeMismatch: { code: '5007', detail: 'SQL Type Mismatch' },
  constraint: { code: '5008', detail: 'SQL Constraint Violation' },
  packetLimit: { code: '5009', detail: 'Query Packet Limit Exceeded[Over max_allowed_packet size]' },
  transaction: { code: '5010', detail: 'Query Transaction' },
  encoding: { code: '5011', detail: 'Query Character Encoding' },
  tableLock: { code: '5012', detail: 'Table Locking' },
  connectionPool: { code: '5013', detail: 'No Available Connection Pool' },
  unknown: { code: '9999', detail: 'Unknown Server' },
};

const clientErrMap: Record<ClientErrType, { code: string; detail: string }> = {
  badRequest: { code: '5021', detail: 'Bad Request' },
  missingParameter: { code: '5022', detail: 'Missing Parameter' },
  invalidDataFormat: { code: '5023', detail: 'Invalid Data Format' },
  invalidData: { code: '5024', detail: 'Invalid Data' },
  credentials: { code: '5025', detail: 'Invalid Credentials' },
  accountStatus: { code: '5026', detail: 'Account Status Issues' },
  token: { code: '5027', detail: 'Invalid Token' },
  session: { code: '5028', detail: 'Session expired' },
  unauthorized: { code: '5029', detail: 'Unauthorized Access' },
  forbidden: { code: '5030', detail: 'Forbidden Access' },
  accessControl: { code: '5031', detail: 'Access Control Error' },
  mfa: { code: '5032', detail: 'Invalid Multi-Factor Authentication' },
  apiKey: { code: '5033', detail: 'Invalid API Key' },
  notRunning: { code: '5034', detail: 'Service Not Running' },
  requestBlocked: { code: '5035', detail: 'Request Blocked' },
  unknown: { code: '9999', detail: 'Unknown Server' },
};

const serverErrMap: Record<ServerErrType, { code: string; detail: string }> = {
  internal: { code: '5041', detail: 'Internal Server' },
  badGateway: { code: '5042', detail: 'Bad Gateway' },
  serviceUnavailable: { code: '5043', detail: 'Service Unavailable' },
  gatewayTimeout: { code: '5044', detail: 'Gateway Timeout' },
  unhandledExceptions: { code: '5045', detail: 'Unhandled Exceptions' },
  dependencyInjection: { code: '5046', detail: 'Dependency Injection Error' },
  setting: { code: '5047', detail: 'Server Setting Error' },
  outOfMemory: { code: '5048', detail: 'Out of Memory' },
  proxy: { code: '5049', detail: 'Proxy Error' },
  applicationDown: { code: '5050', detail: 'Application Down' },
  applicationTimeout: { code: '5051', detail: 'Application Timeout' },
  externalService: { code: '5052', detail: 'External Service Error' },
  tooManyRequests: { code: '5053', detail: 'Too Many Requests' },
  routePath: { code: '5054', detail: 'Route Path Error' },
  unregisteredController: { code: '5055', detail: 'Unregistered Controller' },
  unregisteredModule: { code: '5056', detail: 'Unregistered Module' },
  methodDecorator: { code: '5057', detail: 'Method Decorator Error' },
  unknown: { code: '9999', detail: 'Unknown Server' },
};

function formatErrorMessage(detail: string, callerLine: string, stack: string) {
  return `${detail} Error Occurred at [${callerLine}] with error: ${stack}`;
}

export function getQueryErrRes<T>(errType: DbErrType, error?: Error): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  const { code, detail } = dbErrMap[errType] ?? dbErrMap.unknown;
  return {
    code,
    isSuccess: false,
    message: formatErrorMessage(detail, callerLine, stack),
    resSystem: 'c',
    comSystem: 'central-database',
    resTime: new Date(),
    data: null,
  };
}

export function getClientErrRes<T>(errType: ClientErrType, comSystem: ComSystem): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  const { code, detail } = clientErrMap[errType] ?? clientErrMap.unknown;
  return {
    code,
    isSuccess: false,
    message: formatErrorMessage(detail, callerLine, stack),
    resSystem: 'c',
    comSystem,
    resTime: new Date(),
    data: null,
  };
}

export function getServerErrRes<T>(errType: ServerErrType, comSystem: ComSystem): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  const { code, detail } = serverErrMap[errType] ?? serverErrMap.unknown;
  return {
    code,
    isSuccess: false,
    message: formatErrorMessage(detail, callerLine, stack),
    resSystem: 'c',
    comSystem,
    resTime: new Date(),
    data: null,
  };
}
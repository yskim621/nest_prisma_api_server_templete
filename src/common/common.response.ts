import { CommonResponse } from './common.interface';
import { Logger } from '@nestjs/common';
import { DbErrType } from './common.type';

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
  // 1: at getCallerLine (common.response.ts:...)
  // 2: at getQueryErrRes (common.response.ts:...) <- 에러 발생 위치
  // 2: at [CALLER LOCATION] ← 이 함수(getQueryErrRes())를 호출한 위치 (외부 파일 or 실제 호출자)
  const errStackArr = stack.split('\n');

  // errStackArr[0]은 "Error" 메시지이므로 제외하고, 1부터 시작
  // "getCallerLine" 함수가 포착된 위치의 다음 줄이 진짜 호출 위치
  const idx = errStackArr.findIndex((line) => line.includes(errStackArr[2].trim()));
  if (idx < 0 || errStackArr.length <= idx + 1) {
    return {
      callerLine,
      stack,
    };
  }

  callerLine = errStackArr[idx + 1].trim();
  const callerLineWithOutAt = callerLine.startsWith('at ') ? callerLine.slice(3) : callerLine;

  return {
    callerLine: callerLineWithOutAt,
    stack,
  };
};

export function getDefaultResponse<T>(): CommonResponse<T> {
  return {
    code: '5000',
    isSuccess: false,
    message: 'This request is not processed',
    resSystem: 'c',
    comSystem: 'central-common',
    resTime: new Date(),
    data: null,
  };
}

export function getQueryErrRes<T>(errType: DbErrType): CommonResponse<T> {
  const { callerLine, stack } = getCallerLine();
  if (!errType) {
    return getDefaultResponse<T>();
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

import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../utils/pagination';

export class CommonResponse<T = any> {
  /**
   * 2000(성공), 4xxx(클라이언트 에러), 5xxx(서버 에러), 9999(unknown)
   * default: 5000
   * central: 5100
   * notification: 5200
   * external: 5300
   * payment: 5400
   * user: 4500
   * admin: 4600
   */
  code: string;
  isSuccess: boolean;
  message: string;
  resSystem: ResSystem;
  comSystem: ComSystem;
  resTime: Date;

  @ApiProperty({
    description: '결과 값',
  })
  data: T[] | T | null | undefined;
}

export class CommonResponseWithPagination<T> {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: CommmonResponseResult;

  @ApiProperty({
    description: '결과 값',
  })
  readonly data: T[] | null | undefined;

  @ApiProperty({
    description: '페이징 정보',
  })
  readonly pagination: Pagination;
}

export function getCommonResponse<T>(): CommonResponse<T> {
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

export interface CommmonResponseResult {
  /**
   * 2000(성공), 4xxx(클라이언트 에러), 5xxx(서버 에러), 9999(unknown)
   * default: 5000
   * central: 5100
   * notification: 5200
   * external: 5300
   * payment: 5400
   * user: 4500
   * admin: 4600
   */
  code: string;
  isSuccess: boolean;
  message: string;
  resSystem: ResSystem;
  comSystem: ComSystem;
  resTime: Date;
}

/**
 * 응답 시스템 코드
 * - 'c': 중앙 제어 서버
 * - 'n': 알림 서버
 * - 'e': 외부 API 서버
 * - 'p': 결제 서버
 * - 'u': 사용자 서버
 * - 'a': 관리자 서버
 */
type ResSystem = 'c' | 'n' | 'e' | 'p' | 'u' | 'a';


type ComSystem =
  | 'central-notification'
  | 'notification-central'
  | 'central-payment'
  | 'payment-central'
  | 'central-external'
  | 'external-central'
  | 'user-central'
  | 'admin-central'
  | 'central-database'
  | 'notification-database'
  | 'payment-database'
  | 'external-database'
  | 'central-common'
  | 'common-central'
  | 'aws-central';


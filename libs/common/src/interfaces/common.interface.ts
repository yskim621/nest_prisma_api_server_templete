import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../utils/pagination';
import { HttpStatus } from '@nestjs/common';

export class CommonResponse<T = unknown> {
  code: string;
  httpStatus?: HttpStatus;
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

export class CommonResponseWithPagination extends CommonResponse {
  @ApiProperty({
    description: '페이징 정보',
  })
  readonly pagination: Pagination;
}

type ResSystem = 'c' | 'n' | 'e' | 'p' | 'u' | 'a';

export type ComSystem =
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

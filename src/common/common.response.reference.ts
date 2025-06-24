import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../utils/pagination';

export class CommonResponse<T> {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: boolean;

  @ApiProperty({
    description: '결과 값',
  })
  readonly data: T[] | null | undefined;

  @ApiProperty({
    description: '페이징 정보',
  })
  readonly pagination: Pagination;
}

export class CommonResponseExceptPaging<T> {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: boolean;

  @ApiProperty({
    description: '결과 값',
    isArray: true,
  })
  readonly data: T[] | null | undefined;
}

export class CommonResponseSingleObject<T> {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: boolean;

  @ApiProperty({
    description: '결과 값',
  })
  readonly data: T | null | undefined;
}

export class CommonResponseVoid {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: boolean;
}

export class CommonErrorResponse {
  @ApiProperty({
    description: '성공 여부',
  })
  readonly result: boolean;

  @ApiProperty({
    description: '상태 코드',
  })
  readonly statusCode: string;

  @ApiProperty({
    description: '에러 메시지',
  })
  readonly message: string;

  @ApiProperty({
    description: '에러 정보',
  })
  readonly info: string;

  @ApiProperty({
    description: '에러 시간',
  })
  readonly timestamp: string;

  @ApiProperty({
    description: '에러 경로',
  })
  readonly path: string;
}

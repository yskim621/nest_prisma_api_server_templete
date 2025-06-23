import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../utils/pagination';
export class IResultList<T> {
  @ApiProperty({
    description: '결과 값',
  })
  readonly data?: T[] | T | null | undefined;
  readonly pagination?: Pagination;
}

// 쿼리 실행 후 raw 개수도 반환
export class AddTotalCount<T> {
  readonly result?: T[] | T | null | undefined;
  readonly total?: number;
}

export type DbErrType = 'create' | 'update' | 'delete' | 'find' | 'findOne' | 'syntax' | 'typeMismatch' | 'constraint' | 'transaction';

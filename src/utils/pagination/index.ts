import { ApiProperty } from '@nestjs/swagger';

export class Pagination {
  @ApiProperty({
    description: '전체 데이터 수',
    type: Number,
  })
  private readonly total: number;

  @ApiProperty({
    description: '현재 페이지',
    type: Number,
  })
  private readonly curPage: number;

  @ApiProperty({
    description: '전체 페이지 수',
    type: Number,
  })
  private readonly totalPage: number;

  @ApiProperty({
    description: '페이지당 데이터 수',
    type: Number,
  })
  private readonly limit: number;

  @ApiProperty({
    description: '하단에 표시될 페이지 블록 수(ex: 1~10, 11~20, 21~30)',
    type: Number,
  })
  private readonly block: number;

  @ApiProperty({
    description: '하단에 표시될 현재 페이지 블록 수',
    type: Number,
  })
  private readonly curBlock: number;

  @ApiProperty({
    description: '하단에 표시될 전체 페이지 블록 수',
    type: Number,
  })
  private readonly totalBlock: number;

  constructor(total: number, curPage = 1, limit = 10, block = 10) {
    this.total = total;
    this.curPage = curPage;
    this.limit = limit;
    this.block = block;
    this.curBlock = Math.ceil(this.curPage / this.block);
    this.totalPage = Math.ceil(this.total / this.limit);
    this.totalBlock = Math.ceil(this.totalPage / this.block);
  }
}

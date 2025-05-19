import { ApiProperty } from '@nestjs/swagger';

export class Pagination {
  @ApiProperty({
    description: '전체 데이터 수',
    type: Number,
  })
  private total: number;

  @ApiProperty({
    description: '현재 페이지',
    type: Number,
  })
  private cur_page: number;

  @ApiProperty({
    description: '전체 페이지 수',
    type: Number,
  })
  private total_page: number;

  @ApiProperty({
    description: '페이지당 데이터 수',
    type: Number,
  })
  private limit: number;

  @ApiProperty({
    description: '하단에 표시될 페이지 블록 수(ex: 1~10, 11~20, 21~30)',
    type: Number,
  })
  private block: number;

  @ApiProperty({
    description: '하단에 표시될 현재 페이지 블록 수',
    type: Number,
  })
  private cur_block: number;

  @ApiProperty({
    description: '하단에 표시될 전체 페이지 블록 수',
    type: Number,
  })
  private total_block: number;

  constructor(total: number, cur_page = 1, limit = 10, block = 10) {
    this.total = total;
    this.cur_page = cur_page;
    this.limit = limit;
    this.block = block;
    this.cur_block = Math.ceil(this.cur_page / this.block);
    this.total_page = Math.ceil(this.total / this.limit);
    this.total_block = Math.ceil(this.total_page / this.block);
  }

  public getPagenation(): Pagination {
    return this;
  }
}

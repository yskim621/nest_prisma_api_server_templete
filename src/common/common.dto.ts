import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class PaginationInfoDto {
  @ApiProperty({
    description: '현재 페이지',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  public page: number;

  @ApiProperty({
    description: '페이지당 데이터 수',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    description: '하단에 표시될 페이지 블록 수(ex: 1~10, 11~20, 21~30)',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  public block: number;
}

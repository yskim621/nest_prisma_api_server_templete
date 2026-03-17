import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '../board.enum';

export class BoardDto {
  @ApiProperty({ description: 'Board ID' })
  id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ContentStatus })
  @IsEnum(ContentStatus)
  status: string;

  @ApiProperty()
  @IsInt()
  userId: number;
}

export class CreateBoardDto extends OmitType(BoardDto, ['id'] as const) {}
export class UpdateBoardDto extends PartialType(OmitType(CreateBoardDto, ['userId'] as const)) {}

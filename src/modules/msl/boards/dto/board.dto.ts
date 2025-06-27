import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ContentStatus } from '../board.enum';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(ContentStatus, { message: 'Invalid status' })
  status: ContentStatus;

  @ApiProperty()
  @IsNumber()
  userId: number;
}

export class Board extends PartialType(CreateBoardDto) {}
export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

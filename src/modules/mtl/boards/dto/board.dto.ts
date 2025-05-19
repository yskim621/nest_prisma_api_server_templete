import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  status: contentStatus;

  @ApiProperty()
  @IsNumber()
  userId: number;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

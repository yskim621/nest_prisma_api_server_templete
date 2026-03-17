import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreateBoardWithUserCheckDto {
  @ApiProperty({ description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Board title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Board description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BulkBoardTransactionDto {
  @ApiProperty({ description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Board titles', type: [String] })
  @IsArray()
  @IsString({ each: true })
  titles: string[];
}

export class TransferBoardDto {
  @ApiProperty({ description: 'Board ID' })
  @IsInt()
  boardId: number;

  @ApiProperty({ description: 'From user ID' })
  @IsInt()
  fromUserId: number;

  @ApiProperty({ description: 'To user ID' })
  @IsInt()
  toUserId: number;
}

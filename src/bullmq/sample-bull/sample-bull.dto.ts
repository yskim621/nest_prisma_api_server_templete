import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * 이메일 작업 요청 DTO
 */
export class EmailJobDto {
  @ApiProperty({ description: '수신자 이메일', example: 'test@example.com' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: '이메일 제목', example: 'Hello' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: '이메일 본문', example: 'Test message' })
  @IsString()
  @IsNotEmpty()
  body: string;
}

/**
 * 알림 작업 요청 DTO
 */
export class NotificationJobDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '알림 메시지', example: 'New notification' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

/**
 * 데이터 처리 작업 요청 DTO
 */
export class DataProcessingJobDto {
  @ApiProperty({ description: '처리할 데이터', example: { items: [1, 2, 3] } })
  @IsOptional()
  data: unknown;
}

/**
 * 지연 작업 요청 DTO
 */
export class DelayedJobDto {
  @ApiProperty({ description: '작업 이름', example: 'email' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '작업 데이터', example: { to: 'test@example.com' } })
  data: unknown;

  @ApiProperty({ description: '지연 시간 (ms)', example: 5000 })
  @IsNumber()
  delayMs: number;
}

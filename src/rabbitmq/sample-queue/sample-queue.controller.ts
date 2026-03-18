import { Controller, Post, Get, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { SampleQueueService } from './sample-queue.service';

class PublishMessageDto {
  @ApiProperty({ description: '메시지 타입', example: 'EMAIL' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: '메시지 페이로드', example: { key: 'value' } })
  @IsOptional()
  payload: Record<string, unknown>;
}

class EmailJobDto {
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

class NotificationJobDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '알림 메시지', example: 'New notification' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

class DataProcessingJobDto {
  @ApiProperty({ description: '처리할 데이터', example: { items: [1, 2, 3] } })
  @IsOptional()
  data: Record<string, unknown>;
}

@ApiTags('Queue Sample')
@Controller('queue')
export class SampleQueueController {
  constructor(private readonly sampleQueueService: SampleQueueService) {}

  @Post('publish')
  @ApiOperation({ summary: '일반 메시지 발행' })
  @ApiBody({ type: PublishMessageDto })
  @ApiResponse({ status: 201, description: '메시지가 큐에 추가됨' })
  async publishMessage(@Body() body: PublishMessageDto) {
    const result = await this.sampleQueueService.publishMessage(body.type, body.payload);
    return {
      success: true,
      message: 'Message published to queue',
      data: result,
    };
  }

  @Post('email')
  @ApiOperation({ summary: '이메일 작업 큐에 추가' })
  @ApiBody({ type: EmailJobDto })
  async queueEmailJob(@Body() body: EmailJobDto) {
    const result = await this.sampleQueueService.queueEmailJob(body.to, body.subject, body.body);
    return {
      success: true,
      message: 'Email job queued',
      data: result,
    };
  }

  @Post('notification')
  @ApiOperation({ summary: '알림 작업 큐에 추가' })
  @ApiBody({ type: NotificationJobDto })
  async queueNotificationJob(@Body() body: NotificationJobDto) {
    const result = await this.sampleQueueService.queueNotificationJob(body.userId, body.message);
    return {
      success: true,
      message: 'Notification job queued',
      data: result,
    };
  }

  @Post('data-processing')
  @ApiOperation({ summary: '데이터 처리 작업 큐에 추가' })
  @ApiBody({ type: DataProcessingJobDto })
  async queueDataProcessingJob(@Body() body: DataProcessingJobDto) {
    const result = await this.sampleQueueService.queueDataProcessingJob(body.data);
    return {
      success: true,
      message: 'Data processing job queued',
      data: result,
    };
  }

  @Get('status')
  @ApiOperation({ summary: '큐 상태 조회' })
  async getQueueStatus() {
    const status = await this.sampleQueueService.getQueueStatus();
    return {
      success: true,
      data: status,
    };
  }

  @Delete('clear')
  @ApiOperation({ summary: '큐 비우기' })
  async clearQueue() {
    const result = await this.sampleQueueService.clearQueue();
    return {
      success: true,
      message: 'Queue cleared',
      data: result,
    };
  }
}

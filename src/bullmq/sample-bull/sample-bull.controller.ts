import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { SampleBullService } from './sample-bull.service';

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
  data: unknown;
}

class DelayedJobDto {
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

@ApiTags('BullMQ Sample')
@Controller('bull')
export class SampleBullController {
  constructor(private readonly sampleBullService: SampleBullService) {}

  @Post('email')
  @ApiOperation({ summary: '이메일 작업 큐에 추가' })
  @ApiBody({ type: EmailJobDto })
  @ApiResponse({ status: 201, description: '작업이 큐에 추가됨' })
  async addEmailJob(@Body() dto: EmailJobDto) {
    const result = await this.sampleBullService.addEmailJob(dto);
    return {
      success: true,
      message: 'Email job added to queue',
      data: result,
    };
  }

  @Post('notification')
  @ApiOperation({ summary: '알림 작업 큐에 추가' })
  @ApiBody({ type: NotificationJobDto })
  async addNotificationJob(@Body() dto: NotificationJobDto) {
    const result = await this.sampleBullService.addNotificationJob(dto);
    return {
      success: true,
      message: 'Notification job added to queue',
      data: result,
    };
  }

  @Post('data-processing')
  @ApiOperation({ summary: '데이터 처리 작업 큐에 추가' })
  @ApiBody({ type: DataProcessingJobDto })
  async addDataProcessingJob(@Body() dto: DataProcessingJobDto) {
    const result = await this.sampleBullService.addDataProcessingJob(dto);
    return {
      success: true,
      message: 'Data processing job added to queue',
      data: result,
    };
  }

  @Post('delayed')
  @ApiOperation({ summary: '지연 작업 추가 (예약 실행)' })
  @ApiBody({ type: DelayedJobDto })
  async addDelayedJob(@Body() dto: DelayedJobDto) {
    const result = await this.sampleBullService.addDelayedJob(dto.name, dto.data, dto.delayMs);
    return {
      success: true,
      message: `Job will be executed after ${dto.delayMs}ms`,
      data: result,
    };
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: '작업 상태 조회' })
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.sampleBullService.getJobStatus(jobId);
    if (!status) {
      return {
        success: false,
        message: 'Job not found',
      };
    }
    return {
      success: true,
      data: status,
    };
  }

  @Get('status')
  @ApiOperation({ summary: '큐 상태 조회' })
  async getQueueStatus() {
    const status = await this.sampleBullService.getQueueStatus();
    return {
      success: true,
      data: status,
    };
  }

  @Get('waiting')
  @ApiOperation({ summary: '대기 중인 작업 목록' })
  @ApiQuery({ name: 'start', required: false, type: Number })
  @ApiQuery({ name: 'end', required: false, type: Number })
  async getWaitingJobs(@Query('start') start = 0, @Query('end') end = 10) {
    const jobs = await this.sampleBullService.getWaitingJobs(start, end);
    return {
      success: true,
      data: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        timestamp: job.timestamp,
      })),
    };
  }

  @Post('pause')
  @ApiOperation({ summary: '큐 일시정지' })
  async pauseQueue() {
    await this.sampleBullService.pauseQueue();
    return {
      success: true,
      message: 'Queue paused',
    };
  }

  @Post('resume')
  @ApiOperation({ summary: '큐 재개' })
  async resumeQueue() {
    await this.sampleBullService.resumeQueue();
    return {
      success: true,
      message: 'Queue resumed',
    };
  }

  @Delete('job/:jobId')
  @ApiOperation({ summary: '작업 제거' })
  async removeJob(@Param('jobId') jobId: string) {
    const removed = await this.sampleBullService.removeJob(jobId);
    return {
      success: removed,
      message: removed ? 'Job removed' : 'Job not found',
    };
  }

  @Post('clean')
  @ApiOperation({ summary: '완료/실패 작업 정리' })
  @ApiQuery({ name: 'grace', required: false, type: Number, description: '유예 시간 (ms)' })
  async cleanQueue(@Query('grace') grace = 0) {
    const result = await this.sampleBullService.cleanQueue(grace);
    return {
      success: true,
      message: `Cleaned ${result.cleaned.length} jobs`,
      data: result,
    };
  }

  @Post('retry-failed')
  @ApiOperation({ summary: '실패한 작업 재시도' })
  async retryFailedJobs() {
    const count = await this.sampleBullService.retryFailedJobs();
    return {
      success: true,
      message: `Retried ${count} failed jobs`,
      data: { retriedCount: count },
    };
  }
}

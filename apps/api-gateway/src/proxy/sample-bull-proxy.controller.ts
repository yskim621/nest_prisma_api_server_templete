import { Controller, Get, Post, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';
import { Public } from '@app/auth';

@Controller('msl/sample-bull')
@ApiTags('Sample - BullMQ')
@ApiBearerAuth()
export class SampleBullProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post('jobs')
  @Public()
  @ApiOperation({ summary: 'Add job to queue' })
  addJob(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.BULL_ADD_JOB, dto);
  }

  @Get('jobs/:jobId')
  @Public()
  @ApiOperation({ summary: 'Get job status' })
  getJobStatus(@Param('jobId') jobId: string) {
    return this.coreClient.send(CORE_PATTERNS.BULL_GET_JOB_STATUS, { jobId });
  }

  @Get('queue/status')
  @Public()
  @ApiOperation({ summary: 'Get queue status' })
  getQueueStatus() {
    return this.coreClient.send(CORE_PATTERNS.BULL_GET_QUEUE_STATUS, {});
  }

  @Delete('jobs/:jobId')
  @Public()
  @ApiOperation({ summary: 'Remove job' })
  removeJob(@Param('jobId') jobId: string) {
    return this.coreClient.send(CORE_PATTERNS.BULL_REMOVE_JOB, { jobId });
  }

  @Post('retry-failed')
  @Public()
  @ApiOperation({ summary: 'Retry all failed jobs' })
  retryFailed() {
    return this.coreClient.send(CORE_PATTERNS.BULL_RETRY_FAILED, {});
  }
}

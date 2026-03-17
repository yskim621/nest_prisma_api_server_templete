import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { SampleBullService } from './sample-bull.service';
import { CreateJobDto } from './dto/sample-bull.dto';

@Controller()
export class SampleBullController {
  constructor(private readonly bullService: SampleBullService) {}

  @MessagePattern(CORE_PATTERNS.BULL_ADD_JOB)
  async addJob(@Payload() dto: CreateJobDto) {
    return this.bullService.addJob(dto);
  }

  @MessagePattern(CORE_PATTERNS.BULL_GET_JOB_STATUS)
  async getJobStatus(@Payload() data: { jobId: string }) {
    return this.bullService.getJobStatus(data.jobId);
  }

  @MessagePattern(CORE_PATTERNS.BULL_GET_QUEUE_STATUS)
  async getQueueStatus() {
    return this.bullService.getQueueStatus();
  }

  @MessagePattern(CORE_PATTERNS.BULL_REMOVE_JOB)
  async removeJob(@Payload() data: { jobId: string }) {
    return this.bullService.removeJob(data.jobId);
  }

  @MessagePattern(CORE_PATTERNS.BULL_RETRY_FAILED)
  async retryFailed() {
    return this.bullService.retryFailedJobs();
  }
}

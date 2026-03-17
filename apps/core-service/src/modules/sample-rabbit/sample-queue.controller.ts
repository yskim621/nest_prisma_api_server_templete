import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { SampleQueueService } from './sample-queue.service';

@Controller()
export class SampleQueueController {
  constructor(private readonly queueService: SampleQueueService) {}

  @MessagePattern(CORE_PATTERNS.RABBIT_PUBLISH)
  async publish(@Payload() data: { type: string; payload: any }) {
    return this.queueService.publishMessage(data.type, data.payload);
  }

  @MessagePattern(CORE_PATTERNS.RABBIT_GET_STATUS)
  async getStatus() {
    return this.queueService.getQueueStatus();
  }

  @MessagePattern(CORE_PATTERNS.RABBIT_CLEAR)
  async clear() {
    return this.queueService.clearQueue();
  }
}

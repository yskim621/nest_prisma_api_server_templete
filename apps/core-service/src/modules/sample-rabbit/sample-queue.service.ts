import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '@app/queue';
import { v4 as uuidv4 } from 'uuid';

export const SAMPLE_QUEUE = 'sample_queue';

@Injectable()
export class SampleQueueService {
  private readonly logger = new Logger(SampleQueueService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishMessage(type: string, payload: any) {
    const message = {
      id: uuidv4(),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.rabbitMQService.publish(SAMPLE_QUEUE, message);
    this.logger.log(`Published message: ${message.id} [${type}]`);
    return { success: true, messageId: message.id };
  }

  async queueEmailJob(to: string, subject: string, body: string) {
    return this.publishMessage('EMAIL', { to, subject, body });
  }

  async queueNotificationJob(userId: number, message: string) {
    return this.publishMessage('NOTIFICATION', { userId, message });
  }

  async getQueueStatus() {
    const info = await this.rabbitMQService.getQueueInfo(SAMPLE_QUEUE);
    return {
      queue: SAMPLE_QUEUE,
      connected: this.rabbitMQService.isConnected(),
      ...info,
    };
  }

  async clearQueue() {
    await this.rabbitMQService.purgeQueue(SAMPLE_QUEUE);
    return { cleared: true, queue: SAMPLE_QUEUE };
  }
}

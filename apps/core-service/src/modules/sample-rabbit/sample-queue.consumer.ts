import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@app/queue';
import { SAMPLE_QUEUE } from './sample-queue.service';

@Injectable()
export class SampleQueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(SampleQueueConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    if (!this.rabbitMQService.isConnected()) {
      this.logger.warn('RabbitMQ not connected, skipping consumer setup');
      return;
    }

    await this.rabbitMQService.consume(SAMPLE_QUEUE, (msg) => {
      try {
        const content = JSON.parse(msg.content.toString());
        this.handleMessage(content);
      } catch (error) {
        this.logger.error('Failed to process message:', error.message);
      }
    });

    this.logger.log(`Consumer started on queue: ${SAMPLE_QUEUE}`);
  }

  private handleMessage(message: { type: string; payload: any; id: string }) {
    this.logger.log(`Received message ${message.id} [${message.type}]`);

    switch (message.type) {
      case 'EMAIL':
        this.logger.log(`Processing email to: ${message.payload?.to}`);
        break;
      case 'NOTIFICATION':
        this.logger.log(`Processing notification for user: ${message.payload?.userId}`);
        break;
      default:
        this.logger.log(`Processing generic message: ${message.type}`);
    }
  }
}

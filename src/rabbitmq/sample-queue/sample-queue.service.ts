import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';

export const SAMPLE_QUEUE = 'sample_queue';

export interface SampleMessage {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

@Injectable()
export class SampleQueueService {
  private readonly logger = new Logger(SampleQueueService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  /**
   * 샘플 메시지 발행 (Producer)
   */
  async publishMessage(type: string, payload: Record<string, unknown>): Promise<SampleMessage> {
    const message: SampleMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: new Date(),
    };

    await this.rabbitMQService.publish(SAMPLE_QUEUE, message);
    this.logger.log(`Published message: ${message.id}`);

    return message;
  }

  /**
   * 이메일 전송 작업 큐에 추가
   */
  async queueEmailJob(to: string, subject: string, body: string): Promise<SampleMessage> {
    return this.publishMessage('EMAIL', { to, subject, body });
  }

  /**
   * 알림 전송 작업 큐에 추가
   */
  async queueNotificationJob(userId: number, message: string): Promise<SampleMessage> {
    return this.publishMessage('NOTIFICATION', { userId, message });
  }

  /**
   * 데이터 처리 작업 큐에 추가
   */
  async queueDataProcessingJob(data: Record<string, unknown>): Promise<SampleMessage> {
    return this.publishMessage('DATA_PROCESSING', { data });
  }

  /**
   * 큐 상태 조회
   */
  async getQueueStatus() {
    const info = await this.rabbitMQService.getQueueInfo(SAMPLE_QUEUE);
    return {
      queue: SAMPLE_QUEUE,
      messageCount: info.messageCount,
      consumerCount: info.consumerCount,
    };
  }

  /**
   * 큐 비우기
   */
  async clearQueue() {
    const result = await this.rabbitMQService.purgeQueue(SAMPLE_QUEUE);
    return {
      queue: SAMPLE_QUEUE,
      purgedCount: result.messageCount,
    };
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

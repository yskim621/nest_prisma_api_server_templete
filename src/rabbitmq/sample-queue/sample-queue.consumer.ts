import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { SAMPLE_QUEUE, SampleMessage } from './sample-queue.service';

@Injectable()
export class SampleQueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(SampleQueueConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    await this.rabbitMQService.consume(SAMPLE_QUEUE, async (message: SampleMessage) => {
      await this.handleMessage(message);
    });
  }

  /**
   * 메시지 타입에 따라 적절한 핸들러 실행
   */
  private async handleMessage(message: SampleMessage): Promise<void> {
    this.logger.log(`Processing message: ${message.id} (type: ${message.type})`);

    switch (message.type) {
      case 'EMAIL':
        await this.handleEmailJob(message.payload);
        break;
      case 'NOTIFICATION':
        await this.handleNotificationJob(message.payload);
        break;
      case 'DATA_PROCESSING':
        await this.handleDataProcessingJob(message.payload);
        break;
      default:
        this.logger.warn(`Unknown message type: ${message.type}`);
    }

    this.logger.log(`Message processed: ${message.id}`);
  }

  /**
   * 이메일 전송 처리
   */
  private async handleEmailJob(payload: { to: string; subject: string; body: string }): Promise<void> {
    this.logger.log(`Sending email to: ${payload.to}`);
    // 실제 이메일 전송 로직 구현
    // await this.emailService.send(payload.to, payload.subject, payload.body);

    // 시뮬레이션: 2초 대기
    await this.delay(2000);
    this.logger.log(`Email sent to: ${payload.to}`);
  }

  /**
   * 알림 전송 처리
   */
  private async handleNotificationJob(payload: { userId: number; message: string }): Promise<void> {
    this.logger.log(`Sending notification to user: ${payload.userId}`);
    // 실제 알림 전송 로직 구현
    // await this.notificationService.send(payload.userId, payload.message);

    // 시뮬레이션: 1초 대기
    await this.delay(1000);
    this.logger.log(`Notification sent to user: ${payload.userId}`);
  }

  /**
   * 데이터 처리
   */
  private async handleDataProcessingJob(payload: { data: any }): Promise<void> {
    this.logger.log(`Processing data: ${JSON.stringify(payload.data)}`);
    // 실제 데이터 처리 로직 구현

    // 시뮬레이션: 3초 대기
    await this.delay(3000);
    this.logger.log(`Data processed successfully`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

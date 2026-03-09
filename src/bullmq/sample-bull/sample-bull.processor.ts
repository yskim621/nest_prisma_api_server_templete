import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export const SAMPLE_BULL_QUEUE = 'sample-bull-queue';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface NotificationJobData {
  userId: number;
  message: string;
}

export interface DataProcessingJobData {
  data: unknown;
}

export type SampleJobData = EmailJobData | NotificationJobData | DataProcessingJobData;

@Processor(SAMPLE_BULL_QUEUE)
export class SampleBullProcessor extends WorkerHost {
  private readonly logger = new Logger(SampleBullProcessor.name);

  async process(job: Job<SampleJobData>): Promise<unknown> {
    this.logger.log(`Processing job ${job.id} (${job.name})`);

    switch (job.name) {
      case 'email':
        return this.handleEmailJob(job.data as EmailJobData, job);
      case 'notification':
        return this.handleNotificationJob(job.data as NotificationJobData, job);
      case 'data-processing':
        return this.handleDataProcessingJob(job.data as DataProcessingJobData, job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        return { success: false, error: 'Unknown job type' };
    }
  }

  private async handleEmailJob(data: EmailJobData, job: Job): Promise<{ success: boolean; sentTo: string }> {
    this.logger.log(`[Email] Sending to: ${data.to}`);

    // 진행률 업데이트
    await job.updateProgress(10);

    // 실제 이메일 전송 로직 구현
    // await this.emailService.send(data.to, data.subject, data.body);

    // 시뮬레이션: 2초 대기
    await this.delay(2000);
    await job.updateProgress(100);

    this.logger.log(`[Email] Sent to: ${data.to}`);
    return { success: true, sentTo: data.to };
  }

  private async handleNotificationJob(data: NotificationJobData, job: Job): Promise<{ success: boolean; userId: number }> {
    this.logger.log(`[Notification] Sending to user: ${data.userId}`);

    await job.updateProgress(50);

    // 실제 알림 전송 로직 구현
    // await this.notificationService.send(data.userId, data.message);

    // 시뮬레이션: 1초 대기
    await this.delay(1000);
    await job.updateProgress(100);

    this.logger.log(`[Notification] Sent to user: ${data.userId}`);
    return { success: true, userId: data.userId };
  }

  private async handleDataProcessingJob(data: DataProcessingJobData, job: Job): Promise<{ success: boolean; processedAt: Date }> {
    this.logger.log(`[DataProcessing] Processing data`);

    // 단계별 진행률 업데이트
    for (let i = 0; i <= 100; i += 20) {
      await job.updateProgress(i);
      await this.delay(500);
    }

    this.logger.log(`[DataProcessing] Completed`);
    return { success: true, processedAt: new Date() };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number | object) {
    this.logger.debug(`Job ${job.id} progress: ${JSON.stringify(progress)}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

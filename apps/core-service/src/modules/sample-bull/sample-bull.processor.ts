import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export const SAMPLE_BULL_QUEUE = 'sample-queue';

@Processor(SAMPLE_BULL_QUEUE)
export class SampleBullProcessor extends WorkerHost {
  private readonly logger = new Logger(SampleBullProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id} [${job.name}]`);

    switch (job.name) {
      case 'email':
        return this.handleEmailJob(job);
      case 'notification':
        return this.handleNotificationJob(job);
      case 'data-processing':
        return this.handleDataProcessingJob(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        return { processed: true, type: 'unknown' };
    }
  }

  private async handleEmailJob(job: Job) {
    this.logger.log(`Sending email to: ${job.data?.to || 'unknown'}`);
    await job.updateProgress(50);
    await new Promise((r) => setTimeout(r, 1000));
    await job.updateProgress(100);
    return { sent: true, to: job.data?.to };
  }

  private async handleNotificationJob(job: Job) {
    this.logger.log(`Sending notification to user: ${job.data?.userId || 'unknown'}`);
    await new Promise((r) => setTimeout(r, 500));
    return { notified: true, userId: job.data?.userId };
  }

  private async handleDataProcessingJob(job: Job) {
    this.logger.log('Processing data batch...');
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 200));
      await job.updateProgress(Math.round((i / steps) * 100));
    }
    return { processed: true, steps };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} [${job.name}] completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} [${job.name}] failed: ${error.message}`);
  }
}

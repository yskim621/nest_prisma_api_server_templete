import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SAMPLE_BULL_QUEUE } from './sample-bull.processor';
import { CreateJobDto } from './dto/sample-bull.dto';

@Injectable()
export class SampleBullService {
  private readonly logger = new Logger(SampleBullService.name);

  constructor(@InjectQueue(SAMPLE_BULL_QUEUE) private readonly queue: Queue) {}

  async addJob(dto: CreateJobDto) {
    const job = await this.queue.add(dto.name, dto.data || {}, {
      delay: dto.delay,
      priority: dto.priority,
    });
    this.logger.log(`Job added: ${job.id} [${dto.name}]`);
    return { jobId: job.id, name: job.name, timestamp: job.timestamp };
  }

  async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    };
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  async getWaitingJobs(start = 0, end = 10) {
    return this.queue.getWaiting(start, end);
  }

  async removeJob(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    await job.remove();
    return { removed: true, jobId };
  }

  async retryFailedJobs() {
    const failed = await this.queue.getFailed();
    let retried = 0;
    for (const job of failed) {
      await job.retry();
      retried++;
    }
    return { retried };
  }
}

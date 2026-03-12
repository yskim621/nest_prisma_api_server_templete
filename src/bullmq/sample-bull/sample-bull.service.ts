import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { SAMPLE_BULL_QUEUE, EmailJobData, NotificationJobData, DataProcessingJobData } from './sample-bull.processor';

export interface JobResult {
  jobId: string | undefined;
  name: string;
  data: unknown;
  status: string;
}

@Injectable()
export class SampleBullService {
  private readonly logger = new Logger(SampleBullService.name);

  constructor(
    @InjectQueue(SAMPLE_BULL_QUEUE)
    private readonly sampleQueue: Queue,
  ) {}

  /**
   * 이메일 작업 큐에 추가
   */
  async addEmailJob(data: EmailJobData): Promise<JobResult> {
    const job = await this.sampleQueue.add('email', data, {
      priority: 1,
    });

    this.logger.log(`Email job added: ${job.id}`);
    return this.formatJobResult(job);
  }

  /**
   * 알림 작업 큐에 추가
   */
  async addNotificationJob(data: NotificationJobData): Promise<JobResult> {
    const job = await this.sampleQueue.add('notification', data, {
      priority: 2,
    });

    this.logger.log(`Notification job added: ${job.id}`);
    return this.formatJobResult(job);
  }

  /**
   * 데이터 처리 작업 큐에 추가
   */
  async addDataProcessingJob(data: DataProcessingJobData): Promise<JobResult> {
    const job = await this.sampleQueue.add('data-processing', data, {
      priority: 3,
    });

    this.logger.log(`Data processing job added: ${job.id}`);
    return this.formatJobResult(job);
  }

  /**
   * 지연 작업 추가 (예약 실행)
   */
  async addDelayedJob(name: string, data: unknown, delayMs: number): Promise<JobResult> {
    const job = await this.sampleQueue.add(name, data, {
      delay: delayMs,
    });

    this.logger.log(`Delayed job added: ${job.id} (delay: ${delayMs}ms)`);
    return this.formatJobResult(job);
  }

  /**
   * 반복 작업 추가 (Cron)
   */
  async addRepeatableJob(name: string, data: unknown, pattern: string): Promise<{ jobKey: string; pattern: string }> {
    const job = await this.sampleQueue.add(name, data, {
      repeat: {
        pattern,
      },
    });

    this.logger.log(`Repeatable job added: ${job.id} (pattern: ${pattern})`);
    return {
      jobKey: job.repeatJobKey || '',
      pattern,
    };
  }

  /**
   * 작업 상태 조회
   */
  async getJobStatus(jobId: string): Promise<{
    id: string | undefined;
    name: string;
    state: string;
    progress: number | object | string | boolean;
    data: unknown;
    result: unknown;
    failedReason: string | undefined;
    attemptsMade: number;
    timestamp: number | undefined;
    finishedOn: number | undefined;
  } | null> {
    const job = await this.sampleQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * 큐 상태 조회
   */
  async getQueueStatus(): Promise<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.sampleQueue.getWaitingCount(),
      this.sampleQueue.getActiveCount(),
      this.sampleQueue.getCompletedCount(),
      this.sampleQueue.getFailedCount(),
      this.sampleQueue.getDelayedCount(),
      this.sampleQueue.isPaused(),
    ]);

    return {
      name: this.sampleQueue.name,
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    };
  }

  /**
   * 큐 일시정지
   */
  async pauseQueue(): Promise<void> {
    await this.sampleQueue.pause();
    this.logger.log('Queue paused');
  }

  /**
   * 큐 재개
   */
  async resumeQueue(): Promise<void> {
    await this.sampleQueue.resume();
    this.logger.log('Queue resumed');
  }

  /**
   * 완료/실패 작업 정리
   */
  async cleanQueue(grace: number = 0): Promise<{ cleaned: string[] }> {
    const cleaned = await this.sampleQueue.clean(grace, 100, 'completed');
    const failedCleaned = await this.sampleQueue.clean(grace, 100, 'failed');

    this.logger.log(`Cleaned ${cleaned.length + failedCleaned.length} jobs`);
    return { cleaned: [...cleaned, ...failedCleaned] };
  }

  /**
   * 특정 작업 제거
   */
  async removeJob(jobId: string): Promise<boolean> {
    const job = await this.sampleQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Job ${jobId} removed`);
      return true;
    }
    return false;
  }

  /**
   * 대기 중인 작업 목록
   */
  async getWaitingJobs(start = 0, end = 10): Promise<Job[]> {
    return this.sampleQueue.getWaiting(start, end);
  }

  /**
   * 실패한 작업 재시도
   */
  async retryFailedJobs(): Promise<number> {
    const failedJobs = await this.sampleQueue.getFailed(0, 100);
    let retriedCount = 0;

    for (const job of failedJobs) {
      await job.retry();
      retriedCount++;
    }

    this.logger.log(`Retried ${retriedCount} failed jobs`);
    return retriedCount;
  }

  private formatJobResult(job: Job): JobResult {
    return {
      jobId: job.id,
      name: job.name,
      data: job.data,
      status: 'queued',
    };
  }
}

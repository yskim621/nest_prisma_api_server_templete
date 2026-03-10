import { Logger } from '@nestjs/common';
import { Queue, Job, JobsOptions } from 'bullmq';

/**
 * 작업 결과 인터페이스
 */
export interface JobResult {
  jobId: string | undefined;
  name: string;
  data: unknown;
  status: string;
}

/**
 * 작업 상태 인터페이스
 */
export interface JobStatus {
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
}

/**
 * 큐 상태 인터페이스
 */
export interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

/**
 * BaseQueueService - BullMQ 큐 서비스를 위한 추상 클래스
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class EmailQueueService extends BaseQueueService {
 *   constructor(@InjectQueue('email') queue: Queue) {
 *     super(queue);
 *   }
 *
 *   async sendEmail(data: EmailData): Promise<JobResult> {
 *     return this.addJob('send', data, { priority: 1 });
 *   }
 * }
 * ```
 */
export abstract class BaseQueueService {
  protected readonly logger: Logger;

  protected constructor(protected readonly queue: Queue) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * 작업을 큐에 추가
   */
  async addJob<T>(
    name: string,
    data: T,
    options?: JobsOptions,
  ): Promise<JobResult> {
    const job = await this.queue.add(name, data, options);
    this.logger.log(`Job ${name} added: ${job.id}`);
    return this.formatJobResult(job);
  }

  /**
   * 지연 작업 추가
   */
  async addDelayedJob<T>(
    name: string,
    data: T,
    delayMs: number,
    options?: Omit<JobsOptions, 'delay'>,
  ): Promise<JobResult> {
    const job = await this.queue.add(name, data, { ...options, delay: delayMs });
    this.logger.log(`Delayed job ${name} added: ${job.id} (delay: ${delayMs}ms)`);
    return this.formatJobResult(job);
  }

  /**
   * 반복 작업 추가 (Cron)
   */
  async addRepeatableJob<T>(
    name: string,
    data: T,
    pattern: string,
    options?: Omit<JobsOptions, 'repeat'>,
  ): Promise<{ jobKey: string; pattern: string }> {
    const job = await this.queue.add(name, data, {
      ...options,
      repeat: { pattern },
    });
    this.logger.log(`Repeatable job ${name} added: ${job.id} (pattern: ${pattern})`);
    return {
      jobKey: job.repeatJobKey || '',
      pattern,
    };
  }

  /**
   * 작업 상태 조회
   */
  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    const job = await this.queue.getJob(jobId);
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
  async getQueueStatus(): Promise<QueueStatus> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.isPaused(),
    ]);

    return {
      name: this.queue.name,
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
    await this.queue.pause();
    this.logger.log('Queue paused');
  }

  /**
   * 큐 재개
   */
  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    this.logger.log('Queue resumed');
  }

  /**
   * 완료/실패 작업 정리
   */
  async cleanQueue(grace: number = 0, limit: number = 100): Promise<{ cleaned: string[] }> {
    const [completed, failed] = await Promise.all([
      this.queue.clean(grace, limit, 'completed'),
      this.queue.clean(grace, limit, 'failed'),
    ]);

    this.logger.log(`Cleaned ${completed.length + failed.length} jobs`);
    return { cleaned: [...completed, ...failed] };
  }

  /**
   * 특정 작업 제거
   */
  async removeJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
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
    return this.queue.getWaiting(start, end);
  }

  /**
   * 활성 작업 목록
   */
  async getActiveJobs(start = 0, end = 10): Promise<Job[]> {
    return this.queue.getActive(start, end);
  }

  /**
   * 실패한 작업 목록
   */
  async getFailedJobs(start = 0, end = 10): Promise<Job[]> {
    return this.queue.getFailed(start, end);
  }

  /**
   * 실패한 작업 재시도
   */
  async retryFailedJobs(limit = 100): Promise<number> {
    const failedJobs = await this.queue.getFailed(0, limit);
    let retriedCount = 0;

    for (const job of failedJobs) {
      await job.retry();
      retriedCount++;
    }

    this.logger.log(`Retried ${retriedCount} failed jobs`);
    return retriedCount;
  }

  /**
   * 작업 결과 포맷팅
   */
  protected formatJobResult(job: Job): JobResult {
    return {
      jobId: job.id,
      name: job.name,
      data: job.data,
      status: 'queued',
    };
  }
}

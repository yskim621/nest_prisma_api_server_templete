import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../../../prisma/generated/nest_prisma_template';

type PrismaQueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

@Injectable()
export class MindsaiPrismaService extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel> implements OnModuleInit {
  private readonly logger = new Logger(MindsaiPrismaService.name);
  timezone = process.env.TIMEZONE || 'Asia/Seoul';
  loglevel = process.env.LOGLEVEL || 'query';

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.$on('query', (e: PrismaQueryEvent) => {
      if (this.loglevel === 'query') {
        this.logger.log(`Query: ${e.query}`);
        this.logger.log(`params: ${e.params}`);
        this.logger.log(`Duration: ${e.duration}ms`);
      }
    });
  }

  getTodey(): Date {
    const offset = 1000 * 60 * 60 * 9;
    const today: Date = new Date(Date.now() + offset);
    return today;
  }
}

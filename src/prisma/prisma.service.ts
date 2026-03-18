import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../prisma/generated/nest_prisma_template';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  timezone = process.env.TIMEZONE || 'Asia/Seoul';
  loglevel = process.env.LOGLEVEL || 'query';

  constructor() {
    const adapter = new PrismaMariaDb(process.env.PRISMA_DATABASE_URL || '');

    super({
      adapter,
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
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
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

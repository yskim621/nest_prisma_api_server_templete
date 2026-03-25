import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/nest_prisma_template/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb(process.env.PRISMA_DATABASE_URL || '');
    const loglevel = process.env.LOGLEVEL || 'query';

    super({
      adapter,
      log:
        loglevel === 'query'
          ? [
              { emit: 'stdout', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }
}

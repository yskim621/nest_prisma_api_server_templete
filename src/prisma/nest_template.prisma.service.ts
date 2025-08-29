import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../prisma/generated/nest_prisma_template';


type PrismaQueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number; // milliseconds
  target: string;
};

@Injectable()
export class MindsaiPrismaService extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel> implements OnModuleInit {
  private readonly logger = new Logger(MindsaiPrismaService.name);
  timezone = process.env.TIMEZONE || 'Asia/Seoul';
  loglevel = process.env.LOGLEVEL || 'query';

  constructor() {
    //private readonly prisma: PrismaService
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
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
    // this.$use(async (params, next) => {
    //   const result = await next(params);
    //   // console.log(typeof result);
    //   // console.log('🚀 ~ PrismaService ~ this.$use ~ result:', result);
    //   if (result) {
    //     // const result_ = JSON.parse(JSON.stringify(result));
    //     // return result_;
    //     // result.forEach((item) => {
    //     //   for (const key in item) {
    //     //     console.log(key, item[key]);
    //     //     if (item[key]?.prisma__type === 'bigint') {
    //     //       item[key].prisma__type = 'int';
    //     //       item[key].prisma__value = Number(item[key].prisma__value);
    //     //     }
    //     //   }
    //     // });
    //   }
    //   // return result;
    // });
  }

  getTodey(): Date {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const today: Date = new Date(Date.now() + offset);
    return today;
  }
}

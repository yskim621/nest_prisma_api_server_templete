import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisPassword = process.env.REDIS_PASSWORD;

        return {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            ...(redisPassword && redisPassword.length > 0 ? { password: redisPassword } : {}),
            db: parseInt(process.env.REDIS_BULL_DB || '1', 10),
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class BullMQModule {}

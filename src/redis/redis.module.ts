import { Module, Global, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const redisUsername = process.env.REDIS_USERNAME;
        const redisPassword = process.env.REDIS_PASSWORD;

        const client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          db: parseInt(process.env.REDIS_DB || '0', 10),
          ...(redisUsername && redisUsername.length > 0 ? { username: redisUsername } : {}),
          ...(redisPassword && redisPassword.length > 0 ? { password: redisPassword } : {}),
        });

        client.on('connect', () => logger.log('[' + new Date().toISOString() + '] Redis connected'));
        client.on('error', (err) => logger.error('[' + new Date().toISOString() + '] Redis error: ' + err.message));

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

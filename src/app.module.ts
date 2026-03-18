import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UtilsModule } from './utils/utils.module'; // Global module
import { APP_FILTER, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { Modules } from './modules/modules';
import { MindsSignalModule } from './routes/minds-signal.module';
import { MetricsController } from './metrics.controller';
import { MetricMiddleware, Pm2MetricsService } from './middlewares/metric.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { HealthModule } from './health/health.module';
import { SocketModule } from './sockets/socket.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { SampleQueueModule } from './rabbitmq/sample-queue/sample-queue.module';
import { BullMQModule } from './bullmq/bullmq.module';
import { SampleBullModule } from './bullmq/sample-bull/sample-bull.module';
import { EveryInterceptor } from './interceptors/every.interceptor';
import { HttpExceptionsFilter } from './common/exceptions/all-exception.filters';
import { ResponseInterceptor } from './interceptors/transform.response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    forwardRef(() =>
      RouterModule.register([
        {
          path: 'msl',
          module: MindsSignalModule,
        },
      ]),
    ),
    Modules,
    PrismaModule,
    SocketModule,
    RedisModule,
    UtilsModule,
    HealthModule,
    RabbitMQModule,
    SampleQueueModule,
    BullMQModule,
    SampleBullModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    PrismaService,
    MetricMiddleware,
    Pm2MetricsService,
    {
      provide: APP_INTERCEPTOR,
      // 전역 인터셉터 등록 - 모든 요청에 대해 EveryInterceptor 실행
      useClass: EveryInterceptor, // 👉 Nest가 의존성 자동 주입함
    },
    {
      provide: APP_INTERCEPTOR,
      // 전역 인터셉터 등록 - 모든 응답을 ResponseInterceptor 가공
      useClass: ResponseInterceptor, // 👉 Nest가 의존성 자동 주입함
    },
    {
      provide: APP_FILTER,
      // 전역 에러 처리
      useClass: HttpExceptionsFilter, // 👉 Nest가 의존성 자동 주입함
    },
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, MetricMiddleware).forRoutes('{*path}');
    // .exclude(`${process.env.baseUrl || ''}/health/(.*)`)
    // .forRoutes('*')
  }
}

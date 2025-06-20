import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MindsaiPrismaService } from './prisma/mindsai_platform.prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UtilsModule } from './utils/utils.module'; // Global module
import { RouterModule } from '@nestjs/core';
import { Modules } from './modules/modules';
import { MindsSignalModule } from './routes/minds-signal.module';
import { MetricsController } from './metrics.controller';
import { MetricMiddleware, Pm2MetricsService } from './middlewares/metric.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { HealthModule } from './health/health.module';

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
    RedisModule,
    UtilsModule,
    // End-point registering
    MindsSignalModule,
    HealthModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [AppService, MindsaiPrismaService, MetricMiddleware, Pm2MetricsService],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, MetricMiddleware).forRoutes('*');
    // .exclude(`${process.env.baseUrl || ''}/health/(.*)`)
    // .forRoutes('*')
  }
}
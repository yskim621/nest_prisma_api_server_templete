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
import { MindsTrafficLightModule } from './routes/minds-traffic-light.module';
import { AuthModule } from './modules/mtl/auth/auth.module';
import { MetricsController } from './metrics.controller';
import { MetricMiddleware, Pm2MetricsService } from './middlewares/metric.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    forwardRef(() =>
      RouterModule.register([
        {
          path: 'mtl',
          module: MindsTrafficLightModule,
        },
      ]),
    ),
    PrismaModule,
    RedisModule,
    UtilsModule,
    Modules,
    AuthModule,
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
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/database';
import { BullMQModule, RabbitMQModule } from '@app/queue';
import { UserModule } from './modules/user/user.module';
import { UserGroupModule } from './modules/user-group/user-group.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { BoardModule } from './modules/board/board.module';
import { SampleTransactionModule } from './modules/sample-transaction/sample-transaction.module';
import { SampleBullModule } from './modules/sample-bull/sample-bull.module';
import { SampleQueueModule } from './modules/sample-rabbit/sample-queue.module';
import { CoreHealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BullMQModule,
    RabbitMQModule,
    UserModule,
    UserGroupModule,
    PermissionModule,
    MenuModule,
    BoardModule,
    SampleTransactionModule,
    SampleBullModule,
    SampleQueueModule,
  ],
  controllers: [CoreHealthController],
})
export class CoreServiceModule {}

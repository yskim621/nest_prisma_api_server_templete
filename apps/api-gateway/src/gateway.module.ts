import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, CORE_SERVICE } from '@app/common';
import { AuthLibModule, JwtAuthGuard } from '@app/auth';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import {
  UsersProxyController,
  UserGroupsProxyController,
  PermissionsProxyController,
  MenusProxyController,
} from './proxy/core-proxy.controller';
import { BoardsProxyController } from './proxy/board-proxy.controller';
import { SampleTransactionProxyController } from './proxy/sample-transaction-proxy.controller';
import { SampleBullProxyController } from './proxy/sample-bull-proxy.controller';
import { SampleRabbitProxyController } from './proxy/sample-rabbit-proxy.controller';
import { SocketModule } from './socket/socket.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
        },
      },
      {
        name: CORE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.CORE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.CORE_SERVICE_PORT, 10) || 3002,
        },
      },
    ]),
    AuthLibModule,
    SocketModule,
    HealthModule,
  ],
  controllers: [
    AuthProxyController,
    UsersProxyController,
    UserGroupsProxyController,
    PermissionsProxyController,
    MenusProxyController,
    BoardsProxyController,
    SampleTransactionProxyController,
    SampleBullProxyController,
    SampleRabbitProxyController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class GatewayModule {}

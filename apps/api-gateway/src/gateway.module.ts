import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
  ],
  controllers: [
    AuthProxyController,
    UsersProxyController,
    UserGroupsProxyController,
    PermissionsProxyController,
    MenusProxyController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class GatewayModule {}

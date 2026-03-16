import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/database';
import { UserModule } from './modules/user/user.module';
import { UserGroupModule } from './modules/user-group/user-group.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    UserGroupModule,
    PermissionModule,
    MenuModule,
  ],
})
export class CoreServiceModule {}

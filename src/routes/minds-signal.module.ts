import { Module } from '@nestjs/common';

import { BoardsModule } from '../modules/msl/boards/boards.module';
import { BoardsController } from '../modules/msl/boards/boards.controller';
import { UserModule } from '../modules/msl/user/user.module';
import { UserController } from '../modules/msl/user/user.controller';
import { AuthModule } from '../modules/msl/auth/auth.module';
import { AuthController } from '../modules/msl/auth/auth.controller';
import { UserGroupModule } from '../modules/msl/user-group/user-group.module';
import { UserGroupController } from '../modules/msl/user-group/user-group.controller';
import { PermissionModule } from '../modules/msl/permission/permission.module';
import { PermissionController } from '../modules/msl/permission/permission.controller';
import { MenuModule } from '../modules/msl/menu/menu.module';
import { MenuController } from '../modules/msl/menu/menu.controller';

@Module({
  imports: [AuthModule, UserModule, UserGroupModule, PermissionModule, MenuModule, BoardsModule],
  controllers: [AuthController, UserController, UserGroupController, PermissionController, MenuController, BoardsController],
  providers: [],
})
export class MindsSignalModule {}

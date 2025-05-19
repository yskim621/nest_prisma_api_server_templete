import { Module } from '@nestjs/common';

import { BoardsModule } from 'src/modules/mtl/boards/boards.module';
import { BoardsController } from 'src/modules/mtl/boards/boards.controller';
import { UserModule } from '../modules/mtl/user/user.module';
import { UserController } from '../modules/mtl/user/user.controller';
import { AuthModule } from '../modules/mtl/auth/auth.module';
import { AuthController } from '../modules/mtl/auth/auth.controller';

@Module({
  imports: [AuthModule, UserModule, BoardsModule],
  controllers: [AuthController, UserController, BoardsController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class MindsTrafficLightModule {}

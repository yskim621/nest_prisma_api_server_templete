import { Module } from '@nestjs/common';

import { BoardsModule } from 'src/modules/msl/boards/boards.module';
import { BoardsController } from 'src/modules/msl/boards/boards.controller';
import { UserModule } from '../modules/msl/user/user.module';
import { UserController } from '../modules/msl/user/user.controller';
import { AuthModule } from '../modules/msl/auth/auth.module';
import { AuthController } from '../modules/msl/auth/auth.controller';

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
export class MindsSignalModule {}

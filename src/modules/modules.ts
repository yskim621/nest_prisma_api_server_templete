import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from './mtl/user/user.module';
import { BoardsModule } from './mtl/boards/boards.module';
import { MindsTrafficLightModule } from 'src/routes/minds-traffic-light.module';
import { AuthModule } from './mtl/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => BoardsModule),
    forwardRef(() => MindsTrafficLightModule),
  ],
})
export class Modules {}

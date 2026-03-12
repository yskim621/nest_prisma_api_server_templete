import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from './msl/user/user.module';
import { BoardsModule } from './msl/boards/boards.module';
import { MindsSignalModule } from 'src/routes/minds-signal.module';
import { AuthModule } from './msl/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => UserModule), forwardRef(() => BoardsModule), forwardRef(() => MindsSignalModule)],
})
export class Modules {}

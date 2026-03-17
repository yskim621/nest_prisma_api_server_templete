import { Module } from '@nestjs/common';
import { UserGroupController } from './user-group.controller';
import { UserGroupService } from './user-group.service';
import { UserGroupRepository } from './user-group.repository';

@Module({
  controllers: [UserGroupController],
  providers: [UserGroupService, UserGroupRepository],
  exports: [UserGroupService, UserGroupRepository],
})
export class UserGroupModule {}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto, UpdateUserGroupDto, UpdateGroupPermissionsDto } from './dto/user-group.dto';

@Controller()
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @MessagePattern(CORE_PATTERNS.USER_GROUP_CREATE)
  async create(@Payload() data: { dto: CreateUserGroupDto; createdBy?: string }) {
    return this.userGroupService.create(data.dto, data.createdBy);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_FIND_ALL)
  async findAll() {
    return this.userGroupService.findAll();
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_FIND_BY_ID)
  async findOne(@Payload() data: { id: number }) {
    return this.userGroupService.findOne(data.id);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_UPDATE)
  async update(@Payload() data: { id: number; dto: UpdateUserGroupDto; modifiedBy?: string }) {
    return this.userGroupService.update(data.id, data.dto, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_DELETE)
  async remove(@Payload() data: { id: number; modifiedBy?: string }) {
    return this.userGroupService.remove(data.id, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_GET_PERMISSIONS)
  async getGroupPermissions(@Payload() data: { groupId: number }) {
    return this.userGroupService.getGroupPermissions(data.groupId);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_UPDATE_PERMISSIONS)
  async updateGroupPermissions(@Payload() data: { groupId: number; dto: UpdateGroupPermissionsDto }) {
    return this.userGroupService.updateGroupPermissions(data.groupId, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.USER_GROUP_GET_USERS)
  async getGroupUsers(@Payload() data: { groupId: number }) {
    return this.userGroupService.getGroupUsers(data.groupId);
  }
}

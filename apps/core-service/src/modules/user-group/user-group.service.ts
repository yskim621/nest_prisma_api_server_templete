import { Injectable, NotFoundException } from '@nestjs/common';
import { UserGroupRepository } from './user-group.repository';
import { CreateUserGroupDto, UpdateUserGroupDto, UpdateGroupPermissionsDto } from './dto/user-group.dto';

@Injectable()
export class UserGroupService {
  constructor(private readonly userGroupRepository: UserGroupRepository) {}

  async create(dto: CreateUserGroupDto, createdBy?: string) {
    return this.userGroupRepository.create(dto, createdBy);
  }

  async findAll() {
    return this.userGroupRepository.findAll();
  }

  async findOne(id: number) {
    const group = await this.userGroupRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`UserGroup with id ${id} not found`);
    }
    return group;
  }

  async update(id: number, dto: UpdateUserGroupDto, modifiedBy?: string) {
    await this.findOne(id);
    return this.userGroupRepository.update(id, dto, modifiedBy);
  }

  async remove(id: number, modifiedBy?: string) {
    await this.findOne(id);
    return this.userGroupRepository.softDelete(id, modifiedBy);
  }

  async getGroupPermissions(groupId: number) {
    await this.findOne(groupId);
    return this.userGroupRepository.getGroupPermissions(groupId);
  }

  async updateGroupPermissions(groupId: number, dto: UpdateGroupPermissionsDto) {
    await this.findOne(groupId);
    return this.userGroupRepository.updateGroupPermissions(groupId, dto.permissionIds);
  }

  async getGroupUsers(groupId: number) {
    await this.findOne(groupId);
    return this.userGroupRepository.getGroupUsers(groupId);
  }
}

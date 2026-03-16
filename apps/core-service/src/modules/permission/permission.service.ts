import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdateUserPermissionsDto } from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(dto: CreatePermissionDto, createdBy?: string) {
    return this.permissionRepository.create(dto, createdBy);
  }

  async findAll(type?: string) {
    return this.permissionRepository.findAll(type);
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return permission;
  }

  async update(id: number, dto: UpdatePermissionDto, modifiedBy?: string) {
    await this.findOne(id);
    return this.permissionRepository.update(id, dto, modifiedBy);
  }

  async remove(id: number, modifiedBy?: string) {
    await this.findOne(id);
    return this.permissionRepository.softDelete(id, modifiedBy);
  }

  async getUserPermissions(userId: number, type?: string) {
    return this.permissionRepository.getUserPermissions(userId, type);
  }

  async getGroupPermissions(groupId: number, type?: string) {
    return this.permissionRepository.getGroupPermissions(groupId, type);
  }

  async updateUserPermissions(userId: number, dto: UpdateUserPermissionsDto) {
    return this.permissionRepository.updateUserPermissions(userId, dto.permissionIds);
  }

  async updateGroupPermissions(groupId: number, dto: UpdateUserPermissionsDto) {
    return this.permissionRepository.updateGroupPermissions(groupId, dto.permissionIds);
  }

  async getOwnedPermissions(userId: number) {
    return this.permissionRepository.getOwnedPermissions(userId);
  }

  async getPageActionPermissions(pageId: string) {
    return this.permissionRepository.getPageActionPermissions(pageId);
  }
}

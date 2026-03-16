import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto, UpdateUserPermissionsDto } from './dto/permission.dto';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @MessagePattern(CORE_PATTERNS.PERMISSION_CREATE)
  async create(@Payload() data: { dto: CreatePermissionDto; createdBy?: string }) {
    return this.permissionService.create(data.dto, data.createdBy);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_FIND_ALL)
  async findAll(@Payload() data: { type?: string }) {
    return this.permissionService.findAll(data?.type);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_FIND_BY_ID)
  async findOne(@Payload() data: { id: number }) {
    return this.permissionService.findOne(data.id);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_UPDATE)
  async update(@Payload() data: { id: number; dto: UpdatePermissionDto; modifiedBy?: string }) {
    return this.permissionService.update(data.id, data.dto, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_DELETE)
  async remove(@Payload() data: { id: number; modifiedBy?: string }) {
    return this.permissionService.remove(data.id, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_GET_USER_PERMISSIONS)
  async getUserPermissions(@Payload() data: { userId: number; type?: string }) {
    return this.permissionService.getUserPermissions(data.userId, data.type);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_GET_GROUP_PERMISSIONS)
  async getGroupPermissions(@Payload() data: { groupId: number; type?: string }) {
    return this.permissionService.getGroupPermissions(data.groupId, data.type);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_UPDATE_USER_PERMISSIONS)
  async updateUserPermissions(@Payload() data: { userId: number; dto: UpdateUserPermissionsDto }) {
    return this.permissionService.updateUserPermissions(data.userId, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_UPDATE_GROUP_PERMISSIONS)
  async updateGroupPermissions(@Payload() data: { groupId: number; dto: UpdateUserPermissionsDto }) {
    return this.permissionService.updateGroupPermissions(data.groupId, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_GET_OWNED)
  async getOwnedPermissions(@Payload() data: { userId: number }) {
    return this.permissionService.getOwnedPermissions(data.userId);
  }

  @MessagePattern(CORE_PATTERNS.PERMISSION_GET_PAGE_ACTIONS)
  async getPageActionPermissions(@Payload() data: { pageId: string }) {
    return this.permissionService.getPageActionPermissions(data.pageId);
  }
}

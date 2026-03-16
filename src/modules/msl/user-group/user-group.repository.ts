import { Injectable } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { BaseRepository, PrismaDelegate } from 'src/common/base';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto/user-group.dto';

@Injectable()
export class UserGroupRepository extends BaseRepository {
  constructor(prisma: MindsaiPrismaService) {
    super(prisma, 'UserGroup');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.userGroup;
  }

  async create(data: CreateUserGroupDto, createdBy?: string) {
    return this.prisma.userGroup.create({
      data: { ...data, createdBy },
    });
  }

  async findAll() {
    return this.prisma.userGroup.findMany({
      where: { delYn: 'N' },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.userGroup.findFirst({
      where: { id, delYn: 'N' },
      include: {
        users: { select: { id: true, email: true, name: true, role: true } },
        groupPermissions: { include: { permission: true } },
      },
    });
  }

  async update(id: number, data: UpdateUserGroupDto, modifiedBy?: string) {
    return this.prisma.userGroup.update({
      where: { id },
      data: { ...data, modifiedBy },
    });
  }

  async softDelete(id: number, modifiedBy?: string) {
    return this.prisma.userGroup.update({
      where: { id },
      data: { delYn: 'Y', modifiedBy },
    });
  }

  async getGroupPermissions(groupId: number) {
    return this.prisma.groupPermissionMap.findMany({
      where: { groupId },
      include: { permission: true },
    });
  }

  async updateGroupPermissions(groupId: number, permissionIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.groupPermissionMap.deleteMany({ where: { groupId } });

      if (permissionIds.length > 0) {
        await tx.groupPermissionMap.createMany({
          data: permissionIds.map((permissionId) => ({ groupId, permissionId })),
        });
      }

      return tx.groupPermissionMap.findMany({
        where: { groupId },
        include: { permission: true },
      });
    });
  }

  async getGroupUsers(groupId: number) {
    return this.prisma.user.findMany({
      where: { userGroupId: groupId, accountStatus: 'ACTIVE' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }
}

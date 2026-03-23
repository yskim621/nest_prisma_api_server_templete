import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository, PrismaDelegate } from '../../../common/base';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'Permission');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.permission;
  }

  async create(data: CreatePermissionDto, createdBy?: string) {
    return this.prisma.permission.create({
      data: { ...data, createdBy },
    });
  }

  async findAll(type?: string) {
    return this.prisma.permission.findMany({
      where: {
        delYn: 'N',
        ...(type && { type }),
      },
      include: { menu: { select: { id: true, name: true } } },
      orderBy: [{ type: 'asc' }, { resource: 'asc' }],
    });
  }

  async findById(id: number) {
    return this.prisma.permission.findFirst({
      where: { id, delYn: 'N' },
      include: { menu: true },
    });
  }

  async update(id: number, data: UpdatePermissionDto, modifiedBy?: string) {
    return this.prisma.permission.update({
      where: { id },
      data: { ...data, modifiedBy },
    });
  }

  async softDelete(id: number, modifiedBy?: string) {
    return this.prisma.permission.update({
      where: { id },
      data: { delYn: 'Y', modifiedBy },
    });
  }

  async getUserPermissions(userId: number, type?: string) {
    return this.prisma.userPermissionMap.findMany({
      where: {
        userId,
        permission: {
          delYn: 'N',
          ...(type && { type }),
        },
      },
      include: { permission: { include: { menu: { select: { id: true, name: true } } } } },
    });
  }

  async getGroupPermissions(groupId: number, type?: string) {
    return this.prisma.groupPermissionMap.findMany({
      where: {
        groupId,
        permission: {
          delYn: 'N',
          ...(type && { type }),
        },
      },
      include: { permission: { include: { menu: { select: { id: true, name: true } } } } },
    });
  }

  async updateUserPermissions(userId: number, permissionIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.userPermissionMap.deleteMany({ where: { userId } });

      if (permissionIds.length > 0) {
        await tx.userPermissionMap.createMany({
          data: permissionIds.map((permissionId) => ({ userId, permissionId })),
        });
      }

      return tx.userPermissionMap.findMany({
        where: { userId },
        include: { permission: true },
      });
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

  async getOwnedPermissions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userGroupId: true },
    });

    const userPerms = await this.prisma.userPermissionMap.findMany({
      where: { userId },
      include: { permission: { include: { menu: { select: { id: true, name: true } } } } },
    });

    const groupPerms = user?.userGroupId
      ? await this.prisma.groupPermissionMap.findMany({
          where: { groupId: user.userGroupId },
          include: { permission: { include: { menu: { select: { id: true, name: true } } } } },
        })
      : [];

    // 중복 제거: 사용자 직접 권한 + 그룹 상속 권한
    const permissionMap = new Map<number, (typeof userPerms)[0]['permission']>();
    for (const p of userPerms) {
      permissionMap.set(p.permission.id, p.permission);
    }
    for (const p of groupPerms) {
      if (!permissionMap.has(p.permission.id)) {
        permissionMap.set(p.permission.id, p.permission);
      }
    }

    return Array.from(permissionMap.values()).filter((p) => p.delYn === 'N');
  }

  async getPageActionPermissions(pageId: string) {
    return this.prisma.permission.findMany({
      where: { pageId, type: 'ACTION', delYn: 'N' },
      orderBy: { resource: 'asc' },
    });
  }
}

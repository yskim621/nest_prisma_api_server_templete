import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<Request>();
    if (!user) return false;

    const userPermissions = await this.getUserPermissions(user.userId);

    // MASTER 권한이 있으면 모든 접근 허용
    if (userPermissions.some((p) => p.resource === 'ALL' && p.type === 'MASTER')) {
      return true;
    }

    return requiredPermissions.every((required) => userPermissions.some((p) => p.resource === required));
  }

  private async getUserPermissions(userId: number) {
    // 사용자 직접 권한
    const userPerms = await this.prisma.userPermissionMap.findMany({
      where: { userId },
      include: { permission: true },
    });

    // 사용자 그룹 권한
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userGroupId: true },
    });

    let groupPerms: { permission: { resource: string; type: string } }[] = [];
    if (user?.userGroupId) {
      groupPerms = await this.prisma.groupPermissionMap.findMany({
        where: { groupId: user.userGroupId },
        include: { permission: true },
      });
    }

    const permissionMap = new Map<string, { resource: string; type: string }>();
    for (const p of userPerms) {
      permissionMap.set(p.permission.resource, p.permission);
    }
    for (const p of groupPerms) {
      permissionMap.set(p.permission.resource, p.permission);
    }

    return Array.from(permissionMap.values());
  }
}

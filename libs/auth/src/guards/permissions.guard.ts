import { Injectable, CanActivate, ExecutionContext, Inject, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Optional() @Inject(CORE_SERVICE) private coreClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userPermissions = await firstValueFrom(
      this.coreClient.send<{ resource: string; type: string }[]>(
        CORE_PATTERNS.PERMISSION_GET_USER_PERMISSIONS,
        { userId: user.userId },
      ),
    );

    if (userPermissions.some((p) => p.resource === 'ALL' && p.type === 'MASTER')) {
      return true;
    }

    return requiredPermissions.every((required) => userPermissions.some((p) => p.resource === required));
  }
}

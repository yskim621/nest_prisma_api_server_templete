import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository, PrismaDelegate } from '../../../common/base';
import { CreateMenuDto, CreateMenuTranslationDto, UpdateMenuDto } from './dto/menu.dto';
import { Menu, MenuTranslation } from '../../../../prisma/generated/nest_prisma_template/client';

type MenuWithTranslations = Menu & { translations: MenuTranslation[] };

export interface MenuTreeNode {
  id: number;
  pageId: string | null;
  type: string;
  depth: number;
  parentMenuId: number | null;
  name: string;
  description: string | null;
  menuOrder: number;
  isFavorite?: boolean;
  children: MenuTreeNode[];
}

@Injectable()
export class MenuRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'Menu');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.menu;
  }

  async create(data: CreateMenuDto, createdBy?: string) {
    return this.prisma.menu.create({
      data: {
        ...data,
        depth: data.depth ?? 0,
        menuOrder: data.menuOrder ?? 0,
        createdBy,
      },
      include: { translations: true },
    });
  }

  async findAll() {
    return this.prisma.menu.findMany({
      where: { delYn: 'N' },
      include: {
        translations: true,
        childMenus: {
          where: { delYn: 'N' },
          include: { translations: true },
          orderBy: { menuOrder: 'asc' },
        },
      },
      orderBy: [{ depth: 'asc' }, { menuOrder: 'asc' }],
    });
  }

  async findById(id: number) {
    return this.prisma.menu.findFirst({
      where: { id, delYn: 'N' },
      include: {
        translations: true,
        permissions: { where: { delYn: 'N' } },
        childMenus: {
          where: { delYn: 'N' },
          include: { translations: true },
          orderBy: { menuOrder: 'asc' },
        },
      },
    });
  }

  async update(id: number, data: UpdateMenuDto, modifiedBy?: string) {
    return this.prisma.menu.update({
      where: { id },
      data: { ...data, modifiedBy },
      include: { translations: true },
    });
  }

  async softDelete(id: number, modifiedBy?: string) {
    return this.prisma.menu.update({
      where: { id },
      data: { delYn: 'Y', modifiedBy },
    });
  }

  async upsertTranslation(menuId: number, dto: CreateMenuTranslationDto) {
    return this.prisma.menuTranslation.upsert({
      where: { menuId_locale: { menuId, locale: dto.locale } },
      create: { menuId, ...dto },
      update: { name: dto.name, description: dto.description },
    });
  }

  async deleteTranslation(menuId: number, locale: string) {
    return this.prisma.menuTranslation.delete({
      where: { menuId_locale: { menuId, locale } },
    });
  }

  async getMenuTree(locale?: string) {
    const menus = await this.prisma.menu.findMany({
      where: { delYn: 'N' },
      include: { translations: locale ? { where: { locale } } : true },
      orderBy: [{ depth: 'asc' }, { menuOrder: 'asc' }],
    });

    return this.buildTree(menus as MenuWithTranslations[], locale);
  }

  async getMenuTreeByUser(userId: number, locale?: string) {
    // 사용자 직접 권한 + 그룹 상속 권한으로 접근 가능한 메뉴 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userGroupId: true },
    });

    const userPerms = await this.prisma.userPermissionMap.findMany({
      where: { userId, permission: { type: 'MENU', delYn: 'N' } },
      select: { permission: { select: { menuId: true, resource: true } } },
    });

    const groupPerms = user?.userGroupId
      ? await this.prisma.groupPermissionMap.findMany({
          where: { groupId: user.userGroupId, permission: { type: 'MENU', delYn: 'N' } },
          select: { permission: { select: { menuId: true, resource: true } } },
        })
      : [];

    // MASTER 권한 체크
    const hasMasterPerm = await this.prisma.userPermissionMap.findFirst({
      where: {
        userId,
        permission: { resource: 'ALL', type: 'MASTER', delYn: 'N' },
      },
    });

    const hasGroupMasterPerm = user?.userGroupId
      ? await this.prisma.groupPermissionMap.findFirst({
          where: {
            groupId: user.userGroupId,
            permission: { resource: 'ALL', type: 'MASTER', delYn: 'N' },
          },
        })
      : null;

    const hasAllPermission = !!hasMasterPerm || !!hasGroupMasterPerm;

    const allowedMenuIds = new Set<number>();
    for (const p of [...userPerms, ...groupPerms]) {
      if (p.permission.menuId) {
        allowedMenuIds.add(p.permission.menuId);
      }
    }

    const menus = await this.prisma.menu.findMany({
      where: { delYn: 'N' },
      include: { translations: locale ? { where: { locale } } : true },
      orderBy: [{ depth: 'asc' }, { menuOrder: 'asc' }],
    });

    // 즐겨찾기 조회
    const favorites = await this.prisma.userFavoriteMenu.findMany({
      where: { userId },
      select: { menuId: true },
    });
    const favoriteSet = new Set(favorites.map((f) => f.menuId));

    const filteredMenus = hasAllPermission ? menus : menus.filter((m) => allowedMenuIds.has(m.id) || m.type === 'FOLDER');

    return this.buildTree(filteredMenus as MenuWithTranslations[], locale, favoriteSet);
  }

  async toggleFavorite(userId: number, menuId: number) {
    const existing = await this.prisma.userFavoriteMenu.findUnique({
      where: { userId_menuId: { userId, menuId } },
    });

    if (existing) {
      await this.prisma.userFavoriteMenu.delete({
        where: { userId_menuId: { userId, menuId } },
      });
      return { isFavorite: false };
    }

    await this.prisma.userFavoriteMenu.create({
      data: { userId, menuId },
    });
    return { isFavorite: true };
  }

  private buildTree(menus: MenuWithTranslations[], locale?: string, favoriteSet?: Set<number>): MenuTreeNode[] {
    const menuMap = new Map<number, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];

    for (const menu of menus) {
      const translation = locale && menu.translations?.length > 0 ? menu.translations[0] : null;

      const node: MenuTreeNode = {
        id: menu.id,
        pageId: menu.pageId,
        type: menu.type,
        depth: menu.depth,
        parentMenuId: menu.parentMenuId,
        name: translation?.name ?? menu.name,
        description: translation?.description ?? menu.description,
        menuOrder: menu.menuOrder,
        isFavorite: favoriteSet ? favoriteSet.has(menu.id) : undefined,
        children: [],
      };

      menuMap.set(menu.id, node);
    }

    for (const node of menuMap.values()) {
      if (node.parentMenuId && menuMap.has(node.parentMenuId)) {
        menuMap.get(node.parentMenuId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    // 자식 없는 FOLDER는 제거
    return this.pruneEmptyFolders(roots);
  }

  private pruneEmptyFolders(nodes: MenuTreeNode[]): MenuTreeNode[] {
    return nodes.filter((node) => {
      if (node.type === 'FOLDER') {
        node.children = this.pruneEmptyFolders(node.children);
        return node.children.length > 0;
      }
      return true;
    });
  }
}

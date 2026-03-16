import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, CreateMenuTranslationDto } from './dto/menu.dto';

@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @MessagePattern(CORE_PATTERNS.MENU_CREATE)
  async create(@Payload() data: { dto: CreateMenuDto; createdBy?: string }) {
    return this.menuService.create(data.dto, data.createdBy);
  }

  @MessagePattern(CORE_PATTERNS.MENU_FIND_ALL)
  async findAll() {
    return this.menuService.findAll();
  }

  @MessagePattern(CORE_PATTERNS.MENU_FIND_BY_ID)
  async findOne(@Payload() data: { id: number }) {
    return this.menuService.findOne(data.id);
  }

  @MessagePattern(CORE_PATTERNS.MENU_UPDATE)
  async update(@Payload() data: { id: number; dto: UpdateMenuDto; modifiedBy?: string }) {
    return this.menuService.update(data.id, data.dto, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.MENU_DELETE)
  async remove(@Payload() data: { id: number; modifiedBy?: string }) {
    return this.menuService.remove(data.id, data.modifiedBy);
  }

  @MessagePattern(CORE_PATTERNS.MENU_GET_TREE)
  async getMenuTree(@Payload() data: { locale?: string }) {
    return this.menuService.getMenuTree(data?.locale);
  }

  @MessagePattern(CORE_PATTERNS.MENU_GET_TREE_BY_USER)
  async getMenuTreeByUser(@Payload() data: { userId: number; locale?: string }) {
    return this.menuService.getMenuTreeByUser(data.userId, data.locale);
  }

  @MessagePattern(CORE_PATTERNS.MENU_TOGGLE_FAVORITE)
  async toggleFavorite(@Payload() data: { userId: number; menuId: number }) {
    return this.menuService.toggleFavorite(data.userId, data.menuId);
  }

  @MessagePattern(CORE_PATTERNS.MENU_UPSERT_TRANSLATION)
  async upsertTranslation(@Payload() data: { menuId: number; dto: CreateMenuTranslationDto }) {
    return this.menuService.upsertTranslation(data.menuId, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.MENU_DELETE_TRANSLATION)
  async deleteTranslation(@Payload() data: { menuId: number; locale: string }) {
    return this.menuService.deleteTranslation(data.menuId, data.locale);
  }
}

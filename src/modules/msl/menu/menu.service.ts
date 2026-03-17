import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { CreateMenuDto, CreateMenuTranslationDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async create(dto: CreateMenuDto, createdBy?: string) {
    return this.menuRepository.create(dto, createdBy);
  }

  async findAll() {
    return this.menuRepository.findAll();
  }

  async findOne(id: number) {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return menu;
  }

  async update(id: number, dto: UpdateMenuDto, modifiedBy?: string) {
    await this.findOne(id);
    return this.menuRepository.update(id, dto, modifiedBy);
  }

  async remove(id: number, modifiedBy?: string) {
    await this.findOne(id);
    return this.menuRepository.softDelete(id, modifiedBy);
  }

  async upsertTranslation(menuId: number, dto: CreateMenuTranslationDto) {
    await this.findOne(menuId);
    return this.menuRepository.upsertTranslation(menuId, dto);
  }

  async deleteTranslation(menuId: number, locale: string) {
    await this.findOne(menuId);
    return this.menuRepository.deleteTranslation(menuId, locale);
  }

  async getMenuTree(locale?: string) {
    return this.menuRepository.getMenuTree(locale);
  }

  async getMenuTreeByUser(userId: number, locale?: string) {
    return this.menuRepository.getMenuTreeByUser(userId, locale);
  }

  async toggleFavorite(userId: number, menuId: number) {
    return this.menuRepository.toggleFavorite(userId, menuId);
  }
}

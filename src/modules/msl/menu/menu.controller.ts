import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, CreateMenuTranslationDto, ToggleFavoriteDto, MenuDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menus')
@ApiTags('Menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '메뉴 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '메뉴 생성 성공' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '모든 메뉴 조회 (관리자용)' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: [MenuDto] })
  async findAll() {
    return this.menuService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: '사용자 권한 기반 메뉴 트리 조회' })
  @ApiQuery({ name: 'locale', required: false, description: '로케일 (ko, en, ja, zh-CN)' })
  async getMenuTree(@Req() req: any, @Query('locale') locale?: string) {
    return this.menuService.getMenuTreeByUser(req.user.userId, locale);
  }

  @Get('tree/all')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '전체 메뉴 트리 조회 (관리자용)' })
  @ApiQuery({ name: 'locale', required: false })
  async getFullMenuTree(@Query('locale') locale?: string) {
    return this.menuService.getMenuTree(locale);
  }

  @Post('favorite')
  @ApiOperation({ summary: '메뉴 즐겨찾기 토글' })
  async toggleFavorite(@Req() req: any, @Body() dto: ToggleFavoriteDto) {
    return this.menuService.toggleFavorite(req.user.userId, dto.menuId);
  }

  @Get(':id')
  @ApiOperation({ summary: '메뉴 상세 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: MenuDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '메뉴 수정' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '메뉴 삭제 (소프트 삭제)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }

  @Post(':id/translations')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '메뉴 번역 추가/수정' })
  async upsertTranslation(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateMenuTranslationDto) {
    return this.menuService.upsertTranslation(id, dto);
  }

  @Delete(':id/translations/:locale')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '메뉴 번역 삭제' })
  async deleteTranslation(@Param('id', ParseIntPipe) id: number, @Param('locale') locale: string) {
    return this.menuService.deleteTranslation(id, locale);
  }
}

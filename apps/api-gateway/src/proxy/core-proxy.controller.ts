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
  Inject,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';
import { Public, Roles, RequirePermissions } from '@app/auth';

// ========== Users Proxy ==========
@Controller('msl/users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create user' })
  create(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.USER_CREATE, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.coreClient.send(CORE_PATTERNS.USER_FIND_ALL, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_FIND_BY_ID, { id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.USER_UPDATE, { id, dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_DELETE, { id });
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  findByEmail(@Param('email') email: string) {
    return this.coreClient.send(CORE_PATTERNS.USER_FIND_BY_EMAIL, { email });
  }
}

// ========== UserGroups Proxy ==========
@Controller('msl/user-groups')
@ApiTags('User Groups')
@ApiBearerAuth()
export class UserGroupsProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Create user group' })
  create(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_CREATE, { dto });
  }

  @Get()
  @ApiOperation({ summary: 'Get all user groups' })
  findAll() {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_FIND_ALL, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user group by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_FIND_BY_ID, { id });
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update user group' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_UPDATE, { id, dto });
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Delete user group (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_DELETE, { id });
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get group permissions' })
  getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_GET_PERMISSIONS, { groupId: id });
  }

  @Put(':id/permissions')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update group permissions' })
  updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_UPDATE_PERMISSIONS, { groupId: id, dto });
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get users in group' })
  getUsers(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.USER_GROUP_GET_USERS, { groupId: id });
  }
}

// ========== Permissions Proxy ==========
@Controller('msl/permissions')
@ApiTags('Permissions')
@ApiBearerAuth()
export class PermissionsProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Create permission' })
  create(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_CREATE, { dto });
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'type', required: false, description: 'Permission type filter (MASTER, MANAGER, MENU, ACTION)' })
  findAll(@Query('type') type?: string) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_FIND_ALL, { type });
  }

  @Get('owned')
  @ApiOperation({ summary: 'Get current user owned permissions (direct + group inherited)' })
  getOwnedPermissions(@Req() req: any) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_GET_OWNED, { userId: req.user.userId });
  }

  @Get('pages/:pageId/actions')
  @ApiOperation({ summary: 'Get page ACTION permissions' })
  getPageActions(@Param('pageId') pageId: string) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_GET_PAGE_ACTIONS, { pageId });
  }

  @Get('users/:userId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiQuery({ name: 'type', required: false })
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number, @Query('type') type?: string) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_GET_USER_PERMISSIONS, { userId, type });
  }

  @Put('users/:userId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update user permissions' })
  updateUserPermissions(@Param('userId', ParseIntPipe) userId: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_UPDATE_USER_PERMISSIONS, { userId, dto });
  }

  @Get('groups/:groupId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get group permissions' })
  @ApiQuery({ name: 'type', required: false })
  getGroupPermissions(@Param('groupId', ParseIntPipe) groupId: number, @Query('type') type?: string) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_GET_GROUP_PERMISSIONS, { groupId, type });
  }

  @Put('groups/:groupId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update group permissions' })
  updateGroupPermissions(@Param('groupId', ParseIntPipe) groupId: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_UPDATE_GROUP_PERMISSIONS, { groupId, dto });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_FIND_BY_ID, { id });
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update permission' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_UPDATE, { id, dto });
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Delete permission (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.PERMISSION_DELETE, { id });
  }
}

// ========== Menus Proxy ==========
@Controller('msl/menus')
@ApiTags('Menus')
@ApiBearerAuth()
export class MenusProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Create menu' })
  create(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.MENU_CREATE, { dto });
  }

  @Get()
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get all menus (admin)' })
  findAll() {
    return this.coreClient.send(CORE_PATTERNS.MENU_FIND_ALL, {});
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get menu tree by user permissions' })
  @ApiQuery({ name: 'locale', required: false, description: 'Locale (ko, en, ja, zh-CN)' })
  getMenuTree(@Req() req: any, @Query('locale') locale?: string) {
    return this.coreClient.send(CORE_PATTERNS.MENU_GET_TREE_BY_USER, { userId: req.user.userId, locale });
  }

  @Get('tree/all')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get full menu tree (admin)' })
  @ApiQuery({ name: 'locale', required: false })
  getFullMenuTree(@Query('locale') locale?: string) {
    return this.coreClient.send(CORE_PATTERNS.MENU_GET_TREE, { locale });
  }

  @Post('favorite')
  @ApiOperation({ summary: 'Toggle menu favorite' })
  toggleFavorite(@Req() req: any, @Body() dto: { menuId: number }) {
    return this.coreClient.send(CORE_PATTERNS.MENU_TOGGLE_FAVORITE, { userId: req.user.userId, menuId: dto.menuId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.MENU_FIND_BY_ID, { id });
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Update menu' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.MENU_UPDATE, { id, dto });
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Delete menu (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.MENU_DELETE, { id });
  }

  @Post(':id/translations')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Upsert menu translation' })
  upsertTranslation(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.MENU_UPSERT_TRANSLATION, { menuId: id, dto });
  }

  @Delete(':id/translations/:locale')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Delete menu translation' })
  deleteTranslation(@Param('id', ParseIntPipe) id: number, @Param('locale') locale: string) {
    return this.coreClient.send(CORE_PATTERNS.MENU_DELETE_TRANSLATION, { menuId: id, locale });
  }
}

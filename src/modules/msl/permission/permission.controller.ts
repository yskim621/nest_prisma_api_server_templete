import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto, UpdateUserPermissionsDto, PermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('permissions')
@ApiTags('Permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '권한 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '권한 생성 성공' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '모든 권한 조회' })
  @ApiQuery({ name: 'type', required: false, description: '권한 타입 필터 (MASTER, MANAGER, MENU, ACTION)' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: [PermissionDto] })
  async findAll(@Query('type') type?: string) {
    return this.permissionService.findAll(type);
  }

  @Get('owned')
  @ApiOperation({ summary: '현재 사용자의 보유 권한 조회 (사용자 직접 + 그룹 상속)' })
  async getOwnedPermissions(@Req() req: Request) {
    return this.permissionService.getOwnedPermissions(req.user?.userId);
  }

  @Get('pages/:pageId/actions')
  @ApiOperation({ summary: '페이지별 ACTION 권한 조회' })
  async getPageActions(@Param('pageId') pageId: string) {
    return this.permissionService.getPageActionPermissions(pageId);
  }

  @Get('users/:userId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '사용자별 권한 조회' })
  @ApiQuery({ name: 'type', required: false })
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number, @Query('type') type?: string) {
    return this.permissionService.getUserPermissions(userId, type);
  }

  @Put('users/:userId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '사용자 권한 수정' })
  async updateUserPermissions(@Param('userId', ParseIntPipe) userId: number, @Body() dto: UpdateUserPermissionsDto) {
    return this.permissionService.updateUserPermissions(userId, dto);
  }

  @Get('groups/:groupId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '그룹별 권한 조회' })
  @ApiQuery({ name: 'type', required: false })
  async getGroupPermissions(@Param('groupId', ParseIntPipe) groupId: number, @Query('type') type?: string) {
    return this.permissionService.getGroupPermissions(groupId, type);
  }

  @Put('groups/:groupId')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '그룹 권한 수정' })
  async updateGroupPermissions(@Param('groupId', ParseIntPipe) groupId: number, @Body() dto: UpdateUserPermissionsDto) {
    return this.permissionService.updateGroupPermissions(groupId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '권한 상세 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: PermissionDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '권한 수정' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '권한 삭제 (소프트 삭제)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}

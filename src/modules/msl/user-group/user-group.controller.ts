import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto, UpdateUserGroupDto, UpdateGroupPermissionsDto, UserGroupDto } from './dto/user-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('user-groups')
@ApiTags('User Groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @Post()
  @Roles('ROLE_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 그룹 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '그룹 생성 성공' })
  async create(@Body() dto: CreateUserGroupDto) {
    return this.userGroupService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '모든 사용자 그룹 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: [UserGroupDto] })
  async findAll() {
    return this.userGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 그룹 상세 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: UserGroupDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupService.findOne(id);
  }

  @Put(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '사용자 그룹 수정' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserGroupDto) {
    return this.userGroupService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '사용자 그룹 삭제 (소프트 삭제)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupService.remove(id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '그룹 권한 조회' })
  async getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupService.getGroupPermissions(id);
  }

  @Put(':id/permissions')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '그룹 권한 수정' })
  async updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGroupPermissionsDto) {
    return this.userGroupService.updateGroupPermissions(id, dto);
  }

  @Get(':id/users')
  @ApiOperation({ summary: '그룹에 속한 사용자 목록 조회' })
  async getUsers(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupService.getGroupUsers(id);
  }
}

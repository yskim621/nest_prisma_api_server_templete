import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PermissionType } from '../../auth/auth.enum';

export class PermissionDto {
  @ApiProperty({ description: 'Permission ID' })
  id: number;

  @ApiProperty({ description: '리소스 식별자' })
  resource: string;

  @ApiProperty({ description: '설명' })
  description?: string;

  @ApiProperty({ description: '권한 타입', enum: PermissionType })
  type: string;

  @ApiProperty({ description: '연결된 메뉴 ID', required: false })
  menuId?: number;

  @ApiProperty({ description: '연결된 페이지 ID', required: false })
  pageId?: string;
}

export class CreatePermissionDto {
  @ApiProperty({ description: '리소스 식별자', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  resource: string;

  @ApiProperty({ description: '설명', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: '권한 타입', enum: PermissionType })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiProperty({ description: '연결된 메뉴 ID', required: false })
  @IsOptional()
  @IsInt()
  menuId?: number;

  @ApiProperty({ description: '연결된 페이지 ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pageId?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class UpdateUserPermissionsDto {
  @ApiProperty({ description: '권한 ID 목록', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

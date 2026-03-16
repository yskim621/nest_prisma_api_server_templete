import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PermissionType } from '@app/auth';

export class PermissionDto {
  @ApiProperty({ description: 'Permission ID' })
  id: number;

  @ApiProperty({ description: 'Resource identifier' })
  resource: string;

  @ApiProperty({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Permission type', enum: PermissionType })
  type: string;

  @ApiProperty({ description: 'Connected menu ID', required: false })
  menuId?: number;

  @ApiProperty({ description: 'Connected page ID', required: false })
  pageId?: string;
}

export class CreatePermissionDto {
  @ApiProperty({ description: 'Resource identifier', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  resource: string;

  @ApiProperty({ description: 'Description', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: 'Permission type', enum: PermissionType })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiProperty({ description: 'Connected menu ID', required: false })
  @IsOptional()
  @IsInt()
  menuId?: number;

  @ApiProperty({ description: 'Connected page ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pageId?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class UpdateUserPermissionsDto {
  @ApiProperty({ description: 'Permission ID list', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

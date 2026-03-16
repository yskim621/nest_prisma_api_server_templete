import { IsArray, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UserGroupDto {
  @ApiProperty({ description: 'Group ID' })
  id: number;

  @ApiProperty({ description: 'Group name' })
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}

export class CreateUserGroupDto {
  @ApiProperty({ description: 'Group name', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Description', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {}

export class UpdateGroupPermissionsDto {
  @ApiProperty({ description: 'Permission ID list', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

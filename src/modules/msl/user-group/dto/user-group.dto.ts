import { IsArray, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UserGroupDto {
  @ApiProperty({ description: 'Group ID' })
  id: number;

  @ApiProperty({ description: '그룹명' })
  name: string;

  @ApiProperty({ description: '설명', required: false })
  description?: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class CreateUserGroupDto {
  @ApiProperty({ description: '그룹명', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '설명', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {}

export class UpdateGroupPermissionsDto {
  @ApiProperty({ description: '권한 ID 목록', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

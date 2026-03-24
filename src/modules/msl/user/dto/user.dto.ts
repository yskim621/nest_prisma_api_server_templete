import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { AccountStatus } from '../user.enum';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: '사용자 역할 (ROLE_USER, ROLE_ADMIN)' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ required: false, description: '사용자 그룹 ID' })
  @IsOptional()
  @IsInt()
  userGroupId?: number;

  @ApiProperty()
  @IsEnum(AccountStatus, { message: 'Invalid account status' })
  accountStatus: AccountStatus;

  @ApiProperty({ description: 'Created DateTime' })
  createdAt: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['id', 'createdAt'] as const) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

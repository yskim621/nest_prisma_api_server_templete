import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
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

  @ApiProperty()
  @IsEnum(AccountStatus, { message: 'Invalid account status' })
  accountStatus: AccountStatus;

  @ApiProperty({ description: 'Created DateTime' })
  createdAt: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['id', 'createdAt'] as const) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

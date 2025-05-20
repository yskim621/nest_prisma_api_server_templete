import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UserDto {
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
  @IsString()
  accountStatus: accountStatus;
}

export class CreateUserDto {
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
  @IsString()
  accountStatus: accountStatus;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

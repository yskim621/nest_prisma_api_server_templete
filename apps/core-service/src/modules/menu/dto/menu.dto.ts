import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { MenuType } from '@app/auth';

export class MenuDto {
  @ApiProperty({ description: 'Menu ID' })
  id: number;

  @ApiProperty({ description: 'Page ID', required: false })
  pageId?: string;

  @ApiProperty({ description: 'Menu type', enum: MenuType })
  type: string;

  @ApiProperty({ description: 'Depth' })
  depth: number;

  @ApiProperty({ description: 'Parent menu ID', required: false })
  parentMenuId?: number;

  @ApiProperty({ description: 'Menu name' })
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @ApiProperty({ description: 'Sort order' })
  menuOrder: number;
}

export class CreateMenuDto {
  @ApiProperty({ description: 'Page ID', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pageId?: string;

  @ApiProperty({ description: 'Menu type', enum: MenuType })
  @IsEnum(MenuType)
  type: MenuType;

  @ApiProperty({ description: 'Depth', required: false })
  @IsOptional()
  @IsInt()
  depth?: number;

  @ApiProperty({ description: 'Parent menu ID', required: false })
  @IsOptional()
  @IsInt()
  parentMenuId?: number;

  @ApiProperty({ description: 'Menu name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsInt()
  menuOrder?: number;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}

export class CreateMenuTranslationDto {
  @ApiProperty({ description: 'Locale (ko, en, ja, zh-CN)' })
  @IsString()
  @MaxLength(10)
  locale: string;

  @ApiProperty({ description: 'Translated menu name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Translated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class ToggleFavoriteDto {
  @ApiProperty({ description: 'Menu ID' })
  @IsInt()
  menuId: number;
}

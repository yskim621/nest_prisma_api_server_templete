import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { MenuType } from '../menu.enum';

export class MenuDto {
  @ApiProperty({ description: 'Menu ID' })
  id: number;

  @ApiProperty({ description: '페이지 ID', required: false })
  pageId?: string;

  @ApiProperty({ description: '메뉴 타입', enum: MenuType })
  type: string;

  @ApiProperty({ description: '깊이' })
  depth: number;

  @ApiProperty({ description: '상위 메뉴 ID', required: false })
  parentMenuId?: number;

  @ApiProperty({ description: '메뉴명' })
  name: string;

  @ApiProperty({ description: '설명', required: false })
  description?: string;

  @ApiProperty({ description: '정렬 순서' })
  menuOrder: number;
}

export class CreateMenuDto {
  @ApiProperty({ description: '페이지 ID', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pageId?: string;

  @ApiProperty({ description: '메뉴 타입', enum: MenuType })
  @IsEnum(MenuType)
  type: MenuType;

  @ApiProperty({ description: '깊이', required: false })
  @IsOptional()
  @IsInt()
  depth?: number;

  @ApiProperty({ description: '상위 메뉴 ID', required: false })
  @IsOptional()
  @IsInt()
  parentMenuId?: number;

  @ApiProperty({ description: '메뉴명', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '설명', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: '정렬 순서', required: false })
  @IsOptional()
  @IsInt()
  menuOrder?: number;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}

export class CreateMenuTranslationDto {
  @ApiProperty({ description: '로케일 (ko, en, ja, zh-CN)' })
  @IsString()
  @MaxLength(10)
  locale: string;

  @ApiProperty({ description: '번역된 메뉴명' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '번역된 설명', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class ToggleFavoriteDto {
  @ApiProperty({ description: '메뉴 ID' })
  @IsInt()
  menuId: number;
}

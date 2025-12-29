import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, IsObject, IsUrl, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';

export class CreateMenuDto {
  @IsString()
  menuGroup: string;

  @IsEnum(MenuType)
  type: MenuType;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsEnum(MenuTarget)
  target: MenuTarget;

  @IsNumber()
  position: number;

  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  borderColor?: string;

  @IsOptional()
  @IsString()
  borderWidth?: string;

  @IsOptional()
  @IsString()
  paddingTop?: string;

  @IsOptional()
  @IsString()
  paddingBottom?: string;

  @IsObject()
  config: Record<string, unknown>;

  @IsBoolean()
  isMegaMenu: boolean;

  @IsOptional()
  @IsNumber()
  megaMenuColumns?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsObject()
  translations: Record<string, CreateMenuTranslationDto>;
}

export class CreateMenuTranslationDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  menuGroup?: string;

  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsEnum(MenuTarget)
  target?: MenuTarget;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  borderColor?: string;

  @IsOptional()
  @IsString()
  borderWidth?: string;

  @IsOptional()
  @IsString()
  paddingTop?: string;

  @IsOptional()
  @IsString()
  paddingBottom?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isMegaMenu?: boolean;

  @IsOptional()
  @IsNumber()
  megaMenuColumns?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, CreateMenuTranslationDto>;
}

export class ReorderMenuDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsNumber()
  @Type(() => Number)
  position: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

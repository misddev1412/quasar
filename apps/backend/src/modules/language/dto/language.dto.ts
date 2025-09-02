import { IsString, IsBoolean, IsOptional, IsNotEmpty, Length, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  @Transform(({ value }) => value?.toLowerCase())
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nativeName: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateLanguageDto {
  @IsString()
  @IsOptional()
  @Length(2, 10)
  @Transform(({ value }) => value?.toLowerCase())
  code?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nativeName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class LanguageFiltersDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isActive?: boolean;
}

export class SetDefaultLanguageDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UpdateSortOrdersDto {
  updates: Array<{
    id: string;
    sortOrder: number;
  }>;
}
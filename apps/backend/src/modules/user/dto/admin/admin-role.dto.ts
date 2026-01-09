import { IsString, IsBoolean, IsOptional, MinLength, IsArray, IsUUID, IsEnum } from 'class-validator';
import { UserRole } from '@shared';

export class AdminCreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  code?: UserRole;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}

export class AdminUpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  code?: UserRole;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}

export class AdminRoleResponseDto {
  id: string;
  name: string;
  code: UserRole; // UserRole enum value
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  permissions?: {
    id: string;
    name: string;
    resource: string;
    action: string;
    scope: string;
    description?: string;
  }[];
  permissionCount?: number;
  userCount?: number;
}

export class AdminRoleFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

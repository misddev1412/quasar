import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { PermissionAction, PermissionScope, UserRole, PaginatedResponseDto } from '@shared';

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  description?: string;
  attributes?: string[];
}

export interface UpdatePermissionDto {
  name?: string;
  resource?: string;
  action?: PermissionAction;
  scope?: PermissionScope;
  description?: string;
  attributes?: string[];
  isActive?: boolean;
}

export interface CreateRolePermissionDto {
  roleId: string;
  permissionId: string;
}

export interface PermissionFilter {
  resource?: string;
  action?: PermissionAction;
  scope?: PermissionScope;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  disablePagination?: boolean;
}

export interface IPermissionRepository {
  // Permission CRUD
  createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission>;
  findAllPermissions(filter?: PermissionFilter): Promise<Permission[]>;
  findAllPermissionsWithPagination(filter?: PermissionFilter): Promise<PaginatedResponseDto<Permission>>;
  findPermissionById(id: string): Promise<Permission | null>;
  findPermissionByName(name: string): Promise<Permission | null>;
  updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null>;
  deletePermission(id: string): Promise<boolean>;

  // Role Permission management
  assignPermissionToRole(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean>;
  findPermissionsByRole(roleId: string): Promise<Permission[]>;
  findPermissionsByRoleIds(roleIds: string[]): Promise<Permission[]>;
  findRolePermissions(roleId: string): Promise<RolePermission[]>;
  
  // Permission checking
  hasPermission(roleId: string, resource: string, action: PermissionAction, scope: PermissionScope): Promise<boolean>;
  getPermission(roleId: string, resource: string, action: PermissionAction, scope: PermissionScope): Promise<Permission | null>;
} 

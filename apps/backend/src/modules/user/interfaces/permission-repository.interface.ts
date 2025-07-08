import { Permission, PermissionAction, PermissionScope } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRole } from '../entities/user.entity';

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
  role: UserRole;
  permissionId: string;
}

export interface PermissionFilter {
  resource?: string;
  action?: PermissionAction;
  scope?: PermissionScope;
  isActive?: boolean;
}

export interface IPermissionRepository {
  // Permission CRUD
  createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission>;
  findAllPermissions(filter?: PermissionFilter): Promise<Permission[]>;
  findPermissionById(id: string): Promise<Permission | null>;
  findPermissionByName(name: string): Promise<Permission | null>;
  updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null>;
  deletePermission(id: string): Promise<boolean>;

  // Role Permission management
  assignPermissionToRole(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission>;
  removePermissionFromRole(role: UserRole, permissionId: string): Promise<boolean>;
  findPermissionsByRole(role: UserRole): Promise<Permission[]>;
  findRolePermissions(role: UserRole): Promise<RolePermission[]>;
  
  // Permission checking
  hasPermission(role: UserRole, resource: string, action: PermissionAction, scope: PermissionScope): Promise<boolean>;
  getPermission(role: UserRole, resource: string, action: PermissionAction, scope: PermissionScope): Promise<Permission | null>;
} 
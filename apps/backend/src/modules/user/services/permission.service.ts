import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { PermissionAction, PermissionScope, UserRole } from '@quasar/shared';
import { 
  CreatePermissionDto, 
  UpdatePermissionDto,
  CreateRolePermissionDto,
  PermissionFilter
} from '../interfaces/permission-repository.interface';

export interface PermissionCheck {
  granted: boolean;
  permission?: Permission;
  attributes: string[];
}

export interface PermissionGrant {
  role: UserRole;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  attributes?: string[];
}

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
  ) {}

  // Permission CRUD operations
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findPermissionByName(createPermissionDto.name);
    if (existingPermission) {
      throw new ConflictException(`Permission with name '${createPermissionDto.name}' already exists`);
    }

    return await this.permissionRepository.createPermission(createPermissionDto);
  }

  async getAllPermissions(filter?: PermissionFilter): Promise<Permission[]> {
    return await this.permissionRepository.findAllPermissions(filter);
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.getPermissionById(id);
    
    // Check if name is being changed and if new name already exists
    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findPermissionByName(updatePermissionDto.name);
      if (existingPermission) {
        throw new ConflictException(`Permission with name '${updatePermissionDto.name}' already exists`);
      }
    }

    const updatedPermission = await this.permissionRepository.updatePermission(id, updatePermissionDto);
    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }
    return updatedPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.getPermissionById(id);
    const deleted = await this.permissionRepository.deletePermission(id);
    if (!deleted) {
      throw new NotFoundException('Permission not found');
    }
  }

  // Role Permission management
  async assignPermissionToRole(role: UserRole, permissionId: string): Promise<RolePermission> {
    const permission = await this.getPermissionById(permissionId);
    
    const createRolePermissionDto: CreateRolePermissionDto = {
      role,
      permissionId
    };

    return await this.permissionRepository.assignPermissionToRole(createRolePermissionDto);
  }

  async removePermissionFromRole(role: UserRole, permissionId: string): Promise<void> {
    const removed = await this.permissionRepository.removePermissionFromRole(role, permissionId);
    if (!removed) {
      throw new NotFoundException('Role permission assignment not found');
    }
  }

  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    return await this.permissionRepository.findPermissionsByRole(role);
  }

  // Permission checking (AccessControl-style API)
  can(role: UserRole): PermissionChecker {
    return new PermissionChecker(role, this.permissionRepository);
  }

  // Grant permissions in AccessControl style
  async grant(grants: PermissionGrant[]): Promise<void> {
    for (const grant of grants) {
      // Create permission if it doesn't exist
      const permissionName = `${grant.action}:${grant.scope}:${grant.resource}`;
      let permission = await this.permissionRepository.findPermissionByName(permissionName);
      
      if (!permission) {
        const createPermissionDto: CreatePermissionDto = {
          name: permissionName,
          resource: grant.resource,
          action: grant.action,
          scope: grant.scope,
          attributes: grant.attributes || ['*'],
        };
        permission = await this.permissionRepository.createPermission(createPermissionDto);
      }

      // Assign permission to role
      await this.permissionRepository.assignPermissionToRole({
        role: grant.role,
        permissionId: permission.id
      });
    }
  }

  // Filter data based on permission attributes
  filterAttributes(data: any, attributes: string[]): any {
    if (!data || !attributes || attributes.includes('*')) {
      return data;
    }

    const result = { ...data };
    const deniedAttributes = attributes.filter(attr => attr.startsWith('!'));
    
    for (const denied of deniedAttributes) {
      const field = denied.substring(1); // Remove '!' prefix
      if (field.includes('.')) {
        // Handle nested attributes like '!record.id'
        const parts = field.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]]) {
            current = current[parts[i]];
          }
        }
        if (current) {
          delete current[parts[parts.length - 1]];
        }
      } else {
        delete result[field];
      }
    }

    return result;
  }
}

// AccessControl-style permission checker
export class PermissionChecker {
  constructor(
    private readonly role: UserRole,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async createOwn(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.CREATE, PermissionScope.OWN);
  }

  async createAny(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.CREATE, PermissionScope.ANY);
  }

  async readOwn(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.READ, PermissionScope.OWN);
  }

  async readAny(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.READ, PermissionScope.ANY);
  }

  async updateOwn(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.UPDATE, PermissionScope.OWN);
  }

  async updateAny(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.UPDATE, PermissionScope.ANY);
  }

  async deleteOwn(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.DELETE, PermissionScope.OWN);
  }

  async deleteAny(resource: string): Promise<PermissionCheck> {
    return this.checkPermission(resource, PermissionAction.DELETE, PermissionScope.ANY);
  }

  private async checkPermission(
    resource: string, 
    action: PermissionAction, 
    scope: PermissionScope
  ): Promise<PermissionCheck> {
    const permission = await this.permissionRepository.getPermission(this.role, resource, action, scope);
    
    return {
      granted: permission !== null,
      permission: permission || undefined,
      attributes: permission?.attributes || []
    };
  }
} 
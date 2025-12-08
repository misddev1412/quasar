import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRepository } from '../../user/repositories/permission.repository';
import { Permission } from '../../user/entities/permission.entity';
import { Role } from '../../user/entities/role.entity';
import { PermissionAction, PermissionScope, UserRole } from '@shared';

export interface PermissionCheck {
  granted: boolean;
  permission?: Permission;
  attributes: string[];
}

@Injectable()
export class PermissionCheckerService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Convert UserRole enum to Role entity ID
   */
  private async getRoleIdByCode(roleCode: UserRole): Promise<string> {
    const role = await this.roleRepository.findOne({
      where: { code: roleCode }
    });
    
    if (!role) {
      throw new NotFoundException(`Role with code '${roleCode}' not found`);
    }
    
    return role.id;
  }

  // Permission checking (AccessControl-style API)
  can(role: UserRole): PermissionChecker {
    return new PermissionChecker(role, this.permissionRepository, this.roleRepository);
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
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Convert UserRole enum to Role entity ID
   */
  private async getRoleIdByCode(roleCode: UserRole): Promise<string> {
    const role = await this.roleRepository.findOne({
      where: { code: roleCode }
    });
    
    if (!role) {
      throw new NotFoundException(`Role with code '${roleCode}' not found`);
    }
    
    return role.id;
  }

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
    const roleId = await this.getRoleIdByCode(this.role);
    const permission = await this.permissionRepository.getPermission(roleId, resource, action, scope);
    
    return {
      granted: permission !== null,
      permission: permission || undefined,
      attributes: permission?.attributes || []
    };
  }
} 
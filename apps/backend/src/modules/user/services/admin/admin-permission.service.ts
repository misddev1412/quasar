import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRepository } from '../../repositories/permission.repository';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { Role } from '../../entities/role.entity';
import { PermissionAction, PermissionScope, UserRole, PaginatedResponseDto } from '@shared';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRolePermissionDto,
  PermissionFilter
} from '../../interfaces/permission-repository.interface';
import { PermissionCheckerService, PermissionCheck } from '@backend/modules/shared/services/permission-checker.service';

export interface PermissionGrant {
  role: UserRole;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  attributes?: string[];
}

@Injectable()
export class AdminPermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionChecker: PermissionCheckerService,
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

  /**
   * Convert Role entity ID back to UserRole enum
   */
  private async getRoleCodeById(roleId: string): Promise<UserRole> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }
    
    return role.code as UserRole;
  }

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

  async getAllPermissionsWithPagination(filter?: PermissionFilter): Promise<PaginatedResponseDto<Permission>> {
    return await this.permissionRepository.findAllPermissionsWithPagination(filter);
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
    const roleId = await this.getRoleIdByCode(role);
    
    const createRolePermissionDto: CreateRolePermissionDto = {
      roleId,
      permissionId
    };

    return await this.permissionRepository.assignPermissionToRole(createRolePermissionDto);
  }

  async removePermissionFromRole(role: UserRole, permissionId: string): Promise<void> {
    const roleId = await this.getRoleIdByCode(role);
    const removed = await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
    if (!removed) {
      throw new NotFoundException('Role permission assignment not found');
    }
  }

  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    const roleId = await this.getRoleIdByCode(role);
    return await this.permissionRepository.findPermissionsByRole(roleId);
  }

  // Permission checking (AccessControl-style API)
  can(role: UserRole) {
    return this.permissionChecker.can(role);
  }

  // Grant permissions in AccessControl style
  async grant(grants: PermissionGrant[]): Promise<void> {
    for (const grant of grants) {
      try {
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

        // Get role ID from UserRole enum
        const roleId = await this.getRoleIdByCode(grant.role);

        // Assign permission to role
        await this.permissionRepository.assignPermissionToRole({
          roleId,
          permissionId: permission.id
        });

      } catch (error) {
        // Log but don't fail if permission already exists
        if (!(error instanceof ConflictException)) {
          console.error(`   ❌ Failed to grant permission to role '${grant.role}':`, error.message);
          throw error;
        }
      }
    }
  }

  // Filter data based on permission attributes
  filterAttributes(data: any, attributes: string[]): any {
    return this.permissionChecker.filterAttributes(data, attributes);
  }
} 

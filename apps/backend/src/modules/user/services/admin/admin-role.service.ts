import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository, RoleWithCounts } from '../../repositories/role.repository';
import { PermissionRepository } from '../../repositories/permission.repository';
import { UserRepository } from '../../repositories/user.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Role } from '../../entities/role.entity';
import { ApiStatusCodes, UserRole } from '@shared';
import {
  AdminCreateRoleDto,
  AdminUpdateRoleDto,
  AdminRoleResponseDto,
  AdminRoleFiltersDto
} from '../../dto/admin/admin-role.dto';
import { PaginatedDto } from '@shared/classes/pagination.dto';

export interface AdminRoleFilters extends AdminRoleFiltersDto {
  page: number;
  limit: number;
}

export interface UserSearchFilters {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class AdminRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRepository: UserRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  /**
   * Get all roles with filtering and pagination
   */
  async getAllRoles(filters: AdminRoleFilters): Promise<PaginatedDto<AdminRoleResponseDto>> {
    const { roles, total } = await this.roleRepository.findAllWithFilters(filters);

    const roleResponses = roles.map(role => this.toAdminRoleResponse(role));

    return {
      items: roleResponses,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit)
    };
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<AdminRoleResponseDto> {
    const role = await this.roleRepository.findByIdWithPermissions(id);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    return this.toAdminRoleResponse(role);
  }

  /**
   * Create a new role
   */
  async createRole(createRoleDto: AdminCreateRoleDto): Promise<AdminRoleResponseDto> {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existingRole) {
      throw this.responseHandler.createError(
        ApiStatusCodes.CONFLICT,
        'Role with this name already exists',
        'CONFLICT'
      );
    }

    try {
      // Create the role
      const roleData = {
        name: createRoleDto.name,
        description: createRoleDto.description,
        isActive: createRoleDto.isActive ?? true,
        isDefault: createRoleDto.isDefault ?? false,
        // Generate a unique code based on name (simplified approach)
        code: this.generateRoleCode(createRoleDto.name)
      };

      const role = await this.roleRepository.save(roleData);

      // Assign permissions if provided
      if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
        await this.assignPermissionsToRole(role.id, createRoleDto.permissionIds);
      }

      // Fetch the role with permissions
      const roleWithPermissions = await this.roleRepository.findByIdWithPermissions(role.id);
      return this.toAdminRoleResponse(roleWithPermissions || role);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(id: string, updateRoleDto: AdminUpdateRoleDto): Promise<AdminRoleResponseDto> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    // Check if name is being changed and if it conflicts
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const nameExists = await this.roleRepository.existsByName(updateRoleDto.name, id);
      if (nameExists) {
        throw this.responseHandler.createError(
          ApiStatusCodes.CONFLICT,
          'Role with this name already exists',
          'CONFLICT'
        );
      }
    }

    try {
      // Update role basic information
      const updateData: Partial<Role> = {};
      if (updateRoleDto.name !== undefined) updateData.name = updateRoleDto.name;
      if (updateRoleDto.description !== undefined) updateData.description = updateRoleDto.description;
      if (updateRoleDto.isActive !== undefined) updateData.isActive = updateRoleDto.isActive;
      if (updateRoleDto.isDefault !== undefined) updateData.isDefault = updateRoleDto.isDefault;

      const updatedRole = await this.roleRepository.update(id, updateData);
      if (!updatedRole) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'Role not found',
          'NOT_FOUND'
        );
      }

      // Update permissions if provided
      if (updateRoleDto.permissionIds !== undefined) {
        await this.updateRolePermissions(id, updateRoleDto.permissionIds);
      }

      // Fetch the updated role with permissions
      const roleWithPermissions = await this.roleRepository.findByIdWithPermissions(id);
      return this.toAdminRoleResponse(roleWithPermissions || updatedRole);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to update role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    // Check if role is default - prevent deletion of default roles
    if (role.isDefault) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Cannot delete default role',
        'BAD_REQUEST'
      );
    }

    // Check if role is assigned to users - prevent deletion if users are assigned
    const userCount = await this.getUserCountForRole(id);
    if (userCount > 0) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        `Cannot delete role. It is currently assigned to ${userCount} user(s). Please remove all users from this role before deleting it.`,
        'ROLE_HAS_USERS'
      );
    }

    try {
      const deleted = await this.roleRepository.delete(id);
      if (!deleted) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'Role not found',
          'NOT_FOUND'
        );
      }
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to delete role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Get all available permissions
   */
  async getAvailablePermissions(): Promise<any[]> {
    const permissions = await this.permissionRepository.findAllPermissions({ isActive: true });
    return permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      description: permission.description
    }));
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics(): Promise<any> {
    return await this.roleRepository.getRoleStatistics();
  }

  /**
   * Toggle role status (active/inactive)
   */
  async toggleRoleStatus(id: string): Promise<AdminRoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    try {
      const updatedRole = await this.roleRepository.update(id, { 
        isActive: !role.isActive 
      });
      
      if (!updatedRole) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'Role not found',
          'NOT_FOUND'
        );
      }

      return this.toAdminRoleResponse(updatedRole);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to toggle role status',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Duplicate an existing role
   */
  async duplicateRole(id: string, newName?: string): Promise<AdminRoleResponseDto> {
    const sourceRole = await this.roleRepository.findByIdWithPermissions(id);
    if (!sourceRole) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    const duplicateName = newName || `${sourceRole.name} (Copy)`;
    
    // Check if the new name already exists
    const existingRole = await this.roleRepository.findByName(duplicateName);
    if (existingRole) {
      throw this.responseHandler.createError(
        ApiStatusCodes.CONFLICT,
        'Role with this name already exists',
        'CONFLICT'
      );
    }

    try {
      // Create the duplicated role
      const roleData = {
        name: duplicateName,
        description: sourceRole.description ? `${sourceRole.description} (Copy)` : undefined,
        isActive: sourceRole.isActive,
        isDefault: false, // Duplicated roles should never be default
        code: this.generateRoleCode(duplicateName)
      };

      const duplicatedRole = await this.roleRepository.save(roleData);

      // Copy permissions if the source role has any
      if (sourceRole.rolePermissions && sourceRole.rolePermissions.length > 0) {
        const permissionIds = sourceRole.rolePermissions
          .filter(rp => rp.isActive && rp.permission)
          .map(rp => rp.permission.id);
        
        if (permissionIds.length > 0) {
          await this.assignPermissionsToRole(duplicatedRole.id, permissionIds);
        }
      }

      // Fetch the duplicated role with permissions
      const roleWithPermissions = await this.roleRepository.findByIdWithPermissions(duplicatedRole.id);
      return this.toAdminRoleResponse(roleWithPermissions || duplicatedRole);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to duplicate role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Quick add permissions to a role
   */
  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<AdminRoleResponseDto> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    // Validate that all permissions exist and are active
    const permissions = await this.permissionRepository.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'One or more permissions not found',
        'BAD_REQUEST'
      );
    }

    try {
      // Get current role permissions to avoid duplicates
      const currentPermissions = await this.permissionRepository.findRolePermissions(roleId);
      const currentPermissionIds = currentPermissions.map(rp => rp.permissionId);
      
      // Filter out permissions that are already assigned
      const newPermissionIds = permissionIds.filter(id => !currentPermissionIds.includes(id));
      
      if (newPermissionIds.length > 0) {
        await this.assignPermissionsToRole(roleId, newPermissionIds);
      }

      // Fetch the updated role with permissions
      const roleWithPermissions = await this.roleRepository.findByIdWithPermissions(roleId);
      return this.toAdminRoleResponse(roleWithPermissions || role);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to add permissions to role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Search users available to be added to a role (users not currently assigned to this role)
   */
  async searchUsersForRole(roleId: string, filters: UserSearchFilters): Promise<PaginatedDto<any>> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    try {
      // Get users that don't have this specific role
      const result = await this.userRepository.findUsersNotInRole(roleId, filters);
      
      const userResponses = result.items.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username,
        isActive: user.isActive,
        createdAt: user.createdAt
      }));

      return {
        items: userResponses,
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit)
      };
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to search users for role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Add multiple users to a role
   */
  async addUsersToRole(roleId: string, userIds: string[]): Promise<{ addedCount: number; skippedCount: number }> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Role not found',
        'NOT_FOUND'
      );
    }

    // Validate that all users exist and are active
    const users = await this.userRepository.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'One or more users not found',
        'BAD_REQUEST'
      );
    }

    try {
      let addedCount = 0;
      let skippedCount = 0;

      for (const userId of userIds) {
        try {
          // Check if user already has this role
          const userWithRole = await this.userRepository.findByIdWithRoles(userId);
          const hasRole = userWithRole?.userRoles?.some(ur => ur.roleId === roleId && ur.isActive);
          
          if (!hasRole) {
            await this.userRepository.assignRoleToUser(userId, roleId);
            addedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.warn(`Failed to assign role ${roleId} to user ${userId}:`, error.message);
          skippedCount++;
        }
      }

      return { addedCount, skippedCount };
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to add users to role',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  /**
   * Get the count of users assigned to a specific role
   */
  private async getUserCountForRole(roleId: string): Promise<number> {
    try {
      return await this.userRepository.getUserCountByRole(roleId);
    } catch (error) {
      console.warn(`Failed to get user count for role ${roleId}:`, error.message);
      return 0; // Return 0 if we can't determine the count - err on the side of caution
    }
  }

  /**
   * Private helper methods
   */
  private async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    for (const permissionId of permissionIds) {
      try {
        await this.permissionRepository.assignPermissionToRole({
          roleId,
          permissionId
        });
      } catch (error) {
        // Log error but continue with other permissions
        console.warn(`Failed to assign permission ${permissionId} to role ${roleId}:`, error.message);
      }
    }
  }

  private async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Get current role permissions
    const currentPermissions = await this.permissionRepository.findRolePermissions(roleId);
    const currentPermissionIds = currentPermissions.map(rp => rp.permissionId);

    // Remove permissions that are no longer needed
    const permissionsToRemove = currentPermissionIds.filter(id => !permissionIds.includes(id));
    for (const permissionId of permissionsToRemove) {
      try {
        await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
      } catch (error) {
        console.warn(`Failed to remove permission ${permissionId} from role ${roleId}:`, error.message);
      }
    }

    // Add new permissions
    const permissionsToAdd = permissionIds.filter(id => !currentPermissionIds.includes(id));
    await this.assignPermissionsToRole(roleId, permissionsToAdd);
  }

  private generateRoleCode(name: string): UserRole {
    // This is a simplified approach - in a real application, you might want
    // to have a more sophisticated mapping or allow custom codes
    const normalizedName = name.toUpperCase().replace(/\s+/g, '_');

    // Map to existing UserRole enum values or default to USER
    switch (normalizedName) {
      case 'SUPER_ADMIN':
      case 'SUPERADMIN':
        return UserRole.SUPER_ADMIN;
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return UserRole.ADMIN;
      case 'MANAGER':
        return UserRole.MANAGER;
      case 'GUEST':
        return UserRole.GUEST;
      default:
        return UserRole.USER;
    }
  }

  private toAdminRoleResponse(role: Role | RoleWithCounts): AdminRoleResponseDto {
    const response: AdminRoleResponseDto = {
      id: role.id,
      name: role.name,
      code: role.code, // Include the UserRole enum value
      description: role.description,
      isActive: role.isActive,
      isDefault: role.isDefault,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      version: role.version,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy
    };

    // Add permission count if available
    if ('permissionCount' in role) {
      response.permissionCount = role.permissionCount;
      response.userCount = role.userCount;
    }

    // Add permissions if loaded
    if (role.rolePermissions && role.rolePermissions.length > 0) {
      response.permissions = role.rolePermissions
        .filter(rp => rp.permission && rp.isActive)
        .map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action,
          scope: rp.permission.scope,
          description: rp.permission.description
        }));
      response.permissionCount = response.permissions.length;
    }

    return response;
  }
}
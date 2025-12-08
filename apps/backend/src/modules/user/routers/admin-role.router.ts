import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, Input, UseMiddlewares } from 'nestjs-trpc';
import { AdminRoleService } from '../services/admin/admin-role.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { z } from 'zod';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { RequirePermission } from '../../../trpc/middlewares/permission.middleware';
import { PermissionAction, PermissionScope } from '@shared';

// Create permission middleware classes at module level so they can be registered as providers
const requireReadAnyRole = RequirePermission({
  resource: 'role',
  action: PermissionAction.READ,
  scope: PermissionScope.ANY,
});

const requireCreateAnyRole = RequirePermission({
  resource: 'role',
  action: PermissionAction.CREATE,
  scope: PermissionScope.ANY,
});

const requireUpdateAnyRole = RequirePermission({
  resource: 'role',
  action: PermissionAction.UPDATE,
  scope: PermissionScope.ANY,
});

const requireDeleteAnyRole = RequirePermission({
  resource: 'role',
  action: PermissionAction.DELETE,
  scope: PermissionScope.ANY,
});

const requireReadAnyPermission = RequirePermission({
  resource: 'permission',
  action: PermissionAction.READ,
  scope: PermissionScope.ANY,
});

export const AdminRolePermissions = [
  requireReadAnyRole,
  requireCreateAnyRole,
  requireUpdateAnyRole,
  requireDeleteAnyRole,
  requireReadAnyPermission,
];

// Zod schemas for validation
const adminCreateRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

const adminUpdateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

const getAllRolesQuerySchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const getRoleByIdSchema = z.object({
  id: z.string().uuid(),
});

const deleteRoleSchema = z.object({
  id: z.string().uuid(),
});

const toggleRoleStatusSchema = z.object({
  id: z.string().uuid(),
});

const duplicateRoleSchema = z.object({
  id: z.string().uuid(),
  newName: z.string().optional(),
});

const addPermissionsToRoleSchema = z.object({
  roleId: z.string().uuid(),
  permissionIds: z.array(z.string().uuid()),
});

const searchUsersForRoleSchema = z.object({
  roleId: z.string().uuid(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
});

const addUsersToRoleSchema = z.object({
  roleId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
});

@Router({ alias: 'adminRole' })
@Injectable()
export class AdminRoleRouter {
  constructor(
    @Inject(AdminRoleService)
    private readonly adminRoleService: AdminRoleService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireReadAnyRole
  )
  @Query({
    input: getAllRolesQuerySchema,
    output: apiResponseSchema,
  })
  async getAllRoles(
    @Input() input: z.infer<typeof getAllRolesQuerySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const roles = await this.adminRoleService.getAllRoles({
        ...input,
        page: input.page || 1,
        limit: input.limit || 10
      });
      return this.responseHandler.createTrpcSuccess(roles);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        1,  // OperationCode.READ
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve roles'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireReadAnyRole
  )
  @Query({
    input: getRoleByIdSchema,
    output: apiResponseSchema,
  })
  async getRoleById(
    @Input() input: z.infer<typeof getRoleByIdSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.getRoleById(input.id);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        1,  // OperationCode.READ
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireCreateAnyRole
  )
  @Mutation({
    input: adminCreateRoleSchema,
    output: apiResponseSchema,
  })
  async createRole(
    @Input() input: z.infer<typeof adminCreateRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.createRole(input as any);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        2,  // OperationCode.CREATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireUpdateAnyRole
  )
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: adminUpdateRoleSchema,
    }),
    output: apiResponseSchema,
  })
  async updateRole(
    @Input() input: { id: string; data: z.infer<typeof adminUpdateRoleSchema> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.updateRole(input.id, input.data);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        3,  // OperationCode.UPDATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireDeleteAnyRole
  )
  @Mutation({
    input: deleteRoleSchema,
    output: apiResponseSchema,
  })
  async deleteRole(
    @Input() input: z.infer<typeof deleteRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.adminRoleService.deleteRole(input.id);
      return this.responseHandler.createTrpcSuccess({ message: 'Role deleted successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        4,  // OperationCode.DELETE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireReadAnyPermission
  )
  @Query({
    output: apiResponseSchema,
  })
  async getAvailablePermissions(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const permissions = await this.adminRoleService.getAvailablePermissions();
      return this.responseHandler.createTrpcSuccess(permissions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        1,  // OperationCode.READ
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve available permissions'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireReadAnyRole
  )
  @Query({
    output: apiResponseSchema,
  })
  async getRoleStatistics(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const statistics = await this.adminRoleService.getRoleStatistics();
      return this.responseHandler.createTrpcSuccess(statistics);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        1,  // OperationCode.READ
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve role statistics'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireUpdateAnyRole
  )
  @Mutation({
    input: toggleRoleStatusSchema,
    output: apiResponseSchema,
  })
  async toggleRoleStatus(
    @Input() input: z.infer<typeof toggleRoleStatusSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.toggleRoleStatus(input.id);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        3,  // OperationCode.UPDATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to toggle role status'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireCreateAnyRole
  )
  @Mutation({
    input: duplicateRoleSchema,
    output: apiResponseSchema,
  })
  async duplicateRole(
    @Input() input: z.infer<typeof duplicateRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.duplicateRole(input.id, input.newName);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        2,  // OperationCode.CREATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to duplicate role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireUpdateAnyRole
  )
  @Mutation({
    input: addPermissionsToRoleSchema,
    output: apiResponseSchema,
  })
  async addPermissionsToRole(
    @Input() input: z.infer<typeof addPermissionsToRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const role = await this.adminRoleService.addPermissionsToRole(input.roleId, input.permissionIds);
      return this.responseHandler.createTrpcSuccess(role);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        3,  // OperationCode.UPDATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to add permissions to role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireReadAnyRole
  )
  @Query({
    input: searchUsersForRoleSchema,
    output: apiResponseSchema,
  })
  async searchUsersForRole(
    @Input() input: z.infer<typeof searchUsersForRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const users = await this.adminRoleService.searchUsersForRole(input.roleId, {
        page: input.page || 1,
        limit: input.limit || 10,
        search: input.search
      });
      return this.responseHandler.createTrpcSuccess(users);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        1,  // OperationCode.READ
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to search users for role'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    requireUpdateAnyRole
  )
  @Mutation({
    input: addUsersToRoleSchema,
    output: apiResponseSchema,
  })
  async addUsersToRole(
    @Input() input: z.infer<typeof addUsersToRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.adminRoleService.addUsersToRole(input.roleId, input.userIds);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        13, // ModuleCode.ROLE
        3,  // OperationCode.UPDATE
        2,  // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to add users to role'
      );
    }
  }
}
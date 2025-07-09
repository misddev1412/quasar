import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminPermissionService } from '../../modules/user/services/admin/admin-permission.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import { PermissionAction, PermissionScope, UserRole } from '@shared';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { MessageLevelCode } from '@shared/enums/message-codes.enums';
import { apiResponseSchema } from '../schemas/response.schemas';

// Zod schemas for validation
const permissionActionSchema = z.enum([
  PermissionAction.CREATE, 
  PermissionAction.READ, 
  PermissionAction.UPDATE, 
  PermissionAction.DELETE,
  PermissionAction.EXECUTE,
  PermissionAction.APPROVE,
  PermissionAction.REJECT,
  PermissionAction.PUBLISH,
  PermissionAction.ARCHIVE
]);
const permissionScopeSchema = z.enum([
  PermissionScope.OWN, 
  PermissionScope.DEPARTMENT,
  PermissionScope.ORGANIZATION,
  PermissionScope.ANY
]);
const userRoleSchema = z.enum([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.USER,
  UserRole.GUEST
]);

const createPermissionSchema = z.object({
  name: z.string().min(1),
  resource: z.string().min(1),
  action: permissionActionSchema,
  scope: permissionScopeSchema,
  description: z.string().optional(),
  attributes: z.array(z.string()).optional(),
});

const updatePermissionSchema = z.object({
  name: z.string().optional(),
  resource: z.string().optional(),
  action: permissionActionSchema.optional(),
  scope: permissionScopeSchema.optional(),
  description: z.string().optional(),
  attributes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const permissionFilterSchema = z.object({
  resource: z.string().optional(),
  action: permissionActionSchema.optional(),
  scope: permissionScopeSchema.optional(),
  isActive: z.boolean().optional(),
});

const permissionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  resource: z.string(),
  action: permissionActionSchema,
  scope: permissionScopeSchema,
  description: z.string().optional(),
  attributes: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const assignPermissionToRoleSchema = z.object({
  role: userRoleSchema,
  permissionId: z.string(),
});

const removePermissionFromRoleSchema = z.object({
  role: userRoleSchema,
  permissionId: z.string(),
});

const permissionGrantSchema = z.object({
  role: userRoleSchema,
  resource: z.string().min(1),
  action: permissionActionSchema,
  scope: permissionScopeSchema,
  attributes: z.array(z.string()).optional(),
});



@Injectable()
export class AdminPermissionRouter {
  constructor(
    @Inject(AdminPermissionService)
    private readonly permissionService: AdminPermissionService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  // Permission CRUD operations
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createPermissionSchema,
    output: apiResponseSchema,
  })
  async createPermission(
    @Input() createPermissionDto: z.infer<typeof createPermissionSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Ensure all required fields are present for CreatePermissionDto
      const permissionData = {
        name: createPermissionDto.name,
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
        scope: createPermissionDto.scope,
        description: createPermissionDto.description,
        attributes: createPermissionDto.attributes,
      };
      
      const permission = await this.permissionService.createPermission(permissionData);
      return this.responseHandler.createCreatedResponse(ModuleCode.PERMISSION, 'permission', permission);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create permission'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: permissionFilterSchema,
    output: apiResponseSchema,
  })
  async getAllPermissions(
    @Input() filter: z.infer<typeof permissionFilterSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const permissions = await this.permissionService.getAllPermissions(filter);
      return this.responseHandler.createReadResponse(ModuleCode.PERMISSION, 'permissions', permissions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve permissions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async getPermissionById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const permission = await this.permissionService.getPermissionById(input.id);
      return this.responseHandler.createReadResponse(ModuleCode.PERMISSION, 'permission', permission);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Permission not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updatePermissionSchema),
    output: apiResponseSchema,
  })
  async updatePermission(
    @Input() input: { id: string } & z.infer<typeof updatePermissionSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const permission = await this.permissionService.updatePermission(id, updateDto);
      return this.responseHandler.createUpdatedResponse(ModuleCode.PERMISSION, 'permission', permission);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update permission'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async deletePermission(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.permissionService.deletePermission(input.id);
      return this.responseHandler.createDeletedResponse(ModuleCode.PERMISSION, 'permission');
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete permission'
      );
    }
  }

  // Role Permission management
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: assignPermissionToRoleSchema,
    output: apiResponseSchema,
  })
  async assignPermissionToRole(
    @Input() input: z.infer<typeof assignPermissionToRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.permissionService.assignPermissionToRole(input.role, input.permissionId);
      return this.responseHandler.createCreatedResponse(ModuleCode.PERMISSION, 'role permission', result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to assign permission to role'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: removePermissionFromRoleSchema,
    output: apiResponseSchema,
  })
  async removePermissionFromRole(
    @Input() input: z.infer<typeof removePermissionFromRoleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.permissionService.removePermissionFromRole(input.role, input.permissionId);
      return this.responseHandler.createDeletedResponse(ModuleCode.PERMISSION, 'role permission');
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to remove permission from role'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ role: userRoleSchema }),
    output: apiResponseSchema,
  })
  async getRolePermissions(
    @Input() input: { role: UserRole }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const permissions = await this.permissionService.getRolePermissions(input.role);
      return this.responseHandler.createReadResponse(ModuleCode.PERMISSION, 'role permissions', permissions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve role permissions'
      );
    }
  }

  // Grant permissions in AccessControl style
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      grants: z.array(permissionGrantSchema),
    }),
    output: apiResponseSchema,
  })
  async grantPermissions(
    @Input() input: { grants: z.infer<typeof permissionGrantSchema>[] }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Ensure all required fields are present for PermissionGrant
      const grants = input.grants.map(grant => ({
        role: grant.role,
        resource: grant.resource,
        action: grant.action,
        scope: grant.scope,
        attributes: grant.attributes,
      }));
      
      await this.permissionService.grant(grants);
      return this.responseHandler.createSuccessResponse(
        ModuleCode.PERMISSION,
        OperationCode.CREATE,
        MessageLevelCode.SUCCESS,
        'Permissions granted successfully'
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to grant permissions'
      );
    }
  }

  // Utility: Check if a role has a specific permission
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      role: userRoleSchema,
      resource: z.string(),
      action: permissionActionSchema,
      scope: permissionScopeSchema,
    }),
    output: apiResponseSchema,
  })
  async checkPermission(
    @Input() input: {
      role: UserRole;
      resource: string;
      action: PermissionAction;
      scope: PermissionScope;
    }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const checker = this.permissionService.can(input.role);
      let permissionCheck;
      
      if (input.action === PermissionAction.CREATE && input.scope === PermissionScope.OWN) {
        permissionCheck = await checker.createOwn(input.resource);
      } else if (input.action === PermissionAction.CREATE && input.scope === PermissionScope.ANY) {
        permissionCheck = await checker.createAny(input.resource);
      } else if (input.action === PermissionAction.READ && input.scope === PermissionScope.OWN) {
        permissionCheck = await checker.readOwn(input.resource);
      } else if (input.action === PermissionAction.READ && input.scope === PermissionScope.ANY) {
        permissionCheck = await checker.readAny(input.resource);
      } else if (input.action === PermissionAction.UPDATE && input.scope === PermissionScope.OWN) {
        permissionCheck = await checker.updateOwn(input.resource);
      } else if (input.action === PermissionAction.UPDATE && input.scope === PermissionScope.ANY) {
        permissionCheck = await checker.updateAny(input.resource);
      } else if (input.action === PermissionAction.DELETE && input.scope === PermissionScope.OWN) {
        permissionCheck = await checker.deleteOwn(input.resource);
      } else if (input.action === PermissionAction.DELETE && input.scope === PermissionScope.ANY) {
        permissionCheck = await checker.deleteAny(input.resource);
      } else {
        throw new Error('Invalid permission action or scope');
      }

      const result = {
        granted: permissionCheck.granted,
        attributes: permissionCheck.attributes,
        permission: permissionCheck.permission,
      };
      
      return this.responseHandler.createReadResponse(ModuleCode.PERMISSION, 'permission check', result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PERMISSION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to check permission'
      );
    }
  }
} 
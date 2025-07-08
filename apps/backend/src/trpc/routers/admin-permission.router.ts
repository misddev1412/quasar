import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { PermissionService } from '../../modules/user/services/permission.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import { PermissionAction, PermissionScope } from '../../modules/user/entities/permission.entity';
import { UserRole } from '../../modules/user/entities/user.entity';

// Zod schemas for validation
const permissionActionSchema = z.enum([PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE]);
const permissionScopeSchema = z.enum([PermissionScope.OWN, PermissionScope.ANY]);
const userRoleSchema = z.enum([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

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
  resource: z.string(),
  action: permissionActionSchema,
  scope: permissionScopeSchema,
  attributes: z.array(z.string()).optional(),
});

@Injectable()
export class AdminPermissionRouter {
  constructor(
    @Inject(PermissionService)
    private readonly permissionService: PermissionService,
  ) {}

  // Permission CRUD operations
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createPermissionSchema,
    output: permissionResponseSchema,
  })
  async createPermission(
    @Input() createPermissionDto: z.infer<typeof createPermissionSchema>
  ): Promise<z.infer<typeof permissionResponseSchema>> {
    return await this.permissionService.createPermission(createPermissionDto);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: permissionFilterSchema,
    output: z.array(permissionResponseSchema),
  })
  async getAllPermissions(
    @Input() filter: z.infer<typeof permissionFilterSchema>
  ): Promise<z.infer<typeof permissionResponseSchema>[]> {
    return await this.permissionService.getAllPermissions(filter);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: permissionResponseSchema,
  })
  async getPermissionById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof permissionResponseSchema>> {
    return await this.permissionService.getPermissionById(input.id);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updatePermissionSchema),
    output: permissionResponseSchema,
  })
  async updatePermission(
    @Input() input: { id: string } & z.infer<typeof updatePermissionSchema>
  ): Promise<z.infer<typeof permissionResponseSchema>> {
    const { id, ...updateDto } = input;
    return await this.permissionService.updatePermission(id, updateDto);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.void(),
  })
  async deletePermission(
    @Input() input: { id: string }
  ): Promise<void> {
    await this.permissionService.deletePermission(input.id);
  }

  // Role Permission management
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: assignPermissionToRoleSchema,
    output: z.object({
      id: z.string(),
      role: userRoleSchema,
      permissionId: z.string(),
      isActive: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  })
  async assignPermissionToRole(
    @Input() input: z.infer<typeof assignPermissionToRoleSchema>
  ) {
    return await this.permissionService.assignPermissionToRole(input.role, input.permissionId);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: removePermissionFromRoleSchema,
    output: z.void(),
  })
  async removePermissionFromRole(
    @Input() input: z.infer<typeof removePermissionFromRoleSchema>
  ): Promise<void> {
    await this.permissionService.removePermissionFromRole(input.role, input.permissionId);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ role: userRoleSchema }),
    output: z.array(permissionResponseSchema),
  })
  async getRolePermissions(
    @Input() input: { role: UserRole }
  ): Promise<z.infer<typeof permissionResponseSchema>[]> {
    return await this.permissionService.getRolePermissions(input.role);
  }

  // Grant permissions in AccessControl style
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      grants: z.array(permissionGrantSchema),
    }),
    output: z.void(),
  })
  async grantPermissions(
    @Input() input: { grants: z.infer<typeof permissionGrantSchema>[] }
  ): Promise<void> {
    await this.permissionService.grant(input.grants);
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
    output: z.object({
      granted: z.boolean(),
      attributes: z.array(z.string()),
      permission: permissionResponseSchema.optional(),
    }),
  })
  async checkPermission(
    @Input() input: {
      role: UserRole;
      resource: string;
      action: PermissionAction;
      scope: PermissionScope;
    }
  ) {
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

    return {
      granted: permissionCheck.granted,
      attributes: permissionCheck.attributes,
      permission: permissionCheck.permission,
    };
  }
} 
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { PermissionAction, PermissionScope } from '@quasar/shared';
import { PermissionService } from '../../modules/user/services/permission.service';

export interface RequiredPermission {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

export function RequirePermission(permission: RequiredPermission) {
  @Injectable()
  class PermissionMiddleware implements TRPCMiddleware {
    constructor(private readonly permissionService: PermissionService) {}

    async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
      const { ctx, next } = opts;
      
      // This middleware should be used after AuthMiddleware, so user should exist
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      // Check if user has the required permission
      const checker = this.permissionService.can(ctx.user.role);
      let permissionCheck;
      
      if (permission.action === PermissionAction.CREATE && permission.scope === PermissionScope.OWN) {
        permissionCheck = await checker.createOwn(permission.resource);
      } else if (permission.action === PermissionAction.CREATE && permission.scope === PermissionScope.ANY) {
        permissionCheck = await checker.createAny(permission.resource);
      } else if (permission.action === PermissionAction.READ && permission.scope === PermissionScope.OWN) {
        permissionCheck = await checker.readOwn(permission.resource);
      } else if (permission.action === PermissionAction.READ && permission.scope === PermissionScope.ANY) {
        permissionCheck = await checker.readAny(permission.resource);
      } else if (permission.action === PermissionAction.UPDATE && permission.scope === PermissionScope.OWN) {
        permissionCheck = await checker.updateOwn(permission.resource);
      } else if (permission.action === PermissionAction.UPDATE && permission.scope === PermissionScope.ANY) {
        permissionCheck = await checker.updateAny(permission.resource);
      } else if (permission.action === PermissionAction.DELETE && permission.scope === PermissionScope.OWN) {
        permissionCheck = await checker.deleteOwn(permission.resource);
      } else if (permission.action === PermissionAction.DELETE && permission.scope === PermissionScope.ANY) {
        permissionCheck = await checker.deleteAny(permission.resource);
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid permission action or scope',
        });
      }

      if (!permissionCheck.granted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required: ${permission.action}:${permission.scope}:${permission.resource}`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: permissionCheck, // Add permission info to context
        },
      });
    }
  }

  return PermissionMiddleware;
}

// Convenient permission middleware for common use cases
@Injectable()
export class CanCreateOwn implements TRPCMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  private resource: string;

  setResource(resource: string): this {
    this.resource = resource;
    return this;
  }

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const permissionCheck = await this.permissionService
      .can(ctx.user.role)
      .createOwn(this.resource);

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot create own ${this.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        permission: permissionCheck,
      },
    });
  }
}

@Injectable()
export class CanCreateAny implements TRPCMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  private resource: string;

  setResource(resource: string): this {
    this.resource = resource;
    return this;
  }

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const permissionCheck = await this.permissionService
      .can(ctx.user.role)
      .createAny(this.resource);

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot create any ${this.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        permission: permissionCheck,
      },
    });
  }
}

@Injectable()
export class CanReadAny implements TRPCMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  private resource: string;

  setResource(resource: string): this {
    this.resource = resource;
    return this;
  }

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const permissionCheck = await this.permissionService
      .can(ctx.user.role)
      .readAny(this.resource);

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot read any ${this.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        permission: permissionCheck,
      },
    });
  }
}

@Injectable()
export class CanUpdateOwn implements TRPCMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  private resource: string;

  setResource(resource: string): this {
    this.resource = resource;
    return this;
  }

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const permissionCheck = await this.permissionService
      .can(ctx.user.role)
      .updateOwn(this.resource);

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot update own ${this.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        permission: permissionCheck,
      },
    });
  }
}

@Injectable()
export class CanDeleteAny implements TRPCMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  private resource: string;

  setResource(resource: string): this {
    this.resource = resource;
    return this;
  }

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const permissionCheck = await this.permissionService
      .can(ctx.user.role)
      .deleteAny(this.resource);

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot delete any ${this.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        permission: permissionCheck,
      },
    });
  }
} 
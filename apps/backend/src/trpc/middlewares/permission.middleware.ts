import { Injectable, Type, mixin } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { PermissionAction, PermissionScope, UserRole } from '@shared';
import { Permission } from '../modules/user/entities/permission.entity';

export interface RequiredPermission {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

interface PermissionCheckResult {
  granted: boolean;
  attributes: string[];
}

function hasPermission(
  permissions: Permission[] = [],
  resource: string,
  action: PermissionAction,
  scope: PermissionScope
): PermissionCheckResult {
  if (!permissions || permissions.length === 0) {
    return { granted: false, attributes: [] };
  }

  const exactMatch = permissions.find(
    permission =>
      permission.resource === resource &&
      permission.action === action &&
      permission.scope === scope
  );

  if (exactMatch) {
    return {
      granted: true,
      attributes: exactMatch.attributes?.length ? exactMatch.attributes : ['*'],
    };
  }

  if (scope === PermissionScope.OWN) {
    const anyScopeMatch = permissions.find(
      permission =>
        permission.resource === resource &&
        permission.action === action &&
        permission.scope === PermissionScope.ANY
    );

    if (anyScopeMatch) {
      return {
        granted: true,
        attributes: anyScopeMatch.attributes?.length ? anyScopeMatch.attributes : ['*'],
      };
    }
  }

  return { granted: false, attributes: [] };
}

function isSuperAdmin(ctx: AuthenticatedContext): boolean {
  return ctx.user?.isSuperAdmin || ctx.user?.role === UserRole.SUPER_ADMIN;
}

export function RequirePermission(permission: RequiredPermission): Type<TRPCMiddleware> {
  @Injectable()
  class PermissionMiddleware implements TRPCMiddleware {
    async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
      const { ctx, next } = opts;

      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      if (isSuperAdmin(ctx)) {
        return next({
          ctx: {
            ...ctx,
            user: ctx.user,
            permission: { granted: true, attributes: ['*'] },
          },
        });
      }

      const permissionCheck = hasPermission(
        ctx.user.permissions,
        permission.resource,
        permission.action,
        permission.scope
      );

      if (!permissionCheck.granted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required: ${permission.action}:${permission.scope}:${permission.resource}`,
          cause: { httpStatus: 403 },
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

  return mixin(PermissionMiddleware);
}

@Injectable()
export class CanCreateOwn implements TRPCMiddleware {
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

    if (isSuperAdmin(ctx)) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: { granted: true, attributes: ['*'] },
        },
      });
    }

    const permissionCheck = hasPermission(
      ctx.user.permissions,
      this.resource,
      PermissionAction.CREATE,
      PermissionScope.OWN
    );

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot create own ${this.resource}`,
        cause: { httpStatus: 403 },
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

    if (isSuperAdmin(ctx)) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: { granted: true, attributes: ['*'] },
        },
      });
    }

    const permissionCheck = hasPermission(
      ctx.user.permissions,
      this.resource,
      PermissionAction.CREATE,
      PermissionScope.ANY
    );

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot create any ${this.resource}`,
        cause: { httpStatus: 403 },
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

    if (isSuperAdmin(ctx)) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: { granted: true, attributes: ['*'] },
        },
      });
    }

    const permissionCheck = hasPermission(
      ctx.user.permissions,
      this.resource,
      PermissionAction.READ,
      PermissionScope.ANY
    );

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot read any ${this.resource}`,
        cause: { httpStatus: 403 },
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

    if (isSuperAdmin(ctx)) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: { granted: true, attributes: ['*'] },
        },
      });
    }

    const permissionCheck = hasPermission(
      ctx.user.permissions,
      this.resource,
      PermissionAction.UPDATE,
      PermissionScope.OWN
    );

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot update own ${this.resource}`,
        cause: { httpStatus: 403 },
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

    if (isSuperAdmin(ctx)) {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          permission: { granted: true, attributes: ['*'] },
        },
      });
    }

    const permissionCheck = hasPermission(
      ctx.user.permissions,
      this.resource,
      PermissionAction.DELETE,
      PermissionScope.ANY
    );

    if (!permissionCheck.granted) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot delete any ${this.resource}`,
        cause: { httpStatus: 403 },
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

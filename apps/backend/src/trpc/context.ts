import { Injectable, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { SupportedLocale, UserRole } from '@shared';
import { resolveLocaleFromRequest } from '../modules/shared/utils/locale.util';
import { Permission } from '../modules/user/entities/permission.entity';
import { PermissionRepository } from '../modules/user/repositories/permission.repository';
import { JwtPayload } from '../auth/auth.service';
import { UserRepository } from '../modules/user/repositories/user.repository';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole | string;
  isActive: boolean;
  isSuperAdmin: boolean;
  roleIds: string[];
  roles: Array<{
    id: string;
    name: string;
    code: UserRole | string;
  }>;
  permissions: Permission[];
}

export interface AuthenticatedContext extends Record<string, unknown> {
  user?: AuthUser;
  req: any;
  res: any;
  locale: SupportedLocale;
  resolve<TInput = unknown>(type: Type<TInput>): TInput;
}

@Injectable()
export class AppContext implements TRPCContext {
  constructor(
    private readonly jwtService: JwtService,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRepository: UserRepository,
    private readonly moduleRef: ModuleRef,
  ) {}

  async create(opts: ContextOptions): Promise<AuthenticatedContext> {
    const { req, res } = opts;
    
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    let user: AuthUser | undefined;
    const locale = resolveLocaleFromRequest(req);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        
        // 确保payload.sub是UUID，而不是用户角色名称
        if (!payload.sub || typeof payload.sub !== 'string') {
          console.warn('Invalid JWT token: missing or invalid user ID');
        } else {
          const userWithRoles = await this.userRepository.findWithRoles(payload.sub);
          const activeRoles = userWithRoles?.userRoles?.filter(ur => ur.isActive && ur.role);
          const roleIds = activeRoles?.map(ur => ur.roleId) || [];
          const permissions = await this.permissionRepository.findPermissionsByRoleIds(roleIds);
          const isSuperAdmin = activeRoles?.some(ur => ur.role?.code === UserRole.SUPER_ADMIN) || false;
          const primaryRole = activeRoles?.[0]?.role?.code || payload.role;

          // Create user object from JWT payload with permissions
          user = {
            id: payload.sub, // 用户ID
            email: payload.email,
            username: payload.username || '',
            role: isSuperAdmin ? UserRole.SUPER_ADMIN : primaryRole,
            isActive: userWithRoles?.isActive ?? payload.isActive ?? true,
            isSuperAdmin,
            roleIds,
            roles: activeRoles?.map(ur => ({
              id: ur.role?.id || ur.roleId,
              name: ur.role?.name,
              code: ur.role?.code || '',
            })) || [],
            permissions,
          };
        }
      } catch (error) {
        // Invalid token - user remains undefined
        console.warn('Invalid JWT token:', error.message);
      }
    }

    if (req) {
      req.locale = locale;
    }

    const resolve = <TInput = unknown>(type: Type<TInput>): TInput => {
      return this.moduleRef.get(type, { strict: false });
    };

    return {
      user,
      req,
      res,
      locale,
      resolve,
    };
  }

}

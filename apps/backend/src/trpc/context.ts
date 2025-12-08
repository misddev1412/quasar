import { Injectable, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { SupportedLocale, UserRole } from '@shared';
import { resolveLocaleFromRequest } from '../modules/shared/utils/locale.util';
import { Permission } from '../modules/user/entities/permission.entity';
import { PermissionRepository } from '../modules/user/repositories/permission.repository';
import { JwtPayload } from '../auth/auth.service';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
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
          // Load user permissions based on role
          const permissions = await this.permissionRepository.findPermissionsByRole(payload.role);

          // Create user object from JWT payload with permissions
          user = {
            id: payload.sub, // 用户ID
            email: payload.email,
            username: payload.username || '',
            role: payload.role,
            isActive: payload.isActive || true,
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

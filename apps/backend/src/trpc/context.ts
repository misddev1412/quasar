import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { UserRole } from '../modules/user/entities/user.entity';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthenticatedContext extends Record<string, unknown> {
  user?: AuthUser;
  req: any;
  res: any;
}

@Injectable()
export class AppContext implements TRPCContext {
  constructor(private readonly jwtService: JwtService) {}

  async create(opts: ContextOptions): Promise<AuthenticatedContext> {
    const { req, res } = opts;
    
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    let user: AuthUser | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = await this.jwtService.verifyAsync(token);
        
        // Create user object from JWT payload
        user = {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          role: payload.role,
          isActive: payload.isActive,
        };
      } catch (error) {
        // Invalid token - user remains undefined
        console.warn('Invalid JWT token:', error.message);
      }
    }

    return {
      user,
      req,
      res,
    };
  }
} 
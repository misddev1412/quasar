import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../modules/user/repositories/user.repository';
import { User } from '../modules/user/entities/user.entity';
import { UserRole } from '@shared';
import { UserActivityTrackingService } from '../modules/user/services/user-activity-tracking.service';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
  username?: string;
  isActive?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private activityTrackingService: UserActivityTrackingService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User, sessionData?: { ipAddress?: string; userAgent?: string; isRememberMe?: boolean }) {
    // Get user with roles
    const userWithRoles = await this.userRepository.findWithRoles(user.id);

    // Get primary role (first active role or default to USER)
    const primaryRole = userWithRoles?.userRoles?.find(ur => ur.isActive)?.role?.code || UserRole.USER;

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id, // 确保sub是用户ID而不是角色
      username: user.username,
      role: primaryRole,
      isActive: user.isActive
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Create session tracking
    if (sessionData) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (sessionData.isRememberMe ? 30 : 1)); // 30 days if remember me, 1 day otherwise

      try {
        await this.activityTrackingService.createSession({
          userId: user.id,
          sessionToken: accessToken,
          refreshToken: refreshToken,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          expiresAt: expiresAt,
          isRememberMe: sessionData.isRememberMe || false,
        });
      } catch (error) {
        // Don't fail login if session tracking fails
        console.error('Failed to create session:', error);
      }
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload: JwtPayload = { 
        email: payload.email, 
        sub: payload.sub, 
        username: payload.username,
        role: payload.role,
        isActive: payload.isActive 
      };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 
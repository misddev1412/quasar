import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../modules/user/repositories/user.repository';
import { User } from '../modules/user/entities/user.entity';
import { UserRole } from '@shared';
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
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User) {
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
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
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
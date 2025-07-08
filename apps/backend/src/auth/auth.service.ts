import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../modules/user/repositories/user.repository';
import { User } from '../modules/user/entities/user.entity';
import { UserRole } from '@quasar/shared';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
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
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
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
        role: payload.role 
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
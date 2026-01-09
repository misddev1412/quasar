import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service';
import { UserRepository } from '../../modules/user/repositories/user.repository';
import { UserRole } from '@shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const userWithRoles = await this.userRepository.findWithRoles(payload.sub);
    const activeRoles = userWithRoles?.userRoles?.filter(ur => ur.isActive && ur.role?.code);
    const isSuperAdmin = activeRoles?.some(ur => ur.role?.code === UserRole.SUPER_ADMIN);
    const role = isSuperAdmin
      ? UserRole.SUPER_ADMIN
      : activeRoles?.[0]?.role?.code || payload.role;

    return {
      id: payload.sub,
      email: payload.email,
      role,
    };
  }
}

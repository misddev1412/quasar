import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '../modules/user/entities/user.entity';
import { UserProfile } from '../modules/user/entities/user-profile.entity';
import { Permission } from '../modules/user/entities/permission.entity';
import { Role } from '../modules/user/entities/role.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { RolePermission } from '../modules/user/entities/role-permission.entity';
import { UserActivity } from '../modules/user/entities/user-activity.entity';
import { UserSession } from '../modules/user/entities/user-session.entity';
import { UserRepository } from '../modules/user/repositories/user.repository';
import { PermissionRepository } from '../modules/user/repositories/permission.repository';
import { UserActivityRepository } from '../modules/user/repositories/user-activity.repository';
import { UserSessionRepository } from '../modules/user/repositories/user-session.repository';
import { UserActivityTrackingService } from '../modules/user/services/user-activity-tracking.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminAuthRouter } from '../trpc/routers/admin/auth.router';
import { SharedModule } from '../modules/shared/shared.module';

const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
    },
  }),
  inject: [ConfigService],
});

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Permission, Role, UserRole, RolePermission, UserActivity, UserSession]),
    PassportModule,
    jwtModule,
    SharedModule,
  ],
  providers: [
    AuthService,
    UserRepository,
    PermissionRepository,
    UserActivityRepository,
    UserSessionRepository,
    UserActivityTrackingService,
    JwtStrategy,
    RolesGuard,
    JwtAuthGuard,
    AdminAuthRouter,
  ],
  exports: [
    AuthService, 
    UserRepository, 
    PermissionRepository, 
    jwtModule, 
    JwtAuthGuard, 
    RolesGuard,
    AdminAuthRouter
  ],
})
export class AuthModule {} 
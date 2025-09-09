import { Module, forwardRef } from '@nestjs/common';
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
import { FirebaseAuthStrategy } from './strategies/firebase-auth.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AdminAuthRouter } from './routers/admin-auth.router';
import { PublicAuthRouter } from './routers/public-auth.router';
import { SharedModule } from '../modules/shared/shared.module';
import { UserModule } from '../modules/user/user.module';
import { FirebaseModule } from '../modules/firebase/firebase.module';

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
    FirebaseModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    FirebaseAuthStrategy,
    RolesGuard,
    JwtAuthGuard,
    FirebaseAuthGuard,
    AdminAuthRouter,
    PublicAuthRouter,
  ],
  exports: [
    AuthService,
    jwtModule,
    JwtAuthGuard,
    FirebaseAuthGuard,
    RolesGuard,
    AdminAuthRouter,
    PublicAuthRouter,
  ],
})
export class AuthModule {} 
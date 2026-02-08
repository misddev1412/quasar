import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { UserRole } from '@backend/modules/user/entities/user-role.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { UserActivity } from '@backend/modules/user/entities/user-activity.entity';
import { UserSession } from '@backend/modules/user/entities/user-session.entity';
import { UserRepository } from '@backend/modules/user/repositories/user.repository';
import { PermissionRepository } from '@backend/modules/user/repositories/permission.repository';
import { UserActivityRepository } from '@backend/modules/user/repositories/user-activity.repository';
import { UserSessionRepository } from '@backend/modules/user/repositories/user-session.repository';
import { UserActivityTrackingService } from '@backend/modules/user/services/user-activity-tracking.service';
import { AuthService } from '@backend/auth/auth.service';
import { JwtStrategy } from '@backend/auth/strategies/jwt.strategy';
import { FirebaseAuthStrategy } from '@backend/auth/strategies/firebase-auth.strategy';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { FirebaseAuthGuard } from '@backend/auth/guards/firebase-auth.guard';
import { AdminAuthRouter } from '@backend/auth/routers/admin-auth.router';
import { PublicAuthRouter } from '@backend/auth/routers/public-auth.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { UserModule } from '@backend/modules/user/user.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';

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
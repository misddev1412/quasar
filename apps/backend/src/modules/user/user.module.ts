import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserActivity } from './entities/user-activity.entity';
import { UserSession } from './entities/user-session.entity';
import { UserRepository } from './repositories/user.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserActivityRepository } from './repositories/user-activity.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { ActivityTrackingService } from './services/activity-tracking.service';
import { UserActivityTrackingService } from './services/user-activity-tracking.service';
import { UserActivityStatusService } from './services/user-activity-status.service';
import { ActivityTrackingMiddleware } from './middleware/activity-tracking.middleware';
import { AdminActivityInterceptor } from './interceptors/admin-activity.interceptor';
import { ActivityTrackingGuard, AdminActivityTrackingGuard } from './guards/activity-tracking.guard';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminPermissionService } from './services/admin/admin-permission.service';
import { AdminRoleService } from './services/admin/admin-role.service';
import { PermissionCheckerService } from '../shared/services/permission-checker.service';
import { AdminUserService } from './services/admin/admin-user.service';
import { AdminUserStatisticsService } from './services/admin/admin-user-statistics.service';
import { ClientUserService } from './services/client/client-user.service';
import { AdminUserRouter, AdminPermissionRouter } from '../../trpc/routers/admin';
import { AdminRoleRouter } from '../../trpc/routers/admin/role.router';
import { AdminUserStatisticsRouter } from '../../trpc/routers/admin/user-statistics.router';
import { AdminUserActivityRouter } from '../../trpc/routers/admin/user-activity.router';
import { ClientUserRouter } from '../../trpc/routers/client';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Permission, Role, UserRole, RolePermission, UserActivity, UserSession]),
    SharedModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminUserController],
  providers: [
    // Repositories
    UserRepository,
    PermissionRepository,
    RoleRepository,
    UserActivityRepository,
    UserSessionRepository,

    // Services
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    ClientUserService,
    UserActivityTrackingService,
    ActivityTrackingService,
    UserActivityStatusService,

    // Activity Tracking Components
    AdminActivityInterceptor,
    ActivityTrackingGuard,
    AdminActivityTrackingGuard,

    // Global interceptor for admin activity tracking
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActivityInterceptor,
    },

    // TRPC Routers
    AdminUserRouter,
    AdminUserStatisticsRouter,
    AdminUserActivityRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    AdminRoleRouter,
  ],
  exports: [
    // Repositories
    UserRepository,
    PermissionRepository,
    RoleRepository,
    UserActivityRepository,
    UserSessionRepository,

    // Services
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    ClientUserService,
    UserActivityTrackingService,
    ActivityTrackingService,
    UserActivityStatusService,

    // Activity Tracking Components
    AdminActivityInterceptor,
    ActivityTrackingGuard,
    AdminActivityTrackingGuard,

    // TRPC Routers
    AdminUserRouter,
    AdminUserStatisticsRouter,
    AdminUserActivityRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    AdminRoleRouter,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply activity tracking middleware to admin routes
    consumer
      .apply(ActivityTrackingMiddleware)
      .forRoutes('admin/*', 'api/admin/*', 'trpc/admin/*');
  }
}
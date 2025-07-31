import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRepository } from './repositories/user.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { AdminPermissionService } from './services/admin/admin-permission.service';
import { AdminRoleService } from './services/admin/admin-role.service';
import { PermissionCheckerService } from '../shared/services/permission-checker.service';
import { AdminUserService } from './services/admin/admin-user.service';
import { AdminUserStatisticsService } from './services/admin/admin-user-statistics.service';
import { ClientUserService } from './services/client/client-user.service';
import { AdminUserRouter, AdminPermissionRouter } from '../../trpc/routers/admin';
import { AdminRoleRouter } from '../../trpc/routers/admin/role.router';
import { AdminUserStatisticsRouter } from '../../trpc/routers/admin/user-statistics.router';
import { ClientUserRouter } from '../../trpc/routers/client';
import { AuthModule } from '../../auth/auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Permission, Role, UserRole, RolePermission]),
    AuthModule,
    SharedModule,
  ],
  controllers: [],
  providers: [
    UserRepository,
    PermissionRepository,
    RoleRepository,
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    ClientUserService,
    AdminUserRouter,
    AdminUserStatisticsRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    AdminRoleRouter,
  ],
  exports: [
    UserRepository,
    PermissionRepository,
    RoleRepository,
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    ClientUserService,
    AdminUserRouter,
    AdminUserStatisticsRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    AdminRoleRouter,
  ],
})
export class UserModule {} 
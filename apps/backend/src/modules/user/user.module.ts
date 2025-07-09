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
import { AdminPermissionService } from './services/admin/admin-permission.service';
import { PermissionCheckerService } from '../shared/services/permission-checker.service';
import { AdminUserService } from './services/admin/admin-user.service';
import { ClientUserService } from './services/client/client-user.service';
import { AdminUserRouter, AdminPermissionRouter } from '../../trpc/routers/admin';
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
    PermissionCheckerService,
    AdminPermissionService,
    AdminUserService,
    ClientUserService,
    AdminUserRouter,
    ClientUserRouter,
    AdminPermissionRouter,
  ],
  exports: [
    UserRepository, 
    PermissionRepository, 
    PermissionCheckerService,
    AdminPermissionService,
    AdminUserService,
    ClientUserService,
    AdminUserRouter,
    ClientUserRouter,
    AdminPermissionRouter,
  ],
})
export class UserModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../trpc/middlewares/admin-role.middleware';
import { UserInjectionMiddleware } from '../../trpc/middlewares/user-injection.middleware';
import { CanCreateOwn, CanCreateAny, CanReadAny } from '../../trpc/middlewares/permission.middleware';
import { AuthModule } from '../../auth/auth.module';
import { PermissionCheckerService } from './services/permission-checker.service';
import { ResponseService } from './services/response.service';
import { ErrorRegistryService } from './services/error-registry.service';
import { PermissionRepository } from '../user/repositories/permission.repository';
import { Permission } from '../user/entities/permission.entity';
import { RolePermission } from '../user/entities/role-permission.entity';
import { Role } from '../user/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission, Role]),
    AuthModule
  ],
  providers: [
    AuthMiddleware,
    AdminRoleMiddleware,
    UserInjectionMiddleware,
    PermissionRepository,
    PermissionCheckerService,
    ResponseService,
    ErrorRegistryService,
    CanCreateOwn,
    CanCreateAny,
    CanReadAny,
  ],
  exports: [
    AuthMiddleware,
    AdminRoleMiddleware,
    UserInjectionMiddleware,
    PermissionCheckerService,
    ResponseService,
    ErrorRegistryService,
    CanCreateOwn,
    CanCreateAny,
    CanReadAny,
  ],
})
export class SharedModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import { UserInjectionMiddleware } from '@backend/trpc/middlewares/user-injection.middleware';
import { CanCreateOwn, CanCreateAny, CanReadAny } from '@backend/trpc/middlewares/permission.middleware';
import { PermissionCheckerService } from '@backend/modules/shared/services/permission-checker.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ErrorRegistryService } from '@backend/modules/shared/services/error-registry.service';
import { PermissionRepository } from '@backend/modules/user/repositories/permission.repository';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { GlobalExceptionFilter } from '@backend/modules/shared/filters/global-exception.filter';
import { TableInitializationService } from '@backend/modules/shared/services/table-initialization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission, Role]),
  ],
  providers: [
    AuthMiddleware,
    AdminRoleMiddleware,
    UserInjectionMiddleware,
    PermissionRepository,
    PermissionCheckerService,
    ResponseService,
    ErrorRegistryService,
    TableInitializationService,
    CanCreateOwn,
    CanCreateAny,
    CanReadAny,
    GlobalExceptionFilter,
  ],
  exports: [
    AuthMiddleware,
    AdminRoleMiddleware,
    UserInjectionMiddleware,
    PermissionCheckerService,
    ResponseService,
    ErrorRegistryService,
    TableInitializationService,
    CanCreateOwn,
    CanCreateAny,
    CanReadAny,
    GlobalExceptionFilter,
  ],
})
export class SharedModule {} 

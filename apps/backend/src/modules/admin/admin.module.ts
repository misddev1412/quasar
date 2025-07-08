import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { Permission } from '../user/entities/permission.entity';
import { RolePermission } from '../user/entities/role-permission.entity';
import { AdminUserRouter } from '../../trpc/routers/admin-user.router';
import { AdminPermissionRouter } from '../../trpc/routers/admin-permission.router';
import { AdminUserService } from './user/services/admin-user.service';
import { AuthModule } from '../../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../trpc/middlewares/admin-role.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Permission, RolePermission]),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    AdminUserService,
    AdminUserRouter,
    AdminPermissionRouter,
    AuthMiddleware,
    AdminRoleMiddleware,
  ],
  exports: [AdminUserService],
})
export class AdminModule {} 
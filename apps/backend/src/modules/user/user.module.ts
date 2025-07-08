import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRepository } from './repositories/user.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionService } from './services/permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Permission, RolePermission])],
  controllers: [],
  providers: [UserRepository, PermissionRepository, PermissionService],
  exports: [UserRepository, PermissionRepository, PermissionService],
})
export class UserModule {} 
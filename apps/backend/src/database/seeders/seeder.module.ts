import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';
import { Permission } from '../../modules/user/entities/permission.entity';
import { RolePermission } from '../../modules/user/entities/role-permission.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { UserRole } from '../../modules/user/entities/user-role.entity';
import { PermissionRepository } from '../../modules/user/repositories/permission.repository';
import { AdminPermissionService } from '../../modules/user/services/admin/admin-permission.service';
import { PermissionCheckerService } from '@backend/modules/shared/services/permission-checker.service';
import { PermissionSeeder } from './permission.seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      User, 
      UserProfile, 
      Permission, 
      RolePermission, 
      Role, 
      UserRole
    ]),
  ],
  providers: [
    PermissionRepository,
    PermissionCheckerService,
    AdminPermissionService,
    PermissionSeeder,
  ],
  exports: [PermissionSeeder],
})
export class SeederModule {} 
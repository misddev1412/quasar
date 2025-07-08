import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';
import { Permission } from '../../modules/user/entities/permission.entity';
import { RolePermission } from '../../modules/user/entities/role-permission.entity';
import { PermissionRepository } from '../../modules/user/repositories/permission.repository';
import { PermissionService } from '../../modules/user/services/permission.service';
import { PermissionSeeder } from './permission.seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, UserProfile, Permission, RolePermission]),
  ],
  providers: [
    PermissionRepository,
    PermissionService,
    PermissionSeeder,
  ],
  exports: [PermissionSeeder],
})
export class SeederModule {} 
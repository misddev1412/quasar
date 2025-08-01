import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';
import { Permission } from '../../modules/user/entities/permission.entity';
import { RolePermission } from '../../modules/user/entities/role-permission.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { UserRole } from '../../modules/user/entities/user-role.entity';
import { UserActivity } from '../../modules/user/entities/user-activity.entity';
import { UserSession } from '../../modules/user/entities/user-session.entity';
import { SEOEntity } from '../../modules/seo/entities/seo.entity';
import { SettingEntity } from '../../modules/settings/entities/setting.entity';
import { PermissionRepository } from '../../modules/user/repositories/permission.repository';
import { AdminPermissionService } from '../../modules/user/services/admin/admin-permission.service';
import { PermissionCheckerService } from '../../modules/shared/services/permission-checker.service';
import { PermissionSeeder } from './permission.seeder';
import { SeoSeeder } from './seo.seeder';
import { AdminSeeder } from './admin.seeder';
import { SettingsSeeder } from './settings.seeder';
import { UserActivitySeeder } from './user-activity.seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Permission,
      RolePermission,
      Role,
      UserRole,
      UserActivity,
      UserSession,
      SEOEntity,
      SettingEntity
    ]),
  ],
  providers: [
    PermissionRepository,
    PermissionCheckerService,
    AdminPermissionService,
    PermissionSeeder,
    SeoSeeder,
    AdminSeeder,
    SettingsSeeder,
    UserActivitySeeder
  ],
  exports: [PermissionSeeder, SeoSeeder, AdminSeeder, SettingsSeeder, UserActivitySeeder],
})
export class SeederModule {} 
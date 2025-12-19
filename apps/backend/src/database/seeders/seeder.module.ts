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
import { SectionEntity } from '../../modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '../../modules/sections/entities/section-translation.entity';
import { Country } from '../../modules/products/entities/country.entity';
import { Currency } from '../../modules/products/entities/currency.entity';
import { AdministrativeDivision } from '../../modules/products/entities/administrative-division.entity';
import { Warehouse } from '../../modules/products/entities/warehouse.entity';
import { MenuEntity } from '../../modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '../../modules/menus/entities/menu-translation.entity';
import { SiteContentEntity } from '../../modules/site-content/entities/site-content.entity';
import { ComponentConfigEntity } from '../../modules/component-configs/entities/component-config.entity';
import { Attribute } from '../../modules/products/entities/attribute.entity';
import { AttributeValue } from '../../modules/products/entities/attribute-value.entity';
import { PermissionRepository } from '../../modules/user/repositories/permission.repository';
import { AdminPermissionService } from '../../modules/user/services/admin/admin-permission.service';
import { PermissionCheckerService } from '../../modules/shared/services/permission-checker.service';
import { PermissionSeeder } from './permission.seeder';
import { SeoSeeder } from './seo.seeder';
import { AdminSeeder } from './admin.seeder';
import { SettingsSeeder } from './settings.seeder';
import { SectionsSeeder } from './sections.seeder';
import { UserActivitySeeder } from './user-activity.seeder';
import { CountriesSeeder } from './countries.seeder';
import { AdministrativeDivisionsSeeder } from './administrative-divisions.seeder';
import { WarehouseSeeder } from './warehouse.seeder';
import { MenusSeeder } from './menus.seeder';
import { CurrencySeeder } from './currency.seeder';
import { SiteContentSeeder } from './site-content.seeder';
import { ComponentConfigsSeeder } from './component-configs.seeder';
import { AttributesSeeder } from './attributes.seeder';
import { NotificationEventFlow } from '../../modules/notifications/entities/notification-event-flow.entity';
import { NotificationEventFlowSeeder } from './notification-event-flow.seeder';

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
      SettingEntity,
      SectionEntity,
      SectionTranslationEntity,
      Country,
      Currency,
      AdministrativeDivision,
      Warehouse,
      MenuEntity,
      MenuTranslationEntity,
      SiteContentEntity,
      ComponentConfigEntity,
      Attribute,
      AttributeValue,
      NotificationEventFlow,
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
    SectionsSeeder,
    UserActivitySeeder,
    CountriesSeeder,
    CurrencySeeder,
    AdministrativeDivisionsSeeder,
    WarehouseSeeder,
    MenusSeeder,
    SiteContentSeeder,
    ComponentConfigsSeeder,
    AttributesSeeder,
    NotificationEventFlowSeeder,
  ],
  exports: [
    PermissionSeeder,
    SeoSeeder,
    AdminSeeder,
    SettingsSeeder,
    SectionsSeeder,
    UserActivitySeeder,
    CountriesSeeder,
    CurrencySeeder,
    AdministrativeDivisionsSeeder,
    WarehouseSeeder,
    MenusSeeder,
    SiteContentSeeder,
    ComponentConfigsSeeder,
    AttributesSeeder,
    NotificationEventFlowSeeder,
  ],
})
export class SeederModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { UserRole } from '@backend/modules/user/entities/user-role.entity';
import { UserActivity } from '@backend/modules/user/entities/user-activity.entity';
import { UserSession } from '@backend/modules/user/entities/user-session.entity';
import { SEOEntity } from '@backend/modules/seo/entities/seo.entity';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';
import { SectionEntity } from '@backend/modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '@backend/modules/sections/entities/section-translation.entity';
import { Country } from '@backend/modules/products/entities/country.entity';
import { Currency } from '@backend/modules/products/entities/currency.entity';
import { AdministrativeDivision } from '@backend/modules/products/entities/administrative-division.entity';
import { Warehouse } from '@backend/modules/products/entities/warehouse.entity';
import { MenuEntity } from '@backend/modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '@backend/modules/menus/entities/menu-translation.entity';
import { SiteContentEntity } from '@backend/modules/site-content/entities/site-content.entity';
import { ComponentConfigEntity } from '@backend/modules/component-configs/entities/component-config.entity';
import { Attribute } from '@backend/modules/products/entities/attribute.entity';

import { AttributeValue } from '@backend/modules/products/entities/attribute-value.entity';
import { Service } from '@backend/modules/services/entities/service.entity';
import { ServiceTranslation } from '@backend/modules/services/entities/service-translation.entity';
import { ServiceItem } from '@backend/modules/services/entities/service-item.entity';
import { ServiceItemTranslation } from '@backend/modules/services/entities/service-item-translation.entity';
import { PermissionRepository } from '@backend/modules/user/repositories/permission.repository';
import { AdminPermissionService } from '@backend/modules/user/services/admin/admin-permission.service';
import { PermissionCheckerService } from '@backend/modules/shared/services/permission-checker.service';
import { PermissionSeeder } from '@backend/database/seeders/permission.seeder';
import { SeoSeeder } from '@backend/database/seeders/seo.seeder';
import { AdminSeeder } from '@backend/database/seeders/admin.seeder';
import { SettingsSeeder } from '@backend/database/seeders/settings.seeder';
import { SectionsSeeder } from '@backend/database/seeders/sections.seeder';
import { UserActivitySeeder } from '@backend/database/seeders/user-activity.seeder';
import { CountriesSeeder } from '@backend/database/seeders/countries.seeder';
import { AdministrativeDivisionsSeeder } from '@backend/database/seeders/administrative-divisions.seeder';
import { WarehouseSeeder } from '@backend/database/seeders/warehouse.seeder';
import { MenusSeeder } from '@backend/database/seeders/menus.seeder';
import { CurrencySeeder } from '@backend/database/seeders/currency.seeder';
import { SiteContentSeeder } from '@backend/database/seeders/site-content.seeder';
import { ComponentConfigsSeeder } from '@backend/database/seeders/component-configs.seeder';
import { AttributesSeeder } from '@backend/database/seeders/attributes.seeder';
import { NotificationEventFlow } from '@backend/modules/notifications/entities/notification-event-flow.entity';

import { NotificationEventFlowSeeder } from '@backend/database/seeders/notification-event-flow.seeder';
import { ServicesSeeder } from '@backend/database/seeders/services.seeder';
import { LanguagesSeeder } from '@backend/database/seeders/languages.seeder';
import { Language } from '@backend/modules/language/entities/language.entity';

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
      Service,
      ServiceTranslation,
      ServiceItem,
      ServiceItemTranslation,
      Language,
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
    ServicesSeeder,
    LanguagesSeeder,
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
    ServicesSeeder,
    LanguagesSeeder,
  ],
})
export class SeederModule { }

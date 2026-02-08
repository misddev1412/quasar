#!/usr/bin/env ts-node

// Import reflect-metadata first for TypeORM decorators
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SeederModule } from '@backend/database/seeders/seeder.module';
import { PermissionSeeder } from '@backend/database/seeders/permission.seeder';
import { SeoSeeder } from '@backend/database/seeders/seo.seeder';
import { AdminSeeder } from '@backend/database/seeders/admin.seeder';
import { SettingsSeeder } from '@backend/database/seeders/settings.seeder';
import { SectionsSeeder } from '@backend/database/seeders/sections.seeder';
import { UserActivitySeeder } from '@backend/database/seeders/user-activity.seeder';
import { CountriesSeeder } from '@backend/database/seeders/countries.seeder';
import { CurrencySeeder } from '@backend/database/seeders/currency.seeder';
import { AdministrativeDivisionsSeeder } from '@backend/database/seeders/administrative-divisions.seeder';
import { WarehouseSeeder } from '@backend/database/seeders/warehouse.seeder';
import { MenusSeeder } from '@backend/database/seeders/menus.seeder';
import { SiteContentSeeder } from '@backend/database/seeders/site-content.seeder';
import { ComponentConfigsSeeder } from '@backend/database/seeders/component-configs.seeder';
import { AttributesSeeder } from '@backend/database/seeders/attributes.seeder';
import { NotificationEventFlowSeeder } from '@backend/database/seeders/notification-event-flow.seeder';
import { ServicesSeeder } from '@backend/database/seeders/services.seeder';
import { LanguagesSeeder } from '@backend/database/seeders/languages.seeder';
import databaseConfig from '@backend/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env', '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),
    SeederModule,
  ],
})
export class MainSeederApp { }

/**
 * Bootstrap the seeder application
 */
export async function bootstrap() {
  const app = await NestFactory.create(MainSeederApp);

  try {
    const permissionSeeder = app.get(PermissionSeeder);
    const seoSeeder = app.get(SeoSeeder);
    const adminSeeder = app.get(AdminSeeder);
    const settingsSeeder = app.get(SettingsSeeder);
    const sectionsSeeder = app.get(SectionsSeeder);
    const userActivitySeeder = app.get(UserActivitySeeder);
    const countriesSeeder = app.get(CountriesSeeder);
    const currencySeeder = app.get(CurrencySeeder);
    const administrativeDivisionsSeeder = app.get(AdministrativeDivisionsSeeder);
    const warehouseSeeder = app.get(WarehouseSeeder);
    const menusSeeder = app.get(MenusSeeder);
    const siteContentSeeder = app.get(SiteContentSeeder);
    const componentConfigsSeeder = app.get(ComponentConfigsSeeder);
    const attributesSeeder = app.get(AttributesSeeder);
    const notificationEventFlowSeeder = app.get(NotificationEventFlowSeeder);
    const servicesSeeder = app.get(ServicesSeeder);
    const languagesSeeder = app.get(LanguagesSeeder);

    // Run seeders in order (countries first, then currencies, then administrative divisions, then permissions and admin, then warehouses, then user activities)
    await languagesSeeder.seed();
    await countriesSeeder.seed();
    await currencySeeder.seed();
    await administrativeDivisionsSeeder.seed();
    await permissionSeeder.seed();
    await seoSeeder.seed();
    await adminSeeder.seed();
    await settingsSeeder.seed();
    await sectionsSeeder.seed();
    await notificationEventFlowSeeder.seed();
    await componentConfigsSeeder.seed();
    await attributesSeeder.seed();
    await menusSeeder.seed();
    await warehouseSeeder.seed();
    await siteContentSeeder.seed();
    await servicesSeeder.seed();
    await userActivitySeeder.seed();

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

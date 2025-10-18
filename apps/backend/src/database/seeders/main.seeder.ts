#!/usr/bin/env ts-node

// Import reflect-metadata first for TypeORM decorators
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SeederModule } from './seeder.module';
import { PermissionSeeder } from './permission.seeder';
import { SeoSeeder } from './seo.seeder';
import { AdminSeeder } from './admin.seeder';
import { SettingsSeeder } from './settings.seeder';
import { SectionsSeeder } from './sections.seeder';
import { UserActivitySeeder } from './user-activity.seeder';
import { CountriesSeeder } from './countries.seeder';
import { AdministrativeDivisionsSeeder } from './administrative-divisions.seeder';
import { MenusSeeder } from './menus.seeder';
import databaseConfig from '../../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),
    SeederModule,
  ],
})
export class MainSeederApp {}

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
    const administrativeDivisionsSeeder = app.get(AdministrativeDivisionsSeeder);
    const menusSeeder = app.get(MenusSeeder);

    // Run seeders in order (countries first, then administrative divisions, then permissions and admin, then user activities)
    await countriesSeeder.seed();
    await administrativeDivisionsSeeder.seed();
    await permissionSeeder.seed();
    await seoSeeder.seed();
    await adminSeeder.seed();
    await settingsSeeder.seed();
    await sectionsSeeder.seed();
    await menusSeeder.seed();
    await userActivitySeeder.seed();

    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
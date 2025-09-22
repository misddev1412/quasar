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
import { UserActivitySeeder } from './user-activity.seeder';
import { CountriesSeeder } from './countries.seeder';
import { AdministrativeDivisionsSeeder } from './administrative-divisions.seeder';
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
export class DynamicSeederApp {}

// Map of available seeders
const AVAILABLE_SEEDERS = {
  countries: CountriesSeeder,
  'administrative-divisions': AdministrativeDivisionsSeeder,
  permissions: PermissionSeeder,
  seo: SeoSeeder,
  admin: AdminSeeder,
  settings: SettingsSeeder,
  'user-activity': UserActivitySeeder,
};

/**
 * Bootstrap the dynamic seeder application
 */
export async function bootstrap() {
  const seederName = process.argv[2];

  if (!seederName) {
    console.error('❌ Error: Please specify a seeder name');
    console.log('📋 Available seeders:');
    Object.keys(AVAILABLE_SEEDERS).forEach(name => {
      console.log(`   - ${name}`);
    });
    console.log('\n💡 Usage: npm run seed:{seederName}');
    process.exit(1);
  }

  if (!AVAILABLE_SEEDERS[seederName]) {
    console.error(`❌ Error: Seeder '${seederName}' not found`);
    console.log('📋 Available seeders:');
    Object.keys(AVAILABLE_SEEDERS).forEach(name => {
      console.log(`   - ${name}`);
    });
    process.exit(1);
  }

  const app = await NestFactory.create(DynamicSeederApp);

  try {
    const SeederClass = AVAILABLE_SEEDERS[seederName];
    const seeder = app.get(SeederClass);

    console.log(`🌱 Running ${seederName} seeder...`);
    await seeder.seed();

    console.log(`✅ ${seederName} seeder completed successfully`);
  } catch (error) {
    console.error(`❌ Error during ${seederName} seeding:`, error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
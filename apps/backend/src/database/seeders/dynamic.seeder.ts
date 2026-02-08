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
import { UserActivitySeeder } from '@backend/database/seeders/user-activity.seeder';
import { CountriesSeeder } from '@backend/database/seeders/countries.seeder';
import { AdministrativeDivisionsSeeder } from '@backend/database/seeders/administrative-divisions.seeder';
import databaseConfig from '@backend/config/database.config';
import { SectionsSeeder } from '@backend/database/seeders/sections.seeder';
import { MenusSeeder } from '@backend/database/seeders/menus.seeder';
import { ComponentConfigsSeeder } from '@backend/database/seeders/component-configs.seeder';
import { NotificationEventFlowSeeder } from '@backend/database/seeders/notification-event-flow.seeder';
import { ServicesSeeder } from '@backend/database/seeders/services.seeder';

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
export class DynamicSeederApp { }

// Map of available seeders
const AVAILABLE_SEEDERS = {
  countries: CountriesSeeder,
  'administrative-divisions': AdministrativeDivisionsSeeder,
  permissions: PermissionSeeder,
  seo: SeoSeeder,
  admin: AdminSeeder,
  settings: SettingsSeeder,
  'user-activity': UserActivitySeeder,
  section: SectionsSeeder,
  menus: MenusSeeder,
  'component-configs': ComponentConfigsSeeder,
  'notification-event-flows': NotificationEventFlowSeeder,
  services: ServicesSeeder,
} as const;

const printLine = (text = '') => {
  process.stdout.write(`${text}\n`);
};

type SeederKey = keyof typeof AVAILABLE_SEEDERS;

function printAvailableSeeders() {
  printLine('📋 Available seeders:');
  (Object.keys(AVAILABLE_SEEDERS) as SeederKey[]).forEach(name => {
    printLine(`   - ${name}`);
  });
}

function showUsageAndExit(code = 1) {
  printLine('\n💡 Usage:');
  printLine('   yarn seed --tables=seo,settings');
  printLine('   yarn seed --tables countries');
  printLine('   yarn seed seo');
  printLine('   yarn seed component-configs');
  printLine('\nOptions:');
  printLine('   --tables=<names>  Comma separated list of seeder names');
  printLine('   --tables <names>  Space separated seeder names');
  printLine('   --list            Show available seeders');
  process.exit(code);
}

function parseTablesFromArgs(argv: string[]): SeederKey[] {
  if (argv.length === 0) {
    printAvailableSeeders();
    showUsageAndExit();
  }

  const tables = new Set<string>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--list') {
      printAvailableSeeders();
      process.exit(0);
    }

    if (arg === '--help' || arg === '-h') {
      printAvailableSeeders();
      showUsageAndExit(0);
    }

    if (arg.startsWith('--tables=')) {
      const value = arg.split('=')[1];
      value
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .forEach(name => tables.add(name));
      continue;
    }

    if (arg === '--tables') {
      const value = argv[++i];
      if (!value) {
        console.error('❌ Error: Missing value for --tables option.');
        showUsageAndExit();
      }

      value
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .forEach(name => tables.add(name));
      continue;
    }

    if (!arg.startsWith('-')) {
      tables.add(arg.trim());
      continue;
    }

    console.error(`❌ Error: Unknown argument '${arg}'.`);
    showUsageAndExit();
  }

  if (tables.size === 0) {
    console.error('❌ Error: Please specify at least one seeder.');
    printAvailableSeeders();
    showUsageAndExit();
  }

  const invalid: string[] = [];
  const normalized: SeederKey[] = [];

  tables.forEach(table => {
    if ((AVAILABLE_SEEDERS as Record<string, unknown>)[table]) {
      normalized.push(table as SeederKey);
    } else {
      invalid.push(table);
    }
  });

  if (invalid.length) {
    console.error(`❌ Error: Unknown seeder(s): ${invalid.join(', ')}`);
    printAvailableSeeders();
    process.exit(1);
  }

  return normalized;
}

/**
 * Bootstrap the dynamic seeder application
 */
export async function bootstrap() {
  const tablesToSeed = parseTablesFromArgs(process.argv.slice(2));

  const app = await NestFactory.create(DynamicSeederApp);

  try {
    for (const table of tablesToSeed) {
      const SeederClass = AVAILABLE_SEEDERS[table];
      const seeder = app.get(SeederClass);

      printLine(`🌱 Running ${table} seeder...`);
      await seeder.seed();
      printLine(`✅ ${table} seeder completed successfully`);
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

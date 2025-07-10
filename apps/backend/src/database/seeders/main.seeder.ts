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
class MainSeederApp {}

interface SeederFlags {
  permissions?: boolean;
  roles?: boolean;
  seo?: boolean;
  all?: boolean;
  force?: boolean;
  clear?: boolean;
  reseed?: boolean;
  help?: boolean;
  safe?: boolean;
}

function parseFlags(): SeederFlags {
  const args = process.argv.slice(2);
  const flags: SeederFlags = {};

  for (const arg of args) {
    switch (arg) {
      case '--permissions':
      case '-p':
        flags.permissions = true;
        break;
      case '--roles':
      case '-r':
        flags.roles = true;
        break;
      case '--seo':
        flags.seo = true;
        break;
      case '--all':
      case '-a':
        flags.all = true;
        break;
      case '--force':
      case '-f':
        flags.force = true;
        break;
      case '--clear':
      case '-c':
        flags.clear = true;
        break;
      case '--reseed':
        flags.reseed = true;
        break;
      case '--safe':
      case '-s':
        flags.safe = true;
        break;
      case '--help':
      case '-h':
        flags.help = true;
        break;
    }
  }

  return flags;
}

function showHelp() {
  console.log('🌱 Database Seeder Commands\n');
  console.log('Usage: yarn seed [flags]\n');
  
  console.log('🏷️  Flags:');
  console.log('  --permissions, -p    Seed permissions');
  console.log('  --roles, -r          Seed roles only');
  console.log('  --seo                Seed SEO data');
  console.log('  --all, -a            Run all seeders');
  console.log('  --force, -f          Force seed (may create duplicates)');
  console.log('  --clear, -c          Clear all data and reseed (destructive)');
  console.log('  --reseed             Reseed data (may create duplicates)');
  console.log('  --safe, -s           Safe seed (only if empty) - default');
  console.log('  --help, -h           Show this help\n');
  
  console.log('💡 Examples:');
  console.log('  yarn seed                    # Safe seed (default)');
  console.log('  yarn seed --permissions      # Seed permissions (safe)');
  console.log('  yarn seed --seo              # Seed SEO data (safe)');
  console.log('  yarn seed --permissions --force');
  console.log('  yarn seed --roles            # Seed roles only');
  console.log('  yarn seed --all              # Run all seeders');
  console.log('  yarn seed --clear            # Destructive clear & reseed');
  console.log('  yarn seed --permissions --reseed\n');
  
  console.log('⚠️  Notes:');
  console.log('  - Default behavior is safe seeding (only if database empty)');
  console.log('  - --clear is destructive and will delete existing data');
  console.log('  - --force and --reseed may create duplicates');
}

async function bootstrap() {
  console.log('🚀 Starting Database Seeder...\n');

  try {
    const flags = parseFlags();

    // Show help if requested or no specific flags
    if (flags.help) {
      showHelp();
      process.exit(0);
    }

    const app = await NestFactory.create(MainSeederApp, {
      logger: ['error', 'warn'],
    });

    const permissionSeeder = app.get(PermissionSeeder);
    const seoSeeder = app.get(SeoSeeder);

    // Determine what to run based on flags
    if (flags.clear) {
      console.log('🗑️  Running clear and reseed (destructive)...\n');
      console.log('⚠️  This will delete all existing permissions and roles!\n');
      if (flags.permissions || (!flags.roles && !flags.all && !flags.seo)) {
        await permissionSeeder.clearAndReseed();
      }
    } else if (flags.all) {
      console.log('🌱 Running all seeders...\n');
      await permissionSeeder.seedIfEmpty();
      await seoSeeder.seed();
      // Add other seeders here when available
    } else if (flags.roles) {
      console.log('🎭 Seeding roles only...\n');
      await permissionSeeder.seedRoles();
    } else if (flags.seo) {
      console.log('🔍 Seeding SEO data...\n');
      await seoSeeder.seed();
    } else if (flags.permissions) {
      if (flags.force) {
        console.log('📋 Force seeding permissions (may create duplicates)...\n');
        await permissionSeeder.seed();
      } else if (flags.reseed) {
        console.log('🔄 Reseeding permissions (may create duplicates)...\n');
        await permissionSeeder.reseed();
      } else {
        console.log('📋 Seeding permissions (safe - only if empty)...\n');
        await permissionSeeder.seedIfEmpty();
      }
    } else {
      // Default behavior - safe seed
      console.log('🔍 Running safe seed (only if database empty)...\n');
      console.log('💡 Use --help to see all available options\n');
      await permissionSeeder.seedIfEmpty();
      await seoSeeder.seed();
    }

    console.log('\n🎉 Database seeding completed successfully!');
    await app.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    console.error('\n📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Only run if this file is executed directly
if (require.main === module) {
  bootstrap();
}

export { MainSeederApp, bootstrap };
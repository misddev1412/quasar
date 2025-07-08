import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederModule } from '../database/seeders/seeder.module';
import { PermissionSeeder } from '../database/seeders/permission.seeder';

// Create a temporary app module for seeding
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'password',
        database: configService.get('DB_DATABASE') || 'quasar_db',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Don't auto-sync in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    SeederModule,
  ],
})
class SeedAppModule {}

async function bootstrap() {
  console.log('🚀 Starting permission seeder...');
  
  const app = await NestFactory.createApplicationContext(SeedAppModule);
  
  try {
    const seeder = app.get(PermissionSeeder);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'seed-if-empty';
    
    switch (command) {
      case 'seed':
        console.log('📦 Running full seed (will create all permissions)...');
        await seeder.seed();
        break;
      case 'seed-if-empty':
        console.log('🔍 Checking if permissions exist before seeding...');
        await seeder.seedIfEmpty();
        break;
      case 'reseed':
        console.log('🔄 Re-seeding all permissions...');
        await seeder.reseed();
        break;
      default:
        console.log('❓ Unknown command. Available commands:');
        console.log('  - seed: Create all permissions (may create duplicates)');
        console.log('  - seed-if-empty: Only seed if no permissions exist (default)');
        console.log('  - reseed: Force re-seed all permissions');
        process.exit(1);
    }
    
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap(); 
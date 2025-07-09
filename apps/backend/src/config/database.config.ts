import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'quasar_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Always false for production safety
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})); 
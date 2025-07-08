import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'quasar_db',
  // Don't load entities for migration CLI to avoid import issues
  entities: [],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
}); 
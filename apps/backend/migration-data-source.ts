import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

// Migration-specific DataSource - no entities imported to avoid circular dependencies
const migrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'quasar_db',

  // No entities for migration CLI to avoid import issues
  entities: [],

  // Migrations configuration - use absolute paths for better compatibility
  migrations: [path.join(__dirname, 'src/database/migrations/*.ts')],
  migrationsTableName: 'migrations',
  migrationsRun: false,

  // Logging
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],

  // Schema synchronization - always false for migrations
  synchronize: false,

  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Export only default export as required by TypeORM CLI
export default migrationDataSource;
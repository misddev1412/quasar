import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Migration-specific DataSource - no entities imported to avoid circular dependencies
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'quasar_db',
  
  // No entities for migration CLI to avoid import issues
  entities: [],
  
  // Migrations configuration
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  
  // Logging
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  
  // Schema synchronization - always false for migrations
  synchronize: false,
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}); 
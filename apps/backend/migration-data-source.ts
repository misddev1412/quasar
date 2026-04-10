const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env'), override: true });

const isTruthy = (value) =>
  ['1', 'true', 'yes', 'on', 'require'].includes((value || '').toLowerCase());

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

  // SSL configuration (needed for managed PostgreSQL providers)
  ssl:
    isTruthy(process.env.DB_SSL) || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED) }
      : false,
});

// Export only default export as required by TypeORM CLI
module.exports = migrationDataSource;

import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isTruthy = (value?: string): boolean =>
  ['1', 'true', 'yes', 'on', 'require'].includes((value || '').toLowerCase());

export default registerAs('database', (): TypeOrmModuleOptions => {
  const useSsl = isTruthy(process.env.DB_SSL) || process.env.NODE_ENV === 'production';
  const rejectUnauthorized = isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED);

  return {
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
    ssl: useSsl ? { rejectUnauthorized } : false,
  };
});

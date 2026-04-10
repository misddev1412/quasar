import { registerAs } from '@nestjs/config';

const isTruthy = (value?: string): boolean =>
  ['1', 'true', 'yes', 'on', 'require'].includes((value || '').toLowerCase());

export default registerAs('database', () => {
  const useSsl = isTruthy(process.env.DB_SSL) || process.env.NODE_ENV === 'production';
  const rejectUnauthorized = isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED);

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'quasar_db',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: useSsl ? { rejectUnauthorized } : false,
  };
});

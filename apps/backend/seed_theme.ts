
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'quasar_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function run() {
    await dataSource.initialize();
    console.log('Database connected');

    try {
        await dataSource.query(`
      INSERT INTO "settings" ("key", "value", "type", "group", "is_public", "description", "created_at", "updated_at") VALUES
      ('storefront.theme.font_family', 'Inter, sans-serif', 'string', 'storefront_appearance', true, 'Storefront font family', NOW(), NOW()),
      ('storefront.theme.primary_color', '#0f172a', 'string', 'storefront_appearance', true, 'Storefront primary color', NOW(), NOW()),
      ('storefront.theme.mode', 'light', 'string', 'storefront_appearance', true, 'Storefront default mode', NOW(), NOW()),
      ('storefront.theme.border_radius', 'md', 'string', 'storefront_appearance', true, 'Storefront border radius', NOW(), NOW())
      ON CONFLICT ("key") DO NOTHING;
    `);
        console.log('Settings inserted successfully');
    } catch (err) {
        console.error('Error inserting settings:', err);
    } finally {
        await dataSource.destroy();
    }
}

run();

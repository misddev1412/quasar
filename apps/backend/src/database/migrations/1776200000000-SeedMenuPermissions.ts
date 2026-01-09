import { MigrationInterface, QueryRunner } from 'typeorm';

type MenuPermissionSeed = {
  name: string;
  resource: string;
  action: string;
  scope: string;
  description: string;
};

const MENU_PERMISSION_SEEDS: MenuPermissionSeed[] = [
  { name: 'read:any:analytics', resource: 'analytics', action: 'read', scope: 'any', description: 'Access to routes: /analytics, /visitor-analytics' },
  { name: 'read:any:brand', resource: 'brand', action: 'read', scope: 'any', description: 'Access to routes: /brand-assets' },
  { name: 'create:any:component_config', resource: 'component_config', action: 'create', scope: 'any', description: 'Access to routes: /component-configs/create' },
  { name: 'read:any:component_config', resource: 'component_config', action: 'read', scope: 'any', description: 'Access to routes: /component-configs' },
  { name: 'update:any:component_config', resource: 'component_config', action: 'update', scope: 'any', description: 'Access to routes: /component-configs/:id/edit' },
  { name: 'create:any:currency', resource: 'currency', action: 'create', scope: 'any', description: 'Access to routes: /currencies/create' },
  { name: 'read:any:currency', resource: 'currency', action: 'read', scope: 'any', description: 'Access to routes: /currencies' },
  { name: 'update:any:currency', resource: 'currency', action: 'update', scope: 'any', description: 'Access to routes: /currencies/:id/edit' },
  { name: 'create:any:customer', resource: 'customer', action: 'create', scope: 'any', description: 'Access to routes: /customers/create' },
  { name: 'read:any:customer', resource: 'customer', action: 'read', scope: 'any', description: 'Access to routes: /customers, /customers/:id' },
  { name: 'update:any:customer', resource: 'customer', action: 'update', scope: 'any', description: 'Access to routes: /customers/:id/edit' },
  { name: 'read:any:dashboard', resource: 'dashboard', action: 'read', scope: 'any', description: 'Access to routes: /' },
  { name: 'read:any:delivery_method', resource: 'delivery_method', action: 'read', scope: 'any', description: 'Access to routes: /delivery-methods' },
  { name: 'create:any:email_flow', resource: 'email_flow', action: 'create', scope: 'any', description: 'Access to routes: /email-flows/create' },
  { name: 'read:any:email_flow', resource: 'email_flow', action: 'read', scope: 'any', description: 'Access to routes: /email-flows' },
  { name: 'update:any:email_flow', resource: 'email_flow', action: 'update', scope: 'any', description: 'Access to routes: /email-flows/:id/edit' },
  { name: 'create:any:firebase_config', resource: 'firebase_config', action: 'create', scope: 'any', description: 'Access to routes: /firebase-configs/create' },
  { name: 'read:any:firebase_config', resource: 'firebase_config', action: 'read', scope: 'any', description: 'Access to routes: /firebase-configs' },
  { name: 'update:any:firebase_config', resource: 'firebase_config', action: 'update', scope: 'any', description: 'Access to routes: /firebase-configs/:id' },
  { name: 'read:any:help', resource: 'help', action: 'read', scope: 'any', description: 'Access to routes: /help' },
  { name: 'create:any:language', resource: 'language', action: 'create', scope: 'any', description: 'Access to routes: /languages/create' },
  { name: 'read:any:language', resource: 'language', action: 'read', scope: 'any', description: 'Access to routes: /languages' },
  { name: 'update:any:language', resource: 'language', action: 'update', scope: 'any', description: 'Access to routes: /languages/:id/edit' },
  { name: 'read:any:loyalty', resource: 'loyalty', action: 'read', scope: 'any', description: 'Access to routes: /loyalty, /loyalty/stats' },
  { name: 'create:any:loyalty_reward', resource: 'loyalty_reward', action: 'create', scope: 'any', description: 'Access to routes: /loyalty/rewards/create' },
  { name: 'read:any:loyalty_reward', resource: 'loyalty_reward', action: 'read', scope: 'any', description: 'Access to routes: /loyalty/rewards' },
  { name: 'create:any:loyalty_tier', resource: 'loyalty_tier', action: 'create', scope: 'any', description: 'Access to routes: /loyalty/tiers/create' },
  { name: 'read:any:loyalty_tier', resource: 'loyalty_tier', action: 'read', scope: 'any', description: 'Access to routes: /loyalty/tiers' },
  { name: 'update:any:loyalty_tier', resource: 'loyalty_tier', action: 'update', scope: 'any', description: 'Access to routes: /loyalty/tiers/:id/edit' },
  { name: 'read:any:loyalty_transaction', resource: 'loyalty_transaction', action: 'read', scope: 'any', description: 'Access to routes: /loyalty/transactions' },
  { name: 'create:any:mail_provider', resource: 'mail_provider', action: 'create', scope: 'any', description: 'Access to routes: /mail-providers/create' },
  { name: 'read:any:mail_provider', resource: 'mail_provider', action: 'read', scope: 'any', description: 'Access to routes: /mail-providers' },
  { name: 'update:any:mail_provider', resource: 'mail_provider', action: 'update', scope: 'any', description: 'Access to routes: /mail-providers/:id/edit' },
  { name: 'create:any:mail_template', resource: 'mail_template', action: 'create', scope: 'any', description: 'Access to routes: /mail-templates/create' },
  { name: 'read:any:mail_template', resource: 'mail_template', action: 'read', scope: 'any', description: 'Access to routes: /mail-templates' },
  { name: 'update:any:mail_template', resource: 'mail_template', action: 'update', scope: 'any', description: 'Access to routes: /mail-templates/:id' },
  { name: 'read:any:menu', resource: 'menu', action: 'read', scope: 'any', description: 'Access to routes: /menus/:group' },
  { name: 'read:any:notification', resource: 'notification', action: 'read', scope: 'any', description: 'Access to routes: /notifications' },
  { name: 'update:any:notification', resource: 'notification', action: 'update', scope: 'any', description: 'Access to routes: /notifications/preferences, /notifications/event-flows' },
  { name: 'create:any:order', resource: 'order', action: 'create', scope: 'any', description: 'Access to routes: /orders/new' },
  { name: 'read:any:order', resource: 'order', action: 'read', scope: 'any', description: 'Access to routes: /orders, /orders/:id' },
  { name: 'update:any:order', resource: 'order', action: 'update', scope: 'any', description: 'Access to routes: /orders/:id/edit' },
  { name: 'create:any:order_fulfillment', resource: 'order_fulfillment', action: 'create', scope: 'any', description: 'Access to routes: /orders/fulfillments/new' },
  { name: 'read:any:order_fulfillment', resource: 'order_fulfillment', action: 'read', scope: 'any', description: 'Access to routes: /orders/fulfillments, /orders/fulfillments/:id' },
  { name: 'update:any:order_fulfillment', resource: 'order_fulfillment', action: 'update', scope: 'any', description: 'Access to routes: /orders/fulfillments/:id/edit' },
  { name: 'read:any:payment_method', resource: 'payment_method', action: 'read', scope: 'any', description: 'Access to routes: /payment-methods' },
  { name: 'create:any:permission', resource: 'permission', action: 'create', scope: 'any', description: 'Access to routes: /permissions/create' },
  { name: 'read:any:permission', resource: 'permission', action: 'read', scope: 'any', description: 'Access to routes: /permissions' },
  { name: 'update:any:permission', resource: 'permission', action: 'update', scope: 'any', description: 'Access to routes: /permissions/:id' },
  { name: 'create:any:post', resource: 'post', action: 'create', scope: 'any', description: 'Access to routes: /posts/create' },
  { name: 'read:any:post', resource: 'post', action: 'read', scope: 'any', description: 'Access to routes: /posts' },
  { name: 'update:any:post', resource: 'post', action: 'update', scope: 'any', description: 'Access to routes: /posts/:id' },
  { name: 'read:any:post_category', resource: 'post_category', action: 'read', scope: 'any', description: 'Access to routes: /posts/categories' },
  { name: 'read:any:post_tag', resource: 'post_tag', action: 'read', scope: 'any', description: 'Access to routes: /posts/tags' },
  { name: 'create:any:product', resource: 'product', action: 'create', scope: 'any', description: 'Access to routes: /products/create' },
  { name: 'read:any:product', resource: 'product', action: 'read', scope: 'any', description: 'Access to routes: /products' },
  { name: 'update:any:product', resource: 'product', action: 'update', scope: 'any', description: 'Access to routes: /products/:id/edit' },
  { name: 'read:any:product_attribute', resource: 'product_attribute', action: 'read', scope: 'any', description: 'Access to routes: /products/attributes' },
  { name: 'read:any:product_brand', resource: 'product_brand', action: 'read', scope: 'any', description: 'Access to routes: /products/brands' },
  { name: 'create:any:product_category', resource: 'product_category', action: 'create', scope: 'any', description: 'Access to routes: /products/categories/create' },
  { name: 'read:any:product_category', resource: 'product_category', action: 'read', scope: 'any', description: 'Access to routes: /products/categories' },
  { name: 'update:any:product_category', resource: 'product_category', action: 'update', scope: 'any', description: 'Access to routes: /products/categories/:id/edit' },
  { name: 'read:any:product_supplier', resource: 'product_supplier', action: 'read', scope: 'any', description: 'Access to routes: /products/suppliers' },
  { name: 'read:own:profile', resource: 'profile', action: 'read', scope: 'own', description: 'Access to routes: /profile' },
  { name: 'create:any:role', resource: 'role', action: 'create', scope: 'any', description: 'Access to routes: /roles/create' },
  { name: 'read:any:role', resource: 'role', action: 'read', scope: 'any', description: 'Access to routes: /roles' },
  { name: 'update:any:role', resource: 'role', action: 'update', scope: 'any', description: 'Access to routes: /roles/:id' },
  { name: 'create:any:section', resource: 'section', action: 'create', scope: 'any', description: 'Access to routes: /sections/:page/create' },
  { name: 'read:any:section', resource: 'section', action: 'read', scope: 'any', description: 'Access to routes: /sections/:page' },
  { name: 'update:any:section', resource: 'section', action: 'update', scope: 'any', description: 'Access to routes: /sections/:page/:sectionId/edit' },
  { name: 'read:any:seo', resource: 'seo', action: 'read', scope: 'any', description: 'Access to routes: /seo' },
  { name: 'read:any:setting', resource: 'setting', action: 'read', scope: 'any', description: 'Access to routes: /settings' },
  { name: 'update:any:setting', resource: 'setting', action: 'update', scope: 'any', description: 'Access to routes: /settings/floating-icons, /settings/visibility' },
  { name: 'create:any:shipping_provider', resource: 'shipping_provider', action: 'create', scope: 'any', description: 'Access to routes: /shipping-providers/create' },
  { name: 'read:any:shipping_provider', resource: 'shipping_provider', action: 'read', scope: 'any', description: 'Access to routes: /shipping-providers' },
  { name: 'update:any:shipping_provider', resource: 'shipping_provider', action: 'update', scope: 'any', description: 'Access to routes: /shipping-providers/:id/edit' },
  { name: 'create:any:site_content', resource: 'site_content', action: 'create', scope: 'any', description: 'Access to routes: /site-content/create' },
  { name: 'read:any:site_content', resource: 'site_content', action: 'read', scope: 'any', description: 'Access to routes: /site-content' },
  { name: 'update:any:site_content', resource: 'site_content', action: 'update', scope: 'any', description: 'Access to routes: /site-content/:id/edit' },
  { name: 'read:any:storage', resource: 'storage', action: 'read', scope: 'any', description: 'Access to routes: /storage' },
  { name: 'read:any:storefront', resource: 'storefront', action: 'read', scope: 'any', description: 'Access to routes: /storefront/checkout, /storefront/footer' },
  { name: 'read:any:support_client', resource: 'support_client', action: 'read', scope: 'any', description: 'Access to routes: /support-clients' },
  { name: 'read:any:telegram_config', resource: 'telegram_config', action: 'read', scope: 'any', description: 'Access to routes: /telegram-configs' },
  { name: 'read:any:transaction', resource: 'transaction', action: 'read', scope: 'any', description: 'Access to routes: /transactions, /transactions/:id' },
  { name: 'create:any:user', resource: 'user', action: 'create', scope: 'any', description: 'Access to routes: /users/create' },
  { name: 'read:any:user', resource: 'user', action: 'read', scope: 'any', description: 'Access to routes: /users, /users/dashboard, /users/exports' },
  { name: 'update:any:user', resource: 'user', action: 'update', scope: 'any', description: 'Access to routes: /users/:id' },
  { name: 'create:any:warehouse', resource: 'warehouse', action: 'create', scope: 'any', description: 'Access to routes: /warehouses/create' },
  { name: 'read:any:warehouse', resource: 'warehouse', action: 'read', scope: 'any', description: 'Access to routes: /warehouses' },
  { name: 'update:any:warehouse', resource: 'warehouse', action: 'update', scope: 'any', description: 'Access to routes: /warehouses/:id' },
  { name: 'create:any:warehouse_location', resource: 'warehouse_location', action: 'create', scope: 'any', description: 'Access to routes: /warehouses/locations/create' },
  { name: 'read:any:warehouse_location', resource: 'warehouse_location', action: 'read', scope: 'any', description: 'Access to routes: /warehouses/locations' },
  { name: 'update:any:warehouse_location', resource: 'warehouse_location', action: 'update', scope: 'any', description: 'Access to routes: /warehouses/locations/:id' }
];

export class SeedMenuPermissions1776200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of MENU_PERMISSION_SEEDS) {
      await queryRunner.query(
        `
          INSERT INTO "permissions" ("name", "resource", "action", "scope", "description", "attributes", "is_active", "created_at", "updated_at")
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
          ON CONFLICT ("name") DO NOTHING
        `,
        [permission.name, permission.resource, permission.action, permission.scope, permission.description, '{"*"}'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = MENU_PERMISSION_SEEDS.map((permission) => `'${permission.name}'`).join(', ');
    await queryRunner.query(`DELETE FROM "permissions" WHERE "name" IN (${names});`);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminPermissionService } from '../../modules/user/services/admin/admin-permission.service';
import { Role } from '../../modules/user/entities/role.entity';
import { PermissionAction, PermissionScope, UserRole } from '@shared';
import { PermissionGrant } from '../../modules/user/services/admin/admin-permission.service';

@Injectable()
export class PermissionSeeder {
  constructor(
    private readonly permissionService: AdminPermissionService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Seed default roles first
   */
  async seedRoles(): Promise<void> {
    console.log('🎭 Seeding default roles...');

    const defaultRoles = [
      {
        name: 'User',
        code: UserRole.USER,
        description: 'Standard user with basic permissions',
        isActive: true,
        isDefault: true,
      },
      {
        name: 'Admin',
        code: UserRole.ADMIN,
        description: 'Administrator with elevated permissions',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Super Admin',
        code: UserRole.SUPER_ADMIN,
        description: 'Super administrator with full system access',
        isActive: true,
        isDefault: false,
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: roleData.code }
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`   ✅ Created role: ${roleData.name} (${roleData.code})`);
      } else {
        console.log(`   ℹ️  Role already exists: ${roleData.name} (${roleData.code})`);
      }
    }
  }

  /**
   * Main seed method - creates roles and permissions
   */
  async seed(): Promise<void> {
    console.log('🌱 Starting permission seeding...');

    // First, ensure roles exist
    await this.seedRoles();

    // Define default permissions for each role
    const defaultPermissions: PermissionGrant[] = [
      // USER ROLE PERMISSIONS
      // Users can manage their own profile and user data
      {
        role: UserRole.USER,
        resource: 'user',
        action: PermissionAction.READ,
        scope: PermissionScope.OWN,
        attributes: ['id', 'email', 'username', 'role', 'isActive', 'createdAt'],
      },
      {
        role: UserRole.USER,
        resource: 'user',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.OWN,
        attributes: ['email', 'username'],
      },
      {
        role: UserRole.USER,
        resource: 'user-profile',
        action: PermissionAction.READ,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      {
        role: UserRole.USER,
        resource: 'user-profile',
        action: PermissionAction.CREATE,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      {
        role: UserRole.USER,
        resource: 'user-profile',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },

      // ADMIN ROLE PERMISSIONS
      // Admins can manage all users and user profiles
      {
        role: UserRole.ADMIN,
        resource: 'user',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['email', 'username', 'role', 'isActive'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user-profile',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user-profile',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user-profile',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'user-profile',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Admins can read permissions but not modify them
      {
        role: UserRole.ADMIN,
        resource: 'permission',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'role',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'role',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'role',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'role',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'role-permission',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Dashboard and general admin access
      {
        role: UserRole.ADMIN,
        resource: 'dashboard',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'profile',
        action: PermissionAction.READ,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'profile',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      // Settings
      {
        role: UserRole.ADMIN,
        resource: 'setting',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'setting',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // SEO
      {
        role: UserRole.ADMIN,
        resource: 'seo',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'seo',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'seo',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'seo',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Brand Assets
      {
        role: UserRole.ADMIN,
        resource: 'brand',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'brand',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'brand',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'brand',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Analytics
      {
        role: UserRole.ADMIN,
        resource: 'analytics',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Storage
      {
        role: UserRole.ADMIN,
        resource: 'storage',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storage',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storage',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storage',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Templates
      {
        role: UserRole.ADMIN,
        resource: 'mail_template',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_template',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_template',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_template',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Providers
      {
        role: UserRole.ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Channel Priority
      {
        role: UserRole.ADMIN,
        resource: 'email_flow',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'email_flow',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'email_flow',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'email_flow',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Posts
      {
        role: UserRole.ADMIN,
        resource: 'post',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post',
        action: PermissionAction.PUBLISH,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Post Categories
      {
        role: UserRole.ADMIN,
        resource: 'post_category',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_category',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_category',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_category',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Post Tags
      {
        role: UserRole.ADMIN,
        resource: 'post_tag',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_tag',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_tag',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'post_tag',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Site Content
      {
        role: UserRole.ADMIN,
        resource: 'site_content',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'site_content',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'site_content',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'site_content',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Languages
      {
        role: UserRole.ADMIN,
        resource: 'language',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'language',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'language',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'language',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Currencies
      {
        role: UserRole.ADMIN,
        resource: 'currency',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'currency',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'currency',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'currency',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Shipping Providers
      {
        role: UserRole.ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Firebase Configs
      {
        role: UserRole.ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Notifications
      {
        role: UserRole.ADMIN,
        resource: 'notification',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'notification',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'notification',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'notification',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Telegram Configs
      {
        role: UserRole.ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Products
      {
        role: UserRole.ADMIN,
        resource: 'product',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Attributes
      {
        role: UserRole.ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Brands
      {
        role: UserRole.ADMIN,
        resource: 'product_brand',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_brand',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_brand',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_brand',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Suppliers
      {
        role: UserRole.ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Categories
      {
        role: UserRole.ADMIN,
        resource: 'product_category',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_category',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_category',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'product_category',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Warehouses
      {
        role: UserRole.ADMIN,
        resource: 'warehouse',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Warehouse Locations
      {
        role: UserRole.ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Payment Methods
      {
        role: UserRole.ADMIN,
        resource: 'payment_method',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'payment_method',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'payment_method',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'payment_method',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Delivery Methods
      {
        role: UserRole.ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Transactions
      {
        role: UserRole.ADMIN,
        resource: 'transaction',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'transaction',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'transaction',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'transaction',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Support Clients
      {
        role: UserRole.ADMIN,
        resource: 'support_client',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'support_client',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'support_client',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'support_client',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Sections
      {
        role: UserRole.ADMIN,
        resource: 'section',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'section',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'section',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'section',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Menus
      {
        role: UserRole.ADMIN,
        resource: 'menu',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'menu',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'menu',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'menu',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Storefront
      {
        role: UserRole.ADMIN,
        resource: 'storefront',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storefront',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storefront',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'storefront',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Orders
      {
        role: UserRole.ADMIN,
        resource: 'order',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Order Fulfillments
      {
        role: UserRole.ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Customers
      {
        role: UserRole.ADMIN,
        resource: 'customer',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'customer',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'customer',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'customer',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty
      {
        role: UserRole.ADMIN,
        resource: 'loyalty',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Rewards
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Tiers
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Transactions
      {
        role: UserRole.ADMIN,
        resource: 'loyalty_transaction',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Help
      {
        role: UserRole.ADMIN,
        resource: 'help',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },

      // SUPER_ADMIN ROLE PERMISSIONS
      // Super admins have full access to everything
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user-profile',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user-profile',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user-profile',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'user-profile',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Super admins can manage permissions
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'permission',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'permission',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'permission',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'permission',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role-permission',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role-permission',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role-permission',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role-permission',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Role management
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'role',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Dashboard and profile
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'dashboard',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'profile',
        action: PermissionAction.READ,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'profile',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.OWN,
        attributes: ['*'],
      },
      // Settings
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'setting',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'setting',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'setting',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'setting',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // SEO
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'seo',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'seo',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'seo',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'seo',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Brand Assets
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'brand',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'brand',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'brand',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'brand',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Analytics
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'analytics',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Storage
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storage',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storage',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storage',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storage',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Templates
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_template',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_template',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_template',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_template',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Providers
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'mail_provider',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Mail Channel Priority
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'email_flow',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'email_flow',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'email_flow',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'email_flow',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Posts
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post',
        action: PermissionAction.PUBLISH,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Post Categories
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_category',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_category',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_category',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_category',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Post Tags
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_tag',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_tag',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_tag',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'post_tag',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Site Content
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'site_content',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'site_content',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'site_content',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'site_content',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Languages
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'language',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'language',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'language',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'language',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Currencies
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'currency',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'currency',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'currency',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'currency',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Shipping Providers
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'shipping_provider',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Firebase Configs
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'firebase_config',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Notifications
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'notification',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'notification',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'notification',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'notification',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Telegram Configs
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'telegram_config',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Products
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Attributes
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_attribute',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Brands
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_brand',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_brand',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_brand',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_brand',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Suppliers
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_supplier',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Product Categories
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_category',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_category',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_category',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'product_category',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Warehouses
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Warehouse Locations
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'warehouse_location',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Payment Methods
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'payment_method',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'payment_method',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'payment_method',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'payment_method',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Delivery Methods
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'delivery_method',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Transactions
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'transaction',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'transaction',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'transaction',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'transaction',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Support Clients
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'support_client',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'support_client',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'support_client',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'support_client',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Sections
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'section',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'section',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'section',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'section',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Menus
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'menu',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'menu',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'menu',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'menu',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Storefront
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storefront',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storefront',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storefront',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'storefront',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Orders
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Order Fulfillments
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'order_fulfillment',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Customers
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'customer',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'customer',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'customer',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'customer',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Rewards
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_reward',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Tiers
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.CREATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.UPDATE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_tier',
        action: PermissionAction.DELETE,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Loyalty Transactions
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'loyalty_transaction',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
      // Help
      {
        role: UserRole.SUPER_ADMIN,
        resource: 'help',
        action: PermissionAction.READ,
        scope: PermissionScope.ANY,
        attributes: ['*'],
      },
    ];

    try {
      // Grant all default permissions
      await this.permissionService.grant(defaultPermissions);

      console.log('✅ Permission seeding completed successfully!');
      console.log(`📊 Seeded ${defaultPermissions.length} permissions across ${Object.keys(UserRole).length} roles:`);
      
      // Log summary
      const rolePermissionCount = defaultPermissions.reduce((acc, perm) => {
        acc[perm.role] = (acc[perm.role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>);

      Object.entries(rolePermissionCount).forEach(([role, count]) => {
        console.log(`   - ${role}: ${count} permissions`);
      });

    } catch (error) {
      console.error('❌ Permission seeding failed:', error);
      throw error;
    }
  }

  /**
   * Check if the system needs seeding and run if necessary
   */
  async seedIfEmpty(): Promise<void> {
    console.log('🔍 Checking if seeding is needed...');

    // Check if roles exist
    const existingRoles = await this.roleRepository.count();
    
    // Check if permissions exist
    const existingPermissions = await this.permissionService.getAllPermissions();
    
    if (existingRoles === 0 || existingPermissions.length === 0) {
      console.log(`📋 Found ${existingRoles} roles and ${existingPermissions.length} permissions. Running seeder...`);
      await this.seed();
    } else {
      console.log(`ℹ️  Found ${existingRoles} roles and ${existingPermissions.length} permissions. Skipping seeder.`);
    }
  }

  /**
   * Force reseed (creates duplicates if data already exists)
   */
  async reseed(): Promise<void> {
    console.log('🔄 Reseeding permissions and roles (this may create duplicates if data already exists)...');
    await this.seed();
  }

  /**
   * Clear all permissions and roles, then reseed
   */
  async clearAndReseed(): Promise<void> {
    console.log('🗑️  Clearing existing permissions and roles...');
    
    try {
      // Note: This is a destructive operation - consider adding confirmation in production
      await this.roleRepository.query('DELETE FROM role_permissions');
      await this.roleRepository.query('DELETE FROM permissions');
      await this.roleRepository.query('DELETE FROM user_roles');
      await this.roleRepository.query('DELETE FROM roles');
      
      console.log('✅ Cleared existing data. Running fresh seed...');
      await this.seed();
      
    } catch (error) {
      console.error('❌ Clear and reseed failed:', error);
      throw error;
    }
  }
} 

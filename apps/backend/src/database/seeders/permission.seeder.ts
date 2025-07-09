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
        resource: 'role-permission',
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
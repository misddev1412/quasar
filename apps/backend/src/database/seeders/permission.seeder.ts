import { Injectable } from '@nestjs/common';
import { PermissionService } from '../../modules/user/services/permission.service';
import { PermissionAction, PermissionScope } from '../../modules/user/entities/permission.entity';
import { UserRole } from '../../modules/user/entities/user.entity';
import { PermissionGrant } from '../../modules/user/services/permission.service';

@Injectable()
export class PermissionSeeder {
  constructor(private readonly permissionService: PermissionService) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting permission seeding...');

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

  async seedIfEmpty(): Promise<void> {
    // Check if permissions already exist
    const existingPermissions = await this.permissionService.getAllPermissions();
    
    if (existingPermissions.length === 0) {
      console.log('🔍 No existing permissions found. Running seeder...');
      await this.seed();
    } else {
      console.log(`ℹ️  Found ${existingPermissions.length} existing permissions. Skipping seeder.`);
    }
  }

  async reseed(): Promise<void> {
    console.log('🔄 Reseeding permissions (this will create duplicates if permissions already exist)...');
    await this.seed();
  }
} 
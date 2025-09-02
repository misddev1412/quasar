import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { BaseRepository, UserRole } from '@shared';
import { Role } from '../entities/role.entity';
import { AdminRoleFiltersDto } from '../dto/admin/admin-role.dto';

export interface RoleWithCounts extends Role {
  permissionCount: number;
  userCount: number;
}

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(dataSource.getRepository(Role));
  }

  /**
   * Find all roles with optional filtering and pagination
   */
  async findAllWithFilters(
    filters: AdminRoleFiltersDto & { page?: number; limit?: number }
  ): Promise<{ roles: RoleWithCounts[]; total: number }> {
    // First get count without complex joins
    const countQueryBuilder = this.repository.createQueryBuilder('role');
    
    // Apply filters for counting
    if (filters.search) {
      countQueryBuilder.andWhere(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    if (filters.isActive !== undefined) {
      countQueryBuilder.andWhere('role.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.isDefault !== undefined) {
      countQueryBuilder.andWhere('role.isDefault = :isDefault', { isDefault: filters.isDefault });
    }
    
    const total = await countQueryBuilder.getCount();

    // Build main query with counts using subqueries (more reliable)
    const queryBuilder = this.repository.createQueryBuilder('role')
      .select([
        'role.id as "roleId"',
        'role.name as "roleName"',
        'role.code as "roleCode"', 
        'role.description as "roleDescription"',
        'role.isActive as "roleIsActive"',
        'role.isDefault as "roleIsDefault"',
        'role.createdAt as "roleCreatedAt"',
        'role.updatedAt as "roleUpdatedAt"',
        'role.version as "roleVersion"',
        'role.createdBy as "roleCreatedBy"',
        'role.updatedBy as "roleUpdatedBy"',
        `(SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = role.id AND rp.is_active = true) as "permissionCount"`,
        `(SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = role.id AND ur.is_active = true) as "userCount"`
      ]);

    // Apply same filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.isDefault !== undefined) {
      queryBuilder.andWhere('role.isDefault = :isDefault', { isDefault: filters.isDefault });
    }

    // Apply pagination and ordering
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      queryBuilder.offset(offset).limit(filters.limit);
    }

    queryBuilder.orderBy('role.name', 'ASC');

    // Get results
    const rawResults = await queryBuilder.getRawMany();
    
    // Transform to RoleWithCounts (using proper field names)
    const roles: RoleWithCounts[] = rawResults.map(raw => {
      const role = new Role();
      role.id = raw.roleId;
      role.name = raw.roleName;
      role.code = raw.roleCode;
      role.description = raw.roleDescription;
      role.isActive = raw.roleIsActive;
      role.isDefault = raw.roleIsDefault;
      role.createdAt = raw.roleCreatedAt;
      role.updatedAt = raw.roleUpdatedAt;
      role.version = raw.roleVersion || 1;
      role.createdBy = raw.roleCreatedBy;
      role.updatedBy = raw.roleUpdatedBy;
      role.rolePermissions = [];
      role.userRoles = [];
      
      return {
        ...role,
        permissionCount: parseInt(raw.permissionCount) || 0,
        userCount: parseInt(raw.userCount) || 0
      } as RoleWithCounts;
    });

    return { roles, total };
  }

  /**
   * Find role by ID with permissions
   */
  async findByIdWithPermissions(id: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission']
    });
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { name }
    });
  }

  /**
   * Find role by code
   */
  async findByCode(code: UserRole): Promise<Role | null> {
    return await this.repository.findOne({
      where: { code }
    });
  }

  /**
   * Check if role name exists (excluding specific ID)
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder('role')
      .where('role.name = :name', { name });

    if (excludeId) {
      queryBuilder.andWhere('role.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    default: number;
  }> {
    const [total, active, inactive, defaultRoles] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { isActive: true } }),
      this.repository.count({ where: { isActive: false } }),
      this.repository.count({ where: { isDefault: true } })
    ]);

    return {
      total,
      active,
      inactive,
      default: defaultRoles
    };
  }
}
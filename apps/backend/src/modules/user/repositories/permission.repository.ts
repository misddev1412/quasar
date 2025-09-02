import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PermissionAction, PermissionScope, UserRole, PaginatedResponseDto } from '@shared';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import {
  IPermissionRepository,
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRolePermissionDto,
  PermissionFilter
} from '../interfaces/permission-repository.interface';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(permissionRepository);
  }

  // Permission CRUD
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.repository.create({
      ...createPermissionDto,
      attributes: createPermissionDto.attributes || ['*']
    });
    return await this.repository.save(permission);
  }

  async findAllPermissions(filter?: PermissionFilter): Promise<Permission[]> {
    const queryBuilder = this.repository.createQueryBuilder('permission');

    if (filter?.resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource: filter.resource });
    }

    if (filter?.action) {
      queryBuilder.andWhere('permission.action = :action', { action: filter.action });
    }

    if (filter?.scope) {
      queryBuilder.andWhere('permission.scope = :scope', { scope: filter.scope });
    }

    if (filter?.isActive !== undefined) {
      queryBuilder.andWhere('permission.isActive = :isActive', { isActive: filter.isActive });
    }

    if (filter?.search) {
      queryBuilder.andWhere(
        '(permission.name ILIKE :search OR permission.description ILIKE :search OR permission.resource ILIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    return await queryBuilder.getMany();
  }

  async findAllPermissionsWithPagination(filter?: PermissionFilter): Promise<PaginatedResponseDto<Permission>> {
    const queryBuilder = this.repository.createQueryBuilder('permission');

    // Apply filters
    if (filter?.resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource: filter.resource });
    }

    if (filter?.action) {
      queryBuilder.andWhere('permission.action = :action', { action: filter.action });
    }

    if (filter?.scope) {
      queryBuilder.andWhere('permission.scope = :scope', { scope: filter.scope });
    }

    if (filter?.isActive !== undefined) {
      queryBuilder.andWhere('permission.isActive = :isActive', { isActive: filter.isActive });
    }

    if (filter?.search) {
      queryBuilder.andWhere(
        '(permission.name ILIKE :search OR permission.description ILIKE :search OR permission.resource ILIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy('permission.createdAt', 'DESC');

    // Apply pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Get results and count
    const [data, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findPermissionById(id: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async findPermissionByName(name: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { name }
    });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return await this.repository.findByIds(ids);
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
    await this.repository.update(id, updatePermissionDto);
    return await this.findPermissionById(id);
  }

  async deletePermission(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  // Role Permission management
  async assignPermissionToRole(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission> {
    // Check if the role-permission relationship already exists
    const existing = await this.rolePermissionRepository.findOne({
      where: { 
        roleId: createRolePermissionDto.roleId,
        permissionId: createRolePermissionDto.permissionId
      }
    });

    if (existing) {
      // If it exists but is inactive, reactivate it
      if (!existing.isActive) {
        existing.isActive = true;
        return await this.rolePermissionRepository.save(existing);
      }
      return existing;
    }

    const rolePermission = this.rolePermissionRepository.create(createRolePermissionDto);
    return await this.rolePermissionRepository.save(rolePermission);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const result = await this.rolePermissionRepository.delete({
      roleId,
      permissionId
    });
    return result.affected > 0;
  }

  /**
   * 查找角色的所有权限
   * @param roleOrCode 角色ID或角色代码
   * @returns 权限列表
   */
  async findPermissionsByRole(roleOrCode: string): Promise<Permission[]> {
    let roleId = roleOrCode;
    
    // 检查输入是否为角色代码而不是UUID
    if (Object.values(UserRole).includes(roleOrCode as UserRole)) {
      // 如果是角色代码，先查找对应角色的ID
      const role = await this.roleRepository.findOne({
        where: { code: roleOrCode as UserRole }
      });
      
      if (!role) {
        console.warn(`找不到角色代码为 ${roleOrCode} 的角色`);
        return [];
      }
      
      roleId = role.id;
    }

    // 使用角色ID查询权限
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { 
        roleId,
        isActive: true
      },
      relations: ['permission']
    });

    return rolePermissions
      .map(rp => rp.permission)
      .filter(permission => permission.isActive);
  }

  async findRolePermissions(roleId: string): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({
      where: { 
        roleId,
        isActive: true
      },
      relations: ['permission']
    });
  }

  // Permission checking
  async hasPermission(
    roleId: string, 
    resource: string, 
    action: PermissionAction, 
    scope: PermissionScope
  ): Promise<boolean> {
    const permission = await this.getPermission(roleId, resource, action, scope);
    return permission !== null;
  }

  /**
   * 获取特定权限
   * @param roleOrCode 角色ID或角色代码
   * @param resource 资源
   * @param action 操作
   * @param scope 范围
   * @returns 权限对象或null
   */
  async getPermission(
    roleOrCode: string, 
    resource: string, 
    action: PermissionAction, 
    scope: PermissionScope
  ): Promise<Permission | null> {
    let roleId = roleOrCode;
    
    // 检查输入是否为角色代码而不是UUID
    if (Object.values(UserRole).includes(roleOrCode as UserRole)) {
      // 如果是角色代码，先查找对应角色的ID
      const role = await this.roleRepository.findOne({
        where: { code: roleOrCode as UserRole }
      });
      
      if (!role) {
        console.warn(`找不到角色代码为 ${roleOrCode} 的角色`);
        return null;
      }
      
      roleId = role.id;
    }

    const rolePermission = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'permission')
      .where('rp.roleId = :roleId', { roleId })
      .andWhere('rp.isActive = :isActive', { isActive: true })
      .andWhere('permission.resource = :resource', { resource })
      .andWhere('permission.action = :action', { action })
      .andWhere('permission.scope = :scope', { scope })
      .andWhere('permission.isActive = :permissionActive', { permissionActive: true })
      .select(['rp', 'permission'])
      .getOne();

    return rolePermission?.permission || null;
  }
} 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PermissionAction, PermissionScope, UserRole } from '@quasar/shared';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
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
    
    return await queryBuilder.getMany();
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
        role: createRolePermissionDto.role,
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

  async removePermissionFromRole(role: UserRole, permissionId: string): Promise<boolean> {
    const result = await this.rolePermissionRepository.delete({
      role,
      permissionId
    });
    return result.affected > 0;
  }

  async findPermissionsByRole(role: UserRole): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { 
        role,
        isActive: true
      },
      relations: ['permission']
    });

    return rolePermissions
      .map(rp => rp.permission)
      .filter(permission => permission.isActive);
  }

  async findRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({
      where: { 
        role,
        isActive: true
      },
      relations: ['permission']
    });
  }

  // Permission checking
  async hasPermission(
    role: UserRole, 
    resource: string, 
    action: PermissionAction, 
    scope: PermissionScope
  ): Promise<boolean> {
    const permission = await this.getPermission(role, resource, action, scope);
    return permission !== null;
  }

  async getPermission(
    role: UserRole, 
    resource: string, 
    action: PermissionAction, 
    scope: PermissionScope
  ): Promise<Permission | null> {
    const rolePermission = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'permission')
      .where('rp.role = :role', { role })
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
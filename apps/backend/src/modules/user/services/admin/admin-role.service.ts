import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';
import { PermissionRepository } from '../../repositories/permission.repository';

@Injectable()
export class AdminRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  // We will add methods for CRUD operations here.
  // For example: findAll, findOne, create, update, delete
  // And methods for managing permissions for a role.
} 
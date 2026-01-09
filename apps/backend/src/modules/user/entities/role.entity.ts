import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, UserRole } from '@shared';
import { RolePermission } from './role-permission.entity';
import { UserRole as UserRoleEntity } from './user-role.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code: UserRole;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRoleEntity, userRole => userRole.role)
  userRoles: UserRoleEntity[];
} 

import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, PermissionAction, PermissionScope } from '@quasar/shared';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  resource: string;

  @Column({ 
    type: 'enum', 
    enum: PermissionAction 
  })
  action: PermissionAction;

  @Column({ 
    type: 'enum', 
    enum: PermissionScope 
  })
  scope: PermissionScope;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', array: true, default: ['*'] })
  attributes: string[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];
} 
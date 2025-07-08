import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity, UserRole } from '@quasar/shared';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Index(['role', 'permissionId'], { unique: true })
export class RolePermission extends BaseEntity {
  @Column({ 
    type: 'enum', 
    enum: UserRole 
  })
  role: UserRole;

  @Column({ name: 'permission_id' })
  permissionId: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
} 
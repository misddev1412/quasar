import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { UserProfile } from './user-profile.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];
} 
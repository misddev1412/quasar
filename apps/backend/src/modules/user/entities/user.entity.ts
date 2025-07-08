import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity, UserRole } from '@quasar/shared';
import { UserProfile } from './user-profile.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;
} 
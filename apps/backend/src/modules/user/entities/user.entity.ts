import { Entity, Column, OneToOne, OneToMany, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { UserProfile } from './user-profile.entity';
import { UserRole } from './user-role.entity';
import { UserLoginProvider, AuthProvider } from './user-login-provider.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
@Index(['firebaseUid'])
@Index(['provider'])
@Index(['providerId'])
@Index(['emailVerified'])
@Index(['lastLoginAt'])
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified_at', nullable: true, type: 'timestamp' })
  emailVerifiedAt: Date | null;

  // Firebase Authentication fields
  @Column({ name: 'firebase_uid', nullable: true, unique: true })
  firebaseUid?: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: AuthProvider.EMAIL,
    enum: AuthProvider 
  })
  provider: AuthProvider;

  @Column({ name: 'provider_id', nullable: true })
  providerId?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  // Relations
  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => UserLoginProvider, loginProvider => loginProvider.user)
  loginProviders: UserLoginProvider[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash password for email auth users, not Firebase users
    if (this.password && this.provider === AuthProvider.EMAIL && !this.password.startsWith('firebase_user_')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
} 
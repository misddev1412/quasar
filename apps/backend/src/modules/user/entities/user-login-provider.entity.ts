import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '@shared';
import { User } from './user.entity';

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook', 
  TWITTER = 'twitter',
  GITHUB = 'github',
  FIREBASE = 'firebase'
}

@Entity('user_login_providers')
@Unique('UQ_user_provider', ['userId', 'provider', 'providerId'])
@Index(['userId'])
@Index(['provider'])
@Index(['providerId'])
@Index(['lastUsedAt'])
export class UserLoginProvider extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: AuthProvider
  })
  provider: AuthProvider;

  @Column({ name: 'provider_id', length: 255 })
  providerId: string;

  @Column({ name: 'provider_email', length: 255, nullable: true })
  providerEmail?: string;

  @Column({ name: 'provider_data', type: 'jsonb', nullable: true })
  providerData?: Record<string, any>;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken?: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.loginProviders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
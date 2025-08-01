import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  LOGGED_OUT = 'logged_out'
}

@Entity('user_sessions')
@Index(['userId', 'status'])
@Index(['userId', 'createdAt'])
@Index(['sessionToken'], { unique: true })
@Index(['refreshToken'], { unique: true })
@Index(['expiresAt'])
export class UserSession extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'session_token', unique: true })
  sessionToken: string; // JWT access token ID or session identifier

  @Column({ name: 'refresh_token', unique: true, nullable: true })
  refreshToken: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE
  })
  status: SessionStatus;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string; // mobile, desktop, tablet

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @Column({ name: 'operating_system', nullable: true })
  operatingSystem: string;

  @Column({ name: 'location', nullable: true })
  location: string; // City, Country

  @Column({ name: 'login_at', type: 'timestamp' })
  loginAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp' })
  lastActivityAt: Date;

  @Column({ name: 'logout_at', type: 'timestamp', nullable: true })
  logoutAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_remember_me', default: false })
  isRememberMe: boolean;

  @Column({
    name: 'session_data',
    type: 'jsonb',
    nullable: true
  })
  sessionData: Record<string, any>; // Additional session-specific data

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  isActive(): boolean {
    return this.status === SessionStatus.ACTIVE && 
           this.expiresAt > new Date() && 
           !this.logoutAt;
  }

  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  getDuration(): number {
    const endTime = this.logoutAt || new Date();
    return endTime.getTime() - this.loginAt.getTime();
  }

  getDurationInMinutes(): number {
    return Math.floor(this.getDuration() / (1000 * 60));
  }

  getDurationInHours(): number {
    return Math.floor(this.getDuration() / (1000 * 60 * 60));
  }

  updateLastActivity(): void {
    this.lastActivityAt = new Date();
  }

  terminate(reason: SessionStatus = SessionStatus.TERMINATED): void {
    this.status = reason;
    this.logoutAt = new Date();
  }

  static createSession(data: {
    userId: string;
    sessionToken: string;
    refreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    operatingSystem?: string;
    location?: string;
    expiresAt: Date;
    isRememberMe?: boolean;
    sessionData?: Record<string, any>;
  }): Partial<UserSession> {
    const now = new Date();
    return {
      userId: data.userId,
      sessionToken: data.sessionToken,
      refreshToken: data.refreshToken,
      status: SessionStatus.ACTIVE,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      browser: data.browser,
      operatingSystem: data.operatingSystem,
      location: data.location,
      loginAt: now,
      lastActivityAt: now,
      expiresAt: data.expiresAt,
      isRememberMe: data.isRememberMe ?? false,
      sessionData: data.sessionData,
    };
  }
}

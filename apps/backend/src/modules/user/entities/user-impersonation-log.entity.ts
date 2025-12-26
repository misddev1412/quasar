import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { User } from './user.entity';

export enum ImpersonationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  EXPIRED = 'expired'
}

@Entity('user_impersonation_logs')
@Index(['adminUserId'])
@Index(['impersonatedUserId'])
@Index(['status'])
@Index(['startedAt'])
@Index(['sessionToken'], { unique: true })
export class UserImpersonationLog extends BaseEntity {
  @Column({ name: 'admin_user_id' })
  adminUserId: string;

  @Column({ name: 'impersonated_user_id' })
  impersonatedUserId: string;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'session_token', unique: true })
  sessionToken: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ImpersonationStatus,
    default: ImpersonationStatus.ACTIVE
  })
  status: ImpersonationStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'impersonated_user_id' })
  impersonatedUser: User;

  // Helper methods
  isActive(): boolean {
    return this.status === ImpersonationStatus.ACTIVE && !this.endedAt;
  }

  getDuration(): number {
    const endTime = this.endedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  getDurationInMinutes(): number {
    return Math.floor(this.getDuration() / (1000 * 60));
  }

  getDurationInHours(): number {
    return Math.floor(this.getDuration() / (1000 * 60 * 60));
  }

  end(): void {
    this.status = ImpersonationStatus.ENDED;
    this.endedAt = new Date();
  }

  markExpired(): void {
    this.status = ImpersonationStatus.EXPIRED;
    this.endedAt = new Date();
  }

  static createLog(data: {
    adminUserId: string;
    impersonatedUserId: string;
    sessionToken: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  }): Partial<UserImpersonationLog> {
    return {
      adminUserId: data.adminUserId,
      impersonatedUserId: data.impersonatedUserId,
      sessionToken: data.sessionToken,
      startedAt: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      reason: data.reason,
      status: ImpersonationStatus.ACTIVE,
    };
  }
}

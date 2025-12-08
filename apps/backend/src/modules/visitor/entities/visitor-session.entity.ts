import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { Visitor } from './visitor.entity';
import { PageView } from './page-view.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

@Entity('visitor_sessions')
@Index(['visitorId', 'createdAt'])
@Index(['sessionId', 'status'])
@Index(['status', 'createdAt'])
export class VisitorSession extends SoftDeletableEntity {
  @Column({ name: 'visitor_id' })
  visitorId: string;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE
  })
  status: SessionStatus;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time', nullable: true })
  endTime: Date;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number;

  @Column({ name: 'page_views_count', default: 0 })
  pageViewsCount: number;

  @Column({ name: 'bounce_rate', nullable: true })
  bounceRate: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ name: 'browser_name', nullable: true })
  browserName: string;

  @Column({ name: 'browser_version', nullable: true })
  browserVersion: string;

  @Column({ name: 'os_name', nullable: true })
  osName: string;

  @Column({ name: 'os_version', nullable: true })
  osVersion: string;

  @Column({ name: 'country_code', nullable: true })
  countryCode: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true
  })
  metadata: Record<string, any>;

  @ManyToOne(() => Visitor, visitor => visitor.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor;

  @OneToMany(() => PageView, pageView => pageView.session)
  pageViews: PageView[];

  // Helper methods
  static createSession(data: {
    visitorId: string;
    sessionId: string;
    startTime: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    osVersion?: string;
    countryCode?: string;
    city?: string;
    metadata?: Record<string, any>;
  }): Partial<VisitorSession> {
    return {
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      startTime: data.startTime,
      status: SessionStatus.ACTIVE,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      browserName: data.browserName,
      browserVersion: data.browserVersion,
      osName: data.osName,
      osVersion: data.osVersion,
      countryCode: data.countryCode,
      city: data.city,
      metadata: data.metadata,
    };
  }

  endSession(): void {
    this.endTime = new Date();
    this.status = SessionStatus.COMPLETED;
    if (this.startTime) {
      this.durationSeconds = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
    }
  }

  incrementPageViews(): void {
    this.pageViewsCount += 1;
  }

  calculateBounceRate(): number {
    // A bounce is typically a single page view session
    return this.pageViewsCount === 1 ? 100 : 0;
  }
}
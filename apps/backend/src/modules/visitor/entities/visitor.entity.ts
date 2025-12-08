import { Entity, Column, OneToMany, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { VisitorSession } from './visitor-session.entity';

export enum VisitorType {
  NEW = 'new',
  RETURNING = 'returning'
}

export enum VisitorSource {
  DIRECT = 'direct',
  SEARCH_ENGINE = 'search_engine',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  EMAIL = 'email',
  PAID_ADVERTISING = 'paid_advertising',
  ORGANIC = 'organic',
  OTHER = 'other'
}

@Entity('visitors')
@Index(['visitorId', 'createdAt'])
@Index(['ipAddress'])
@Index(['userAgent'])
@Index(['visitorSource'])
export class Visitor extends SoftDeletableEntity {
  @Column({ name: 'visitor_id', unique: true })
  visitorId: string; // Unique identifier for tracking across sessions

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({
    name: 'visitor_type',
    type: 'enum',
    enum: VisitorType,
    default: VisitorType.NEW
  })
  visitorType: VisitorType;

  @Column({
    name: 'visitor_source',
    type: 'enum',
    enum: VisitorSource,
    nullable: true
  })
  visitorSource: VisitorSource;

  @Column({ name: 'referrer_url', nullable: true })
  referrerUrl: string;

  @Column({ name: 'landing_page', nullable: true })
  landingPage: string;

  @Column({ name: 'utm_source', nullable: true })
  utmSource: string;

  @Column({ name: 'utm_medium', nullable: true })
  utmMedium: string;

  @Column({ name: 'utm_campaign', nullable: true })
  utmCampaign: string;

  @Column({ name: 'utm_term', nullable: true })
  utmTerm: string;

  @Column({ name: 'utm_content', nullable: true })
  utmContent: string;

  @Column({ name: 'country_code', nullable: true })
  countryCode: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string; // desktop, mobile, tablet

  @Column({ name: 'browser_name', nullable: true })
  browserName: string;

  @Column({ name: 'browser_version', nullable: true })
  browserVersion: string;

  @Column({ name: 'os_name', nullable: true })
  osName: string;

  @Column({ name: 'os_version', nullable: true })
  osVersion: string;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true
  })
  metadata: Record<string, any>;

  @OneToMany(() => VisitorSession, session => session.visitor)
  sessions: VisitorSession[];

  // Helper methods
  static createVisitor(data: {
    visitorId: string;
    ipAddress?: string;
    userAgent?: string;
    visitorType?: VisitorType;
    visitorSource?: VisitorSource;
    referrerUrl?: string;
    landingPage?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    countryCode?: string;
    city?: string;
    deviceType?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    osVersion?: string;
    metadata?: Record<string, any>;
  }): Partial<Visitor> {
    return {
      visitorId: data.visitorId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      visitorType: data.visitorType || VisitorType.NEW,
      visitorSource: data.visitorSource,
      referrerUrl: data.referrerUrl,
      landingPage: data.landingPage,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      countryCode: data.countryCode,
      city: data.city,
      deviceType: data.deviceType,
      browserName: data.browserName,
      browserVersion: data.browserVersion,
      osName: data.osName,
      osVersion: data.osVersion,
      metadata: data.metadata,
    };
  }
}
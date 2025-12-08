import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { User } from './user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAGE_VIEW = 'page_view',
  API_CALL = 'api_call',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  SETTINGS_UPDATE = 'settings_update',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  SEARCH = 'search',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  ADMIN_ACTION = 'admin_action',
  OTHER = 'other'
}

@Entity('user_activities')
@Index(['userId', 'activityType'])
@Index(['userId', 'createdAt'])
@Index(['activityType', 'createdAt'])
@Index(['sessionId'])
export class UserActivity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType
  })
  activityType: ActivityType;

  @Column({ name: 'activity_description', nullable: true })
  activityDescription: string;

  @Column({ name: 'resource_type', nullable: true })
  resourceType: string; // e.g., 'user', 'post', 'file', etc.

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'request_path', nullable: true })
  requestPath: string;

  @Column({ name: 'request_method', nullable: true })
  requestMethod: string; // GET, POST, PUT, DELETE, etc.

  @Column({ name: 'response_status', nullable: true })
  responseStatus: number;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number; // Request duration in milliseconds

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true
  })
  metadata: Record<string, any>; // Additional activity-specific data

  @Column({ name: 'is_successful', default: true })
  isSuccessful: boolean;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  static createActivity(data: {
    userId: string;
    sessionId?: string;
    activityType: ActivityType;
    activityDescription?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestPath?: string;
    requestMethod?: string;
    responseStatus?: number;
    durationMs?: number;
    metadata?: Record<string, any>;
    isSuccessful?: boolean;
    errorMessage?: string;
  }): Partial<UserActivity> {
    return {
      userId: data.userId,
      sessionId: data.sessionId,
      activityType: data.activityType,
      activityDescription: data.activityDescription,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestPath: data.requestPath,
      requestMethod: data.requestMethod,
      responseStatus: data.responseStatus,
      durationMs: data.durationMs,
      metadata: data.metadata,
      isSuccessful: data.isSuccessful ?? true,
      errorMessage: data.errorMessage,
    };
  }
}

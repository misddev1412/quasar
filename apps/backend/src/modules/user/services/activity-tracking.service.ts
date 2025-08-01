import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserActivityRepository } from '../repositories/user-activity.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { UserActivity, ActivityType } from '../entities/user-activity.entity';
import { SessionStatus } from '../entities/user-session.entity';

export interface ActivityContext {
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  request: Request;
  response?: Response;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

export interface AdminActionContext {
  action: string;
  resource: string;
  resourceId?: string;
  targetUserId?: string;
  changes?: Record<string, any>;
  previousValues?: Record<string, any>;
}

@Injectable()
export class ActivityTrackingService {
  private readonly logger = new Logger(ActivityTrackingService.name);

  constructor(
    private readonly userActivityRepository: UserActivityRepository,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  /**
   * Track a user activity with full context
   */
  async trackActivity(
    activityType: ActivityType,
    context: ActivityContext,
    description?: string,
    adminAction?: AdminActionContext
  ): Promise<UserActivity> {
    try {
      const duration = context.endTime ? context.endTime - context.startTime : undefined;
      
      const activityData = UserActivity.createActivity({
        userId: context.userId,
        sessionId: context.sessionId,
        activityType,
        activityDescription: description || this.generateDescription(activityType, context, adminAction),
        resourceType: adminAction?.resource,
        resourceId: adminAction?.resourceId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestPath: context.request.path,
        requestMethod: context.request.method,
        responseStatus: context.response?.statusCode,
        durationMs: duration,
        metadata: this.buildMetadata(context, adminAction),
        isSuccessful: this.isSuccessfulResponse(context.response?.statusCode),
      });

      const activity = await this.userActivityRepository.logActivity(activityData);
      
      // Update session last activity if session exists
      if (context.sessionId) {
        await this.updateSessionActivity(context.sessionId);
      }

      this.logger.debug(`Activity tracked: ${activityType} for user ${context.userId}`);
      return activity;
    } catch (error) {
      this.logger.error(`Failed to track activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track admin panel login
   */
  async trackAdminLogin(context: ActivityContext): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.LOGIN,
      context,
      'Admin logged into admin panel',
      {
        action: 'admin_login',
        resource: 'admin_auth',
      }
    );
  }

  /**
   * Track admin panel logout
   */
  async trackAdminLogout(context: ActivityContext): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.LOGOUT,
      context,
      'Admin logged out of admin panel',
      {
        action: 'admin_logout',
        resource: 'admin_auth',
      }
    );
  }

  /**
   * Track admin page view
   */
  async trackAdminPageView(context: ActivityContext, pageTitle?: string): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.PAGE_VIEW,
      context,
      `Admin viewed ${pageTitle || 'page'}`,
      {
        action: 'view_page',
        resource: 'admin_page',
      }
    );
  }

  /**
   * Track admin CRUD operations
   */
  async trackAdminCrudOperation(
    context: ActivityContext,
    operation: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId?: string,
    changes?: Record<string, any>
  ): Promise<UserActivity> {
    const activityTypeMap = {
      create: ActivityType.CREATE,
      read: ActivityType.VIEW,
      update: ActivityType.UPDATE,
      delete: ActivityType.DELETE,
    };

    return this.trackActivity(
      activityTypeMap[operation],
      context,
      `Admin ${operation}d ${resource}${resourceId ? ` (ID: ${resourceId})` : ''}`,
      {
        action: `admin_${operation}`,
        resource,
        resourceId,
        changes,
      }
    );
  }

  /**
   * Track user management actions
   */
  async trackUserManagement(
    context: ActivityContext,
    action: string,
    targetUserId: string,
    changes?: Record<string, any>
  ): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.ADMIN_ACTION,
      context,
      `Admin performed user management: ${action}`,
      {
        action: `user_management_${action}`,
        resource: 'user',
        resourceId: targetUserId,
        targetUserId,
        changes,
      }
    );
  }

  /**
   * Track role and permission changes
   */
  async trackRolePermissionChange(
    context: ActivityContext,
    action: string,
    targetType: 'role' | 'permission',
    targetId: string,
    changes?: Record<string, any>
  ): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.ADMIN_ACTION,
      context,
      `Admin modified ${targetType}: ${action}`,
      {
        action: `${targetType}_${action}`,
        resource: targetType,
        resourceId: targetId,
        changes,
      }
    );
  }

  /**
   * Track system configuration changes
   */
  async trackSystemConfiguration(
    context: ActivityContext,
    configType: string,
    changes: Record<string, any>
  ): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.SETTINGS_UPDATE,
      context,
      `Admin updated system configuration: ${configType}`,
      {
        action: 'system_config_update',
        resource: 'system_config',
        resourceId: configType,
        changes,
      }
    );
  }

  /**
   * Track data export operations
   */
  async trackDataExport(
    context: ActivityContext,
    exportType: string,
    recordCount?: number
  ): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.EXPORT,
      context,
      `Admin exported ${exportType} data`,
      {
        action: 'data_export',
        resource: exportType,
        changes: { recordCount },
      }
    );
  }

  /**
   * Track API calls from admin panel
   */
  async trackAdminApiCall(context: ActivityContext, endpoint: string): Promise<UserActivity> {
    return this.trackActivity(
      ActivityType.API_CALL,
      context,
      `Admin API call to ${endpoint}`,
      {
        action: 'api_call',
        resource: 'admin_api',
        resourceId: endpoint,
      }
    );
  }

  /**
   * Generate activity description based on context
   */
  private generateDescription(
    activityType: ActivityType,
    context: ActivityContext,
    adminAction?: AdminActionContext
  ): string {
    if (adminAction) {
      return `Admin ${adminAction.action} on ${adminAction.resource}`;
    }

    const path = context.request.path;
    const method = context.request.method;

    if (path.startsWith('/admin')) {
      return `Admin panel ${method} request to ${path}`;
    }

    return `${activityType} activity`;
  }

  /**
   * Build comprehensive metadata for the activity
   */
  private buildMetadata(context: ActivityContext, adminAction?: AdminActionContext): Record<string, any> {
    const metadata: Record<string, any> = {
      adminPanel: context.request.path.startsWith('/admin'),
      requestHeaders: this.sanitizeHeaders(context.request.headers),
      queryParams: context.request.query,
      bodySize: context.request.get('content-length'),
      referer: context.request.get('referer'),
      timestamp: new Date().toISOString(),
    };

    if (adminAction) {
      metadata.adminAction = {
        action: adminAction.action,
        resource: adminAction.resource,
        resourceId: adminAction.resourceId,
        targetUserId: adminAction.targetUserId,
        changes: adminAction.changes,
        previousValues: adminAction.previousValues,
      };
    }

    if (context.metadata) {
      Object.assign(metadata, context.metadata);
    }

    return metadata;
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(headers: any): Record<string, any> {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    
    return sanitized;
  }

  /**
   * Determine if response is successful
   */
  private isSuccessfulResponse(statusCode?: number): boolean {
    if (!statusCode) return true;
    return statusCode >= 200 && statusCode < 400;
  }

  /**
   * Update session last activity timestamp
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.userSessionRepository.updateLastActivity(sessionId);
    } catch (error) {
      this.logger.warn(`Failed to update session activity: ${error.message}`);
    }
  }

  /**
   * Extract user context from request
   */
  extractUserContext(req: Request): Partial<ActivityContext> {
    const user = (req as any).user;
    const session = (req as any).session;

    return {
      userId: user?.id,
      sessionId: session?.sessionToken || session?.id,
      ipAddress: this.extractIpAddress(req),
      userAgent: req.get('user-agent'),
      request: req,
      startTime: Date.now(),
    };
  }

  /**
   * Extract real IP address from request
   */
  private extractIpAddress(req: Request): string {
    return (
      req.get('x-forwarded-for')?.split(',')[0] ||
      req.get('x-real-ip') ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}

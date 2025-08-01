import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ActivityTrackingService } from '../services/activity-tracking.service';
import { ActivityType } from '../entities/user-activity.entity';

export const TRACK_ADMIN_ACTION = 'track_admin_action';

export interface AdminActionMetadata {
  action: string;
  resource: string;
  description?: string;
  trackChanges?: boolean;
  trackTarget?: boolean;
}

/**
 * Decorator to mark methods for admin activity tracking
 */
export const TrackAdminAction = (metadata: AdminActionMetadata) => (target: any) =>
  Reflect.defineMetadata(TRACK_ADMIN_ACTION, metadata, target);

@Injectable()
export class AdminActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdminActivityInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AdminActionMetadata>(
      TRACK_ADMIN_ACTION,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const startTime = Date.now();
    const activityContext = this.activityTrackingService.extractUserContext(request);
    activityContext.startTime = startTime;

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const endTime = Date.now();
          activityContext.endTime = endTime;
          
          await this.trackSuccessfulAction(
            metadata,
            activityContext,
            request,
            result
          );
        } catch (error) {
          this.logger.error(`Failed to track successful admin action: ${error.message}`);
        }
      }),
      catchError(async (error) => {
        try {
          const endTime = Date.now();
          activityContext.endTime = endTime;
          
          await this.trackFailedAction(
            metadata,
            activityContext,
            request,
            error
          );
        } catch (trackingError) {
          this.logger.error(`Failed to track failed admin action: ${trackingError.message}`);
        }
        
        throw error;
      }),
    );
  }

  /**
   * Track successful admin action
   */
  private async trackSuccessfulAction(
    metadata: AdminActionMetadata,
    context: any,
    request: any,
    result: any
  ): Promise<void> {
    const activityType = this.getActivityTypeFromAction(metadata.action);
    const description = metadata.description || `Admin ${metadata.action} on ${metadata.resource}`;
    
    const adminAction = {
      action: metadata.action,
      resource: metadata.resource,
      resourceId: this.extractResourceId(request, result),
      targetUserId: this.extractTargetUserId(request, result),
      changes: metadata.trackChanges ? this.extractChanges(request, result) : undefined,
    };

    // Add specific metadata based on action type
    context.metadata = {
      ...context.metadata,
      actionResult: this.sanitizeResult(result),
      requestBody: this.sanitizeRequestBody(request.body),
      queryParams: request.query,
    };

    await this.activityTrackingService.trackActivity(
      activityType,
      context,
      description,
      adminAction
    );
  }

  /**
   * Track failed admin action
   */
  private async trackFailedAction(
    metadata: AdminActionMetadata,
    context: any,
    request: any,
    error: any
  ): Promise<void> {
    const activityType = this.getActivityTypeFromAction(metadata.action);
    const description = `Failed: Admin ${metadata.action} on ${metadata.resource}`;
    
    const adminAction = {
      action: `${metadata.action}_failed`,
      resource: metadata.resource,
      resourceId: this.extractResourceId(request),
    };

    context.metadata = {
      ...context.metadata,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
      requestBody: this.sanitizeRequestBody(request.body),
      queryParams: request.query,
    };

    context.response = { statusCode: error.statusCode || 500 };

    await this.activityTrackingService.trackActivity(
      activityType,
      context,
      description,
      adminAction
    );
  }

  /**
   * Get activity type from action name
   */
  private getActivityTypeFromAction(action: string): ActivityType {
    const actionMap: Record<string, ActivityType> = {
      'create': ActivityType.CREATE,
      'create_user': ActivityType.CREATE,
      'update': ActivityType.UPDATE,
      'update_user': ActivityType.UPDATE,
      'delete': ActivityType.DELETE,
      'delete_user': ActivityType.DELETE,
      'view': ActivityType.VIEW,
      'list': ActivityType.VIEW,
      'assign_role': ActivityType.ADMIN_ACTION,
      'remove_role': ActivityType.ADMIN_ACTION,
      'update_permissions': ActivityType.ADMIN_ACTION,
      'export_data': ActivityType.EXPORT,
      'import_data': ActivityType.IMPORT,
      'update_settings': ActivityType.SETTINGS_UPDATE,
      'change_password': ActivityType.PASSWORD_CHANGE,
    };

    return actionMap[action] || ActivityType.ADMIN_ACTION;
  }

  /**
   * Extract resource ID from request or result
   */
  private extractResourceId(request: any, result?: any): string | undefined {
    // Try to get ID from URL parameters
    if (request.params?.id) {
      return request.params.id;
    }

    // Try to get ID from result
    if (result?.id) {
      return result.id;
    }

    if (result?.data?.id) {
      return result.data.id;
    }

    // Try to get ID from request body
    if (request.body?.id) {
      return request.body.id;
    }

    return undefined;
  }

  /**
   * Extract target user ID for user management actions
   */
  private extractTargetUserId(request: any, result?: any): string | undefined {
    // For user management operations
    if (request.params?.userId) {
      return request.params.userId;
    }

    if (request.body?.userId) {
      return request.body.userId;
    }

    if (result?.userId) {
      return result.userId;
    }

    if (result?.data?.userId) {
      return result.data.userId;
    }

    return undefined;
  }

  /**
   * Extract changes made during the operation
   */
  private extractChanges(request: any, result?: any): Record<string, any> | undefined {
    const changes: Record<string, any> = {};

    // Extract changes from request body
    if (request.body) {
      Object.keys(request.body).forEach(key => {
        if (key !== 'password' && key !== 'currentPassword') {
          changes[key] = request.body[key];
        }
      });
    }

    // Add result information if available
    if (result?.changes) {
      Object.assign(changes, result.changes);
    }

    return Object.keys(changes).length > 0 ? changes : undefined;
  }

  /**
   * Sanitize result data to remove sensitive information
   */
  private sanitizeResult(result: any): any {
    if (!result) return undefined;

    const sanitized = { ...result };

    // Remove sensitive fields
    if (sanitized.password) delete sanitized.password;
    if (sanitized.passwordHash) delete sanitized.passwordHash;
    if (sanitized.refreshToken) delete sanitized.refreshToken;
    if (sanitized.accessToken) delete sanitized.accessToken;

    // Limit size of result data
    const resultString = JSON.stringify(sanitized);
    if (resultString.length > 10000) {
      return {
        type: typeof result,
        size: resultString.length,
        truncated: true,
        preview: resultString.substring(0, 1000) + '...',
      };
    }

    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return undefined;

    const sanitized = { ...body };

    // Remove sensitive fields
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
    if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
    if (sanitized.confirmPassword) sanitized.confirmPassword = '[REDACTED]';

    return sanitized;
  }
}

/**
 * Specific decorators for common admin actions
 */
export const TrackUserManagement = (action: string, description?: string) =>
  TrackAdminAction({
    action: `user_${action}`,
    resource: 'user',
    description: description || `User management: ${action}`,
    trackChanges: true,
    trackTarget: true,
  });

export const TrackRoleManagement = (action: string, description?: string) =>
  TrackAdminAction({
    action: `role_${action}`,
    resource: 'role',
    description: description || `Role management: ${action}`,
    trackChanges: true,
  });

export const TrackPermissionManagement = (action: string, description?: string) =>
  TrackAdminAction({
    action: `permission_${action}`,
    resource: 'permission',
    description: description || `Permission management: ${action}`,
    trackChanges: true,
  });

export const TrackSystemSettings = (action: string, description?: string) =>
  TrackAdminAction({
    action: `settings_${action}`,
    resource: 'system_settings',
    description: description || `System settings: ${action}`,
    trackChanges: true,
  });

export const TrackDataOperation = (action: string, resource: string, description?: string) =>
  TrackAdminAction({
    action: `data_${action}`,
    resource,
    description: description || `Data operation: ${action} on ${resource}`,
    trackChanges: action !== 'export',
  });

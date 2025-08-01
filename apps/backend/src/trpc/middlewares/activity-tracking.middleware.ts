import { Injectable, Logger } from '@nestjs/common';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { UserActivityTrackingService } from '../../modules/user/services/user-activity-tracking.service';
import { ActivityType } from '../../modules/user/entities/user-activity.entity';

@Injectable()
export class ActivityTrackingMiddleware implements TRPCMiddleware {
  private readonly logger = new Logger(ActivityTrackingMiddleware.name);

  constructor(
    private readonly activityTrackingService: UserActivityTrackingService,
  ) {}

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next, path, type, input } = opts;
    const startTime = Date.now();

    // Only track for authenticated users
    if (!ctx.user) {
      return next();
    }

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      // Track successful activity
      await this.trackActivity({
        userId: ctx.user.id,
        sessionId: ctx.sessionId,
        activityType: this.getActivityType(path, type),
        activityDescription: `${type.toUpperCase()} ${path}`,
        resourceType: this.getResourceType(path),
        requestPath: path,
        requestMethod: type.toUpperCase(),
        responseStatus: 200,
        durationMs: duration,
        isSuccessful: true,
        metadata: {
          input: this.sanitizeInput(input),
          userAgent: ctx.userAgent,
          ipAddress: ctx.ipAddress,
        }
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Track failed activity
      await this.trackActivity({
        userId: ctx.user.id,
        sessionId: ctx.sessionId,
        activityType: this.getActivityType(path, type),
        activityDescription: `${type.toUpperCase()} ${path} (FAILED)`,
        resourceType: this.getResourceType(path),
        requestPath: path,
        requestMethod: type.toUpperCase(),
        responseStatus: this.getErrorStatus(error),
        durationMs: duration,
        isSuccessful: false,
        errorMessage: error.message,
        metadata: {
          input: this.sanitizeInput(input),
          userAgent: ctx.userAgent,
          ipAddress: ctx.ipAddress,
          errorCode: error.code,
        }
      });

      throw error;
    }
  }

  private async trackActivity(data: any): Promise<void> {
    try {
      await this.activityTrackingService.trackActivity(data);
    } catch (error) {
      // Don't let activity tracking errors break the main request
      this.logger.error(`Failed to track activity: ${error.message}`, error.stack);
    }
  }

  private getActivityType(path: string, type: string): ActivityType {
    // Map tRPC paths to activity types
    if (path.includes('login') || path.includes('auth')) {
      return ActivityType.LOGIN;
    }
    if (path.includes('logout')) {
      return ActivityType.LOGOUT;
    }
    if (path.includes('profile')) {
      return ActivityType.PROFILE_UPDATE;
    }
    if (path.includes('password')) {
      return ActivityType.PASSWORD_CHANGE;
    }
    if (path.includes('settings')) {
      return ActivityType.SETTINGS_UPDATE;
    }
    if (path.includes('upload')) {
      return ActivityType.FILE_UPLOAD;
    }
    if (path.includes('download')) {
      return ActivityType.FILE_DOWNLOAD;
    }
    if (path.includes('search')) {
      return ActivityType.SEARCH;
    }
    if (path.includes('admin')) {
      return ActivityType.ADMIN_ACTION;
    }

    // Map by HTTP method type
    switch (type.toLowerCase()) {
      case 'mutation':
        if (path.includes('create')) return ActivityType.CREATE;
        if (path.includes('update')) return ActivityType.UPDATE;
        if (path.includes('delete')) return ActivityType.DELETE;
        return ActivityType.UPDATE;
      case 'query':
        return ActivityType.VIEW;
      default:
        return ActivityType.API_CALL;
    }
  }

  private getResourceType(path: string): string {
    // Extract resource type from path
    const pathParts = path.split('.');
    if (pathParts.length > 1) {
      return pathParts[0]; // e.g., 'user' from 'user.getProfile'
    }
    return 'unknown';
  }

  private getErrorStatus(error: any): number {
    // Map tRPC error codes to HTTP status codes
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'BAD_REQUEST':
        return 400;
      case 'INTERNAL_SERVER_ERROR':
        return 500;
      default:
        return 500;
    }
  }

  private sanitizeInput(input: any): any {
    if (!input) return null;

    // Remove sensitive data from input before logging
    const sanitized = { ...input };
    
    // Remove password fields
    if (sanitized.password) delete sanitized.password;
    if (sanitized.newPassword) delete sanitized.newPassword;
    if (sanitized.oldPassword) delete sanitized.oldPassword;
    if (sanitized.confirmPassword) delete sanitized.confirmPassword;
    
    // Remove token fields
    if (sanitized.token) delete sanitized.token;
    if (sanitized.accessToken) delete sanitized.accessToken;
    if (sanitized.refreshToken) delete sanitized.refreshToken;

    // Truncate large strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    });

    return sanitized;
  }
}

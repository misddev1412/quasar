import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ActivityTrackingService } from '../services/activity-tracking.service';
import { ActivityType } from '../entities/user-activity.entity';

export interface TrackingRequest extends Request {
  activityContext?: {
    startTime: number;
    userId?: string;
    sessionId?: string;
  };
}

@Injectable()
export class ActivityTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ActivityTrackingMiddleware.name);

  constructor(private readonly activityTrackingService: ActivityTrackingService) {}

  async use(req: TrackingRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // Extract user information from request
    const user = (req as any).user;
    const session = (req as any).session;

    // Skip tracking for non-authenticated requests or non-admin routes
    if (!user || !this.shouldTrackRequest(req)) {
      return next();
    }

    // Store context for later use
    req.activityContext = {
      startTime,
      userId: user.id,
      sessionId: session?.sessionToken || session?.id,
    };

    // Override res.end to capture response data
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = Date.now();
      
      // Track the activity after response is sent
      setImmediate(async () => {
        try {
          await this.trackRequestActivity(req, res, startTime, endTime);
        } catch (error) {
          this.logger.error(`Failed to track activity: ${error.message}`, error.stack);
        }
      });

      // Call original end method
      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  /**
   * Determine if request should be tracked
   */
  private shouldTrackRequest(req: Request): boolean {
    const path = req.path;
    const method = req.method;

    // Track admin panel routes
    if (path.startsWith('/admin')) {
      return true;
    }

    // Track API routes that affect admin functionality
    if (path.startsWith('/api/admin') || path.startsWith('/trpc/admin')) {
      return true;
    }

    // Track authentication routes
    if (path.includes('/auth/') && (method === 'POST' || method === 'DELETE')) {
      return true;
    }

    // Skip static assets, health checks, etc.
    const skipPatterns = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/_next/',
      '/static/',
      '/assets/',
      '/public/',
    ];

    return !skipPatterns.some(pattern => path.startsWith(pattern));
  }

  /**
   * Track the request activity based on route and method
   */
  private async trackRequestActivity(
    req: TrackingRequest,
    res: Response,
    startTime: number,
    endTime: number
  ): Promise<void> {
    if (!req.activityContext) {
      return;
    }

    const context = this.activityTrackingService.extractUserContext(req);
    context.startTime = startTime;
    context.endTime = endTime;
    context.response = res;

    const path = req.path;
    const method = req.method;

    try {
      // Determine activity type and track accordingly
      if (this.isAuthRoute(path, method)) {
        await this.trackAuthActivity(context, path, method);
      } else if (this.isAdminPageRoute(path, method)) {
        await this.trackAdminPageActivity(context, path);
      } else if (this.isApiRoute(path, method)) {
        await this.trackApiActivity(context, path, method);
      } else if (this.isCrudRoute(path, method)) {
        await this.trackCrudActivity(context, path, method);
      } else {
        // Generic activity tracking
        const fullContext = this.activityTrackingService.extractUserContext(req);
        await this.activityTrackingService.trackActivity(
          this.getActivityTypeFromMethod(method),
          {
            ...fullContext,
            userId: fullContext.userId || 'unknown',
            request: req,
            startTime: fullContext.startTime || Date.now(),
            endTime: Date.now(),
          }
        );
      }
    } catch (error) {
      this.logger.error(`Failed to track activity for ${path}: ${error.message}`);
    }
  }

  /**
   * Track authentication activities
   */
  private async trackAuthActivity(context: any, path: string, method: string): Promise<void> {
    if (path.includes('/login') && method === 'POST') {
      if (path.includes('/admin')) {
        await this.activityTrackingService.trackAdminLogin(context);
      } else {
        await this.activityTrackingService.trackActivity(ActivityType.LOGIN, context);
      }
    } else if (path.includes('/logout') && (method === 'POST' || method === 'DELETE')) {
      if (path.includes('/admin')) {
        await this.activityTrackingService.trackAdminLogout(context);
      } else {
        await this.activityTrackingService.trackActivity(ActivityType.LOGOUT, context);
      }
    }
  }

  /**
   * Track admin page views
   */
  private async trackAdminPageActivity(context: any, path: string): Promise<void> {
    const pageTitle = this.getPageTitleFromPath(path);
    await this.activityTrackingService.trackAdminPageView(context, pageTitle);
  }

  /**
   * Track API activities
   */
  private async trackApiActivity(context: any, path: string, method: string): Promise<void> {
    if (path.startsWith('/api/admin') || path.startsWith('/trpc/admin')) {
      await this.activityTrackingService.trackAdminApiCall(context, path);
    } else {
      await this.activityTrackingService.trackActivity(ActivityType.API_CALL, context);
    }
  }

  /**
   * Track CRUD operations
   */
  private async trackCrudActivity(context: any, path: string, method: string): Promise<void> {
    const { resource, resourceId, operation } = this.parseCrudRoute(path, method);
    
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      await this.activityTrackingService.trackAdminCrudOperation(
        context,
        operation,
        resource,
        resourceId
      );
    } else {
      const activityType = this.getActivityTypeFromOperation(operation);
      await this.activityTrackingService.trackActivity(activityType, context);
    }
  }

  /**
   * Helper methods for route classification
   */
  private isAuthRoute(path: string, method: string): boolean {
    return path.includes('/auth/') && (method === 'POST' || method === 'DELETE');
  }

  private isAdminPageRoute(path: string, method: string): boolean {
    return path.startsWith('/admin') && method === 'GET' && !path.startsWith('/api/admin');
  }

  private isApiRoute(path: string, method: string): boolean {
    return path.startsWith('/api/') || path.startsWith('/trpc/');
  }

  private isCrudRoute(path: string, method: string): boolean {
    const crudMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    return crudMethods.includes(method) && (
      path.includes('/users') ||
      path.includes('/roles') ||
      path.includes('/permissions') ||
      path.includes('/settings')
    );
  }

  /**
   * Extract page title from admin path
   */
  private getPageTitleFromPath(path: string): string {
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length < 2) return 'Admin Panel';
    
    const pageMap: Record<string, string> = {
      'dashboard': 'Admin Dashboard',
      'users': 'User Management',
      'roles': 'Role Management',
      'permissions': 'Permission Management',
      'settings': 'System Settings',
      'analytics': 'Analytics Dashboard',
      'logs': 'System Logs',
      'reports': 'Reports',
    };

    const page = pathSegments[1];
    return pageMap[page] || `Admin ${page.charAt(0).toUpperCase() + page.slice(1)}`;
  }

  /**
   * Parse CRUD route to extract resource and operation
   */
  private parseCrudRoute(path: string, method: string): {
    resource: string;
    resourceId?: string;
    operation: 'create' | 'read' | 'update' | 'delete';
  } {
    const pathSegments = path.split('/').filter(Boolean);
    let resource = 'unknown';
    let resourceId: string | undefined;
    let operation: 'create' | 'read' | 'update' | 'delete' = 'read';

    // Extract resource from path
    if (pathSegments.includes('users')) {
      resource = 'user';
      const userIndex = pathSegments.indexOf('users');
      if (pathSegments[userIndex + 1] && pathSegments[userIndex + 1] !== 'create') {
        resourceId = pathSegments[userIndex + 1];
      }
    } else if (pathSegments.includes('roles')) {
      resource = 'role';
      const roleIndex = pathSegments.indexOf('roles');
      if (pathSegments[roleIndex + 1] && pathSegments[roleIndex + 1] !== 'create') {
        resourceId = pathSegments[roleIndex + 1];
      }
    } else if (pathSegments.includes('permissions')) {
      resource = 'permission';
    } else if (pathSegments.includes('settings')) {
      resource = 'setting';
    }

    // Determine operation from method
    switch (method) {
      case 'POST':
        operation = 'create';
        break;
      case 'GET':
        operation = 'read';
        break;
      case 'PUT':
      case 'PATCH':
        operation = 'update';
        break;
      case 'DELETE':
        operation = 'delete';
        break;
    }

    return { resource, resourceId, operation };
  }

  /**
   * Get activity type from HTTP method
   */
  private getActivityTypeFromMethod(method: string): ActivityType {
    switch (method) {
      case 'POST':
        return ActivityType.CREATE;
      case 'GET':
        return ActivityType.VIEW;
      case 'PUT':
      case 'PATCH':
        return ActivityType.UPDATE;
      case 'DELETE':
        return ActivityType.DELETE;
      default:
        return ActivityType.OTHER;
    }
  }

  /**
   * Get activity type from CRUD operation
   */
  private getActivityTypeFromOperation(operation: string): ActivityType {
    switch (operation) {
      case 'create':
        return ActivityType.CREATE;
      case 'read':
        return ActivityType.VIEW;
      case 'update':
        return ActivityType.UPDATE;
      case 'delete':
        return ActivityType.DELETE;
      default:
        return ActivityType.OTHER;
    }
  }
}

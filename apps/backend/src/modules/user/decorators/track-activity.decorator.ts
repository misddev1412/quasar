import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActivityType } from '../entities/user-activity.entity';

export const ACTIVITY_TRACKING_KEY = 'activity_tracking';

export interface ActivityTrackingOptions {
  type: ActivityType;
  description?: string;
  resource?: string;
  action?: string;
  trackChanges?: boolean;
  trackResult?: boolean;
  skipOnError?: boolean;
}

/**
 * Decorator to enable activity tracking for a method
 */
export const TrackActivity = (options: ActivityTrackingOptions) =>
  SetMetadata(ACTIVITY_TRACKING_KEY, options);

/**
 * Parameter decorator to inject activity context
 */
export const ActivityContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const session = request.session;

    return {
      userId: user?.id,
      sessionId: session?.sessionToken || session?.id,
      ipAddress: request.ip || request.connection.remoteAddress,
      userAgent: request.get('user-agent'),
      request,
      startTime: Date.now(),
    };
  },
);

/**
 * Parameter decorator to inject current user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Parameter decorator to inject current session
 */
export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);

/**
 * Specific activity tracking decorators for common operations
 */

export const TrackLogin = (description?: string) =>
  TrackActivity({
    type: ActivityType.LOGIN,
    description: description || 'User login',
    action: 'login',
  });

export const TrackLogout = (description?: string) =>
  TrackActivity({
    type: ActivityType.LOGOUT,
    description: description || 'User logout',
    action: 'logout',
  });

export const TrackPageView = (pageName?: string) =>
  TrackActivity({
    type: ActivityType.PAGE_VIEW,
    description: `Page view: ${pageName || 'unknown'}`,
    action: 'page_view',
    resource: 'page',
  });

export const TrackApiCall = (endpoint?: string) =>
  TrackActivity({
    type: ActivityType.API_CALL,
    description: `API call: ${endpoint || 'unknown'}`,
    action: 'api_call',
    resource: 'api',
  });

export const TrackCreate = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.CREATE,
    description: description || `Create ${resource}`,
    action: 'create',
    resource,
    trackChanges: true,
    trackResult: true,
  });

export const TrackUpdate = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.UPDATE,
    description: description || `Update ${resource}`,
    action: 'update',
    resource,
    trackChanges: true,
    trackResult: true,
  });

export const TrackDelete = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.DELETE,
    description: description || `Delete ${resource}`,
    action: 'delete',
    resource,
    trackChanges: true,
  });

export const TrackView = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.VIEW,
    description: description || `View ${resource}`,
    action: 'view',
    resource,
  });

export const TrackSearch = (resource?: string, description?: string) =>
  TrackActivity({
    type: ActivityType.SEARCH,
    description: description || `Search ${resource || 'data'}`,
    action: 'search',
    resource: resource || 'data',
    trackResult: true,
  });

export const TrackExport = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.EXPORT,
    description: description || `Export ${resource}`,
    action: 'export',
    resource,
    trackResult: true,
  });

export const TrackImport = (resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.IMPORT,
    description: description || `Import ${resource}`,
    action: 'import',
    resource,
    trackChanges: true,
    trackResult: true,
  });

export const TrackProfileUpdate = (description?: string) =>
  TrackActivity({
    type: ActivityType.PROFILE_UPDATE,
    description: description || 'Profile update',
    action: 'profile_update',
    resource: 'user_profile',
    trackChanges: true,
  });

export const TrackPasswordChange = (description?: string) =>
  TrackActivity({
    type: ActivityType.PASSWORD_CHANGE,
    description: description || 'Password change',
    action: 'password_change',
    resource: 'user_auth',
  });

export const TrackSettingsUpdate = (settingType?: string, description?: string) =>
  TrackActivity({
    type: ActivityType.SETTINGS_UPDATE,
    description: description || `Settings update: ${settingType || 'general'}`,
    action: 'settings_update',
    resource: settingType || 'settings',
    trackChanges: true,
  });

export const TrackFileUpload = (description?: string) =>
  TrackActivity({
    type: ActivityType.FILE_UPLOAD,
    description: description || 'File upload',
    action: 'file_upload',
    resource: 'file',
    trackResult: true,
  });

export const TrackFileDownload = (description?: string) =>
  TrackActivity({
    type: ActivityType.FILE_DOWNLOAD,
    description: description || 'File download',
    action: 'file_download',
    resource: 'file',
  });

export const TrackAdminAction = (action: string, resource?: string, description?: string) =>
  TrackActivity({
    type: ActivityType.ADMIN_ACTION,
    description: description || `Admin action: ${action}`,
    action: `admin_${action}`,
    resource: resource || 'admin',
    trackChanges: true,
    trackResult: true,
  });

/**
 * Composite decorators for complex admin operations
 */

export const TrackUserManagementAction = (action: string, description?: string) =>
  TrackAdminAction(`user_${action}`, 'user', description || `User management: ${action}`);

export const TrackRoleManagementAction = (action: string, description?: string) =>
  TrackAdminAction(`role_${action}`, 'role', description || `Role management: ${action}`);

export const TrackPermissionManagementAction = (action: string, description?: string) =>
  TrackAdminAction(`permission_${action}`, 'permission', description || `Permission management: ${action}`);

export const TrackSystemConfigAction = (action: string, description?: string) =>
  TrackAdminAction(`config_${action}`, 'system_config', description || `System configuration: ${action}`);

/**
 * Utility function to create custom tracking decorators
 */
export function createActivityTracker(
  type: ActivityType,
  defaultOptions: Partial<ActivityTrackingOptions> = {}
) {
  return (options: Partial<ActivityTrackingOptions> = {}) =>
    TrackActivity({
      type,
      ...defaultOptions,
      ...options,
    });
}

/**
 * Conditional tracking decorators
 */
export const TrackIfAdmin = (options: ActivityTrackingOptions) =>
  TrackActivity({
    ...options,
    description: `[Admin] ${options.description || options.action}`,
  });

export const TrackIfSuccess = (options: ActivityTrackingOptions) =>
  TrackActivity({
    ...options,
    skipOnError: true,
  });

/**
 * Batch operation tracking
 */
export const TrackBatchOperation = (operation: string, resource: string, description?: string) =>
  TrackActivity({
    type: ActivityType.ADMIN_ACTION,
    description: description || `Batch ${operation} on ${resource}`,
    action: `batch_${operation}`,
    resource,
    trackChanges: true,
    trackResult: true,
  });

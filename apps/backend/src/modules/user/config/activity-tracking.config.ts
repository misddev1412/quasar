import { registerAs } from '@nestjs/config';

export interface ActivityTrackingConfig {
  enabled: boolean;
  trackAnonymous: boolean;
  trackFailedRequests: boolean;
  trackStaticAssets: boolean;
  maxMetadataSize: number;
  sessionTimeout: number;
  batchSize: number;
  flushInterval: number;
  retentionDays: number;
  excludePaths: string[];
  includePaths: string[];
  sensitiveFields: string[];
  adminRoutes: {
    enabled: boolean;
    trackPageViews: boolean;
    trackApiCalls: boolean;
    trackCrudOperations: boolean;
    trackUserManagement: boolean;
    trackRoleManagement: boolean;
    trackSystemSettings: boolean;
    trackDataExports: boolean;
  };
  performance: {
    trackResponseTimes: boolean;
    slowRequestThreshold: number;
    trackMemoryUsage: boolean;
    trackDatabaseQueries: boolean;
  };
  security: {
    trackFailedLogins: boolean;
    trackPermissionDenials: boolean;
    trackSuspiciousActivity: boolean;
    alertThresholds: {
      failedLoginsPerMinute: number;
      permissionDenialsPerMinute: number;
      suspiciousActionsPerHour: number;
    };
  };
  storage: {
    enableCompression: boolean;
    enableEncryption: boolean;
    archiveOldData: boolean;
    archiveAfterDays: number;
  };
}

export default registerAs('activityTracking', (): ActivityTrackingConfig => ({
  // General settings
  enabled: process.env.ACTIVITY_TRACKING_ENABLED === 'true' || true,
  trackAnonymous: process.env.TRACK_ANONYMOUS_USERS === 'true' || false,
  trackFailedRequests: process.env.TRACK_FAILED_REQUESTS === 'true' || true,
  trackStaticAssets: process.env.TRACK_STATIC_ASSETS === 'true' || false,
  maxMetadataSize: parseInt(process.env.MAX_METADATA_SIZE || '10240'), // 10KB
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800'), // 30 minutes
  batchSize: parseInt(process.env.ACTIVITY_BATCH_SIZE || '100'),
  flushInterval: parseInt(process.env.ACTIVITY_FLUSH_INTERVAL || '5000'), // 5 seconds
  retentionDays: parseInt(process.env.ACTIVITY_RETENTION_DAYS || '90'),

  // Path filtering
  excludePaths: [
    '/health',
    '/metrics',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/_next/',
    '/static/',
    '/assets/',
    '/public/',
    '/uploads/',
    '/downloads/',
    ...(process.env.ACTIVITY_EXCLUDE_PATHS?.split(',') || []),
  ],

  includePaths: [
    '/admin/*',
    '/api/admin/*',
    '/trpc/admin/*',
    '/auth/*',
    ...(process.env.ACTIVITY_INCLUDE_PATHS?.split(',') || []),
  ],

  // Sensitive fields to exclude from tracking
  sensitiveFields: [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'passwordHash',
    'accessToken',
    'refreshToken',
    'sessionToken',
    'apiKey',
    'secret',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurityNumber',
    ...(process.env.ACTIVITY_SENSITIVE_FIELDS?.split(',') || []),
  ],

  // Admin-specific tracking
  adminRoutes: {
    enabled: process.env.ADMIN_TRACKING_ENABLED === 'true' || true,
    trackPageViews: process.env.ADMIN_TRACK_PAGE_VIEWS === 'true' || true,
    trackApiCalls: process.env.ADMIN_TRACK_API_CALLS === 'true' || true,
    trackCrudOperations: process.env.ADMIN_TRACK_CRUD === 'true' || true,
    trackUserManagement: process.env.ADMIN_TRACK_USER_MGMT === 'true' || true,
    trackRoleManagement: process.env.ADMIN_TRACK_ROLE_MGMT === 'true' || true,
    trackSystemSettings: process.env.ADMIN_TRACK_SETTINGS === 'true' || true,
    trackDataExports: process.env.ADMIN_TRACK_EXPORTS === 'true' || true,
  },

  // Performance tracking
  performance: {
    trackResponseTimes: process.env.TRACK_RESPONSE_TIMES === 'true' || true,
    slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '1000'), // 1 second
    trackMemoryUsage: process.env.TRACK_MEMORY_USAGE === 'true' || false,
    trackDatabaseQueries: process.env.TRACK_DB_QUERIES === 'true' || false,
  },

  // Security monitoring
  security: {
    trackFailedLogins: process.env.TRACK_FAILED_LOGINS === 'true' || true,
    trackPermissionDenials: process.env.TRACK_PERMISSION_DENIALS === 'true' || true,
    trackSuspiciousActivity: process.env.TRACK_SUSPICIOUS_ACTIVITY === 'true' || true,
    alertThresholds: {
      failedLoginsPerMinute: parseInt(process.env.FAILED_LOGINS_THRESHOLD || '5'),
      permissionDenialsPerMinute: parseInt(process.env.PERMISSION_DENIALS_THRESHOLD || '10'),
      suspiciousActionsPerHour: parseInt(process.env.SUSPICIOUS_ACTIONS_THRESHOLD || '50'),
    },
  },

  // Storage options
  storage: {
    enableCompression: process.env.ACTIVITY_COMPRESSION === 'true' || true,
    enableEncryption: process.env.ACTIVITY_ENCRYPTION === 'true' || false,
    archiveOldData: process.env.ACTIVITY_ARCHIVE === 'true' || true,
    archiveAfterDays: parseInt(process.env.ACTIVITY_ARCHIVE_DAYS || '30'),
  },
}));

/**
 * Activity tracking route patterns
 */
export const ADMIN_ROUTE_PATTERNS = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/users/:id',
  '/admin/users/:id/roles',
  '/admin/users/:id/permissions',
  '/admin/roles',
  '/admin/roles/:id',
  '/admin/permissions',
  '/admin/permissions/:id',
  '/admin/settings',
  '/admin/settings/:category',
  '/admin/analytics',
  '/admin/logs',
  '/admin/reports',
  '/admin/system',
];

export const API_ROUTE_PATTERNS = [
  '/api/admin/users',
  '/api/admin/users/:id',
  '/api/admin/roles',
  '/api/admin/roles/:id',
  '/api/admin/permissions',
  '/api/admin/permissions/:id',
  '/api/admin/settings',
  '/api/admin/analytics',
  '/api/admin/reports',
  '/api/admin/system',
];

export const TRPC_ROUTE_PATTERNS = [
  '/trpc/admin.users.list',
  '/trpc/admin.users.create',
  '/trpc/admin.users.update',
  '/trpc/admin.users.delete',
  '/trpc/admin.roles.list',
  '/trpc/admin.roles.create',
  '/trpc/admin.roles.update',
  '/trpc/admin.roles.delete',
  '/trpc/admin.permissions.list',
  '/trpc/admin.permissions.create',
  '/trpc/admin.permissions.update',
  '/trpc/admin.permissions.delete',
  '/trpc/admin.settings.get',
  '/trpc/admin.settings.update',
  '/trpc/admin.analytics.dashboard',
  '/trpc/admin.reports.generate',
];

/**
 * Activity type mappings for different operations
 */
export const ACTIVITY_TYPE_MAPPINGS = {
  // HTTP Methods
  GET: 'view',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',

  // Admin Actions
  'admin.login': 'login',
  'admin.logout': 'logout',
  'admin.dashboard': 'page_view',
  'admin.users.list': 'view',
  'admin.users.create': 'create',
  'admin.users.update': 'update',
  'admin.users.delete': 'delete',
  'admin.users.export': 'export',
  'admin.roles.assign': 'admin_action',
  'admin.roles.remove': 'admin_action',
  'admin.permissions.grant': 'admin_action',
  'admin.permissions.revoke': 'admin_action',
  'admin.settings.update': 'settings_update',
  'admin.system.config': 'admin_action',

  // User Actions
  'user.profile.update': 'profile_update',
  'user.password.change': 'password_change',
  'user.settings.update': 'settings_update',
  'user.file.upload': 'file_upload',
  'user.file.download': 'file_download',
  'user.search': 'search',
};

/**
 * Sensitive data patterns to exclude from activity logs
 */
export const SENSITIVE_DATA_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /ssn/i,
  /social.*security/i,
  /credit.*card/i,
  /bank.*account/i,
  /routing.*number/i,
];

/**
 * High-privilege operations that require special tracking
 */
export const HIGH_PRIVILEGE_OPERATIONS = [
  'admin.users.delete',
  'admin.roles.delete',
  'admin.permissions.delete',
  'admin.system.config',
  'admin.database.backup',
  'admin.database.restore',
  'admin.system.maintenance',
  'admin.security.settings',
];

/**
 * Real-time alert triggers
 */
export const ALERT_TRIGGERS = {
  FAILED_LOGIN_ATTEMPTS: 'failed_login_attempts',
  PERMISSION_DENIALS: 'permission_denials',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  HIGH_PRIVILEGE_ACCESS: 'high_privilege_access',
  BULK_OPERATIONS: 'bulk_operations',
  DATA_EXPORT: 'data_export',
  SYSTEM_CHANGES: 'system_changes',
};

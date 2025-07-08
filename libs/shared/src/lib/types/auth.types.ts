import { UserRole, PermissionAction, PermissionScope } from '../enums';

/**
 * JWT token payload
 */
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  username: string;
  role: UserRole;
  permissions?: string[];
  iat: number; // issued at
  exp: number; // expires at
  iss?: string; // issuer
  aud?: string; // audience
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds until access token expires
  refreshExpiresIn: number; // seconds until refresh token expires
  scope?: string;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * Authentication context
 */
export interface AuthContext {
  user: AuthUser;
  session: UserSession;
  permissions: Permission[];
  roles: UserRole[];
  isAuthenticated: boolean;
  isAuthorized: (resource: string, action: string) => boolean;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  };
}

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  attributes: string[];
  conditions?: Record<string, any>;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: UserRole;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  hierarchy: number; // for role hierarchy (higher number = more permissions)
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  deviceName?: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
  resetUrl?: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password change data
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  token: string;
  email?: string;
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * Two-factor authentication verification
 */
export interface TwoFactorVerification {
  token: string;
  backupCode?: string;
}

/**
 * OAuth provider configuration
 */
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

/**
 * OAuth authentication data
 */
export interface OAuthAuthData {
  provider: string;
  code: string;
  state?: string;
  redirectUri: string;
}

/**
 * OAuth user profile
 */
export interface OAuthUserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
  providerId: string;
  raw: Record<string, any>;
}

/**
 * API key information
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  userId: string;
  permissions: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

/**
 * Rate limiting configuration
 */
export interface RateLimit {
  requests: number;
  window: number; // in seconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  message?: string;
}

/**
 * Security policy configuration
 */
export interface SecurityPolicy {
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  accountLockoutPolicy: AccountLockoutPolicy;
  auditPolicy: AuditPolicy;
}

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // number of previous passwords to check
  expiryDays?: number;
  strengthMeter: boolean;
}

/**
 * Session policy configuration
 */
export interface SessionPolicy {
  timeout: number; // in seconds
  renewalThreshold: number; // renew session when this much time is left
  maxConcurrentSessions: number;
  singleSessionPerUser: boolean;
  trackLocation: boolean;
  requireReauthentication: string[]; // actions that require re-authentication
}

/**
 * Account lockout policy
 */
export interface AccountLockoutPolicy {
  maxAttempts: number;
  lockoutDuration: number; // in seconds
  resetAfter: number; // reset attempt count after this time
  incrementalDelay: boolean;
  notifyUser: boolean;
}

/**
 * Audit policy configuration
 */
export interface AuditPolicy {
  logSuccessfulLogins: boolean;
  logFailedLogins: boolean;
  logPasswordChanges: boolean;
  logPermissionChanges: boolean;
  logDataAccess: boolean;
  retentionDays: number;
  compressOldLogs: boolean;
} 
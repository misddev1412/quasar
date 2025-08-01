import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActivityTrackingService } from '../services/activity-tracking.service';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { SessionStatus } from '../entities/user-session.entity';

export const REQUIRE_ACTIVE_SESSION = 'require_active_session';
export const TRACK_SESSION_ACTIVITY = 'track_session_activity';

/**
 * Decorator to require an active session for activity tracking
 */
export const RequireActiveSession = () => (target: any) =>
  Reflect.defineMetadata(REQUIRE_ACTIVE_SESSION, true, target);

/**
 * Decorator to enable session activity tracking
 */
export const TrackSessionActivity = () => (target: any) =>
  Reflect.defineMetadata(TRACK_SESSION_ACTIVITY, true, target);

@Injectable()
export class ActivityTrackingGuard implements CanActivate {
  protected readonly logger = new Logger(ActivityTrackingGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly activityTrackingService: ActivityTrackingService,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user, allow request to proceed (authentication should be handled elsewhere)
    if (!user) {
      return true;
    }

    const requireActiveSession = this.reflector.get<boolean>(
      REQUIRE_ACTIVE_SESSION,
      context.getHandler(),
    ) || this.reflector.get<boolean>(
      REQUIRE_ACTIVE_SESSION,
      context.getClass(),
    );

    const trackSessionActivity = this.reflector.get<boolean>(
      TRACK_SESSION_ACTIVITY,
      context.getHandler(),
    ) || this.reflector.get<boolean>(
      TRACK_SESSION_ACTIVITY,
      context.getClass(),
    );

    try {
      // Validate and update session if required
      if (requireActiveSession || trackSessionActivity) {
        const sessionValid = await this.validateAndUpdateSession(request);
        
        if (requireActiveSession && !sessionValid) {
          this.logger.warn(`Access denied: Invalid session for user ${user.id}`);
          return false;
        }
      }

      // Set up activity tracking context
      this.setupActivityTrackingContext(request);

      return true;
    } catch (error) {
      this.logger.error(`Activity tracking guard error: ${error.message}`, error.stack);
      
      // Don't block request on tracking errors unless session is required
      return !requireActiveSession;
    }
  }

  /**
   * Validate and update user session
   */
  private async validateAndUpdateSession(request: any): Promise<boolean> {
    const user = request.user;
    const sessionToken = this.extractSessionToken(request);

    if (!sessionToken) {
      this.logger.debug(`No session token found for user ${user.id}`);
      return false;
    }

    try {
      const session = await this.userSessionRepository.findBySessionToken(sessionToken);

      if (!session) {
        this.logger.debug(`Session not found: ${sessionToken}`);
        return false;
      }

      if (session.userId !== user.id) {
        this.logger.warn(`Session user mismatch: expected ${user.id}, got ${session.userId}`);
        return false;
      }

      if (session.status !== SessionStatus.ACTIVE) {
        this.logger.debug(`Session not active: ${sessionToken}, status: ${session.status}`);
        return false;
      }

      if (session.expiresAt < new Date()) {
        this.logger.debug(`Session expired: ${sessionToken}`);
        
        // Mark session as expired
        await this.userSessionRepository.terminateSession(sessionToken, SessionStatus.EXPIRED);
        return false;
      }

      // Update session last activity
      await this.userSessionRepository.updateLastActivity(sessionToken);
      
      // Attach session to request for activity tracking
      request.session = session;
      
      return true;
    } catch (error) {
      this.logger.error(`Session validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract session token from request
   */
  private extractSessionToken(request: any): string | null {
    // Try to get from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get from cookies
    const sessionCookie = request.cookies?.session_token;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Try to get from custom header
    const sessionHeader = request.headers['x-session-token'];
    if (sessionHeader) {
      return sessionHeader;
    }

    // Try to get from query parameter (less secure, for special cases)
    const sessionQuery = request.query?.session_token;
    if (sessionQuery) {
      return sessionQuery;
    }

    return null;
  }

  /**
   * Set up activity tracking context on request
   */
  private setupActivityTrackingContext(request: any): void {
    const user = request.user;
    const session = request.session;

    // Create activity context
    const activityContext = {
      userId: user.id,
      sessionId: session?.sessionToken || session?.id,
      ipAddress: this.extractIpAddress(request),
      userAgent: request.get('user-agent'),
      startTime: Date.now(),
      request,
    };

    // Attach to request for use by interceptors and middleware
    request.activityContext = activityContext;

    // Add user and session info for easy access
    request.trackingUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles || [],
    };

    if (session) {
      request.trackingSession = {
        id: session.id,
        sessionToken: session.sessionToken,
        deviceType: session.deviceType,
        browser: session.browser,
        operatingSystem: session.operatingSystem,
        loginAt: session.loginAt,
        lastActivityAt: session.lastActivityAt,
      };
    }
  }

  /**
   * Extract real IP address from request
   */
  private extractIpAddress(request: any): string {
    return (
      request.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.get('x-real-ip') ||
      request.get('x-client-ip') ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}

/**
 * Specialized guard for admin routes
 */
@Injectable()
export class AdminActivityTrackingGuard extends ActivityTrackingGuard {
  protected readonly logger = new Logger(AdminActivityTrackingGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has admin role
    if (!this.isAdminUser(user)) {
      this.logger.warn(`Non-admin user ${user?.id} attempted to access admin route`);
      return false;
    }

    // Call parent validation
    const canActivate = await super.canActivate(context);
    
    if (canActivate) {
      // Add admin-specific context
      this.setupAdminTrackingContext(request);
    }

    return canActivate;
  }

  /**
   * Check if user has admin privileges
   */
  private isAdminUser(user: any): boolean {
    if (!user) return false;

    // Check user roles
    const roles = user.roles || [];
    const adminRoles = ['super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN'];
    
    return roles.some((role: any) => {
      const roleCode = typeof role === 'string' ? role : role.code || role.name;
      return adminRoles.includes(roleCode);
    });
  }

  /**
   * Set up admin-specific tracking context
   */
  private setupAdminTrackingContext(request: any): void {
    if (request.activityContext) {
      request.activityContext.metadata = {
        ...request.activityContext.metadata,
        adminPanel: true,
        adminUser: true,
        adminRoute: request.path,
      };
    }

    // Mark request as admin for middleware and interceptors
    request.isAdminRequest = true;
  }
}

/**
 * Guard for high-privilege admin operations
 */
@Injectable()
export class HighPrivilegeActivityGuard extends AdminActivityTrackingGuard {
  protected readonly logger = new Logger(HighPrivilegeActivityGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check for super admin role for high-privilege operations
    if (!this.isSuperAdminUser(user)) {
      this.logger.warn(`User ${user?.id} attempted high-privilege operation without super admin role`);
      return false;
    }

    const canActivate = await super.canActivate(context);
    
    if (canActivate) {
      // Add high-privilege context
      request.activityContext.metadata = {
        ...request.activityContext.metadata,
        highPrivilege: true,
        requiresSuperAdmin: true,
      };
    }

    return canActivate;
  }

  /**
   * Check if user has super admin privileges
   */
  private isSuperAdminUser(user: any): boolean {
    if (!user) return false;

    const roles = user.roles || [];
    const superAdminRoles = ['super_admin', 'SUPER_ADMIN'];
    
    return roles.some((role: any) => {
      const roleCode = typeof role === 'string' ? role : role.code || role.name;
      return superAdminRoles.includes(roleCode);
    });
  }
}

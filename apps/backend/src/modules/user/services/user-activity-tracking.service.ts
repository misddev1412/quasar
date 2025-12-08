import { Injectable, Logger } from '@nestjs/common';
import { UserActivityRepository } from '../repositories/user-activity.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { UserActivity, ActivityType } from '../entities/user-activity.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';

export interface ActivityTrackingData {
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
}

export interface SessionTrackingData {
  userId: string;
  sessionToken: string;
  refreshToken?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  isRememberMe?: boolean;
  sessionData?: Record<string, any>;
}

@Injectable()
export class UserActivityTrackingService {
  private readonly logger = new Logger(UserActivityTrackingService.name);

  constructor(
    private readonly userActivityRepository: UserActivityRepository,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async trackActivity(data: ActivityTrackingData): Promise<UserActivity> {
    try {
      const activityData = UserActivity.createActivity(data);
      const activity = await this.userActivityRepository.logActivity(activityData);
      
      // Update session last activity if session exists
      if (data.sessionId) {
        await this.updateSessionActivity(data.sessionId);
      }

      this.logger.debug(`Activity tracked: ${data.activityType} for user ${data.userId}`);
      return activity;
    } catch (error) {
      this.logger.error(`Failed to track activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async trackBulkActivities(activitiesData: ActivityTrackingData[]): Promise<UserActivity[]> {
    try {
      const activities = activitiesData.map(data => UserActivity.createActivity(data));
      const savedActivities = await this.userActivityRepository.bulkLogActivities(activities);
      
      this.logger.debug(`Bulk activities tracked: ${activitiesData.length} activities`);
      return savedActivities;
    } catch (error) {
      this.logger.error(`Failed to track bulk activities: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSession(data: SessionTrackingData): Promise<UserSession> {
    try {
      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(data.userAgent);
      
      const sessionData = UserSession.createSession({
        ...data,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.operatingSystem,
      });

      const session = await this.userSessionRepository.createSession(sessionData);
      
      // Track login activity
      await this.trackActivity({
        userId: data.userId,
        sessionId: session.sessionToken,
        activityType: ActivityType.LOGIN,
        activityDescription: 'User logged in',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: {
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          operatingSystem: deviceInfo.operatingSystem,
          isRememberMe: data.isRememberMe
        }
      });

      this.logger.debug(`Session created for user ${data.userId}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async terminateSession(sessionToken: string, reason: SessionStatus = SessionStatus.LOGGED_OUT): Promise<void> {
    try {
      const session = await this.userSessionRepository.findBySessionToken(sessionToken);
      if (!session) {
        this.logger.warn(`Session not found: ${sessionToken}`);
        return;
      }

      await this.userSessionRepository.terminateSession(sessionToken, reason);
      
      // Track logout activity
      await this.trackActivity({
        userId: session.userId,
        sessionId: sessionToken,
        activityType: ActivityType.LOGOUT,
        activityDescription: `User logged out (${reason})`,
        metadata: { reason }
      });

      this.logger.debug(`Session terminated: ${sessionToken} (${reason})`);
    } catch (error) {
      this.logger.error(`Failed to terminate session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      await this.userSessionRepository.updateLastActivity(sessionToken);
    } catch (error) {
      this.logger.error(`Failed to update session activity: ${error.message}`, error.stack);
      // Don't throw error for session updates to avoid breaking main functionality
    }
  }

  async getActiveUsersCount(timeWindow?: { start: Date; end: Date }): Promise<number> {
    try {
      if (timeWindow) {
        return await this.userActivityRepository.getActiveUsersCount(timeWindow.start, timeWindow.end);
      } else {
        // Default to last 24 hours
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return await this.userActivityRepository.getActiveUsersCount(start, end);
      }
    } catch (error) {
      this.logger.error(`Failed to get active users count: ${error.message}`, error.stack);
      return 0;
    }
  }

  async getActiveUsersInDateRange(startDate: Date, endDate: Date): Promise<string[]> {
    try {
      return await this.userActivityRepository.getActiveUsersInDateRange(startDate, endDate);
    } catch (error) {
      this.logger.error(`Failed to get active users in date range: ${error.message}`, error.stack);
      return [];
    }
  }

  async getRecentActiveUsers(minutes: number = 30): Promise<string[]> {
    try {
      return await this.userActivityRepository.getRecentActiveUsers(minutes);
    } catch (error) {
      this.logger.error(`Failed to get recent active users: ${error.message}`, error.stack);
      return [];
    }
  }

  async cleanupOldData(activityDaysToKeep: number = 90, sessionDaysToKeep: number = 30): Promise<void> {
    try {
      // Cleanup expired sessions first
      await this.userSessionRepository.cleanupExpiredSessions();
      
      // Delete old activities
      const deletedActivities = await this.userActivityRepository.cleanupOldActivities(activityDaysToKeep);
      
      // Delete old sessions
      const deletedSessions = await this.userSessionRepository.deleteOldSessions(sessionDaysToKeep);
      
      this.logger.log(`Cleanup completed: ${deletedActivities} activities, ${deletedSessions} sessions deleted`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private parseUserAgent(userAgent?: string): {
    deviceType: string;
    browser: string;
    operatingSystem: string;
  } {
    if (!userAgent) {
      return {
        deviceType: 'unknown',
        browser: 'unknown',
        operatingSystem: 'unknown'
      };
    }

    const ua = userAgent.toLowerCase();
    
    // Device type detection
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    // Browser detection
    let browser = 'unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'chrome';
    } else if (ua.includes('firefox')) {
      browser = 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'safari';
    } else if (ua.includes('edg')) {
      browser = 'edge';
    } else if (ua.includes('opera')) {
      browser = 'opera';
    }

    // Operating system detection
    let operatingSystem = 'unknown';
    if (ua.includes('windows')) {
      operatingSystem = 'windows';
    } else if (ua.includes('mac')) {
      operatingSystem = 'macos';
    } else if (ua.includes('linux')) {
      operatingSystem = 'linux';
    } else if (ua.includes('android')) {
      operatingSystem = 'android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      operatingSystem = 'ios';
    }

    return {
      deviceType,
      browser,
      operatingSystem
    };
  }
}

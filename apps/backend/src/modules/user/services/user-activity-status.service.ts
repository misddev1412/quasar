import { Injectable, Logger } from '@nestjs/common';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { UserActivityRepository } from '../repositories/user-activity.repository';
import { SessionStatus } from '../entities/user-session.entity';
import { ActivityType } from '../entities/user-activity.entity';

export interface UserActivityStatus {
  userId: string;
  isCurrentlyActive: boolean;
  lastActivityAt: Date;
  sessionCount: number;
  deviceTypes: string[];
  locations: string[];
}

export interface ActivitySummary {
  currentlyActiveUsers: number;
  recentlyActiveUsers: number;
  totalActiveSessions: number;
  averageSessionDuration: number;
  topActiveUsers: {
    userId: string;
    activityCount: number;
    lastActivityAt: Date;
  }[];
}

@Injectable()
export class UserActivityStatusService {
  private readonly logger = new Logger(UserActivityStatusService.name);

  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly userActivityRepository: UserActivityRepository,
  ) {}

  /**
   * Get activity status for a specific user
   */
  async getUserActivityStatus(userId: string): Promise<UserActivityStatus> {
    try {
      const [sessions, recentActivity] = await Promise.all([
        // Get active sessions for the user
        this.userSessionRepository.createQueryBuilder('session')
          .where('session.userId = :userId', { userId })
          .andWhere('session.status = :status', { status: SessionStatus.ACTIVE })
          .getMany(),

        // Get recent activity
        this.userActivityRepository.createQueryBuilder('activity')
          .where('activity.userId = :userId', { userId })
          .orderBy('activity.createdAt', 'DESC')
          .limit(1)
          .getOne(),
      ]);

      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      // Check if user is currently active (has active session with recent activity)
      const isCurrentlyActive = sessions.some(session => 
        session.lastActivityAt && session.lastActivityAt >= fifteenMinutesAgo
      );

      // Extract unique device types and locations
      const deviceTypes = [...new Set(sessions.map(s => s.deviceType).filter(Boolean))];
      const locations = [...new Set(sessions.map(s => s.location).filter(Boolean))];

      return {
        userId,
        isCurrentlyActive,
        lastActivityAt: recentActivity?.createdAt || sessions[0]?.lastActivityAt || new Date(0),
        sessionCount: sessions.length,
        deviceTypes,
        locations,
      };
    } catch (error) {
      this.logger.error(`Failed to get activity status for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get activity status for multiple users
   */
  async getBulkUserActivityStatus(userIds: string[]): Promise<UserActivityStatus[]> {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.getUserActivityStatus(userId))
      );
      return results;
    } catch (error) {
      this.logger.error(`Failed to get bulk activity status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get currently active users (active in last 15 minutes)
   */
  async getCurrentlyActiveUsers(): Promise<string[]> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const activeSessions = await this.userSessionRepository.createQueryBuilder('session')
        .select('DISTINCT session.userId', 'userId')
        .where('session.status = :status', { status: SessionStatus.ACTIVE })
        .andWhere('session.lastActivityAt >= :fifteenMinutesAgo', { fifteenMinutesAgo })
        .getRawMany();

      return activeSessions.map(session => session.userId);
    } catch (error) {
      this.logger.error(`Failed to get currently active users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recently active users (active in last 24 hours)
   */
  async getRecentlyActiveUsers(): Promise<string[]> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentActivities = await this.userActivityRepository.createQueryBuilder('activity')
        .select('DISTINCT activity.userId', 'userId')
        .where('activity.createdAt >= :twentyFourHoursAgo', { twentyFourHoursAgo })
        .getRawMany();

      return recentActivities.map(activity => activity.userId);
    } catch (error) {
      this.logger.error(`Failed to get recently active users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get comprehensive activity summary
   */
  async getActivitySummary(): Promise<ActivitySummary> {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        currentlyActiveUsers,
        recentlyActiveUsers,
        totalActiveSessions,
        sessionDurations,
        topActiveUsers,
      ] = await Promise.all([
        // Currently active users count
        this.userSessionRepository.createQueryBuilder('session')
          .select('COUNT(DISTINCT session.userId)', 'count')
          .where('session.status = :status', { status: SessionStatus.ACTIVE })
          .andWhere('session.lastActivityAt >= :fifteenMinutesAgo', { fifteenMinutesAgo })
          .getRawOne(),

        // Recently active users count
        this.userActivityRepository.createQueryBuilder('activity')
          .select('COUNT(DISTINCT activity.userId)', 'count')
          .where('activity.createdAt >= :twentyFourHoursAgo', { twentyFourHoursAgo })
          .getRawOne(),

        // Total active sessions
        this.userSessionRepository.count({
          where: { status: SessionStatus.ACTIVE }
        }),

        // Average session duration
        this.userSessionRepository.createQueryBuilder('session')
          .select('AVG(EXTRACT(EPOCH FROM (session.lastActivityAt - session.loginAt)))', 'avgDuration')
          .where('session.status = :status', { status: SessionStatus.ACTIVE })
          .andWhere('session.lastActivityAt IS NOT NULL')
          .getRawOne(),

        // Top active users in last 24 hours
        this.userActivityRepository.createQueryBuilder('activity')
          .select([
            'activity.userId',
            'COUNT(*) as activityCount',
            'MAX(activity.createdAt) as lastActivityAt'
          ])
          .where('activity.createdAt >= :twentyFourHoursAgo', { twentyFourHoursAgo })
          .groupBy('activity.userId')
          .orderBy('activityCount', 'DESC')
          .limit(10)
          .getRawMany(),
      ]);

      return {
        currentlyActiveUsers: parseInt(currentlyActiveUsers.count) || 0,
        recentlyActiveUsers: parseInt(recentlyActiveUsers.count) || 0,
        totalActiveSessions,
        averageSessionDuration: parseFloat(sessionDurations.avgDuration) || 0,
        topActiveUsers: topActiveUsers.map(user => ({
          userId: user.userId,
          activityCount: parseInt(user.activityCount),
          lastActivityAt: new Date(user.lastActivityAt),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get activity summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark user as active (update session last activity)
   */
  async markUserActive(userId: string, sessionToken?: string): Promise<void> {
    try {
      if (sessionToken) {
        await this.userSessionRepository.updateLastActivity(sessionToken);
      } else {
        // Update all active sessions for the user
        await this.userSessionRepository.createQueryBuilder()
          .update()
          .set({ lastActivityAt: new Date() })
          .where('userId = :userId', { userId })
          .andWhere('status = :status', { status: SessionStatus.ACTIVE })
          .execute();
      }
    } catch (error) {
      this.logger.error(`Failed to mark user ${userId} as active: ${error.message}`);
      // Don't throw error to avoid breaking main functionality
    }
  }

  /**
   * Clean up expired sessions and old activities
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = new Date();
      
      // Mark expired sessions
      await this.userSessionRepository.createQueryBuilder()
        .update()
        .set({ status: SessionStatus.EXPIRED })
        .where('status = :activeStatus', { activeStatus: SessionStatus.ACTIVE })
        .andWhere('expiresAt < :now', { now })
        .execute();

      this.logger.debug('Cleaned up expired sessions');
    } catch (error) {
      this.logger.error(`Failed to cleanup expired data: ${error.message}`);
    }
  }
}

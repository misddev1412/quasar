import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserSessionRepository } from '../../repositories/user-session.repository';
import { UserActivityRepository } from '../../repositories/user-activity.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { SessionStatus } from '../../entities/user-session.entity';
import { ActivityType } from '../../entities/user-activity.entity';

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  usersWithProfiles: number;
  usersWithoutProfiles: number;
  currentlyActiveUsers: number;
  recentlyActiveUsers: number;
  totalSessions: number;
  activeSessions: number;
}

export interface UserStatisticsWithTrends {
  totalUsers: {
    value: number;
    trend?: {
      value: number;
      isPositive: boolean;
      label: string;
    };
  };
  activeUsers: {
    value: number;
    trend?: {
      value: number;
      isPositive: boolean;
      label: string;
    };
  };
  newUsersThisMonth: {
    value: number;
    trend?: {
      value: number;
      isPositive: boolean;
      label: string;
    };
  };
  usersWithProfiles: {
    value: number;
    percentage: number;
  };
  currentlyActiveUsers: {
    value: number;
    description: string;
  };
  recentActivity: {
    value: number;
    description: string;
  };
}

@Injectable()
export class AdminUserStatisticsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly userActivityRepository: UserActivityRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getUserStatistics(): Promise<UserStatisticsWithTrends> {
    try {
      const rawStats = await this.calculateRawStatistics();
      return this.formatStatisticsWithTrends(rawStats);
    } catch (error) {
      throw this.responseHandler.createError(
        500,
        'Failed to calculate user statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  private async calculateRawStatistics(): Promise<UserStatistics> {
    // Get current date boundaries
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Activity tracking boundaries
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000); // Currently active threshold
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Recently active threshold

    // Execute all queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersWithProfiles,
      usersWithoutProfiles,
      currentlyActiveUsers,
      recentlyActiveUsers,
      totalSessions,
      activeSessions,
    ] = await Promise.all([
      // Total users
      this.userRepository.count(),

      // Active users
      this.userRepository.count({ where: { isActive: true } }),

      // Inactive users
      this.userRepository.count({ where: { isActive: false } }),

      // New users this month
      this.userRepository.createQueryBuilder('user')
        .where('user.createdAt >= :startOfThisMonth', { startOfThisMonth })
        .getCount(),

      // New users last month
      this.userRepository.createQueryBuilder('user')
        .where('user.createdAt >= :startOfLastMonth AND user.createdAt <= :endOfLastMonth', {
          startOfLastMonth,
          endOfLastMonth
        })
        .getCount(),

      // Users with profiles
      this.userRepository.createQueryBuilder('user')
        .innerJoin('user.profile', 'profile')
        .getCount(),

      // Users without profiles
      this.userRepository.createQueryBuilder('user')
        .leftJoin('user.profile', 'profile')
        .where('profile.id IS NULL')
        .getCount(),

      // Currently active users (active sessions in last 15 minutes)
      this.userSessionRepository.createQueryBuilder('session')
        .select('COUNT(DISTINCT session.userId)', 'count')
        .where('session.status = :status', { status: SessionStatus.ACTIVE })
        .andWhere('session.lastActivityAt >= :last15Minutes', { last15Minutes })
        .getRawOne(),

      // Recently active users (activity in last 24 hours)
      this.userActivityRepository.createQueryBuilder('activity')
        .select('COUNT(DISTINCT activity.userId)', 'count')
        .where('activity.createdAt >= :last24Hours', { last24Hours })
        .getRawOne(),

      // Total sessions
      this.userSessionRepository.count(),

      // Active sessions
      this.userSessionRepository.count({
        where: { status: SessionStatus.ACTIVE }
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersWithProfiles,
      usersWithoutProfiles,
      currentlyActiveUsers: parseInt(currentlyActiveUsers.count) || 0,
      recentlyActiveUsers: parseInt(recentlyActiveUsers.count) || 0,
      totalSessions,
      activeSessions,
    };
  }

  private formatStatisticsWithTrends(rawStats: UserStatistics): UserStatisticsWithTrends {
    // Calculate trends
    const newUsersTrend = this.calculateTrend(
      rawStats.newUsersThisMonth,
      rawStats.newUsersLastMonth
    );

    const profileCompletionPercentage = rawStats.totalUsers > 0 
      ? Math.round((rawStats.usersWithProfiles / rawStats.totalUsers) * 100)
      : 0;

    return {
      totalUsers: {
        value: rawStats.totalUsers,
      },
      activeUsers: {
        value: rawStats.activeUsers,
      },
      newUsersThisMonth: {
        value: rawStats.newUsersThisMonth,
        trend: newUsersTrend ? {
          value: newUsersTrend,
          isPositive: newUsersTrend > 0,
          label: 'vs last month'
        } : undefined,
      },
      usersWithProfiles: {
        value: rawStats.usersWithProfiles,
        percentage: profileCompletionPercentage,
      },
      currentlyActiveUsers: {
        value: rawStats.currentlyActiveUsers,
        description: 'Active in last 15 minutes',
      },
      recentActivity: {
        value: rawStats.recentlyActiveUsers,
        description: 'Active in last 24 hours',
      },
    };
  }

  private calculateTrend(current: number, previous: number): number | null {
    if (previous === 0) {
      return current > 0 ? 100 : null;
    }
    
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    return percentage;
  }
}

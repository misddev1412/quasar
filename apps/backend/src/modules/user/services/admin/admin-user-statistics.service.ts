import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  usersWithProfiles: number;
  usersWithoutProfiles: number;
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
}

@Injectable()
export class AdminUserStatisticsService {
  constructor(
    private readonly userRepository: UserRepository,
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

    // Execute all queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersWithProfiles,
      usersWithoutProfiles,
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
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersWithProfiles,
      usersWithoutProfiles,
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

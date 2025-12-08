import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { BaseRepository } from '@shared';
import { UserActivity, ActivityType } from '../entities/user-activity.entity';

export interface ActivityStats {
  totalActivities: number;
  uniqueUsers: number;
  activitiesByType: { [key in ActivityType]?: number };
  activitiesByHour: { hour: number; count: number }[];
  activitiesByDay: { date: string; count: number }[];
}

export interface UserActivitySummary {
  userId: string;
  totalActivities: number;
  lastActivity: Date;
  mostCommonActivity: ActivityType;
  sessionCount: number;
}

@Injectable()
export class UserActivityRepository extends BaseRepository<UserActivity> {
  constructor(
    @InjectRepository(UserActivity)
    protected readonly repository: Repository<UserActivity>
  ) {
    super(repository);
  }

  async findByUserId(userId: string, limit: number = 100): Promise<UserActivity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async findByUserIdAndDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<UserActivity[]> {
    return this.repository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate)
      },
      order: { createdAt: 'DESC' }
    });
  }

  async findByActivityType(
    activityType: ActivityType, 
    limit: number = 100
  ): Promise<UserActivity[]> {
    return this.repository.find({
      where: { activityType },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async getActiveUsersInDateRange(startDate: Date, endDate: Date): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('activity')
      .select('DISTINCT activity.userId', 'userId')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawMany();

    return result.map(row => row.userId);
  }

  async getActiveUsersCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('activity')
      .select('COUNT(DISTINCT activity.userId)', 'count')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  async getActivityStats(startDate: Date, endDate: Date): Promise<ActivityStats> {
    // Total activities
    const totalActivities = await this.repository.count({
      where: { createdAt: Between(startDate, endDate) }
    });

    // Unique users
    const uniqueUsersResult = await this.repository
      .createQueryBuilder('activity')
      .select('COUNT(DISTINCT activity.userId)', 'count')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    const uniqueUsers = parseInt(uniqueUsersResult.count) || 0;

    // Activities by type
    const activitiesByTypeResult = await this.repository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'activityType')
      .addSelect('COUNT(*)', 'count')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('activity.activityType')
      .getRawMany();

    const activitiesByType: { [key in ActivityType]?: number } = {};
    activitiesByTypeResult.forEach(row => {
      activitiesByType[row.activityType as ActivityType] = parseInt(row.count);
    });

    // Activities by hour
    const activitiesByHourResult = await this.repository
      .createQueryBuilder('activity')
      .select('EXTRACT(HOUR FROM activity.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('EXTRACT(HOUR FROM activity.createdAt)')
      .orderBy('hour')
      .getRawMany();

    const activitiesByHour = activitiesByHourResult.map(row => ({
      hour: parseInt(row.hour),
      count: parseInt(row.count)
    }));

    // Activities by day
    const activitiesByDayResult = await this.repository
      .createQueryBuilder('activity')
      .select('DATE(activity.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(activity.createdAt)')
      .orderBy('date')
      .getRawMany();

    const activitiesByDay = activitiesByDayResult.map(row => ({
      date: row.date,
      count: parseInt(row.count)
    }));

    return {
      totalActivities,
      uniqueUsers,
      activitiesByType,
      activitiesByHour,
      activitiesByDay
    };
  }

  async getUserActivitySummary(userId: string): Promise<UserActivitySummary | null> {
    const totalActivitiesResult = await this.repository.count({ where: { userId } });
    
    if (totalActivitiesResult === 0) {
      return null;
    }

    const lastActivityResult = await this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    const mostCommonActivityResult = await this.repository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'activityType')
      .addSelect('COUNT(*)', 'count')
      .where('activity.userId = :userId', { userId })
      .groupBy('activity.activityType')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    const sessionCountResult = await this.repository
      .createQueryBuilder('activity')
      .select('COUNT(DISTINCT activity.sessionId)', 'count')
      .where('activity.userId = :userId AND activity.sessionId IS NOT NULL', { userId })
      .getRawOne();

    return {
      userId,
      totalActivities: totalActivitiesResult,
      lastActivity: lastActivityResult?.createdAt || new Date(),
      mostCommonActivity: mostCommonActivityResult?.activityType || ActivityType.OTHER,
      sessionCount: parseInt(sessionCountResult.count) || 0
    };
  }

  async getRecentActiveUsers(minutes: number = 30, limit: number = 100): Promise<string[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const result = await this.repository
      .createQueryBuilder('activity')
      .select('DISTINCT activity.userId', 'userId')
      .where('activity.createdAt > :cutoffTime', { cutoffTime })
      .limit(limit)
      .getRawMany();

    return result.map(row => row.userId);
  }

  async logActivity(activityData: Partial<UserActivity>): Promise<UserActivity> {
    const activity = this.repository.create(activityData);
    return this.repository.save(activity);
  }

  async bulkLogActivities(activitiesData: Partial<UserActivity>[]): Promise<UserActivity[]> {
    const activities = this.repository.create(activitiesData);
    return this.repository.save(activities);
  }

  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

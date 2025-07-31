import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { subDays, subMonths, format, startOfDay, endOfDay } from 'date-fns';

export interface ChartDataRequest {
  statisticId: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  period: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: ChartDataPoint[] | PieChartDataPoint[];
  period: '7d' | '30d' | '90d' | '1y' | 'custom';
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

@Injectable()
export class AdminChartDataService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getChartData(request: ChartDataRequest): Promise<ChartData> {
    const { statisticId, chartType, period, startDate, endDate } = request;

    // Calculate date range
    const dateRange = this.calculateDateRange(period, startDate, endDate);

    // Generate chart data based on statistic ID
    let data: ChartDataPoint[] | PieChartDataPoint[];
    let title: string;

    switch (statisticId) {
      case 'total-users':
        data = await this.getUserGrowthData(dateRange, chartType);
        title = 'Total Users Growth';
        break;
      case 'active-users':
        data = await this.getActiveUsersData(dateRange, chartType);
        title = 'Active Users';
        break;
      case 'new-users':
        data = await this.getNewUsersData(dateRange, chartType);
        title = 'New Users';
        break;
      case 'users-with-profiles':
        data = await this.getUserProfileData(dateRange, chartType);
        title = 'Users with Profiles';
        break;
      default:
        throw new Error(`Unknown statistic ID: ${statisticId}`);
    }

    return {
      type: chartType,
      title,
      data,
      period,
      customDateRange: period === 'custom' ? { startDate: startDate!, endDate: endDate! } : undefined,
    };
  }

  async getAvailableChartTypes(statisticId: string): Promise<string[]> {
    // Define which chart types are available for each statistic
    const chartTypeMap: Record<string, string[]> = {
      'total-users': ['line', 'bar', 'area'],
      'active-users': ['line', 'bar', 'area'],
      'new-users': ['line', 'bar', 'area'],
      'users-with-profiles': ['line', 'bar', 'pie', 'area'],
    };

    return chartTypeMap[statisticId] || ['line', 'bar'];
  }

  private calculateDateRange(
    period: string,
    startDate?: string,
    endDate?: string
  ): { start: Date; end: Date } {
    const now = new Date();
    
    if (period === 'custom' && startDate && endDate) {
      return {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate)),
      };
    }

    let start: Date;
    switch (period) {
      case '7d':
        start = subDays(now, 7);
        break;
      case '30d':
        start = subDays(now, 30);
        break;
      case '90d':
        start = subDays(now, 90);
        break;
      case '1y':
        start = subMonths(now, 12);
        break;
      default:
        start = subDays(now, 30);
    }

    return {
      start: startOfDay(start),
      end: endOfDay(now),
    };
  }

  private async getUserGrowthData(
    dateRange: { start: Date; end: Date },
    chartType: string
  ): Promise<ChartDataPoint[] | PieChartDataPoint[]> {
    if (chartType === 'pie') {
      // For pie chart, show distribution by user roles
      const roleDistribution = await this.userRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :start AND :end', dateRange)
        .groupBy('user.role')
        .getRawMany();

      return roleDistribution.map((item, index) => ({
        name: item.role,
        value: parseInt(item.count),
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4],
      }));
    }

    // For line/bar/area charts, show growth over time
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const data: ChartDataPoint[] = [];

    for (let i = 0; i <= days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      const count = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt <= :date', { date })
        .getCount();

      data.push({
        date: date.toISOString(),
        value: count,
        label: `Total users as of ${format(date, 'MMM dd')}`,
      });
    }

    return data;
  }

  private async getActiveUsersData(
    dateRange: { start: Date; end: Date },
    chartType: string
  ): Promise<ChartDataPoint[] | PieChartDataPoint[]> {
    if (chartType === 'pie') {
      const activeCount = await this.userRepository.count({ where: { isActive: true } });
      const inactiveCount = await this.userRepository.count({ where: { isActive: false } });

      return [
        { name: 'Active', value: activeCount, color: '#10B981' },
        { name: 'Inactive', value: inactiveCount, color: '#EF4444' },
      ];
    }

    // Generate mock data for active users over time
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const data: ChartDataPoint[] = [];

    for (let i = 0; i <= days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      // Mock active users data (in real implementation, you'd track user activity)
      const baseCount = await this.userRepository.count({ where: { isActive: true } });
      const variation = Math.floor(Math.random() * 20) - 10; // ±10 variation
      
      data.push({
        date: date.toISOString(),
        value: Math.max(0, baseCount + variation),
        label: `Active users on ${format(date, 'MMM dd')}`,
      });
    }

    return data;
  }

  private async getNewUsersData(
    dateRange: { start: Date; end: Date },
    chartType: string
  ): Promise<ChartDataPoint[] | PieChartDataPoint[]> {
    if (chartType === 'pie') {
      // Show new users by month for pie chart
      const monthlyData = await this.userRepository
        .createQueryBuilder('user')
        .select("DATE_TRUNC('month', user.createdAt)", 'month')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :start AND :end', dateRange)
        .groupBy("DATE_TRUNC('month', user.createdAt)")
        .orderBy('month')
        .getRawMany();

      return monthlyData.map((item, index) => ({
        name: format(new Date(item.month), 'MMM yyyy'),
        value: parseInt(item.count),
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
      }));
    }

    // Daily new users for line/bar/area charts
    const dailyData = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE_TRUNC('day', user.createdAt)", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt BETWEEN :start AND :end', dateRange)
      .groupBy("DATE_TRUNC('day', user.createdAt)")
      .orderBy('day')
      .getRawMany();

    return dailyData.map(item => ({
      date: new Date(item.day).toISOString(),
      value: parseInt(item.count),
      label: `${item.count} new users`,
    }));
  }

  private async getUserProfileData(
    dateRange: { start: Date; end: Date },
    chartType: string
  ): Promise<ChartDataPoint[] | PieChartDataPoint[]> {
    if (chartType === 'pie') {
      const withProfiles = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.profile', 'profile')
        .where('profile.id IS NOT NULL')
        .getCount();

      const withoutProfiles = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.profile', 'profile')
        .where('profile.id IS NULL')
        .getCount();

      return [
        { name: 'With Profile', value: withProfiles, color: '#10B981' },
        { name: 'Without Profile', value: withoutProfiles, color: '#F59E0B' },
      ];
    }

    // Generate mock data for profile completion over time
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const data: ChartDataPoint[] = [];

    for (let i = 0; i <= days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      const count = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.profile', 'profile')
        .where('user.createdAt <= :date', { date })
        .andWhere('profile.id IS NOT NULL')
        .getCount();

      data.push({
        date: date.toISOString(),
        value: count,
        label: `Users with profiles as of ${format(date, 'MMM dd')}`,
      });
    }

    return data;
  }
}

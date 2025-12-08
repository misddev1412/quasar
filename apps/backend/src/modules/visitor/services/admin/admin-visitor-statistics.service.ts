import { Injectable } from '@nestjs/common';
import { subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { VisitorRepository } from '../../repositories/visitor.repository';
import { VisitorType, VisitorSource, SessionStatus, PageViewType } from '../../entities';

@Injectable()
export class AdminVisitorStatisticsService {
  constructor(private readonly visitorRepository: VisitorRepository) {}

  async getOverallStatistics(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const [visitorStats, sessionStats, pageViewStats] = await Promise.all([
      this.visitorRepository.getVisitorStats(startDate, endDate),
      this.visitorRepository.getSessionStats(startDate, endDate),
      this.visitorRepository.getPageViewStats(startDate, endDate),
    ]);

    return {
      dateRange: {
        startDate,
        endDate,
        days
      },
      visitors: visitorStats,
      sessions: sessionStats,
      pageViews: pageViewStats,
    };
  }

  async getDailyTrends(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.getDailyVisitorStats(startDate, endDate);
  }

  async getWeeklyTrends(weeks: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfDay(subDays(now, i * 7 + 6));
      const weekEnd = endOfDay(subDays(now, i * 7));

      const [visitorStats, sessionStats, pageViewStats] = await Promise.all([
        this.visitorRepository.getVisitorStats(weekStart, weekEnd),
        this.visitorRepository.getSessionStats(weekStart, weekEnd),
        this.visitorRepository.getPageViewStats(weekStart, weekEnd),
      ]);

      trends.push({
        week: weekStart.toISOString().split('T')[0],
        visitors: visitorStats.totalVisitors,
        newVisitors: visitorStats.newVisitors,
        returningVisitors: visitorStats.returningVisitors,
        sessions: sessionStats.totalSessions,
        avgSessionDuration: Math.round(sessionStats.avgDuration),
        avgPageViews: Math.round(sessionStats.avgPageViews * 10) / 10,
        bounceRate: Math.round(sessionStats.bounceRate * 10) / 10,
        pageViews: pageViewStats.totalPageViews,
      });
    }

    return trends;
  }

  async getMonthlyTrends(months: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subDays(now, i * 30));
      const monthEnd = endOfDay(subDays(now, (i - 1) * 30));

      const [visitorStats, sessionStats, pageViewStats] = await Promise.all([
        this.visitorRepository.getVisitorStats(monthStart, monthEnd),
        this.visitorRepository.getSessionStats(monthStart, monthEnd),
        this.visitorRepository.getPageViewStats(monthStart, monthEnd),
      ]);

      trends.push({
        month: monthStart.toISOString().split('T')[0].substring(0, 7),
        visitors: visitorStats.totalVisitors,
        newVisitors: visitorStats.newVisitors,
        returningVisitors: visitorStats.returningVisitors,
        sessions: sessionStats.totalSessions,
        avgSessionDuration: Math.round(sessionStats.avgDuration),
        avgPageViews: Math.round(sessionStats.avgPageViews * 10) / 10,
        bounceRate: Math.round(sessionStats.bounceRate * 10) / 10,
        pageViews: pageViewStats.totalPageViews,
      });
    }

    return trends;
  }

  async getTopPages(limit: number = 10, days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.findPopularPages(limit, startDate, endDate);
  }

  async getPageViewStatsByType(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const { pageViewsByType } = await this.visitorRepository.getPageViewStats(startDate, endDate);

    return pageViewsByType.map(stat => ({
      type: stat.type,
      count: parseInt(stat.count),
      percentage: 0 // Will be calculated
    }));
  }

  async getVisitorStatsBySource(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const { visitorsBySource } = await this.visitorRepository.getVisitorStats(startDate, endDate);

    return visitorsBySource.map(stat => ({
      source: stat.source || 'direct',
      count: parseInt(stat.count),
      percentage: 0 // Will be calculated
    }));
  }

  async getRealTimeStatistics() {
    const now = new Date();
    const startDate = startOfDay(now);
    const endDate = endOfDay(now);

    const [visitorStats, sessionStats, pageViewStats, activeSessions] = await Promise.all([
      this.visitorRepository.getVisitorStats(startDate, endDate),
      this.visitorRepository.getSessionStats(startDate, endDate),
      this.visitorRepository.getPageViewStats(startDate, endDate),
      this.visitorRepository.findActiveSessions(),
    ]);

    return {
      today: {
        visitors: visitorStats.totalVisitors,
        newVisitors: visitorStats.newVisitors,
        sessions: sessionStats.totalSessions,
        pageViews: pageViewStats.totalPageViews,
        activeSessions: activeSessions.length,
      },
      rightNow: {
        activeSessions: activeSessions.length,
        currentVisitors: new Set(activeSessions.map(s => s.visitorId)).size,
      }
    };
  }

  async getGeographicStatistics(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.getGeographicStatistics(startDate, endDate);
  }

  async getDeviceStatistics(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.getDeviceStatistics(startDate, endDate);
  }

  async getConversionStatistics(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.getConversionStatistics(startDate, endDate);
  }

  async getTopExitPages(days: number = 30) {
    // This would need to be implemented by analyzing session end points
    // For now, return empty data
    return [];
  }

  async getTrafficSources(days: number = 30) {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    return this.visitorRepository.getTrafficSourcesWithMetrics(startDate, endDate);
  }
}
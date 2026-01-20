import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, SelectQueryBuilder } from 'typeorm';
import { Visitor, VisitorType, VisitorSource } from '../entities/visitor.entity';
import { VisitorStatistics } from '../entities/visitor-statistics.entity';
import { VisitorSession, SessionStatus } from '../entities/visitor-session.entity';
import { PageView, PageViewType } from '../entities/page-view.entity';
import { IVisitorRepository } from '../interfaces/visitor-repository.interface';

@Injectable()
export class VisitorRepository implements IVisitorRepository {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorRepo: Repository<Visitor>,
    @InjectRepository(VisitorSession)
    private readonly sessionRepo: Repository<VisitorSession>,
    @InjectRepository(PageView)
    private readonly pageViewRepo: Repository<PageView>,
    @InjectRepository(VisitorStatistics)
    private readonly statisticsRepo: Repository<VisitorStatistics>,
  ) { }

  // Statistics increment methods
  private async getTodayStatistics(): Promise<VisitorStatistics> {
    const today = new Date().toISOString().split('T')[0];
    let stats = await this.statisticsRepo.findOne({ where: { date: today } });

    if (!stats) {
      try {
        stats = this.statisticsRepo.create({ date: today });
        await this.statisticsRepo.save(stats);
      } catch (error) {
        // Handle race condition where another request created the record
        if (error.code === '23505') { // Unique violation
          stats = await this.statisticsRepo.findOne({ where: { date: today } });
        } else {
          throw error;
        }
      }
    }
    return stats;
  }

  async incrementVisitorCount(isNew: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.statisticsRepo.query(
      `INSERT INTO visitor_statistics (date, "total_visitors", "new_visitors", "returning_visitors")
       VALUES ($1, 1, $2, $3)
       ON CONFLICT (date) DO UPDATE SET
       "total_visitors" = visitor_statistics."total_visitors" + 1,
       "new_visitors" = visitor_statistics."new_visitors" + $2,
       "returning_visitors" = visitor_statistics."returning_visitors" + $3`,
      [today, isNew ? 1 : 0, isNew ? 0 : 1]
    );
  }

  async incrementSessionCount(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.statisticsRepo.query(
      `INSERT INTO visitor_statistics (date, "total_sessions")
       VALUES ($1, 1)
       ON CONFLICT (date) DO UPDATE SET
       "total_sessions" = visitor_statistics."total_sessions" + 1`,
      [today]
    );
  }

  async incrementPageViewCount(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.statisticsRepo.query(
      `INSERT INTO visitor_statistics (date, "total_page_views")
       VALUES ($1, 1)
       ON CONFLICT (date) DO UPDATE SET
       "total_page_views" = visitor_statistics."total_page_views" + 1`,
      [today]
    );
  }


  // Visitor operations
  async findByVisitorId(visitorId: string): Promise<Visitor | null> {
    return this.visitorRepo.findOne({
      where: { visitorId },
      relations: ['sessions']
    });
  }

  async findByIdWithSessions(id: string): Promise<Visitor | null> {
    return this.visitorRepo.findOne({
      where: { id },
      relations: ['sessions', 'sessions.pageViews']
    });
  }

  async createVisitor(data: Partial<Visitor>): Promise<Visitor> {
    const visitor = this.visitorRepo.create(data);
    return this.visitorRepo.save(visitor);
  }

  async updateVisitor(id: string, data: Partial<Visitor>): Promise<Visitor> {
    await this.visitorRepo.update(id, data);
    return this.visitorRepo.findOne({ where: { id } });
  }

  async findVisitorsByDateRange(startDate: Date, endDate: Date): Promise<Visitor[]> {
    return this.visitorRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['sessions']
    });
  }

  async findVisitorsByType(type: VisitorType): Promise<Visitor[]> {
    return this.visitorRepo.find({
      where: { visitorType: type },
      relations: ['sessions']
    });
  }

  async findVisitorsBySource(source: VisitorSource): Promise<Visitor[]> {
    return this.visitorRepo.find({
      where: { visitorSource: source },
      relations: ['sessions']
    });
  }

  async getVisitorStats(startDate: Date, endDate: Date): Promise<any> {
    const { totalVisitors, newVisitors, returningVisitors } = await this.statisticsRepo
      .createQueryBuilder('stats')
      .select('SUM(stats.totalVisitors)', 'totalVisitors')
      .addSelect('SUM(stats.newVisitors)', 'newVisitors')
      .addSelect('SUM(stats.returningVisitors)', 'returningVisitors')
      .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const visitorsBySource = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.visitorSource', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('visitor.visitorSource')
      .getRawMany();

    return {
      totalVisitors: parseInt(totalVisitors || '0'),
      newVisitors: parseInt(newVisitors || '0'),
      returningVisitors: parseInt(returningVisitors || '0'),
      visitorsBySource
    };
  }

  // Session operations
  async findBySessionId(sessionId: string): Promise<VisitorSession | null> {
    return this.sessionRepo.findOne({
      where: { sessionId },
      relations: ['visitor', 'pageViews']
    });
  }

  async findSessionsByVisitorId(visitorId: string): Promise<VisitorSession[]> {
    return this.sessionRepo.find({
      where: { visitorId },
      relations: ['pageViews'],
      order: { createdAt: 'DESC' }
    });
  }

  async createSession(data: Partial<VisitorSession>): Promise<VisitorSession> {
    const session = this.sessionRepo.create(data);
    return this.sessionRepo.save(session);
  }

  async updateSession(id: string, data: Partial<VisitorSession>): Promise<VisitorSession> {
    await this.sessionRepo.update(id, data);
    return this.sessionRepo.findOne({ where: { id } });
  }

  async findActiveSessions(): Promise<VisitorSession[]> {
    return this.sessionRepo.find({
      where: { status: SessionStatus.ACTIVE },
      relations: ['visitor']
    });
  }

  async findSessionsByDateRange(startDate: Date, endDate: Date): Promise<VisitorSession[]> {
    return this.sessionRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['visitor']
    });
  }

  async getSessionStats(startDate: Date, endDate: Date): Promise<any> {
    const { totalSessions } = await this.statisticsRepo
      .createQueryBuilder('stats')
      .select('SUM(stats.totalSessions)', 'totalSessions')
      .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const avgDuration = await this.sessionRepo
      .createQueryBuilder('session')
      .select('AVG(session.durationSeconds)', 'avgDuration')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('session.durationSeconds IS NOT NULL')
      .getRawOne();

    const avgPageViews = await this.sessionRepo
      .createQueryBuilder('session')
      .select('AVG(session.pageViewsCount)', 'avgPageViews')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const bounceRate = await this.sessionRepo
      .createQueryBuilder('session')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('session.pageViewsCount = 1')
      .getCount();

    const totalSessionsForBounce = await this.sessionRepo.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    return {
      totalSessions: parseInt(totalSessions || '0'),
      avgDuration: avgDuration?.avgDuration || 0,
      avgPageViews: avgPageViews?.avgPageViews || 0,
      bounceRate: totalSessionsForBounce > 0 ? (bounceRate / totalSessionsForBounce) * 100 : 0
    };
  }

  // Page view operations
  async createPageView(data: Partial<PageView>): Promise<PageView> {
    const pageView = this.pageViewRepo.create(data);
    return this.pageViewRepo.save(pageView);
  }

  async findPageViewsBySessionId(sessionId: string): Promise<PageView[]> {
    return this.pageViewRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' }
    });
  }

  async findPageViewsByDateRange(startDate: Date, endDate: Date): Promise<PageView[]> {
    return this.pageViewRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['session', 'session.visitor']
    });
  }

  async findPageViewsByType(type: PageViewType): Promise<PageView[]> {
    return this.pageViewRepo.find({
      where: { pageType: type },
      relations: ['session', 'session.visitor']
    });
  }

  async findPopularPages(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any[]> {
    const query = this.pageViewRepo
      .createQueryBuilder('pageView')
      .select('pageView.pageUrl', 'url')
      .addSelect('pageView.pageTitle', 'title')
      .addSelect('COUNT(DISTINCT pageView.sessionId)', 'uniqueViews')
      .addSelect('COUNT(*)', 'totalViews')
      .groupBy('pageView.pageUrl, pageView.pageTitle')
      .orderBy('COUNT(DISTINCT pageView.sessionId)', 'DESC')
      .take(limit);

    if (startDate && endDate) {
      query.where('pageView.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return query.getRawMany();
  }

  async getPageViewStats(startDate: Date, endDate: Date): Promise<any> {
    const { totalPageViews } = await this.statisticsRepo
      .createQueryBuilder('stats')
      .select('SUM(stats.totalPageViews)', 'totalPageViews')
      .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const pageViewsByType = await this.pageViewRepo
      .createQueryBuilder('pageView')
      .select('pageView.pageType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('pageView.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('pageView.pageType')
      .getRawMany();

    return {
      totalPageViews: parseInt(totalPageViews || '0'),
      pageViewsByType
    };
  }

  async getBasicStats(startDate: Date, endDate: Date): Promise<{ totalVisitors: number; totalPageViews: number; totalSessions: number }> {
    const stats = await this.statisticsRepo
      .createQueryBuilder('stats')
      .select('SUM(stats.total_visitors)', 'totalVisitors')
      .addSelect('SUM(stats.total_page_views)', 'totalPageViews')
      .addSelect('SUM(stats.total_sessions)', 'totalSessions')
      .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      totalVisitors: parseInt(stats?.totalVisitors || '0'),
      totalPageViews: parseInt(stats?.totalPageViews || '0'),
      totalSessions: parseInt(stats?.totalSessions || '0'),
    };
  }

  // Enhanced analytics methods for real data
  async getDeviceStatistics(startDate: Date, endDate: Date): Promise<any> {
    const deviceTypes = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.deviceType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('visitor.deviceType IS NOT NULL')
      .groupBy('visitor.deviceType')
      .getRawMany();

    const browsers = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.browserName', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('visitor.browserName IS NOT NULL')
      .groupBy('visitor.browserName')
      .orderBy('count', 'DESC')
      .getRawMany();

    const operatingSystems = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.osName', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('visitor.osName IS NOT NULL')
      .groupBy('visitor.osName')
      .orderBy('count', 'DESC')
      .getRawMany();

    const totalDevices = await this.visitorRepo.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    return {
      deviceTypes: deviceTypes.map((item, index, array) => ({
        type: item.type,
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / array.reduce((sum, item) => sum + parseInt(item.count), 0)) * 100)
      })),
      browsers: browsers.map((item, index, array) => ({
        name: item.name,
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / array.reduce((sum, item) => sum + parseInt(item.count), 0)) * 100)
      })),
      operatingSystems: operatingSystems.map((item, index, array) => ({
        name: item.name,
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / array.reduce((sum, item) => sum + parseInt(item.count), 0)) * 100)
      }))
    };
  }

  async getGeographicStatistics(startDate: Date, endDate: Date): Promise<any> {
    const topCountries = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.countryCode', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('visitor.countryCode IS NOT NULL')
      .groupBy('visitor.countryCode')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topCities = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('visitor.city IS NOT NULL')
      .groupBy('visitor.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const totalWithCountry = await this.visitorRepo.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const totalWithCity = await this.visitorRepo.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    return {
      topCountries: topCountries.map((item, index, array) => ({
        country: item.country || 'Unknown',
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / array.reduce((sum, item) => sum + parseInt(item.count), 0)) * 100)
      })),
      topCities: topCities.map((item, index, array) => ({
        city: item.city || 'Unknown',
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / array.reduce((sum, item) => sum + parseInt(item.count), 0)) * 100)
      }))
    };
  }

  async getConversionStatistics(startDate: Date, endDate: Date): Promise<any> {
    const totalVisitors = await this.visitorRepo.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const checkoutInitiated = await this.pageViewRepo.count({
      where: {
        createdAt: Between(startDate, endDate),
        pageType: PageViewType.CHECKOUT_VIEW
      }
    });

    // For completed checkouts, you would need to track actual order completions
    // This is a placeholder implementation
    const checkoutCompleted = Math.floor(checkoutInitiated * 0.3); // Assume 30% completion rate

    return {
      totalVisitors,
      checkoutInitiated,
      checkoutCompleted,
      conversionRate: totalVisitors > 0 ? Math.round((checkoutCompleted / totalVisitors) * 100 * 100) / 100 : 0,
      cartAbandonmentRate: checkoutInitiated > 0 ? Math.round(((checkoutInitiated - checkoutCompleted) / checkoutInitiated) * 100 * 100) / 100 : 0
    };
  }

  async getTopExitPages(startDate: Date, endDate: Date, limit: number = 10): Promise<any[]> {
    // This is a simplified implementation - in practice you'd need to track the last page view of each session
    return this.findPopularPages(limit, startDate, endDate);
  }

  async getTrafficSourcesWithMetrics(startDate: Date, endDate: Date): Promise<any[]> {
    const visitorsBySource = await this.visitorRepo
      .createQueryBuilder('visitor')
      .select('visitor.visitorSource', 'source')
      .addSelect('COUNT(*)', 'visitors')
      .leftJoin('visitor.sessions', 'session')
      .addSelect('AVG(session.durationSeconds)', 'avgSessionDuration')
      .addSelect('AVG(session.pageViewsCount)', 'pagesPerSession')
      .where('visitor.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('visitor.visitorSource')
      .getRawMany();

    const totalVisitors = visitorsBySource.reduce((sum, item) => sum + parseInt(item.visitors), 0);

    // Calculate bounce rates by source
    const sources = visitorsBySource.map(async (item) => {
      const bounceRate = await this.sessionRepo
        .createQueryBuilder('session')
        .leftJoin('session.visitor', 'visitor')
        .where('visitor.visitorSource = :source', { source: item.source })
        .andWhere('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('session.pageViewsCount = 1')
        .getCount();

      const totalSessionsBySource = await this.sessionRepo
        .createQueryBuilder('session')
        .leftJoin('session.visitor', 'visitor')
        .where('visitor.visitorSource = :source', { source: item.source })
        .andWhere('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getCount();

      return {
        source: item.source || 'direct',
        visitors: parseInt(item.visitors),
        percentage: Math.round((parseInt(item.visitors) / totalVisitors) * 100),
        avgSessionDuration: Math.round(item.avgSessionDuration || 0),
        pagesPerSession: Math.round((item.pagesPerSession || 0) * 10) / 10,
        bounceRate: totalSessionsBySource > 0 ? Math.round((bounceRate / totalSessionsBySource) * 100 * 100) / 100 : 0
      };
    });

    return Promise.all(sources);
  }

  async getDailyVisitorStats(startDate: Date, endDate: Date): Promise<any[]> {
    const dailyStats = await this.statisticsRepo
      .createQueryBuilder('stats')
      .where('stats.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('stats.date', 'ASC')
      .getMany();

    return dailyStats.map(stat => ({
      date: stat.date,
      visitors: stat.totalVisitors,
      newVisitors: stat.newVisitors,
      returningVisitors: stat.returningVisitors,
      sessions: stat.totalSessions,
      pageViews: stat.totalPageViews,
      avgSessionDuration: 0,
      avgPageViews: stat.totalSessions > 0 ? stat.totalPageViews / stat.totalSessions : 0,
      bounceRate: 0
    }));
  }
}
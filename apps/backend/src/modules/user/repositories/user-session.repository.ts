import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { BaseRepository } from '@shared';
import { UserSession, SessionStatus } from '../entities/user-session.entity';

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number; // in minutes
  sessionsByStatus: { [key in SessionStatus]?: number };
  sessionsByDevice: { [key: string]: number };
  sessionsByBrowser: { [key: string]: number };
}

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSession> {
  constructor(
    @InjectRepository(UserSession)
    protected readonly repository: Repository<UserSession>
  ) {
    super(repository);
  }

  async findByUserId(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async findActiveSessionsByUserId(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { 
        userId, 
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date())
      },
      order: { lastActivityAt: 'DESC' }
    });
  }

  async findBySessionToken(sessionToken: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { sessionToken }
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { refreshToken }
    });
  }

  async getActiveSessions(): Promise<UserSession[]> {
    return this.repository.find({
      where: { 
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date())
      },
      order: { lastActivityAt: 'DESC' }
    });
  }

  async getActiveSessionsCount(): Promise<number> {
    return this.repository.count({
      where: { 
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date())
      }
    });
  }

  async getActiveUsersCount(timeWindow?: { start: Date; end: Date }): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder('session')
      .select('COUNT(DISTINCT session.userId)', 'count')
      .where('session.status = :status', { status: SessionStatus.ACTIVE })
      .andWhere('session.expiresAt > :now', { now: new Date() });

    if (timeWindow) {
      queryBuilder.andWhere('session.lastActivityAt BETWEEN :start AND :end', timeWindow);
    }

    const result = await queryBuilder.getRawOne();
    return parseInt(result.count) || 0;
  }

  async getSessionStats(startDate: Date, endDate: Date): Promise<SessionStats> {
    // Total sessions in date range
    const totalSessions = await this.repository.count({
      where: { createdAt: Between(startDate, endDate) }
    });

    // Active sessions
    const activeSessions = await this.getActiveSessionsCount();

    // Average session duration
    const durationResult = await this.repository
      .createQueryBuilder('session')
      .select('AVG(EXTRACT(EPOCH FROM (COALESCE(session.logoutAt, session.lastActivityAt) - session.loginAt)) / 60)', 'avgDuration')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    const averageSessionDuration = parseFloat(durationResult.avgDuration) || 0;

    // Sessions by status
    const sessionsByStatusResult = await this.repository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('session.status')
      .getRawMany();

    const sessionsByStatus: { [key in SessionStatus]?: number } = {};
    sessionsByStatusResult.forEach(row => {
      sessionsByStatus[row.status as SessionStatus] = parseInt(row.count);
    });

    // Sessions by device
    const sessionsByDeviceResult = await this.repository
      .createQueryBuilder('session')
      .select('COALESCE(session.deviceType, \'unknown\')', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('session.deviceType')
      .getRawMany();

    const sessionsByDevice: { [key: string]: number } = {};
    sessionsByDeviceResult.forEach(row => {
      sessionsByDevice[row.deviceType] = parseInt(row.count);
    });

    // Sessions by browser
    const sessionsByBrowserResult = await this.repository
      .createQueryBuilder('session')
      .select('COALESCE(session.browser, \'unknown\')', 'browser')
      .addSelect('COUNT(*)', 'count')
      .where('session.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('session.browser')
      .getRawMany();

    const sessionsByBrowser: { [key: string]: number } = {};
    sessionsByBrowserResult.forEach(row => {
      sessionsByBrowser[row.browser] = parseInt(row.count);
    });

    return {
      totalSessions,
      activeSessions,
      averageSessionDuration,
      sessionsByStatus,
      sessionsByDevice,
      sessionsByBrowser
    };
  }

  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const session = this.repository.create(sessionData);
    return this.repository.save(session);
  }

  async updateLastActivity(sessionToken: string): Promise<void> {
    await this.repository.update(
      { sessionToken },
      { lastActivityAt: new Date() }
    );
  }

  async updateSessionTokens(sessionId: string, newAccessToken: string, newRefreshToken: string): Promise<void> {
    await this.repository.update(
      { id: sessionId },
      {
        sessionToken: newAccessToken,
        refreshToken: newRefreshToken,
        lastActivityAt: new Date()
      }
    );
  }

  async terminateSession(sessionToken: string, reason: SessionStatus = SessionStatus.LOGGED_OUT): Promise<void> {
    await this.repository.update(
      { sessionToken },
      { 
        status: reason,
        logoutAt: new Date()
      }
    );
  }

  async terminateUserSessions(userId: string, excludeSessionToken?: string): Promise<void> {
    const updateQuery = this.repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ 
        status: SessionStatus.TERMINATED,
        logoutAt: new Date()
      })
      .where('userId = :userId', { userId })
      .andWhere('status = :status', { status: SessionStatus.ACTIVE });

    if (excludeSessionToken) {
      updateQuery.andWhere('sessionToken != :excludeSessionToken', { excludeSessionToken });
    }

    await updateQuery.execute();
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ status: SessionStatus.EXPIRED })
      .where('status = :activeStatus', { activeStatus: SessionStatus.ACTIVE })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  async deleteOldSessions(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status != :activeStatus', { activeStatus: SessionStatus.ACTIVE })
      .execute();

    return result.affected || 0;
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<UserSession[]> {
    return this.repository.find({
      where: { createdAt: Between(startDate, endDate) },
      order: { createdAt: 'DESC' }
    });
  }

  async getUserSessionHistory(userId: string, limit: number = 50): Promise<UserSession[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }
}

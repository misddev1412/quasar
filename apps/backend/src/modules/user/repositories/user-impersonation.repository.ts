import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BaseRepository } from '@shared';
import { UserImpersonationLog, ImpersonationStatus } from '../entities/user-impersonation-log.entity';

export interface ImpersonationFilters {
  adminUserId?: string;
  impersonatedUserId?: string;
  status?: ImpersonationStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedImpersonationLogs {
  items: UserImpersonationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserImpersonationRepository extends BaseRepository<UserImpersonationLog> {
  constructor(
    @InjectRepository(UserImpersonationLog)
    protected readonly repository: Repository<UserImpersonationLog>
  ) {
    super(repository);
  }

  async findActiveByAdminId(adminUserId: string): Promise<UserImpersonationLog | null> {
    return this.repository.findOne({
      where: {
        adminUserId,
        status: ImpersonationStatus.ACTIVE
      },
      relations: ['adminUser', 'impersonatedUser'],
      order: { startedAt: 'DESC' }
    });
  }

  async findActiveBySessionToken(sessionToken: string): Promise<UserImpersonationLog | null> {
    return this.repository.findOne({
      where: {
        sessionToken,
        status: ImpersonationStatus.ACTIVE
      },
      relations: ['adminUser', 'impersonatedUser']
    });
  }

  async findBySessionToken(sessionToken: string): Promise<UserImpersonationLog | null> {
    return this.repository.findOne({
      where: { sessionToken },
      relations: ['adminUser', 'impersonatedUser']
    });
  }

  async createImpersonationLog(data: {
    adminUserId: string;
    impersonatedUserId: string;
    sessionToken: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  }): Promise<UserImpersonationLog> {
    const log = this.repository.create(
      UserImpersonationLog.createLog(data)
    );
    return this.repository.save(log);
  }

  async endImpersonation(sessionToken: string): Promise<void> {
    await this.repository.update(
      { sessionToken, status: ImpersonationStatus.ACTIVE },
      {
        status: ImpersonationStatus.ENDED,
        endedAt: new Date()
      }
    );
  }

  async markExpired(sessionToken: string): Promise<void> {
    await this.repository.update(
      { sessionToken, status: ImpersonationStatus.ACTIVE },
      {
        status: ImpersonationStatus.EXPIRED,
        endedAt: new Date()
      }
    );
  }

  async getImpersonationHistory(
    filters: ImpersonationFilters
  ): Promise<PaginatedImpersonationLogs> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.adminUser', 'adminUser')
      .leftJoinAndSelect('log.impersonatedUser', 'impersonatedUser');

    // Apply filters
    if (filters.adminUserId) {
      queryBuilder.andWhere('log.adminUserId = :adminUserId', {
        adminUserId: filters.adminUserId
      });
    }

    if (filters.impersonatedUserId) {
      queryBuilder.andWhere('log.impersonatedUserId = :impersonatedUserId', {
        impersonatedUserId: filters.impersonatedUserId
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('log.startedAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const items = await queryBuilder
      .orderBy('log.startedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getActiveImpersonations(): Promise<UserImpersonationLog[]> {
    return this.repository.find({
      where: { status: ImpersonationStatus.ACTIVE },
      relations: ['adminUser', 'impersonatedUser'],
      order: { startedAt: 'DESC' }
    });
  }

  async getAdminImpersonationHistory(
    adminUserId: string,
    limit: number = 50
  ): Promise<UserImpersonationLog[]> {
    return this.repository.find({
      where: { adminUserId },
      relations: ['impersonatedUser'],
      order: { startedAt: 'DESC' },
      take: limit
    });
  }

  async getUserImpersonationHistory(
    impersonatedUserId: string,
    limit: number = 50
  ): Promise<UserImpersonationLog[]> {
    return this.repository.find({
      where: { impersonatedUserId },
      relations: ['adminUser'],
      order: { startedAt: 'DESC' },
      take: limit
    });
  }

  async cleanupExpiredImpersonations(maxDurationHours: number = 24): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - maxDurationHours);

    const result = await this.repository
      .createQueryBuilder()
      .update(UserImpersonationLog)
      .set({
        status: ImpersonationStatus.EXPIRED,
        endedAt: new Date()
      })
      .where('status = :activeStatus', { activeStatus: ImpersonationStatus.ACTIVE })
      .andWhere('startedAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async getImpersonationStats(startDate: Date, endDate: Date): Promise<{
    totalImpersonations: number;
    activeImpersonations: number;
    uniqueAdmins: number;
    uniqueImpersonatedUsers: number;
    averageDurationMinutes: number;
  }> {
    // Total impersonations in date range
    const totalImpersonations = await this.repository.count({
      where: { startedAt: Between(startDate, endDate) }
    });

    // Active impersonations
    const activeImpersonations = await this.repository.count({
      where: { status: ImpersonationStatus.ACTIVE }
    });

    // Unique admins
    const uniqueAdminsResult = await this.repository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.adminUserId)', 'count')
      .where('log.startedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    const uniqueAdmins = parseInt(uniqueAdminsResult.count) || 0;

    // Unique impersonated users
    const uniqueImpersonatedUsersResult = await this.repository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.impersonatedUserId)', 'count')
      .where('log.startedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    const uniqueImpersonatedUsers = parseInt(uniqueImpersonatedUsersResult.count) || 0;

    // Average duration
    const avgDurationResult = await this.repository
      .createQueryBuilder('log')
      .select('AVG(EXTRACT(EPOCH FROM (COALESCE(log.endedAt, NOW()) - log.startedAt)) / 60)', 'avgDuration')
      .where('log.startedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    const averageDurationMinutes = parseFloat(avgDurationResult.avgDuration) || 0;

    return {
      totalImpersonations,
      activeImpersonations,
      uniqueAdmins,
      uniqueImpersonatedUsers,
      averageDurationMinutes
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@shared';
import { MailLog, MailLogStatus } from '../entities/mail-log.entity';
import { CreateMailLogDto, MailLogFilters, MailLogStatistics } from '../dto/mail-log.dto';

@Injectable()
export class MailLogRepository extends BaseRepository<MailLog> {
  constructor(
    @InjectRepository(MailLog)
    private readonly mailLogRepository: Repository<MailLog>,
  ) {
    super(mailLogRepository);
  }

  async createLog(data: CreateMailLogDto): Promise<MailLog> {
    const log = this.mailLogRepository.create({
      ...data,
      channel: data.channel || 'email',
      isTest: data.isTest ?? false,
    });
    return await this.mailLogRepository.save(log);
  }

  async findPaginated(filters: MailLogFilters): Promise<{
    items: MailLog[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { page, limit } = filters;

    const queryBuilder = this.mailLogRepository
      .createQueryBuilder('mailLog')
      .leftJoinAndSelect('mailLog.mailProvider', 'mailProvider')
      .leftJoinAndSelect('mailLog.mailTemplate', 'mailTemplate')
      .leftJoinAndSelect('mailLog.emailFlow', 'emailFlow')
      .leftJoinAndSelect('mailLog.triggeredByUser', 'triggeredByUser')
      .leftJoinAndSelect('triggeredByUser.profile', 'triggeredByUserProfile')
      .orderBy('mailLog.createdAt', 'DESC')
      .addOrderBy('mailLog.id', 'DESC');

    this.applyFilters(queryBuilder, filters);

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByIdWithRelations(id: string): Promise<MailLog | null> {
    return await this.mailLogRepository.findOne({
      where: { id },
      relations: ['mailProvider', 'mailTemplate', 'emailFlow', 'triggeredByUser', 'triggeredByUser.profile'],
    });
  }

  async getStatistics(): Promise<MailLogStatistics> {
    const raw = await this.mailLogRepository
      .createQueryBuilder('mailLog')
      .select('COUNT(mailLog.id)', 'total')
      .addSelect(`COUNT(CASE WHEN mailLog.status = :sent THEN 1 END)`, 'sent')
      .addSelect(`COUNT(CASE WHEN mailLog.status = :failed THEN 1 END)`, 'failed')
      .addSelect(`COUNT(CASE WHEN mailLog.status = :delivered THEN 1 END)`, 'delivered')
      .addSelect(`COUNT(CASE WHEN mailLog.isTest = true THEN 1 END)`, 'tests')
      .addSelect('MAX(mailLog.sentAt)', 'lastSentAt')
      .setParameters({
        sent: MailLogStatus.SENT,
        failed: MailLogStatus.FAILED,
        delivered: MailLogStatus.DELIVERED,
      })
      .getRawOne();

    return {
      total: Number(raw?.total || 0),
      sent: Number(raw?.sent || 0),
      failed: Number(raw?.failed || 0),
      delivered: Number(raw?.delivered || 0),
      tests: Number(raw?.tests || 0),
      lastSentAt: raw?.lastSentAt ? new Date(raw.lastSentAt) : null,
    };
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<MailLog>, filters: MailLogFilters) {
    const { search, status, providerId, templateId, flowId, isTest, dateFrom, dateTo, channel } = filters;

    if (search) {
      queryBuilder.andWhere(
        `(mailLog.recipient ILIKE :search OR mailLog.subject ILIKE :search OR mailLog.errorMessage ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('mailLog.status = :status', { status });
    }

    if (providerId) {
      queryBuilder.andWhere('mailLog.mailProviderId = :providerId', { providerId });
    }

    if (templateId) {
      queryBuilder.andWhere('mailLog.mailTemplateId = :templateId', { templateId });
    }

    if (flowId) {
      queryBuilder.andWhere('mailLog.emailFlowId = :flowId', { flowId });
    }

    if (typeof isTest === 'boolean') {
      queryBuilder.andWhere('mailLog.isTest = :isTest', { isTest });
    }

    if (channel) {
      queryBuilder.andWhere('mailLog.channel = :channel', { channel });
    }

    if (dateFrom) {
      queryBuilder.andWhere('mailLog.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('mailLog.createdAt <= :dateTo', { dateTo });
    }
  }
}

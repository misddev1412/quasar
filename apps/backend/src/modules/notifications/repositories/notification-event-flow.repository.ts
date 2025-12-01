import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '@shared/types/common.types';
import { NotificationEventFlow } from '../entities/notification-event-flow.entity';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannel } from '../entities/notification-preference.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';

export interface NotificationEventFlowFilters {
  page?: number;
  limit?: number;
  search?: string;
  channel?: NotificationChannel;
  eventKey?: NotificationEvent;
  isActive?: boolean;
}

export interface UpsertNotificationEventFlowDto {
  id?: string;
  eventKey: NotificationEvent;
  displayName: string;
  description?: string;
  channelPreferences: NotificationChannel[];
  includeActor: boolean;
  recipientUserIds: string[];
  ccUserIds: string[];
  bccUserIds: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  channelMetadata?: Record<string, unknown>;
  isActive?: boolean;
  mailTemplateIds: string[];
}

@Injectable()
export class NotificationEventFlowRepository {
  constructor(
    @InjectRepository(NotificationEventFlow)
    private readonly repository: Repository<NotificationEventFlow>,
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  async list(filters: NotificationEventFlowFilters): Promise<PaginatedResult<NotificationEventFlow>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    const queryBuilder = this.repository.createQueryBuilder('flow')
      .leftJoinAndSelect('flow.mailTemplates', 'mailTemplates');

    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(flow.displayName) LIKE :search OR LOWER(flow.eventKey) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    if (filters.channel) {
      queryBuilder.andWhere(':channel = ANY(flow.channelPreferences)', { channel: filters.channel });
    }

    if (filters.eventKey) {
      queryBuilder.andWhere('flow.eventKey = :eventKey', { eventKey: filters.eventKey });
    }

    if (typeof filters.isActive === 'boolean') {
      queryBuilder.andWhere('flow.isActive = :isActive', { isActive: filters.isActive });
    }

    const [data, total] = await queryBuilder
      .orderBy('flow.displayName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findById(id: string): Promise<NotificationEventFlow | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['mailTemplates'],
    });
  }

  async findByEvent(eventKey: NotificationEvent): Promise<NotificationEventFlow | null> {
    return this.repository.findOne({
      where: { eventKey },
      relations: ['mailTemplates'],
    });
  }

  async upsert(data: UpsertNotificationEventFlowDto): Promise<NotificationEventFlow> {
    const templateIds = Array.from(new Set(data.mailTemplateIds || []));
    const mailTemplates = templateIds.length
      ? await this.mailTemplateRepository.find({
          where: { id: In(templateIds) },
        })
      : [];

    let entity: NotificationEventFlow | null = null;
    if (data.id) {
      entity = await this.findById(data.id);
    }

    if (!entity) {
      entity = await this.findByEvent(data.eventKey);
    }

    if (!entity) {
      entity = this.repository.create({
        eventKey: data.eventKey,
      });
    }

    entity.displayName = data.displayName;
    entity.description = data.description;
    entity.channelPreferences = Array.from(new Set(data.channelPreferences));
    entity.includeActor = data.includeActor;
    entity.recipientUserIds = Array.from(new Set(data.recipientUserIds));
    entity.ccUserIds = Array.from(new Set(data.ccUserIds));
    entity.bccUserIds = Array.from(new Set(data.bccUserIds));
    entity.ccEmails = data.ccEmails?.length ? Array.from(new Set(data.ccEmails)) : [];
    entity.bccEmails = data.bccEmails?.length ? Array.from(new Set(data.bccEmails)) : [];
    entity.channelMetadata = data.channelMetadata;
    entity.isActive = typeof data.isActive === 'boolean' ? data.isActive : true;
    entity.mailTemplates = mailTemplates;

    return this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

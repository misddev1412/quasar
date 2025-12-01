import { Injectable } from '@nestjs/common';
import { NotificationEventFlowRepository, NotificationEventFlowFilters, UpsertNotificationEventFlowDto } from '../repositories/notification-event-flow.repository';
import { NotificationEventFlow } from '../entities/notification-event-flow.entity';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannel } from '../entities/notification-preference.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { PaginatedResult } from '@shared/types/common.types';

export interface RecipientSummary {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string | null;
}

export interface TemplateSummary {
  id: string;
  name: string;
  subject: string;
  type: string;
  description?: string | null;
}

export interface NotificationEventFlowDto {
  id: string;
  eventKey: NotificationEvent;
  displayName: string;
  description?: string;
  channelPreferences: NotificationChannel[];
  includeActor: boolean;
  isActive: boolean;
  mailTemplates: TemplateSummary[];
  recipientUserIds: string[];
  ccUserIds: string[];
  bccUserIds: string[];
  ccEmails: string[];
  bccEmails: string[];
  recipients: RecipientSummary[];
  ccRecipients: RecipientSummary[];
  bccRecipients: RecipientSummary[];
  channelMetadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipientSearchResult {
  items: RecipientSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class NotificationEventFlowService {
  constructor(
    private readonly repository: NotificationEventFlowRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async listFlows(filters: NotificationEventFlowFilters): Promise<PaginatedResult<NotificationEventFlowDto>> {
    const result = await this.repository.list(filters);
    const userMap = await this.buildUserMap(result.data);
    return {
      data: result.data.map(flow => this.toDto(flow, userMap)),
      meta: result.meta,
    };
  }

  async getFlowById(id: string): Promise<NotificationEventFlowDto | null> {
    const flow = await this.repository.findById(id);
    if (!flow) {
      return null;
    }
    const userMap = await this.buildUserMap([flow]);
    return this.toDto(flow, userMap);
  }

  async getFlowByEvent(eventKey: NotificationEvent): Promise<NotificationEventFlowDto | null> {
    const flow = await this.repository.findByEvent(eventKey);
    if (!flow) {
      return null;
    }
    const userMap = await this.buildUserMap([flow]);
    return this.toDto(flow, userMap);
  }

  async upsertFlow(payload: UpsertNotificationEventFlowDto): Promise<NotificationEventFlowDto> {
    const saved = await this.repository.upsert(payload);
    const userMap = await this.buildUserMap([saved]);
    return this.toDto(saved, userMap);
  }

  async deleteFlow(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async searchRecipients(query: string = '', limit: number = 10): Promise<RecipientSearchResult> {
    const result = await this.userRepository.findUsersWithFilters({
      page: 1,
      limit,
      search: query?.trim() || undefined, // Pass undefined when empty to get all users
    });

    return {
      items: result.items.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.profile
          ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ').trim()
          : undefined,
        avatar: user.profile?.avatar,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private async buildUserMap(flows: NotificationEventFlow[]): Promise<Map<string, RecipientSummary>> {
    const userIds = new Set<string>();
    flows.forEach(flow => {
      flow.recipientUserIds?.forEach(id => id && userIds.add(id));
      flow.ccUserIds?.forEach(id => id && userIds.add(id));
      flow.bccUserIds?.forEach(id => id && userIds.add(id));
    });

    if (userIds.size === 0) {
      return new Map();
    }

    const users = await this.userRepository.findByIds(Array.from(userIds));
    const map = new Map<string, RecipientSummary>();
    users.forEach(user => {
      map.set(user.id, {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.profile
          ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ').trim()
          : undefined,
        avatar: user.profile?.avatar,
      });
    });
    return map;
  }

  private toDto(flow: NotificationEventFlow, userMap: Map<string, RecipientSummary>): NotificationEventFlowDto {
    const mapUser = (id: string): RecipientSummary | null => {
      if (!id) return null;
      return userMap.get(id) || null;
    };

    return {
      id: flow.id,
      eventKey: flow.eventKey,
      displayName: flow.displayName,
      description: flow.description,
      channelPreferences: flow.channelPreferences ?? [],
      includeActor: flow.includeActor,
      isActive: flow.isActive,
      mailTemplates: (flow.mailTemplates || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        type: template.type,
        description: template.description,
      })),
      recipientUserIds: flow.recipientUserIds ?? [],
      ccUserIds: flow.ccUserIds ?? [],
      bccUserIds: flow.bccUserIds ?? [],
      ccEmails: flow.ccEmails ?? [],
      bccEmails: flow.bccEmails ?? [],
      recipients: (flow.recipientUserIds || [])
        .map(id => mapUser(id))
        .filter((val): val is RecipientSummary => !!val),
      ccRecipients: (flow.ccUserIds || [])
        .map(id => mapUser(id))
        .filter((val): val is RecipientSummary => !!val),
      bccRecipients: (flow.bccUserIds || [])
        .map(id => mapUser(id))
        .filter((val): val is RecipientSummary => !!val),
      channelMetadata: flow.channelMetadata,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    };
  }
}

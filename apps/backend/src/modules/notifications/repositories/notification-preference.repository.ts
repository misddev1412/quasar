import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  NotificationPreferenceEntity,
  NotificationChannel,
  NotificationFrequency,
} from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification.entity';

export interface CreateNotificationPreferenceDto {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled?: boolean;
  frequency?: NotificationFrequency;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateNotificationPreferenceDto {
  enabled?: boolean;
  frequency?: NotificationFrequency;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  settings?: Record<string, unknown>;
}

export interface NotificationPreferenceFilter {
  userId?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  enabled?: boolean;
}

@Injectable()
export class NotificationPreferenceRepository {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly repository: Repository<NotificationPreferenceEntity>,
  ) {}

  async create(
    data: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const preference = this.repository.create(data);
    return this.repository.save(preference);
  }

  async findById(id: string): Promise<NotificationPreferenceEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserAndTypeAndChannel(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationPreferenceEntity | null> {
    return this.repository.findOne({
      where: { userId, type, channel },
    });
  }

  async findByUser(userId: string): Promise<NotificationPreferenceEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { type: 'ASC', channel: 'ASC' },
    });
  }

  async findAll(filter: NotificationPreferenceFilter = {}): Promise<NotificationPreferenceEntity[]> {
    const where: FindOptionsWhere<NotificationPreferenceEntity> = {};

    if (filter.userId) where.userId = filter.userId;
    if (filter.type) where.type = filter.type;
    if (filter.channel) where.channel = filter.channel;
    if (filter.enabled !== undefined) where.enabled = filter.enabled;

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    data: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateByUserAndTypeAndChannel(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    data: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity | null> {
    const existing = await this.findByUserAndTypeAndChannel(userId, type, channel);
    if (!existing) {
      return null;
    }
    return this.update(existing.id, data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async createDefaultPreferencesForUser(userId: string): Promise<void> {
    const types = Object.values(NotificationType);
    const channels = Object.values(NotificationChannel);

    const preferences = [];
    for (const type of types) {
      for (const channel of channels) {
        const existing = await this.findByUserAndTypeAndChannel(userId, type, channel);
        if (!existing) {
          preferences.push({
            userId,
            type,
            channel,
            enabled: true,
            frequency: NotificationFrequency.IMMEDIATE,
          });
        }
      }
    }

    if (preferences.length > 0) {
      await this.repository.save(preferences);
    }
  }

  async getUserEnabledChannelsForType(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationChannel[]> {
    const preferences = await this.repository.find({
      where: { userId, type, enabled: true },
      select: ['channel'],
    });

    return preferences.map(p => p.channel);
  }

  async bulkUpdateUserPreferences(
    userId: string,
    updates: Array<{
      type: NotificationType;
      channel: NotificationChannel;
      data: UpdateNotificationPreferenceDto;
    }>,
  ): Promise<void> {
    for (const update of updates) {
      await this.updateByUserAndTypeAndChannel(
        userId,
        update.type,
        update.channel,
        update.data,
      );
    }
  }
}
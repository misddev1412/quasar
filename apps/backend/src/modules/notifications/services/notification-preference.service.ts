import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  NotificationPreferenceRepository,
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
  NotificationPreferenceFilter,
} from '../repositories/notification-preference.repository';
import {
  NotificationPreferenceEntity,
  NotificationChannel,
  NotificationFrequency,
} from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification.entity';

export interface NotificationPreferenceSettings {
  type: NotificationType;
  channels: {
    [K in NotificationChannel]: {
      enabled: boolean;
      frequency: NotificationFrequency;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursTimezone?: string;
      settings?: Record<string, unknown>;
    };
  };
}

export interface BulkUpdatePreferencesDto {
  preferences: Array<{
    type: NotificationType;
    channel: NotificationChannel;
    enabled?: boolean;
    frequency?: NotificationFrequency;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    quietHoursTimezone?: string;
    settings?: Record<string, unknown>;
  }>;
}

@Injectable()
export class NotificationPreferenceService {
  constructor(
    private readonly preferenceRepository: NotificationPreferenceRepository,
  ) {}

  async createPreference(
    data: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const existing = await this.preferenceRepository.findByUserAndTypeAndChannel(
      data.userId,
      data.type,
      data.channel,
    );

    if (existing) {
      throw new ConflictException(
        `Preference for user ${data.userId}, type ${data.type}, channel ${data.channel} already exists`,
      );
    }

    return this.preferenceRepository.create(data);
  }

  async getPreference(id: string): Promise<NotificationPreferenceEntity> {
    const preference = await this.preferenceRepository.findById(id);
    if (!preference) {
      throw new NotFoundException(`Notification preference with ID ${id} not found`);
    }
    return preference;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferenceEntity[]> {
    return this.preferenceRepository.findByUser(userId);
  }

  async getUserPreferencesGrouped(userId: string): Promise<NotificationPreferenceSettings[]> {
    const preferences = await this.getUserPreferences(userId);

    const grouped = new Map<NotificationType, NotificationPreferenceSettings>();

    for (const pref of preferences) {
      if (!grouped.has(pref.type)) {
        grouped.set(pref.type, {
          type: pref.type,
          channels: {} as any,
        });
      }

      const group = grouped.get(pref.type)!;
      group.channels[pref.channel] = {
        enabled: pref.enabled,
        frequency: pref.frequency,
        quietHoursStart: pref.quietHoursStart,
        quietHoursEnd: pref.quietHoursEnd,
        quietHoursTimezone: pref.quietHoursTimezone,
        settings: pref.settings,
      };
    }

    return Array.from(grouped.values());
  }

  async updatePreference(
    id: string,
    data: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const updated = await this.preferenceRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Notification preference with ID ${id} not found`);
    }
    return updated;
  }

  async updateUserPreference(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    data: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const updated = await this.preferenceRepository.updateByUserAndTypeAndChannel(
      userId,
      type,
      channel,
      data,
    );

    if (!updated) {
      throw new NotFoundException(
        `Notification preference for user ${userId}, type ${type}, channel ${channel} not found`,
      );
    }

    return updated;
  }

  async bulkUpdateUserPreferences(
    userId: string,
    data: BulkUpdatePreferencesDto,
  ): Promise<NotificationPreferenceEntity[]> {
    const updates = data.preferences.map(pref => ({
      type: pref.type,
      channel: pref.channel,
      data: {
        enabled: pref.enabled,
        frequency: pref.frequency,
        quietHoursStart: pref.quietHoursStart,
        quietHoursEnd: pref.quietHoursEnd,
        quietHoursTimezone: pref.quietHoursTimezone,
        settings: pref.settings,
      },
    }));

    await this.preferenceRepository.bulkUpdateUserPreferences(userId, updates);
    return this.getUserPreferences(userId);
  }

  async deletePreference(id: string): Promise<void> {
    const deleted = await this.preferenceRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Notification preference with ID ${id} not found`);
    }
  }

  async initializeUserPreferences(userId: string): Promise<void> {
    await this.preferenceRepository.createDefaultPreferencesForUser(userId);
  }

  async getEnabledChannelsForUser(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationChannel[]> {
    return this.preferenceRepository.getUserEnabledChannelsForType(userId, type);
  }

  async canSendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    timezone?: string,
  ): Promise<boolean> {
    const preference = await this.preferenceRepository.findByUserAndTypeAndChannel(
      userId,
      type,
      channel,
    );

    if (!preference) {
      // Default to true if no preference is set
      return true;
    }

    return preference.shouldSendNotification(timezone);
  }

  async getQuietHoursForUser(
    userId: string,
    channel: NotificationChannel,
  ): Promise<{
    start?: string;
    end?: string;
    timezone?: string;
  } | null> {
    const preferences = await this.preferenceRepository.findAll({
      userId,
      channel,
    });

    // Find the first preference with quiet hours set
    const withQuietHours = preferences.find(
      p => p.quietHoursStart && p.quietHoursEnd,
    );

    if (!withQuietHours) {
      return null;
    }

    return {
      start: withQuietHours.quietHoursStart,
      end: withQuietHours.quietHoursEnd,
      timezone: withQuietHours.quietHoursTimezone,
    };
  }

  async toggleNotificationType(
    userId: string,
    type: NotificationType,
    enabled: boolean,
  ): Promise<void> {
    const channels = Object.values(NotificationChannel);
    const updates = channels.map(channel => ({
      type,
      channel,
      data: { enabled },
    }));

    await this.preferenceRepository.bulkUpdateUserPreferences(userId, updates);
  }

  async setQuietHours(
    userId: string,
    channel: NotificationChannel,
    start: string,
    end: string,
    timezone?: string,
  ): Promise<void> {
    const types = Object.values(NotificationType);
    const updates = types.map(type => ({
      type,
      channel,
      data: {
        quietHoursStart: start,
        quietHoursEnd: end,
        quietHoursTimezone: timezone,
      },
    }));

    await this.preferenceRepository.bulkUpdateUserPreferences(userId, updates);
  }
}
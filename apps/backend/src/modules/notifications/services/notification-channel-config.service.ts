import { Injectable } from '@nestjs/common';
import { NotificationChannelConfigRepository, UpsertChannelConfigDto } from '../repositories/notification-channel-config.repository';
import { NotificationChannel } from '../entities/notification-preference.entity';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannelConfigEntity } from '../entities/notification-channel-config.entity';

export const DEFAULT_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  NotificationChannel.EMAIL,
  NotificationChannel.PUSH,
  NotificationChannel.IN_APP,
];

export const DEFAULT_CHANNEL_CONFIGS: Array<Omit<UpsertChannelConfigDto, 'isActive'>> = [
  {
    eventKey: NotificationEvent.USER_REGISTERED,
    displayName: 'User Registration',
    description: 'Triggered when a customer creates a new account',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.TELEGRAM,
      NotificationChannel.IN_APP,
    ],
  },
  {
    eventKey: NotificationEvent.USER_VERIFIED,
    displayName: 'User Verification',
    description: 'Account verification success/failure notifications',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.PUSH,
      NotificationChannel.IN_APP,
    ],
  },
  {
    eventKey: NotificationEvent.ORDER_CREATED,
    displayName: 'Order Created',
    description: 'Customer placed an order',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.PUSH,
      NotificationChannel.IN_APP,
      NotificationChannel.SMS,
    ],
  },
  {
    eventKey: NotificationEvent.ORDER_SHIPPED,
    displayName: 'Order Shipped',
    description: 'Logistics update when the parcel leaves the warehouse',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.PUSH,
    ],
  },
  {
    eventKey: NotificationEvent.MARKETING_CAMPAIGN,
    displayName: 'Marketing Campaign',
    description: 'Campaign pushes and promotional messages',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.TELEGRAM,
      NotificationChannel.PUSH,
    ],
  },
  {
    eventKey: NotificationEvent.SYSTEM_ANNOUNCEMENT,
    displayName: 'System Announcement',
    description: 'System-wide broadcast sent by administrators',
    allowedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.PUSH,
      NotificationChannel.IN_APP,
    ],
  },
  {
    eventKey: NotificationEvent.CUSTOM,
    displayName: 'Manual / Custom',
    description: 'Fallback event for ad-hoc notifications',
    allowedChannels: DEFAULT_NOTIFICATION_CHANNELS,
  },
];

@Injectable()
export class NotificationChannelConfigService {
  constructor(
    private readonly repository: NotificationChannelConfigRepository,
  ) {}

  async list(): Promise<NotificationChannelConfigEntity[]> {
    return this.repository.listAll();
  }

  async getByEvent(eventKey: NotificationEvent): Promise<NotificationChannelConfigEntity | null> {
    return this.repository.findByEvent(eventKey);
  }

  async getAllowedChannels(eventKey?: NotificationEvent): Promise<NotificationChannel[]> {
    if (!eventKey) {
      return DEFAULT_NOTIFICATION_CHANNELS;
    }

    const config = await this.repository.findByEvent(eventKey);
    if (!config) {
      return DEFAULT_NOTIFICATION_CHANNELS;
    }

    return config.allowedChannels?.length ? config.allowedChannels : DEFAULT_NOTIFICATION_CHANNELS;
  }

  async upsertConfig(data: UpsertChannelConfigDto): Promise<NotificationChannelConfigEntity> {
    return this.repository.upsertConfig(data);
  }

  async setAllowedChannels(
    eventKey: NotificationEvent,
    channels: NotificationChannel[],
  ): Promise<NotificationChannelConfigEntity> {
    return this.repository.updateAllowedChannels(
      eventKey,
      Array.from(new Set(channels)),
    );
  }

  async initializeDefaults(): Promise<void> {
    const existing = await this.repository.listAll();
    const existingEvents = new Set(existing.map(config => config.eventKey));

    for (const defaultConfig of DEFAULT_CHANNEL_CONFIGS) {
      if (!existingEvents.has(defaultConfig.eventKey)) {
        await this.repository.upsertConfig({
          ...defaultConfig,
          isActive: true,
        });
      }
    }
  }
}

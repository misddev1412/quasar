import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationChannelConfigEntity } from '../entities/notification-channel-config.entity';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannel } from '../entities/notification-preference.entity';

export interface UpsertChannelConfigDto {
  eventKey: NotificationEvent;
  displayName: string;
  description?: string;
  allowedChannels: NotificationChannel[];
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationChannelConfigRepository {
  constructor(
    @InjectRepository(NotificationChannelConfigEntity)
    private readonly repository: Repository<NotificationChannelConfigEntity>,
  ) {}

  async listAll(): Promise<NotificationChannelConfigEntity[]> {
    return this.repository.find({ order: { displayName: 'ASC' } });
  }

  async findByEvent(eventKey: NotificationEvent): Promise<NotificationChannelConfigEntity | null> {
    return this.repository.findOne({ where: { eventKey } });
  }

  async upsertConfig(data: UpsertChannelConfigDto): Promise<NotificationChannelConfigEntity> {
    const existing = await this.findByEvent(data.eventKey);
    if (existing) {
      return this.repository.save({
        ...existing,
        displayName: data.displayName,
        description: data.description,
        allowedChannels: data.allowedChannels,
        isActive: data.isActive ?? existing.isActive,
        metadata: data.metadata,
      });
    }

    const created = this.repository.create({
      eventKey: data.eventKey,
      displayName: data.displayName,
      description: data.description,
      allowedChannels: data.allowedChannels,
      isActive: data.isActive ?? true,
      metadata: data.metadata,
    });
    return this.repository.save(created);
  }

  async updateAllowedChannels(
    eventKey: NotificationEvent,
    channels: NotificationChannel[],
  ): Promise<NotificationChannelConfigEntity> {
    const config = await this.findByEvent(eventKey);
    if (!config) {
      const created = this.repository.create({
        eventKey,
        displayName: eventKey,
        allowedChannels: channels,
        isActive: true,
      });
      return this.repository.save(created);
    }

    config.allowedChannels = channels;
    return this.repository.save(config);
  }
}

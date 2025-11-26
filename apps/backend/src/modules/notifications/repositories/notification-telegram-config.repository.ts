import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTelegramConfigEntity } from '../entities/notification-telegram-config.entity';

export interface CreateTelegramConfigDto {
  name: string;
  botUsername: string;
  botToken: string;
  chatId: string;
  threadId?: number | null;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateTelegramConfigDto extends Partial<CreateTelegramConfigDto> {
  id: string;
}

@Injectable()
export class NotificationTelegramConfigRepository {
  constructor(
    @InjectRepository(NotificationTelegramConfigEntity)
    private readonly repository: Repository<NotificationTelegramConfigEntity>,
  ) {}

  async listAll(): Promise<NotificationTelegramConfigEntity[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<NotificationTelegramConfigEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async createConfig(data: CreateTelegramConfigDto): Promise<NotificationTelegramConfigEntity> {
    const config = this.repository.create({
      ...data,
      isActive: data.isActive ?? true,
    });

    return this.repository.save(config);
  }

  async updateConfig(
    id: string,
    data: Partial<CreateTelegramConfigDto>,
  ): Promise<NotificationTelegramConfigEntity | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    if (data.name !== undefined) existing.name = data.name;
    if (data.botUsername !== undefined) existing.botUsername = data.botUsername;
    if (data.botToken !== undefined) existing.botToken = data.botToken;
    if (data.chatId !== undefined) existing.chatId = data.chatId;
    if (data.threadId !== undefined) existing.threadId = data.threadId;
    if (data.description !== undefined) existing.description = data.description;
    if (data.isActive !== undefined) existing.isActive = data.isActive;
    if (data.metadata !== undefined) existing.metadata = data.metadata;

    return this.repository.save(existing);
  }

  async deleteConfig(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

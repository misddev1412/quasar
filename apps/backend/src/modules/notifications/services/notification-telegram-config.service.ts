import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationTelegramConfigRepository, CreateTelegramConfigDto } from '../repositories/notification-telegram-config.repository';
import { NotificationTelegramConfigEntity } from '../entities/notification-telegram-config.entity';

@Injectable()
export class NotificationTelegramConfigService {
  constructor(
    private readonly repository: NotificationTelegramConfigRepository,
  ) {}

  list(): Promise<NotificationTelegramConfigEntity[]> {
    return this.repository.listAll();
  }

  create(
    data: CreateTelegramConfigDto,
  ): Promise<NotificationTelegramConfigEntity> {
    return this.repository.createConfig(data);
  }

  async update(
    id: string,
    data: Partial<CreateTelegramConfigDto>,
  ): Promise<NotificationTelegramConfigEntity> {
    const updated = await this.repository.updateConfig(id, data);
    if (!updated) {
      throw new NotFoundException('Telegram notification config not found');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.deleteConfig(id);
    if (!deleted) {
      throw new NotFoundException('Telegram notification config not found');
    }
  }
}

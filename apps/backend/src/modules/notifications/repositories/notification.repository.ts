import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere, In } from 'typeorm';
import { NotificationEntity, NotificationType } from '../entities/notification.entity';
import { NotificationEvent } from '../entities/notification-event.enum';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string;
  icon?: string;
  image?: string;
  data?: Record<string, unknown>;
  fcmToken?: string;
  eventKey?: NotificationEvent;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
  ) {}

  async create(data: CreateNotificationDto): Promise<NotificationEntity> {
    const notification = this.repository.create({
      ...data,
      type: data.type || NotificationType.INFO,
    });
    return await this.repository.save(notification);
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(
    userId: string,
    options: Omit<NotificationFilters, 'userId'> = {}
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const {
      type,
      read,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const where: FindOptionsWhere<NotificationEntity> = { userId };
    if (type !== undefined) where.type = type;
    if (read !== undefined) where.read = read;

    const findOptions: FindManyOptions<NotificationEntity> = {
      where,
      order: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      relations: ['user'],
    };

    const [notifications, total] = await this.repository.findAndCount(findOptions);

    return { notifications, total };
  }

  async findAll(filters: NotificationFilters = {}): Promise<{
    notifications: NotificationEntity[];
    total: number;
  }> {
    const {
      userId,
      type,
      read,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const where: FindOptionsWhere<NotificationEntity> = {};
    if (userId) where.userId = userId;
    if (type !== undefined) where.type = type;
    if (read !== undefined) where.read = read;

    const findOptions: FindManyOptions<NotificationEntity> = {
      where,
      order: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      relations: ['user'],
    };

    const [notifications, total] = await this.repository.findAndCount(findOptions);

    return { notifications, total };
  }

  async markAsRead(id: string): Promise<NotificationEntity | null> {
    const notification = await this.findById(id);
    if (!notification) return null;

    notification.markAsRead();
    return await this.repository.save(notification);
  }

  async markAsReadByUserId(userId: string, notificationIds?: string[]): Promise<void> {
    const where: FindOptionsWhere<NotificationEntity> = { userId, read: false };
    if (notificationIds && notificationIds.length > 0) {
      where.id = In(notificationIds);
    }

    await this.repository.update(where, {
      read: true,
      readAt: new Date(),
    });
  }

  async markAsSent(id: string, fcmToken?: string): Promise<NotificationEntity | null> {
    const notification = await this.findById(id);
    if (!notification) return null;

    notification.markAsSent(fcmToken);
    return await this.repository.save(notification);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async deleteByUserId(userId: string, olderThanDays?: number): Promise<number> {
    let deleteCondition = `user_id = :userId`;
    const parameters: Record<string, unknown> = { userId };

    if (olderThanDays && olderThanDays > 0) {
      deleteCondition += ` AND created_at < NOW() - INTERVAL ':days days'`;
      parameters.days = olderThanDays;
    }

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where(deleteCondition, parameters)
      .execute();

    return result.affected || 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, read: false },
    });
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 5
  ): Promise<NotificationEntity[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async bulkCreate(notifications: CreateNotificationDto[]): Promise<NotificationEntity[]> {
    const entities = notifications.map(data =>
      this.repository.create({
        ...data,
        type: data.type || NotificationType.INFO,
      })
    );
    return await this.repository.save(entities);
  }

  async cleanup(olderThanDays: number = 30): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < NOW() - INTERVAL :days DAY', { days: olderThanDays })
      .execute();

    return result.affected || 0;
  }
}

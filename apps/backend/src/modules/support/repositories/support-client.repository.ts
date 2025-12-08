import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SupportClient } from '../entities/support-client.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class SupportClientRepository extends BaseRepository<SupportClient> {
  constructor(
    @InjectRepository(SupportClient)
    private readonly supportClientRepository: Repository<SupportClient>,
  ) {
    super(supportClientRepository);
  }

  async findActiveClients(): Promise<SupportClient[]> {
    const now = new Date();
    return this.findAll({
      where: [
        {
          isActive: true,
          deletedAt: null,
          scheduleEnabled: false,
        },
        {
          isActive: true,
          deletedAt: null,
          scheduleEnabled: true,
          scheduleStart: LessThanOrEqual(now),
          scheduleEnd: MoreThanOrEqual(now),
        },
      ],
      order: {
        sortOrder: 'ASC',
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findDefaultClient(): Promise<SupportClient | null> {
    return this.findOne({
      where: {
        isActive: true,
        isDefault: true,
        deletedAt: null,
      },
    });
  }

  async findClientsByType(type: string): Promise<SupportClient[]> {
    return this.findAll({
      where: {
        type: type as any,
        isActive: true,
        deletedAt: null,
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findClientsForContext(context: {
    country?: string;
    language?: string;
    deviceType?: string;
    currentPage?: string;
  }): Promise<SupportClient[]> {
    const clients = await this.findActiveClients();

    return clients.filter(client => {
      if (!client.isTargeted(context)) {
        return false;
      }
      return client.isAvailableNow();
    });
  }

  async setAsDefault(id: string): Promise<void> {
    await this.getRepository().manager.transaction(async transactionalEntityManager => {
      // Remove default from all clients
      await transactionalEntityManager.update(
        SupportClient,
        { isDefault: true },
        { isDefault: false }
      );

      // Set the new default
      await transactionalEntityManager.update(
        SupportClient,
        { id },
        { isDefault: true }
      );
    });
  }

  async updateSortOrder(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    await this.getRepository().manager.transaction(async transactionalEntityManager => {
      for (const update of updates) {
        await transactionalEntityManager.update(
          SupportClient,
          { id: update.id },
          { sortOrder: update.sortOrder }
        );
      }
    });
  }

  async findScheduledClients(): Promise<SupportClient[]> {
    const now = new Date();
    return this.findAll({
      where: {
        isActive: true,
        scheduleEnabled: true,
        deletedAt: null,
        scheduleStart: LessThanOrEqual(now),
        scheduleEnd: MoreThanOrEqual(now),
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findClientsByWorkingHours(dayOfWeek: string, time: string): Promise<SupportClient[]> {
    const clients = await this.findActiveClients();

    return clients.filter(client => {
      const workingHours = client.widgetSettings.workingHours;
      if (!workingHours) {
        return true; // No working hours restriction
      }

      const dayWorkingHours = workingHours[dayOfWeek as keyof typeof workingHours];
      if (!dayWorkingHours) {
        return true; // No working hours for this day
      }

      const [startTime, endTime] = dayWorkingHours.split('-');
      return time >= startTime && time <= endTime;
    });
  }

  async getClientStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    defaultCount: number;
  }> {
    const [total, active] = await Promise.all([
      this.count({ where: { deletedAt: null } }),
      this.count({ where: { isActive: true, deletedAt: null } }),
    ]);

    const clientsByType = await this.supportClientRepository
      .createQueryBuilder('client')
      .select('client.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('client.deletedAt IS NULL')
      .groupBy('client.type')
      .getRawMany();

    const byType = clientsByType.reduce((acc, { type, count }) => {
      acc[type] = parseInt(count);
      return acc;
    }, {} as Record<string, number>);

    const defaultCount = await this.count({
      where: { isDefault: true, isActive: true, deletedAt: null },
    });

    return {
      total,
      active,
      byType,
      defaultCount,
    };
  }
}
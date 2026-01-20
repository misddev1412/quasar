import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceItem } from './entities/service-item.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { ServiceItemTranslation } from './entities/service-item-translation.entity';
import { CreateServiceDto, UpdateServiceDto, ServiceFilterDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { items, translations, ...serviceData } = createServiceDto;

    // Use transaction to ensure data consistency
    return this.dataSource.transaction(async (manager) => {
      // 1. Create main service
      const service = manager.create(Service, {
        ...serviceData,
      });
      const savedService = await manager.save(service);

      // 2. Create service translations
      if (translations && translations.length > 0) {
        const transEntities = translations.map(t => manager.create(ServiceTranslation, {
          ...t,
          serviceId: savedService.id,
        }));
        await manager.save(transEntities);
      }

      // 3. Create items with their translations
      if (items && items.length > 0) {
        for (const item of items) {
          const { translations: itemTranslations, ...itemData } = item;
          const itemEntity = manager.create(ServiceItem, {
            ...itemData,
            serviceId: savedService.id,
          });
          const savedItem = await manager.save(itemEntity);

          if (itemTranslations && itemTranslations.length > 0) {
            const itemTransEntities = itemTranslations.map(t => manager.create(ServiceItemTranslation, {
              ...t,
              service_item_id: savedItem.id,
            }));
            await manager.save(itemTransEntities);
          }
        }
      }

      return this.findOne(savedService.id);
    });
  }

  async findAll(query: ServiceFilterDto): Promise<{ items: Service[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, search, isActive, ids } = query;
    const skip = (page - 1) * limit;

    const qb = this.serviceRepository.createQueryBuilder('service');

    qb.leftJoinAndSelect('service.translations', 'translations');
    qb.leftJoinAndSelect('service.items', 'items');
    qb.leftJoinAndSelect('items.translations', 'itemTranslations');
    qb.leftJoinAndSelect('service.currency', 'currency');

    if (ids && ids.length > 0) {
      qb.andWhere('service.id IN (:...ids)', { ids });
    }

    if (isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', { isActive });
    }

    if (search) {
      qb.andWhere('(translations.name ILIKE :search OR translations.description ILIKE :search)', { search: `%${search}%` });
    }

    qb.orderBy('service.createdAt', 'DESC');
    qb.addOrderBy('items.sortOrder', 'ASC'); // secondary sort for items

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['translations', 'items', 'items.translations', 'currency'],
      order: {
        items: {
          sortOrder: 'ASC',
        }
      }
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    const { items, translations, ...serviceData } = updateServiceDto;

    return this.dataSource.transaction(async (manager) => {
      // Update main fields
      await manager.update(Service, id, serviceData);

      // Update translations
      if (translations) {
        // Simple strategy: delete all and recreate or upsert
        // For now, let's just delete existing for this service and recreate if provided
        // A better way is to upsert based on locale

        // Upsert strategy for translations
        for (const t of translations) {
          const existing = service.translations.find(et => et.locale === t.locale);
          if (existing) {
            await manager.update(ServiceTranslation, existing.id, t);
          } else {
            await manager.save(ServiceTranslation, manager.create(ServiceTranslation, { ...t, serviceId: id }));
          }
        }
      }

      // Handle items logic (complexity: high due to add/remove/update)
      // For this iteration, let's assume we replace items if provided, or we might need a dedicated endpoint for item management if too complex
      // Ideally:
      // - items with ID -> update
      // - items without ID -> create
      // - IDs not in list -> delete (if we assume usage of full list)

      if (items) {
        const incomingIds = items.filter(i => i.id).map(i => i.id);
        const existingIds = service.items.map(i => i.id);
        const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));

        // Delete removed items
        if (toDelete.length > 0) {
          await manager.delete(ServiceItem, toDelete);
        }

        for (const item of items) {
          const { translations: itemTrans, ...itemFields } = item;
          let itemId = item.id;

          if (itemId) {
            await manager.update(ServiceItem, itemId, { ...itemFields });
          } else {
            const newItem = await manager.save(ServiceItem, manager.create(ServiceItem, { ...itemFields, serviceId: id }));
            itemId = newItem.id;
          }

          if (itemTrans) {
            // Get existing item if update to check translations? 
            // Or just query translations for this item
            // Optimization: fetch item with translations or just upsert loop

            // Upsert item translations
            for (const it of itemTrans) {
              // Find if exists? We don't have existing sub-relations easily without reloading
              // Let's try to find match in 'service.items' if it was a known item
              const existingItem = service.items.find(si => si.id === itemId);
              const existingTrans = existingItem?.translations?.find(et => et.locale === it.locale);

              // If new item, existingTrans is undefined.
              // But wait, if we just created newItem, we don't have its translations loaded.
              // For safety, let's try to update where serviceId and locale, or insert.
              // Actually, we can just use upsert or manual check query

              const exist = await manager.findOne(ServiceItemTranslation, { where: { service_item_id: itemId, locale: it.locale } });
              if (exist) {
                await manager.update(ServiceItemTranslation, exist.id, it);
              } else {
                await manager.save(ServiceItemTranslation, manager.create(ServiceItemTranslation, { ...it, service_item_id: itemId }));
              }
            }
          }
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }
}

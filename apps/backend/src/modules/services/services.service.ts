import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Service } from '@backend/modules/services/entities/service.entity';
import { ServiceItem } from '@backend/modules/services/entities/service-item.entity';
import { ServiceTranslation } from '@backend/modules/services/entities/service-translation.entity';
import { ServiceItemTranslation } from '@backend/modules/services/entities/service-item-translation.entity';
import { CreateServiceDto, UpdateServiceDto, ServiceFilterDto } from '@backend/modules/services/dto/service.dto';
import { SlugUtil } from '@backend/modules/shared/utils/slug.util';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
    private readonly dataSource: DataSource,
  ) { }

  private async ensureUniqueTranslationSlug(
    manager: EntityManager,
    locale: string,
    source: string,
    excludeServiceId?: string,
  ): Promise<string> {
    const baseSlug = SlugUtil.generate(source || 'service') || 'service';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await manager.findOne(ServiceTranslation, {
        where: { locale, slug: candidate },
      });

      if (!existing) return candidate;
      if (excludeServiceId && existing.service_id === excludeServiceId) return candidate;

      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

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
        const transEntities: ServiceTranslation[] = [];

        for (const t of translations) {
          const locale = t.locale.toLowerCase();
          const slugSource = (typeof t.slug === 'string' && t.slug.trim().length > 0)
            ? t.slug
            : (t.name || 'service');
          const ensuredSlug = await this.ensureUniqueTranslationSlug(manager, locale, slugSource);

          transEntities.push(manager.create(ServiceTranslation, {
            ...t,
            locale,
            slug: ensuredSlug,
            service_id: savedService.id,
            service: savedService,
          }));
        }

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

      const createdService = await manager.findOne(Service, {
        where: { id: savedService.id },
        relations: ['translations', 'items', 'items.translations', 'currency'],
        order: {
          items: {
            sortOrder: 'ASC',
          },
        },
      });

      if (!createdService) {
        throw new NotFoundException(`Service with ID ${savedService.id} not found`);
      }

      return createdService;
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

  async findOneBySlug(slug: string, locale?: string): Promise<Service> {
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedLocale = locale?.trim().toLowerCase();

    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translations')
      .leftJoinAndSelect('service.items', 'items')
      .leftJoinAndSelect('items.translations', 'itemTranslations')
      .leftJoinAndSelect('service.currency', 'currency')
      .where('service.isActive = :isActive', { isActive: true });

    if (normalizedLocale) {
      qb.andWhere(
        `EXISTS (
          SELECT 1
          FROM service_translations st
          WHERE st.service_id = service.id
            AND LOWER(st.slug) = :slug
            AND LOWER(st.locale) = :locale
        )`,
        { slug: normalizedSlug, locale: normalizedLocale },
      );
    } else {
      qb.andWhere(
        `EXISTS (
          SELECT 1
          FROM service_translations st
          WHERE st.service_id = service.id
            AND LOWER(st.slug) = :slug
        )`,
        { slug: normalizedSlug },
      );
    }

    qb.orderBy('items.sortOrder', 'ASC');

    const service = await qb.getOne();
    if (!service) {
      throw new NotFoundException(`Service with slug ${slug} not found`);
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
          const locale = t.locale.toLowerCase();
          const incomingSlug = typeof t.slug === 'string' ? t.slug.trim() : '';
          const fallbackSlug = existing?.slug || t.name || 'service';
          const slugSource = incomingSlug || fallbackSlug;
          const ensuredSlug = await this.ensureUniqueTranslationSlug(manager, locale, slugSource, id);

          if (existing) {
            await manager.update(ServiceTranslation, existing.id, { ...t, locale, slug: ensuredSlug });
          } else {
            await manager.save(
              ServiceTranslation,
              manager.create(ServiceTranslation, {
                ...t,
                locale,
                slug: ensuredSlug,
                service_id: id,
                service: { id } as Service,
              })
            );
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

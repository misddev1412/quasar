import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { SEOEntity } from '@backend/modules/seo/entities/seo.entity';
import { SEORepositoryInterface } from '@backend/modules/seo/interfaces/seo-repository.interface';
import type { AdminSeoListQueryDto, AdminSeoStatsDto } from '@backend/modules/seo/dto/seo.dto';

@Injectable()
export class SEORepository extends BaseRepository<SEOEntity> implements SEORepositoryInterface {
  constructor(
    @InjectRepository(SEOEntity)
    protected readonly repository: Repository<SEOEntity>
  ) {
    super(repository);
  }

  async findByPath(path: string): Promise<SEOEntity | null> {
    return this.repository.findOne({
      where: { 
        path,
        active: true,
        deletedAt: null
      }
    });
  }

  async existsByPath(path: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { path }
    });
    return count > 0;
  }

  async findAllPaginated(query: AdminSeoListQueryDto): Promise<{
    items: SEOEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repository.createQueryBuilder('seo')
      .where('seo.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere(
        '(LOWER(seo.title) LIKE :search OR LOWER(seo.path) LIKE :search OR LOWER(seo.description) LIKE :search OR LOWER(seo.keywords) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` }
      );
    }

    if (typeof query.active === 'boolean') {
      qb.andWhere('seo.active = :active', { active: query.active });
    }

    if (query.group) {
      qb.andWhere('seo.group = :group', { group: query.group });
    }

    const [items, total] = await qb
      .orderBy('seo.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findStats(): Promise<AdminSeoStatsDto> {
    const baseQb = this.repository.createQueryBuilder('seo').where('seo.deletedAt IS NULL');

    const [total, active, rawGroups] = await Promise.all([
      baseQb.clone().getCount(),
      baseQb.clone().andWhere('seo.active = :active', { active: true }).getCount(),
      baseQb.clone().select('COUNT(DISTINCT seo.group)', 'count').getRawOne<{ count: string }>(),
    ]);

    const groups = Number(rawGroups?.count ?? 0);

    return {
      total,
      active,
      inactive: Math.max(0, total - active),
      groups,
    };
  }
}

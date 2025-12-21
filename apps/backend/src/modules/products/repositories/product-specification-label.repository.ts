import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpecificationLabel } from '../entities/product-specification-label.entity';

export interface SearchSpecificationLabelsParams {
  page?: number;
  limit?: number;
  search?: string;
  groupName?: string;
  includeInactive?: boolean;
}

export interface CreateSpecificationLabelDto {
  label: string;
  groupName?: string;
  groupCode?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class ProductSpecificationLabelRepository {
  constructor(
    @InjectRepository(ProductSpecificationLabel)
    private readonly repository: Repository<ProductSpecificationLabel>,
  ) {}

  async search(params: SearchSpecificationLabelsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('label');

    if (params.search) {
      qb.andWhere('(label.label ILIKE :search OR label.groupName ILIKE :search)', {
        search: `%${params.search}%`,
      });
    }

    if (params.groupName) {
      qb.andWhere('label.groupName = :groupName', { groupName: params.groupName });
    }

    if (!params.includeInactive) {
      qb.andWhere('label.isActive = :isActive', { isActive: true });
    }

    qb.orderBy('label.groupName', 'ASC')
      .addOrderBy('label.sortOrder', 'ASC')
      .addOrderBy('label.label', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<ProductSpecificationLabel | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(input: CreateSpecificationLabelDto): Promise<ProductSpecificationLabel> {
    const resolvedGroupName = input.groupName?.trim() || 'General';
    const entity = this.repository.create({
      label: input.label.trim(),
      groupName: resolvedGroupName,
      groupCode: input.groupCode?.trim(),
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });

    return this.repository.save(entity);
  }

  async incrementUsage(id: string, amount = 1): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ProductSpecificationLabel)
      .set({ usageCount: () => `"usage_count" + ${Math.max(amount, 1)}` })
      .where('id = :id', { id })
      .execute();
  }
}

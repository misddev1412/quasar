import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { ComponentConfigEntity } from '../entities/component-config.entity';

@Injectable()
export class ComponentConfigRepository extends BaseRepository<ComponentConfigEntity> {
  constructor(
    @InjectRepository(ComponentConfigEntity)
    protected readonly repository: Repository<ComponentConfigEntity>,
  ) {
    super(repository);
  }

  async findByKey(componentKey: string): Promise<ComponentConfigEntity | null> {
    return this.repository.findOne({
      where: {
        componentKey,
      },
      relations: ['children'],
    });
  }

  async findChildren(parentId: string, onlyEnabled = true): Promise<ComponentConfigEntity[]> {
    const qb = this.repository
      .createQueryBuilder('component')
      .leftJoinAndSelect('component.children', 'children')
      .where('component.parentId = :parentId', { parentId })
      .andWhere('component.deletedAt IS NULL')
      .orderBy('component.position', 'ASC')
      .addOrderBy('component.createdAt', 'ASC');

    if (onlyEnabled) {
      qb.andWhere('component.isEnabled = :isEnabled', { isEnabled: true });
    }

    return qb.getMany();
  }

  async findRoots(onlyEnabled = true): Promise<ComponentConfigEntity[]> {
    const qb = this.repository
      .createQueryBuilder('component')
      .leftJoinAndSelect('component.children', 'children')
      .where('component.parentId IS NULL')
      .andWhere('component.deletedAt IS NULL')
      .orderBy('component.position', 'ASC')
      .addOrderBy('component.createdAt', 'ASC');

    if (onlyEnabled) {
      qb.andWhere('component.isEnabled = :isEnabled', { isEnabled: true });
    }

    return qb.getMany();
  }

  async findMaxPosition(parentId?: string | null): Promise<number> {
    const qb = this.repository
      .createQueryBuilder('component')
      .select('COALESCE(MAX(component.position), 0)', 'max')
      .where('component.deletedAt IS NULL');

    if (parentId) {
      qb.andWhere('component.parentId = :parentId', { parentId });
    } else {
      qb.andWhere('component.parentId IS NULL');
    }

    const result = await qb.getRawOne<{ max: number }>();
    return result?.max ?? 0;
  }
}

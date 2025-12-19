import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { SectionEntity } from '../entities/section.entity';

@Injectable()
export class SectionRepository extends BaseRepository<SectionEntity> {
  constructor(
    @InjectRepository(SectionEntity)
    protected readonly repository: Repository<SectionEntity>,
  ) {
    super(repository);
  }

  async findEnabledByPage(page: string): Promise<SectionEntity[]> {
    return this.repository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation')
      .where('section.page = :page', { page })
      .andWhere('section.isEnabled = :isEnabled', { isEnabled: true })
      .andWhere('section.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .getMany();
  }

  async findAllByPage(page: string): Promise<SectionEntity[]> {
    return this.repository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation')
      .leftJoinAndSelect('section.components', 'components')
      .where('section.page = :page', { page })
      .andWhere('section.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .addOrderBy('section.createdAt', 'ASC')
      .getMany();
  }

  async findAll(): Promise<SectionEntity[]> {
    return this.repository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation')
      .leftJoinAndSelect('section.components', 'components')
      .where('section.deletedAt IS NULL')
      .orderBy('section.page', 'ASC')
      .addOrderBy('section.position', 'ASC')
      .addOrderBy('section.createdAt', 'ASC')
      .getMany();
  }

  async findMaxPosition(page: string): Promise<number> {
    const { max } = await this.repository
      .createQueryBuilder('section')
      .select('MAX(section.position)', 'max')
      .where('section.page = :page', { page })
      .andWhere('section.deletedAt IS NULL')
      .getRawOne<{ max: number | null }>();

    return max ?? 0;
  }

}

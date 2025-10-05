import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { SectionTranslationEntity } from '../entities/section-translation.entity';

@Injectable()
export class SectionTranslationRepository extends BaseRepository<SectionTranslationEntity> {
  constructor(
    @InjectRepository(SectionTranslationEntity)
    protected readonly repository: Repository<SectionTranslationEntity>,
  ) {
    super(repository);
  }

  async findBySectionAndLocale(sectionId: string, locale: string): Promise<SectionTranslationEntity | null> {
    return this.repository.findOne({
      where: {
        sectionId,
        locale,
      },
    });
  }

  async upsertTranslation(sectionId: string, locale: string, payload: Partial<SectionTranslationEntity>) {
    const existing = await this.findBySectionAndLocale(sectionId, locale);
    if (existing) {
      return this.repository.save({ ...existing, ...payload });
    }
    return this.repository.save(
      this.repository.create({
        sectionId,
        locale,
        ...payload,
      }),
    );
  }

  async deleteBySection(sectionId: string): Promise<void> {
    await this.repository.delete({ sectionId });
  }
}

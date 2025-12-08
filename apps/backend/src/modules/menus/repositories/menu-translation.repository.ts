import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTranslationEntity } from '../entities/menu-translation.entity';

@Injectable()
export class MenuTranslationRepository {
  constructor(
    @InjectRepository(MenuTranslationEntity)
    private readonly menuTranslationRepository: Repository<MenuTranslationEntity>,
  ) {}

  async findByMenuId(menuId: string): Promise<MenuTranslationEntity[]> {
    return this.menuTranslationRepository.find({
      where: { menuId },
    });
  }

  async findByMenuIdAndLocale(menuId: string, locale: string): Promise<MenuTranslationEntity | null> {
    return this.menuTranslationRepository.findOne({
      where: { menuId, locale },
    });
  }

  async create(translationData: Partial<MenuTranslationEntity>): Promise<MenuTranslationEntity> {
    const translation = this.menuTranslationRepository.create(translationData);
    return this.menuTranslationRepository.save(translation);
  }

  async update(id: string, translationData: Partial<MenuTranslationEntity>): Promise<MenuTranslationEntity | null> {
    await this.menuTranslationRepository.update(id, translationData);
    return this.menuTranslationRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.menuTranslationRepository.delete(id);
  }

  async deleteByMenuId(menuId: string): Promise<void> {
    await this.menuTranslationRepository.delete({ menuId });
  }

  async upsert(
    menuId: string,
    locale: string,
    translationData: Partial<MenuTranslationEntity>,
  ): Promise<MenuTranslationEntity> {
    const existing = await this.findByMenuIdAndLocale(menuId, locale);

    if (existing) {
      await this.menuTranslationRepository.update(existing.id, translationData);
      return this.findByMenuIdAndLocale(menuId, locale);
    } else {
      return this.create({
        menuId,
        locale,
        ...translationData,
      });
    }
  }
}
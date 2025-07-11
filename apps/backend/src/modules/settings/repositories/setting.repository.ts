import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BaseRepository } from '@shared';
import { SettingEntity } from '../entities/setting.entity';
import { SettingRepositoryInterface } from '../interfaces/setting-repository.interface';

@Injectable()
export class SettingRepository extends BaseRepository<SettingEntity> implements SettingRepositoryInterface {
  constructor(
    @InjectRepository(SettingEntity)
    protected readonly repository: Repository<SettingEntity>
  ) {
    super(repository);
  }

  async findByKey(key: string): Promise<SettingEntity | null> {
    return this.repository.findOne({
      where: { 
        key,
        deletedAt: null 
      }
    });
  }

  async existsByKey(key: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { 
        key,
        deletedAt: null 
      }
    });
    return count > 0;
  }

  async findByGroup(group: string): Promise<SettingEntity[]> {
    return this.repository.find({
      where: { 
        group,
        deletedAt: null 
      }
    });
  }

  async findPublicSettings(): Promise<SettingEntity[]> {
    return this.repository.find({
      where: { 
        isPublic: true,
        deletedAt: null 
      }
    });
  }

  async findByKeys(keys: string[]): Promise<SettingEntity[]> {
    if (!keys || keys.length === 0) return [];
    
    return this.repository.find({
      where: { 
        key: In(keys),
        deletedAt: null 
      }
    });
  }

  /**
   * @deprecated use findAll instead
   */
  async find(): Promise<SettingEntity[]> {
    return this.findAll();
  }

  async findAll(): Promise<SettingEntity[]> {
    return this.repository.find({
      where: {
        deletedAt: null
      }
    });
  }
} 
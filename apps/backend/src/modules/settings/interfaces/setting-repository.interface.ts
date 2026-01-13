import { IBaseRepository } from '@shared';
import { SettingEntity } from '../entities/setting.entity';

export interface SettingRepositoryInterface extends IBaseRepository<SettingEntity> {
  
  findByKey(key: string): Promise<SettingEntity | null>;

  
  existsByKey(key: string): Promise<boolean>;

  
  findByGroup(group: string): Promise<SettingEntity[]>;

  
  findPublicSettings(): Promise<SettingEntity[]>;

  
  findByKeys(keys: string[]): Promise<SettingEntity[]>;

  
  find(): Promise<SettingEntity[]>;
} 
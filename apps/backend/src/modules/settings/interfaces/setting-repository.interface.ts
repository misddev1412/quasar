import { IBaseRepository } from '@shared';
import { SettingEntity } from '../entities/setting.entity';

export interface SettingRepositoryInterface extends IBaseRepository<SettingEntity> {
  /**
   * 通过键查找设置
   * @param key 设置键名
   */
  findByKey(key: string): Promise<SettingEntity | null>;

  /**
   * 检查设置是否存在
   * @param key 设置键名
   */
  existsByKey(key: string): Promise<boolean>;

  /**
   * 通过组获取设置
   * @param group 设置组名
   */
  findByGroup(group: string): Promise<SettingEntity[]>;

  /**
   * 获取公开的设置
   */
  findPublicSettings(): Promise<SettingEntity[]>;

  /**
   * 批量获取设置
   * @param keys 设置键名数组
   */
  findByKeys(keys: string[]): Promise<SettingEntity[]>;

  /**
   * 获取所有设置
   */
  find(): Promise<SettingEntity[]>;
} 
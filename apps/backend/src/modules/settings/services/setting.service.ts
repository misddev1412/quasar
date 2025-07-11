import { Injectable } from '@nestjs/common';
import { SettingRepository } from '../repositories/setting.repository';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingsDto } from '../dto/setting.dto';
import { SettingEntity } from '../entities/setting.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';

@Injectable()
export class SettingService {
  constructor(
    private readonly settingRepository: SettingRepository,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * 创建新设置
   */
  async create(createSettingDto: CreateSettingDto): Promise<SettingEntity> {
    // 检查键是否已存在
    const exists = await this.settingRepository.existsByKey(createSettingDto.key);
    if (exists) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.CREATE,
        ErrorLevelCode.VALIDATION,
        '设置键已存在'
      );
    }

    const settingEntity = this.settingRepository.create(createSettingDto);
    return this.settingRepository.save(settingEntity);
  }

  /**
   * 批量创建或更新设置
   */
  async bulkUpdate(bulkUpdateDto: BulkUpdateSettingsDto): Promise<boolean> {
    if (!bulkUpdateDto.settings || bulkUpdateDto.settings.length === 0) {
      return false;
    }

    const keys = bulkUpdateDto.settings.map(s => s.key);
    const existingSettings = await this.settingRepository.findByKeys(keys);
    
    // 创建键值映射以便快速查找
    const keyToSettingMap = new Map<string, SettingEntity>();
    existingSettings.forEach(setting => {
      keyToSettingMap.set(setting.key, setting);
    });

    // 创建或更新每个设置
    for (const settingData of bulkUpdateDto.settings) {
      const existingSetting = keyToSettingMap.get(settingData.key);
      
      if (existingSetting) {
        // 更新现有设置
        await this.settingRepository.update(existingSetting.id, {
          value: settingData.value
        });
      } else {
        // 创建新设置
        await this.create({
          key: settingData.key,
          value: settingData.value,
          type: 'string',
        });
      }
    }

    return true;
  }

  /**
   * 获取所有设置
   */
  async findAll(): Promise<SettingEntity[]> {
    return this.settingRepository.find();
  }

  /**
   * 通过ID获取设置
   */
  async findById(id: string): Promise<SettingEntity> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        '设置未找到'
      );
    }
    return setting;
  }

  /**
   * 通过键获取设置
   */
  async findByKey(key: string): Promise<SettingEntity> {
    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        '设置未找到'
      );
    }
    return setting;
  }

  /**
   * 通过组获取设置
   */
  async findByGroup(group: string): Promise<SettingEntity[]> {
    return this.settingRepository.findByGroup(group);
  }

  /**
   * 获取公开设置
   */
  async findPublicSettings(): Promise<SettingEntity[]> {
    return this.settingRepository.findPublicSettings();
  }

  /**
   * 更新设置
   */
  async update(id: string, updateSettingDto: UpdateSettingDto): Promise<SettingEntity> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.UPDATE,
        ErrorLevelCode.NOT_FOUND,
        '设置未找到'
      );
    }

    return this.settingRepository.update(id, updateSettingDto);
  }

  /**
   * 删除设置
   */
  async delete(id: string): Promise<boolean> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.DELETE,
        ErrorLevelCode.NOT_FOUND,
        '设置未找到'
      );
    }

    return this.settingRepository.softDelete(id);
  }
} 
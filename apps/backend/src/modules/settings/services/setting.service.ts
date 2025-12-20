import { Injectable } from '@nestjs/common';
import { SettingRepository } from '../repositories/setting.repository';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingsDto } from '../dto/setting.dto';
import { SettingEntity } from '../entities/setting.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { TranslationService } from '../../translation/services/translation.service';
import { SupportedLocale } from '@shared';
import { DEFAULT_LOCALE } from '../../shared/utils/locale.util';
import * as bcrypt from 'bcryptjs';

const MAINTENANCE_PASSWORD_KEY = 'storefront.maintenance_password';

@Injectable()
export class SettingService {
  constructor(
    private readonly settingRepository: SettingRepository,
    private readonly responseService: ResponseService,
    private readonly translationService: TranslationService,
  ) {}

  private async translateMessage(
    key: string,
    locale: SupportedLocale | undefined,
    fallback: string
  ): Promise<string> {
    const resolvedLocale = locale ?? DEFAULT_LOCALE;
    return this.translationService.getTranslation(key, resolvedLocale, fallback);
  }

  /**
   * 创建新设置
   */
  async create(createSettingDto: CreateSettingDto, locale?: SupportedLocale): Promise<SettingEntity> {
    // 检查键是否已存在
    const exists = await this.settingRepository.existsByKey(createSettingDto.key);
    if (exists) {
      const message = await this.translateMessage(
        'settings.errors.key_exists',
        locale,
        'Setting key already exists'
      );

      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.CREATE,
        ErrorLevelCode.VALIDATION,
        message
      );
    }

    const normalizedValue = await this.normalizeValueForStorage(
      createSettingDto.key,
      createSettingDto.value ?? null
    );

    const settingEntity = this.settingRepository.create({
      ...createSettingDto,
      value: normalizedValue ?? undefined,
    });
    return this.settingRepository.save(settingEntity);
  }

  /**
   * 批量创建或更新设置
   */
  async bulkUpdate(bulkUpdateDto: BulkUpdateSettingsDto, locale?: SupportedLocale): Promise<boolean> {
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
      const normalizedValue = await this.normalizeValueForStorage(
        settingData.key,
        settingData.value ?? null
      );
      
      if (existingSetting) {
        // 更新现有设置
        await this.settingRepository.update(existingSetting.id, {
          value: normalizedValue
        });
      } else {
        // 创建新设置
        await this.create({
          key: settingData.key,
          value: normalizedValue ?? undefined,
          type: 'string',
        }, locale);
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
  async findById(id: string, locale?: SupportedLocale): Promise<SettingEntity> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      const message = await this.translateMessage(
        'settings.errors.not_found',
        locale,
        'Setting not found'
      );

      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        message
      );
    }
    return setting;
  }

  /**
   * 通过键获取设置
   */
  async findByKey(key: string, locale?: SupportedLocale): Promise<SettingEntity> {
    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      const message = await this.translateMessage(
        'settings.errors.not_found',
        locale,
        'Setting not found'
      );

      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        message
      );
    }
    return setting;
  }

  /**
   * Retrieve a setting value without throwing when missing
   */
  async getValueByKey(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findByKey(key);
    return setting?.value ?? null;
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
  async update(id: string, updateSettingDto: UpdateSettingDto, locale?: SupportedLocale): Promise<SettingEntity> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      const message = await this.translateMessage(
        'settings.errors.not_found',
        locale,
        'Setting not found'
      );

      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.UPDATE,
        ErrorLevelCode.NOT_FOUND,
        message
      );
    }

    const dataToUpdate: UpdateSettingDto = { ...updateSettingDto };

    if (Object.prototype.hasOwnProperty.call(updateSettingDto, 'value')) {
      dataToUpdate.value = await this.normalizeValueForStorage(
        setting.key,
        updateSettingDto.value ?? null
      ) ?? undefined;
    }

    return this.settingRepository.update(id, dataToUpdate);
  }

  /**
   * 删除设置
   */
  async delete(id: string, locale?: SupportedLocale): Promise<boolean> {
    const setting = await this.settingRepository.findById(id);
    if (!setting) {
      const message = await this.translateMessage(
        'settings.errors.not_found',
        locale,
        'Setting not found'
      );

      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.DELETE,
        ErrorLevelCode.NOT_FOUND,
        message
      );
    }

    return this.settingRepository.softDelete(id);
  }

  /**
   * 分页获取设置
   */
  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    group?: string;
  }): Promise<{ data: SettingEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    const result = await this.settingRepository.findPaginated(params);
    const totalPages = Math.ceil(result.total / params.limit);

    return {
      ...result,
      page: params.page,
      limit: params.limit,
      totalPages
    };
  }

  private async normalizeValueForStorage(key: string, rawValue: string | null): Promise<string | null> {
    if (key === MAINTENANCE_PASSWORD_KEY) {
      if (!rawValue) {
        return '';
      }

      return bcrypt.hash(rawValue, 10);
    }

    return rawValue;
  }
} 

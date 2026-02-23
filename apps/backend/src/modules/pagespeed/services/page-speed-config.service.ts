import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';

interface UpdatePageSpeedConfigInput {
  apiKey?: string;
}

@Injectable()
export class PageSpeedConfigService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async getConfig(): Promise<{ apiKey: string; hasApiKey: boolean }> {
    const apiKey = await this.getSettingValue('analytics.pagespeed_api_key');

    return {
      apiKey,
      hasApiKey: !!apiKey,
    };
  }

  async updateConfig(input: UpdatePageSpeedConfigInput): Promise<void> {
    if (input.apiKey === undefined) {
      return;
    }

    await this.upsertSetting(
      'analytics.pagespeed_api_key',
      input.apiKey.trim(),
      'string',
      'analytics',
      false,
      'Google PageSpeed Insights API key',
    );
  }

  async getApiKey(): Promise<string> {
    return this.getSettingValue('analytics.pagespeed_api_key');
  }

  private async getSettingValue(key: string): Promise<string> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting?.value?.trim() || '';
  }

  private async upsertSetting(
    key: string,
    value: string,
    type: SettingEntity['type'],
    group: string,
    isPublic: boolean,
    description: string,
  ): Promise<void> {
    const existing = await this.settingRepository.findOne({ where: { key } });

    if (existing) {
      existing.value = value;
      existing.type = type;
      existing.group = group;
      existing.isPublic = isPublic;
      existing.description = description;
      await this.settingRepository.save(existing);
      return;
    }

    const created = this.settingRepository.create({
      key,
      value,
      type,
      group,
      isPublic,
      description,
    });

    await this.settingRepository.save(created);
  }
}

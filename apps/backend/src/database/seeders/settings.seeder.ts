import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '../../modules/settings/entities/setting.entity';

@Injectable()
export class SettingsSeeder {
  private readonly logger = new Logger(SettingsSeeder.name);

  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('开始播种设置...');

    const defaultSettings = [
      {
        key: 'site.name',
        value: 'Quasar Admin',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: '站点名称',
      },
      {
        key: 'site.description',
        value: 'Quasar Admin Dashboard',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: '站点描述',
      },
      {
        key: 'site.logo',
        value: '/assets/logo.png',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: '站点logo路径',
      },
      {
        key: 'site.favicon',
        value: '/favicon.ico',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: '站点favicon路径',
      },
      {
        key: 'admin.theme',
        value: 'light',
        type: 'string' as const,
        group: 'appearance',
        isPublic: false,
        description: '管理员主题',
      },
      {
        key: 'admin.sidebar_collapsed',
        value: 'false',
        type: 'boolean' as const,
        group: 'appearance',
        isPublic: false,
        description: '侧边栏是否折叠',
      },
      {
        key: 'admin.items_per_page',
        value: '10',
        type: 'number' as const,
        group: 'pagination',
        isPublic: false,
        description: '每页显示条目数',
      }
    ];

    for (const settingData of defaultSettings) {
      const existing = await this.settingRepository.findOne({ where: { key: settingData.key } });
      
      if (!existing) {
        const setting = this.settingRepository.create(settingData);
        await this.settingRepository.save(setting);
        this.logger.log(`创建设置: ${settingData.key}`);
      } else {
        this.logger.log(`设置已存在: ${settingData.key}`);
      }
    }

    this.logger.log('设置播种完成');
  }
} 
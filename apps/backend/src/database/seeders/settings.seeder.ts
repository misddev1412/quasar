import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '../../modules/settings/entities/setting.entity';
import { DEFAULT_FOOTER_CONFIG } from '@shared/types/footer.types';
import { DEFAULT_FLOATING_WIDGET_ACTIONS } from '@shared/types/floating-widget.types';

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
        value: '',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: 'Main website logo',
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
        key: 'site.footer_logo',
        value: '',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: 'Footer logo URL',
      },
      {
        key: 'site.og_image',
        value: '',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: 'Default social media sharing image',
      },
      {
        key: 'site.login_background',
        value: '',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: 'Login page background image',
      },
      {
        key: 'storefront.footer_config',
        value: JSON.stringify(DEFAULT_FOOTER_CONFIG),
        type: 'json' as const,
        group: 'storefront-ui',
        isPublic: true,
        description: 'Storefront footer configuration',
      },
      {
        key: 'storefront.float_icons',
        value: JSON.stringify(DEFAULT_FLOATING_WIDGET_ACTIONS),
        type: 'json' as const,
        group: 'storefront-ui',
        isPublic: true,
        description: 'Storefront floating quick actions',
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
      },
      {
        key: 'phone.default_country',
        value: 'VN',
        type: 'string' as const,
        group: 'general',
        isPublic: true,
        description: 'Default country for phone input fields',
      },
      // File Storage Configuration
      {
        key: 'storage.provider',
        value: 'local',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'Storage provider (local, s3)',
      },
      {
        key: 'storage.local.upload_path',
        value: 'uploads',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'Local upload directory path',
      },
      {
        key: 'storage.local.base_url',
        value: 'http://localhost:3000',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'Base URL for local file access',
      },
      // S3 Configuration
      {
        key: 'storage.s3.access_key',
        value: '',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'AWS S3 Access Key ID',
      },
      {
        key: 'storage.s3.secret_key',
        value: '',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'AWS S3 Secret Access Key',
      },
      {
        key: 'storage.s3.region',
        value: 'us-east-1',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'AWS S3 Region',
      },
      {
        key: 'storage.s3.bucket',
        value: '',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'AWS S3 Bucket Name',
      },
      {
        key: 'storage.s3.endpoint',
        value: '',
        type: 'string' as const,
        group: 'storage',
        isPublic: false,
        description: 'Custom S3 Endpoint (optional, for S3-compatible services)',
      },
      {
        key: 'storage.s3.force_path_style',
        value: 'false',
        type: 'boolean' as const,
        group: 'storage',
        isPublic: false,
        description: 'Force path-style URLs for S3-compatible services',
      },
      // File Upload Configuration
      {
        key: 'storage.max_file_size',
        value: '10485760',
        type: 'number' as const,
        group: 'storage',
        isPublic: false,
        description: 'Maximum file size in bytes (default: 10MB)',
      },
      {
        key: 'storage.allowed_file_types',
        value: '["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"]',
        type: 'json' as const,
        group: 'storage',
        isPublic: false,
        description: 'Allowed file MIME types for upload',
      },
      // Analytics Configuration
      {
        key: 'analytics.google_analytics_enabled',
        value: 'false',
        type: 'boolean' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Enable Google Analytics tracking',
      },
      {
        key: 'analytics.google_analytics_id',
        value: '',
        type: 'string' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)',
      },
      {
        key: 'analytics.mixpanel_enabled',
        value: 'false',
        type: 'boolean' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Enable Mixpanel tracking',
      },
      {
        key: 'analytics.mixpanel_token',
        value: '',
        type: 'string' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Mixpanel project token',
      },
      {
        key: 'analytics.mixpanel_api_host',
        value: 'api.mixpanel.com',
        type: 'string' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Mixpanel API host (default: api.mixpanel.com)',
      },
      {
        key: 'analytics.track_admin_actions',
        value: 'false',
        type: 'boolean' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Track admin panel actions in analytics',
      },
      {
        key: 'analytics.anonymize_ip',
        value: 'true',
        type: 'boolean' as const,
        group: 'analytics',
        isPublic: false,
        description: 'Anonymize IP addresses in analytics tracking',
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

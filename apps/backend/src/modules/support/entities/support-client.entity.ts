import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@shared';

export enum SupportClientType {
  MESSENGER = 'MESSENGER',
  ZALO = 'ZALO',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  VIBER = 'VIBER',
  SKYPE = 'SKYPE',
  LINE = 'LINE',
  WECHAT = 'WECHAT',
  KAKAOTALK = 'KAKAOTALK',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  CUSTOM = 'CUSTOM',
}

export enum WidgetPosition {
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  TOP_LEFT = 'TOP_LEFT',
  CENTER_RIGHT = 'CENTER_RIGHT',
  CENTER_LEFT = 'CENTER_LEFT',
}

export enum WidgetTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  CUSTOM = 'CUSTOM',
}

export interface ChatConfiguration {
  appId?: string;
  pageId?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  accessToken?: string;
  phoneNumber?: string;
  email?: string;
  customScript?: string;
  widgetId?: string;
  [key: string]: any; // Allow additional configuration fields
}

export interface WidgetSettings {
  position: WidgetPosition;
  theme: WidgetTheme;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  iconUrl?: string;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  autoOpen: boolean;
  responseTime?: string;
  workingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

@Entity('support_clients')
export class SupportClient extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: SupportClientType,
    nullable: false,
  })
  @Index()
  type: SupportClientType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false, nullable: false })
  @Index()
  isDefault: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0, nullable: false })
  @Index()
  sortOrder: number;

  @Column({
    type: 'json',
    nullable: false,
    comment: 'Chat platform specific configuration (API keys, tokens, etc.)',
  })
  configuration: ChatConfiguration;

  @Column({
    type: 'json',
    nullable: false,
    comment: 'Widget display and behavior settings',
  })
  widgetSettings: WidgetSettings;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl?: string;

  @Column({ name: 'target_audience', type: 'json', nullable: true })
  targetAudience?: {
    countries?: string[];
    languages?: string[];
    deviceTypes?: string[];
    pages?: string[];
  };

  @Column({ name: 'schedule_enabled', type: 'boolean', default: false, nullable: false })
  scheduleEnabled: boolean;

  @Column({ name: 'schedule_start', type: 'timestamp', nullable: true })
  scheduleStart?: Date;

  @Column({ name: 'schedule_end', type: 'timestamp', nullable: true })
  scheduleEnd?: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Helper methods
  isAvailableNow(): boolean {
    if (!this.scheduleEnabled) {
      return true;
    }

    const now = new Date();
    if (this.scheduleStart && now < this.scheduleStart) {
      return false;
    }

    if (this.scheduleEnd && now > this.scheduleEnd) {
      return false;
    }

    // Check working hours if configured
    if (this.widgetSettings.workingHours) {
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const workingHours = this.widgetSettings.workingHours[dayOfWeek as keyof typeof this.widgetSettings.workingHours];

      if (workingHours) {
        const [startTime, endTime] = workingHours.split('-');
        const currentTime = now.toTimeString().slice(0, 5);

        return currentTime >= startTime && currentTime <= endTime;
      }
    }

    return true;
  }

  isTargeted(userContext?: {
    country?: string;
    language?: string;
    deviceType?: string;
    currentPage?: string;
  }): boolean {
    if (!this.targetAudience || !userContext) {
      return true; // No targeting means show to everyone
    }

    const { country, language, deviceType, currentPage } = userContext;

    if (this.targetAudience.countries && country) {
      if (!this.targetAudience.countries.includes(country)) {
        return false;
      }
    }

    if (this.targetAudience.languages && language) {
      if (!this.targetAudience.languages.includes(language)) {
        return false;
      }
    }

    if (this.targetAudience.deviceTypes && deviceType) {
      if (!this.targetAudience.deviceTypes.includes(deviceType)) {
        return false;
      }
    }

    if (this.targetAudience.pages && currentPage) {
      if (!this.targetAudience.pages.some(page => currentPage.includes(page))) {
        return false;
      }
    }

    return true;
  }

  getWidgetScript(): string {
    const config = this.configuration;
    const widget = this.widgetSettings;

    switch (this.type) {
      case SupportClientType.MESSENGER:
        return `
          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://connect.facebook.net/${widget.primaryColor === 'dark' ? 'vi_VN' : 'en_US'}/sdk/xfbml.customerchat.js';
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
        `;

      case SupportClientType.ZALO:
        return `
          (function() {
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://sp.zalo.me/plugins/sdk.js';
            s1.charset = 'UTF-8';
            s0.parentNode.insertBefore(s1, s0);
          })();
        `;

      case SupportClientType.WHATSAPP:
        return `
          (function() {
            var url = 'https://wa.me/${config.phoneNumber || ''}';
            var link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.textContent = '${widget.title}';
            link.style.cssText = \`
              position: fixed;
              ${this.getWidgetPositionStyle(widget.position)};
              background-color: ${widget.primaryColor};
              color: ${widget.textColor};
              padding: 12px 24px;
              border-radius: 25px;
              text-decoration: none;
              font-weight: bold;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 8px;
            \`;
            if (${widget.iconUrl ? 'true' : 'false'}) {
              var img = document.createElement('img');
              img.src = '${widget.iconUrl}';
              img.style.width = '24px';
              img.style.height = '24px';
              link.insertBefore(img, link.firstChild);
            }
            document.body.appendChild(link);
          })();
        `;

      default:
        return config.customScript || '';
    }
  }

  private getWidgetPositionStyle(position: WidgetPosition): string {
    const styles = {
      [WidgetPosition.BOTTOM_RIGHT]: 'bottom: 20px; right: 20px;',
      [WidgetPosition.BOTTOM_LEFT]: 'bottom: 20px; left: 20px;',
      [WidgetPosition.TOP_RIGHT]: 'top: 20px; right: 20px;',
      [WidgetPosition.TOP_LEFT]: 'top: 20px; left: 20px;',
      [WidgetPosition.CENTER_RIGHT]: 'top: 50%; right: 20px; transform: translateY(-50%);',
      [WidgetPosition.CENTER_LEFT]: 'top: 50%; left: 20px; transform: translateY(-50%);',
    };
    return styles[position] || styles[WidgetPosition.BOTTOM_RIGHT];
  }

  getDefaultConfiguration(): ChatConfiguration {
    const defaults: Record<SupportClientType, Partial<ChatConfiguration>> = {
      [SupportClientType.MESSENGER]: {
        appId: '',
        pageId: '',
      },
      [SupportClientType.ZALO]: {
        appId: '',
        apiKey: '',
      },
      [SupportClientType.WHATSAPP]: {
        phoneNumber: '',
      },
      [SupportClientType.TELEGRAM]: {
        botUsername: '',
      },
      [SupportClientType.EMAIL]: {
        email: '',
        subject: '',
      },
      [SupportClientType.PHONE]: {
        phoneNumber: '',
      },
      [SupportClientType.VIBER]: {
        phoneNumber: '',
      },
      [SupportClientType.SKYPE]: {
        skypeId: '',
      },
      [SupportClientType.LINE]: {
        lineId: '',
      },
      [SupportClientType.WECHAT]: {
        wechatId: '',
      },
      [SupportClientType.KAKAOTALK]: {
        kakaoId: '',
      },
      [SupportClientType.CUSTOM]: {
        customScript: '',
      },
    };

    return {
      ...defaults[this.type],
    } as ChatConfiguration;
  }

  getDefaultWidgetSettings(): WidgetSettings {
    return {
      position: WidgetPosition.BOTTOM_RIGHT,
      theme: WidgetTheme.LIGHT,
      primaryColor: '#0084ff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      title: this.name,
      subtitle: 'Chat with us',
      welcomeMessage: 'Hello! How can we help you today?',
      showOnMobile: true,
      showOnDesktop: true,
      autoOpen: false,
      responseTime: 'Usually replies within minutes',
    };
  }
}
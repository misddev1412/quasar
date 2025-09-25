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

export interface SupportClient {
  id: string;
  name: string;
  type: SupportClientType;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  iconUrl?: string;
  configuration: Record<string, any>;
  widgetSettings: Record<string, any>;
  targetAudience?: Record<string, any>;
  scheduleEnabled: boolean;
  scheduleStart?: Date;
  scheduleEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}
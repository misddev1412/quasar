import { trpc } from '../utils/trpc';
import { FooterConfig, createFooterConfig } from '@shared/types/footer.types';

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  group: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useSettings = () => {
  const { data, isLoading, error } = trpc.settings.getPublicSettings.useQuery();

  const settings = (data as any)?.data || [];

  const getSetting = (key: string, defaultValue: string = ''): string => {
    const setting = settings.find((s: Setting) => s.key === key);
    if (!setting) return defaultValue;

    // For boolean type, return the actual value (could be 'true' or 'false')
    // Don't fallback to 'false' if value exists
    if (setting.type === 'boolean') {
      // If value is explicitly set, return it; otherwise return defaultValue
      if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
        return setting.value;
      }
      return defaultValue;
    }

    // For other types
    return setting.value || defaultValue;
  };

  const getSettingAsBoolean = (key: string, defaultValue: boolean = false): boolean => {
    const value = getSetting(key, defaultValue.toString());
    return value === 'true' || value === '1';
  };

  const getSettingAsNumber = (key: string, defaultValue: number = 0): number => {
    const value = getSetting(key, defaultValue.toString());
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  const getSettingAsJson = <T>(key: string, defaultValue: T): T => {
    const rawValue = getSetting(key, '');
    if (!rawValue) {
      return defaultValue;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON setting "${key}"`, error);
      return defaultValue;
    }
  };

  const getFooterConfig = (): FooterConfig => {
    const parsed = getSettingAsJson<Partial<FooterConfig>>('storefront.footer_config', {});
    return createFooterConfig(parsed);
  };

  const getSiteLogo = (): string => {
    return getSetting('site.logo', '');
  };

  const getSiteFavicon = (): string => {
    return getSetting('site.favicon', '');
  };

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getSettingAsBoolean,
    getSettingAsNumber,
    getSettingAsJson,
    getSiteLogo,
    getSiteFavicon,
    getFooterConfig,
  };
};

import { trpc } from '../utils/trpc';

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

    // Convert value based on type
    switch (setting.type) {
      case 'number':
        return setting.value || defaultValue;
      case 'boolean':
        return setting.value || 'false';
      default:
        return setting.value || defaultValue;
    }
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

  const getSiteLogo = (): string => {
    return getSetting('site.logo', '');
  };

  const getSiteFavicon = (): string => {
    return getSetting('site.favicon', '');
  };

  const getFooterLogo = (): string => {
    return getSetting('site.footer_logo', '');
  };

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getSettingAsBoolean,
    getSettingAsNumber,
    getSiteLogo,
    getSiteFavicon,
    getFooterLogo,
  };
};
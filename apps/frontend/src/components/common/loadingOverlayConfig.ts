export interface LoadingOverlayConfig {
  enabled: boolean;
  title: string;
  message: string;
  showLogo: boolean;
  backgroundColor: string;
  accentColor: string;
}

interface ResolveLoadingOverlayConfigOptions {
  isSettingsLoading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
}

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const normalizeColor = (value: string, fallback: string): string => {
  const normalized = value.trim();
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : fallback;
};

export const resolveLoadingOverlayConfig = ({
  isSettingsLoading,
  getSetting,
}: ResolveLoadingOverlayConfigOptions): LoadingOverlayConfig => ({
  enabled: !isSettingsLoading && getSetting('storefront.loading_overlay_enabled', 'false') === 'true',
  title: getSetting('storefront.loading_overlay_title', '').trim(),
  message: getSetting('storefront.loading_overlay_message', '').trim(),
  showLogo: getSetting('storefront.loading_overlay_show_logo', 'true') === 'true',
  backgroundColor: normalizeColor(getSetting('storefront.loading_overlay_background_color', ''), ''),
  accentColor: normalizeColor(
    getSetting('storefront.loading_overlay_accent_color', '#3b82f6'),
    '#3b82f6',
  ),
});

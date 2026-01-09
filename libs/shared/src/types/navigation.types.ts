export type MainMenuItemSize = 'compact' | 'comfortable' | 'spacious';

export interface MainMenuThemeColors {
  light: string;
  dark: string;
}

export type MainMenuItemWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export type MainMenuItemTransform = 'normal' | 'uppercase' | 'capitalize';

export interface MainMenuConfig extends Record<string, unknown> {
  backgroundColor: MainMenuThemeColors;
  textColor: MainMenuThemeColors;
  burgerMenuColor: MainMenuThemeColors;
  itemSize: MainMenuItemSize;
  itemWeight: MainMenuItemWeight;
  itemTransform: MainMenuItemTransform;
  paddingTop?: string;
  paddingBottom?: string;
}

export const MAIN_MENU_ITEM_SIZES: MainMenuItemSize[] = ['compact', 'comfortable', 'spacious'];

export const MAIN_MENU_ITEM_SIZE_LABELS: Record<MainMenuItemSize, string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
};

export const MAIN_MENU_ITEM_WEIGHTS: MainMenuItemWeight[] = ['normal', 'medium', 'semibold', 'bold'];

export const MAIN_MENU_ITEM_WEIGHT_LABELS: Record<MainMenuItemWeight, string> = {
  normal: 'Normal',
  medium: 'Medium',
  semibold: 'Semi-bold',
  bold: 'Bold',
};

export const MAIN_MENU_ITEM_TRANSFORMS: MainMenuItemTransform[] = ['normal', 'uppercase', 'capitalize'];

export const MAIN_MENU_ITEM_TRANSFORM_LABELS: Record<MainMenuItemTransform, string> = {
  normal: 'Original casing',
  uppercase: 'Uppercase',
  capitalize: 'Capitalize words',
};

export const DEFAULT_MAIN_MENU_CONFIG: MainMenuConfig = {
  backgroundColor: {
    light: '#ffffff',
    dark: '#0f172a',
  },
  textColor: {
    light: '#0f172a',
    dark: '#f8fafc',
  },
  burgerMenuColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  itemSize: 'comfortable',
  itemWeight: 'medium',
  itemTransform: 'normal',
  paddingTop: undefined,
  paddingBottom: undefined,
};

const isMainMenuItemSize = (value: unknown): value is MainMenuItemSize =>
  typeof value === 'string' && MAIN_MENU_ITEM_SIZES.includes(value as MainMenuItemSize);

const isMainMenuItemWeight = (value: unknown): value is MainMenuItemWeight =>
  typeof value === 'string' && MAIN_MENU_ITEM_WEIGHTS.includes(value as MainMenuItemWeight);

const isMainMenuItemTransform = (value: unknown): value is MainMenuItemTransform =>
  typeof value === 'string' && MAIN_MENU_ITEM_TRANSFORMS.includes(value as MainMenuItemTransform);

export const createMainMenuConfig = (input?: Partial<MainMenuConfig>): MainMenuConfig => {
  const backgroundColor: Partial<MainMenuThemeColors> = input?.backgroundColor ?? {};
  const textColor: Partial<MainMenuThemeColors> = input?.textColor ?? {};
  const burgerMenuColor: Partial<MainMenuThemeColors> = input?.burgerMenuColor ?? {};

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== 'string') {
      return fallback;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  };

  const normalizePadding = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    backgroundColor: {
      light: normalizeColor(backgroundColor.light, DEFAULT_MAIN_MENU_CONFIG.backgroundColor.light),
      dark: normalizeColor(backgroundColor.dark, DEFAULT_MAIN_MENU_CONFIG.backgroundColor.dark),
    },
    textColor: {
      light: normalizeColor(textColor.light, DEFAULT_MAIN_MENU_CONFIG.textColor.light),
      dark: normalizeColor(textColor.dark, DEFAULT_MAIN_MENU_CONFIG.textColor.dark),
    },
    burgerMenuColor: {
      light: normalizeColor(burgerMenuColor.light, DEFAULT_MAIN_MENU_CONFIG.burgerMenuColor.light),
      dark: normalizeColor(burgerMenuColor.dark, DEFAULT_MAIN_MENU_CONFIG.burgerMenuColor.dark),
    },
    itemSize: isMainMenuItemSize(input?.itemSize) ? input!.itemSize : DEFAULT_MAIN_MENU_CONFIG.itemSize,
    itemWeight: isMainMenuItemWeight(input?.itemWeight) ? input!.itemWeight : DEFAULT_MAIN_MENU_CONFIG.itemWeight,
    itemTransform: isMainMenuItemTransform(input?.itemTransform)
      ? input!.itemTransform
      : DEFAULT_MAIN_MENU_CONFIG.itemTransform,
    paddingTop: normalizePadding(input?.paddingTop) ?? DEFAULT_MAIN_MENU_CONFIG.paddingTop,
    paddingBottom: normalizePadding(input?.paddingBottom) ?? DEFAULT_MAIN_MENU_CONFIG.paddingBottom,
  };
};

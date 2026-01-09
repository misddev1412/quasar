import React from 'react';
import {
  MAIN_MENU_ITEM_SIZES,
  MAIN_MENU_ITEM_SIZE_LABELS,
  MAIN_MENU_ITEM_WEIGHTS,
  MAIN_MENU_ITEM_WEIGHT_LABELS,
  MAIN_MENU_ITEM_TRANSFORMS,
  MAIN_MENU_ITEM_TRANSFORM_LABELS,
  type MainMenuConfig,
  type MainMenuItemSize,
  type MainMenuItemWeight,
  type MainMenuItemTransform,
} from '@shared/types/navigation.types';
import { ColorSelector } from '../common/ColorSelector';
import { Select } from '../common/Select';
import { Input } from '../common/Input';

const PREVIEW_ITEMS = ['Shop', 'Collections', 'Brands', 'Contact'];

const PREVIEW_ITEM_CLASSES: Record<MainMenuItemSize, string> = {
  compact: 'text-xs py-1.5 px-2.5',
  comfortable: 'text-sm py-2 px-3',
  spacious: 'text-base py-3 px-4',
};

const ITEM_WEIGHT_CLASSES: Record<MainMenuItemWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const ITEM_TRANSFORM_CLASSES: Record<MainMenuItemTransform, string> = {
  normal: 'normal-case',
  uppercase: 'uppercase',
  capitalize: 'capitalize',
};

interface MainMenuAppearanceEditorProps {
  value: MainMenuConfig;
  onChange: (config: MainMenuConfig) => void;
  t: (key: string, fallback: string) => string;
}

export const MainMenuAppearanceEditor: React.FC<MainMenuAppearanceEditorProps> = ({ value, onChange, t }) => {
  const updateBackgroundColor = (mode: keyof MainMenuConfig['backgroundColor'], color?: string) => {
    onChange({
      ...value,
      backgroundColor: {
        ...value.backgroundColor,
        [mode]: color || '',
      },
    });
  };

  const updateTextColor = (mode: keyof MainMenuConfig['textColor'], color?: string) => {
    onChange({
      ...value,
      textColor: {
        ...value.textColor,
        [mode]: color || '',
      },
    });
  };

  const updateBurgerMenuColor = (mode: keyof MainMenuConfig['burgerMenuColor'], color?: string) => {
    onChange({
      ...value,
      burgerMenuColor: {
        ...value.burgerMenuColor,
        [mode]: color || '',
      },
    });
  };

  const updateItemSize = (size: MainMenuItemSize) => {
    onChange({
      ...value,
      itemSize: size,
    });
  };

  const updateItemWeight = (weight: MainMenuItemWeight) => {
    onChange({
      ...value,
      itemWeight: weight,
    });
  };

  const updateItemTransform = (transform: MainMenuItemTransform) => {
    onChange({
      ...value,
      itemTransform: transform,
    });
  };

  const updatePaddingTop = (paddingTop?: string) => {
    onChange({
      ...value,
      paddingTop: paddingTop?.trim() || undefined,
    });
  };

  const updatePaddingBottom = (paddingBottom?: string) => {
    onChange({
      ...value,
      paddingBottom: paddingBottom?.trim() || undefined,
    });
  };

  const previewLightStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.light,
  };
  const previewDarkStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.dark,
  };
  const lightTextColor = value.textColor.light?.trim();
  const darkTextColor = value.textColor.dark?.trim();
  const previewLightItemStyle: React.CSSProperties | undefined = lightTextColor ? { color: lightTextColor } : undefined;
  const previewDarkItemStyle: React.CSSProperties | undefined = darkTextColor ? { color: darkTextColor } : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.backgroundColor.light}
          onChange={(color) => updateBackgroundColor('light', color)}
          label={t('storefront.mainMenu.lightBackground', 'Light mode background')}
          placeholder="#ffffff"
        />
        <ColorSelector
          value={value.backgroundColor.dark}
          onChange={(color) => updateBackgroundColor('dark', color)}
          label={t('storefront.mainMenu.darkBackground', 'Dark mode background')}
          placeholder="#0f172a"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.textColor.light}
          onChange={(color) => updateTextColor('light', color)}
          label={t('storefront.mainMenu.lightTextColor', 'Light mode text color')}
          placeholder="#0f172a"
        />
        <ColorSelector
          value={value.textColor.dark}
          onChange={(color) => updateTextColor('dark', color)}
          label={t('storefront.mainMenu.darkTextColor', 'Dark mode text color')}
          placeholder="#f8fafc"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.burgerMenuColor?.light}
          onChange={(color) => updateBurgerMenuColor('light', color)}
          label={t('storefront.mainMenu.lightBurgerColor', 'Light mode burger menu color')}
          placeholder="#ffffff"
        />
        <ColorSelector
          value={value.burgerMenuColor?.dark}
          onChange={(color) => updateBurgerMenuColor('dark', color)}
          label={t('storefront.mainMenu.darkBurgerColor', 'Dark mode burger menu color')}
          placeholder="#ffffff"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Select
            label={t('storefront.mainMenu.itemSize', 'Menu item size')}
            value={value.itemSize}
            onChange={(next) => {
              if (MAIN_MENU_ITEM_SIZES.includes(next as MainMenuItemSize)) {
                updateItemSize(next as MainMenuItemSize);
              }
            }}
            options={MAIN_MENU_ITEM_SIZES.map((size) => ({
              value: size,
              label: MAIN_MENU_ITEM_SIZE_LABELS[size],
            }))}
            size="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.mainMenu.itemSizeDescription',
              'Adjusts padding and font size for each menu link on desktop and mobile.',
            )}
          </p>
        </div>

        <div>
          <Select
            label={t('storefront.mainMenu.itemWeight', 'Menu item weight')}
            value={value.itemWeight}
            onChange={(next) => {
              if (MAIN_MENU_ITEM_WEIGHTS.includes(next as MainMenuItemWeight)) {
                updateItemWeight(next as MainMenuItemWeight);
              }
            }}
            options={MAIN_MENU_ITEM_WEIGHTS.map((weight) => ({
              value: weight,
              label: MAIN_MENU_ITEM_WEIGHT_LABELS[weight],
            }))}
            size="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.mainMenu.itemWeightDescription',
              'Controls how bold each top-level menu item appears.',
            )}
          </p>
        </div>

        <div>
          <Select
            label={t('storefront.mainMenu.itemTransform', 'Menu item casing')}
            value={value.itemTransform}
            onChange={(next) => {
              if (MAIN_MENU_ITEM_TRANSFORMS.includes(next as MainMenuItemTransform)) {
                updateItemTransform(next as MainMenuItemTransform);
              }
            }}
            options={MAIN_MENU_ITEM_TRANSFORMS.map((transform) => ({
              value: transform,
              label: MAIN_MENU_ITEM_TRANSFORM_LABELS[transform],
            }))}
            size="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.mainMenu.itemTransformDescription',
              'Uppercase or capitalize labels to match your typography system.',
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('storefront.mainMenu.paddingTop', 'Padding Top')}
          </label>
          <Input
            value={value.paddingTop || ''}
            onChange={(e) => updatePaddingTop(e.target.value)}
            placeholder={t('storefront.mainMenu.paddingPlaceholder', 'e.g., 1rem, 16px, 0.5')}
            inputSize="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.mainMenu.paddingTopDescription',
              'CSS padding top value for the menu container (e.g., 1rem, 16px). Leave empty to use default.',
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('storefront.mainMenu.paddingBottom', 'Padding Bottom')}
          </label>
          <Input
            value={value.paddingBottom || ''}
            onChange={(e) => updatePaddingBottom(e.target.value)}
            placeholder={t('storefront.mainMenu.paddingPlaceholder', 'e.g., 1rem, 16px, 0.5')}
            inputSize="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.mainMenu.paddingBottomDescription',
              'CSS padding bottom value for the menu container (e.g., 1rem, 16px). Leave empty to use default.',
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storefront.mainMenu.previewLight', 'Light mode preview')}
            </p>
          </div>
          <div className="p-4" style={previewLightStyle}>
            <div className="flex flex-wrap gap-2">
              {PREVIEW_ITEMS.map((label) => (
                <span
                  key={label}
                  className={`rounded-xl bg-white/70 ${lightTextColor ? '' : 'text-gray-700'} ${ITEM_WEIGHT_CLASSES[value.itemWeight]} ${ITEM_TRANSFORM_CLASSES[value.itemTransform]} ${PREVIEW_ITEM_CLASSES[value.itemSize]} shadow-sm`}
                  style={previewLightItemStyle}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storefront.mainMenu.previewDark', 'Dark mode preview')}
            </p>
          </div>
          <div className="p-4" style={previewDarkStyle}>
            <div className="flex flex-wrap gap-2">
              {PREVIEW_ITEMS.map((label) => (
                <span
                  key={label}
                  className={`rounded-xl bg-black/30 ${darkTextColor ? '' : 'text-white'} ${ITEM_WEIGHT_CLASSES[value.itemWeight]} ${ITEM_TRANSFORM_CLASSES[value.itemTransform]} ${PREVIEW_ITEM_CLASSES[value.itemSize]} backdrop-blur`}
                  style={previewDarkItemStyle}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuAppearanceEditor;

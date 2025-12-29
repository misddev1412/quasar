import React from 'react';
import { ColorSelector } from '../common/ColorSelector';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { IconSelector } from '../menus/IconSelector';
import { UnifiedIcon } from '../common/UnifiedIcon';

export type AddToCartButtonTextTransform = 'normal' | 'uppercase' | 'capitalize';

export interface AddToCartButtonConfig {
  backgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  textTransform: AddToCartButtonTextTransform;
  icon: string;
}

const TEXT_TRANSFORM_OPTIONS: AddToCartButtonTextTransform[] = ['normal', 'uppercase', 'capitalize'];
const TEXT_TRANSFORM_LABELS: Record<AddToCartButtonTextTransform, string> = {
  normal: 'Viết hoa',
  uppercase: 'VIẾT HOA',
  capitalize: 'Viết Hoa',
};

const TEXT_TRANSFORM_CLASSES: Record<AddToCartButtonTextTransform, string> = {
  normal: 'normal-case',
  uppercase: 'uppercase',
  capitalize: 'capitalize',
};

interface AddToCartButtonEditorProps {
  value: AddToCartButtonConfig;
  onChange: (config: AddToCartButtonConfig) => void;
  t: (key: string, fallback: string) => string;
}

export const AddToCartButtonEditor: React.FC<AddToCartButtonEditorProps> = ({ value, onChange, t }) => {
  const updateBackgroundColor = (mode: keyof AddToCartButtonConfig['backgroundColor'], color?: string) => {
    onChange({
      ...value,
      backgroundColor: {
        ...value.backgroundColor,
        [mode]: color || '',
      },
    });
  };

  const updateTextColor = (mode: keyof AddToCartButtonConfig['textColor'], color?: string) => {
    onChange({
      ...value,
      textColor: {
        ...value.textColor,
        [mode]: color || '',
      },
    });
  };

  const updateTextTransform = (transform: AddToCartButtonTextTransform) => {
    onChange({
      ...value,
      textTransform: transform,
    });
  };

  const updateIcon = (icon: string) => {
    onChange({
      ...value,
      icon: icon || '',
    });
  };

  const previewLightStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.light || '#3b82f6',
  };
  const previewDarkStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.dark || '#2563eb',
  };
  const lightTextColor = value.textColor.light?.trim();
  const darkTextColor = value.textColor.dark?.trim();
  const previewLightTextStyle: React.CSSProperties | undefined = lightTextColor ? { color: lightTextColor } : undefined;
  const previewDarkTextStyle: React.CSSProperties | undefined = darkTextColor ? { color: darkTextColor } : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.backgroundColor.light}
          onChange={(color) => updateBackgroundColor('light', color)}
          label={t('storefront.addToCartButton.lightBackground', 'Light mode background')}
          placeholder="#3b82f6"
        />
        <ColorSelector
          value={value.backgroundColor.dark}
          onChange={(color) => updateBackgroundColor('dark', color)}
          label={t('storefront.addToCartButton.darkBackground', 'Dark mode background')}
          placeholder="#2563eb"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.textColor.light}
          onChange={(color) => updateTextColor('light', color)}
          label={t('storefront.addToCartButton.lightTextColor', 'Light mode text color')}
          placeholder="#ffffff"
        />
        <ColorSelector
          value={value.textColor.dark}
          onChange={(color) => updateTextColor('dark', color)}
          label={t('storefront.addToCartButton.darkTextColor', 'Dark mode text color')}
          placeholder="#ffffff"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label={t('storefront.addToCartButton.textTransform', 'Text transform')}
            value={value.textTransform}
            onChange={(next) => {
              if (TEXT_TRANSFORM_OPTIONS.includes(next as AddToCartButtonTextTransform)) {
                updateTextTransform(next as AddToCartButtonTextTransform);
              }
            }}
            options={TEXT_TRANSFORM_OPTIONS.map((transform) => ({
              value: transform,
              label: TEXT_TRANSFORM_LABELS[transform],
            }))}
            size="md"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t(
              'storefront.addToCartButton.textTransformDescription',
              'Choose how text is displayed: normal (Viết hoa), uppercase (VIẾT HOA), or capitalize (Viết Hoa).',
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('storefront.addToCartButton.icon', 'Icon')}
          </label>
          <div className="flex items-center gap-2">
            <IconSelector
              value={value.icon}
              onChange={updateIcon}
              placeholder={t('storefront.addToCartButton.iconPlaceholder', 'e.g., shopping-cart')}
            />
            {value.icon && (
              <div className="flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-md">
                <UnifiedIcon icon={value.icon} variant="button" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('storefront.addToCartButton.iconDescription', 'Select an icon to display on the button. Leave empty to hide icon.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storefront.addToCartButton.previewLight', 'Light mode preview')}
            </p>
          </div>
          <div className="p-6 flex items-center justify-center" style={previewLightStyle}>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${TEXT_TRANSFORM_CLASSES[value.textTransform]}`}
              style={previewLightTextStyle}
            >
              <div className="flex items-center gap-2">
                {value.icon && <UnifiedIcon icon={value.icon} variant="button" />}
                <span>{t('storefront.addToCartButton.previewText', 'Add to Cart')}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storefront.addToCartButton.previewDark', 'Dark mode preview')}
            </p>
          </div>
          <div className="p-6 flex items-center justify-center" style={previewDarkStyle}>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${TEXT_TRANSFORM_CLASSES[value.textTransform]}`}
              style={previewDarkTextStyle}
            >
              <div className="flex items-center gap-2">
                {value.icon && <UnifiedIcon icon={value.icon} variant="button" />}
                <span>{t('storefront.addToCartButton.previewText', 'Add to Cart')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartButtonEditor;

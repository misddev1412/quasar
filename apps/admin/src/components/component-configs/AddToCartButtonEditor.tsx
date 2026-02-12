import React from 'react';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { Select } from '@admin/components/common/Select';
import { Input } from '@admin/components/common/Input';
import { IconSelector } from '@admin/components/menus/IconSelector';
import { UnifiedIcon } from '@admin/components/common/UnifiedIcon';

export type AddToCartButtonTextTransform = 'normal' | 'uppercase' | 'capitalize';
export type AddToCartButtonSize = 'sm' | 'md' | 'lg';

export interface AddToCartButtonConfig {
  backgroundColor: {
    light: string;
    dark: string;
  };
  outOfStockBackgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  outOfStockTextColor: {
    light: string;
    dark: string;
  };
  size: AddToCartButtonSize;
  textTransform: AddToCartButtonTextTransform;
  icon: string;
}

const TEXT_TRANSFORM_OPTIONS: AddToCartButtonTextTransform[] = ['normal', 'uppercase', 'capitalize'];
const SIZE_OPTIONS: AddToCartButtonSize[] = ['sm', 'md', 'lg'];
const TEXT_TRANSFORM_LABELS: Record<AddToCartButtonTextTransform, string> = {
  normal: 'Viết hoa',
  uppercase: 'VIẾT HOA',
  capitalize: 'Viết Hoa',
};
const SIZE_LABELS: Record<AddToCartButtonSize, string> = {
  sm: 'Nhỏ',
  md: 'Trung bình',
  lg: 'Lớn',
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

  const updateOutOfStockBackgroundColor = (
    mode: keyof AddToCartButtonConfig['outOfStockBackgroundColor'],
    color?: string,
  ) => {
    onChange({
      ...value,
      outOfStockBackgroundColor: {
        ...value.outOfStockBackgroundColor,
        [mode]: color || '',
      },
    });
  };

  const updateOutOfStockTextColor = (mode: keyof AddToCartButtonConfig['outOfStockTextColor'], color?: string) => {
    onChange({
      ...value,
      outOfStockTextColor: {
        ...value.outOfStockTextColor,
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
  const updateSize = (size: AddToCartButtonSize) => {
    onChange({
      ...value,
      size,
    });
  };

  const updateIcon = (icon: string) => {
    onChange({
      ...value,
      icon: icon || '',
    });
  };

  const previewLightContainerStyle: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
  };
  const previewDarkContainerStyle: React.CSSProperties = {
    backgroundColor: '#0f172a',
  };
  const lightTextColor = value.textColor.light?.trim();
  const darkTextColor = value.textColor.dark?.trim();
  const previewLightTextStyle: React.CSSProperties | undefined = lightTextColor ? { color: lightTextColor } : undefined;
  const previewDarkTextStyle: React.CSSProperties | undefined = darkTextColor ? { color: darkTextColor } : undefined;
  const defaultLightStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.light || '#3b82f6',
    color: value.textColor.light || '#ffffff',
  };
  const defaultDarkStyle: React.CSSProperties = {
    backgroundColor: value.backgroundColor.dark || '#2563eb',
    color: value.textColor.dark || '#ffffff',
  };
  const outOfStockLightStyle: React.CSSProperties = {
    backgroundColor: value.outOfStockBackgroundColor.light || '#94a3b8',
    color: value.outOfStockTextColor.light || '#ffffff',
  };
  const outOfStockDarkStyle: React.CSSProperties = {
    backgroundColor: value.outOfStockBackgroundColor.dark || '#64748b',
    color: value.outOfStockTextColor.dark || '#ffffff',
  };

  const previewStates = [
    { key: 'add', label: t('componentConfigs.storefront.addToCartButton.previewText', 'Add to Cart'), outOfStock: false },
    { key: 'out', label: t('componentConfigs.storefront.addToCartButton.previewOutOfStock', 'Out of Stock'), outOfStock: true },
    { key: 'contact', label: t('componentConfigs.storefront.addToCartButton.previewContactPrice', 'Contact Price'), outOfStock: false },
    { key: 'select', label: t('componentConfigs.storefront.addToCartButton.previewSelectOptions', 'Select Options'), outOfStock: false },
    { key: 'incart', label: t('componentConfigs.storefront.addToCartButton.previewInCart', 'In Cart: 2'), outOfStock: false },
  ];
  const sizeClass = value.size === 'sm' ? 'min-w-[200px] h-10 text-base' : value.size === 'lg' ? 'min-w-[280px] h-16 text-xl' : 'min-w-[240px] h-14 text-lg';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.backgroundColor.light}
          onChange={(color) => updateBackgroundColor('light', color)}
          label={t('componentConfigs.storefront.addToCartButton.lightBackground', 'Light mode background')}
          placeholder="#3b82f6"
        />
        <ColorSelector
          value={value.backgroundColor.dark}
          onChange={(color) => updateBackgroundColor('dark', color)}
          label={t('componentConfigs.storefront.addToCartButton.darkBackground', 'Dark mode background')}
          placeholder="#2563eb"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.outOfStockBackgroundColor.light}
          onChange={(color) => updateOutOfStockBackgroundColor('light', color)}
          label={t('componentConfigs.storefront.addToCartButton.lightOutOfStockBackground', 'Light mode out-of-stock background')}
          placeholder="#94a3b8"
        />
        <ColorSelector
          value={value.outOfStockBackgroundColor.dark}
          onChange={(color) => updateOutOfStockBackgroundColor('dark', color)}
          label={t('componentConfigs.storefront.addToCartButton.darkOutOfStockBackground', 'Dark mode out-of-stock background')}
          placeholder="#64748b"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.outOfStockTextColor.light}
          onChange={(color) => updateOutOfStockTextColor('light', color)}
          label={t('componentConfigs.storefront.addToCartButton.lightOutOfStockText', 'Light mode out-of-stock text color')}
          placeholder="#ffffff"
        />
        <ColorSelector
          value={value.outOfStockTextColor.dark}
          onChange={(color) => updateOutOfStockTextColor('dark', color)}
          label={t('componentConfigs.storefront.addToCartButton.darkOutOfStockText', 'Dark mode out-of-stock text color')}
          placeholder="#ffffff"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          value={value.textColor.light}
          onChange={(color) => updateTextColor('light', color)}
          label={t('componentConfigs.storefront.addToCartButton.lightTextColor', 'Light mode text color')}
          placeholder="#ffffff"
        />
        <ColorSelector
          value={value.textColor.dark}
          onChange={(color) => updateTextColor('dark', color)}
          label={t('componentConfigs.storefront.addToCartButton.darkTextColor', 'Dark mode text color')}
          placeholder="#ffffff"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label={t('componentConfigs.storefront.addToCartButton.size', 'Button size')}
            value={value.size}
            onChange={(next) => {
              if (SIZE_OPTIONS.includes(next as AddToCartButtonSize)) {
                updateSize(next as AddToCartButtonSize);
              }
            }}
            options={SIZE_OPTIONS.map((size) => ({
              value: size,
              label: t(`componentConfigs.storefront.addToCartButton.size${size.toUpperCase()}` as string, SIZE_LABELS[size]),
            }))}
            size="md"
          />
        </div>
        <div>
          <Select
            label={t('componentConfigs.storefront.addToCartButton.textTransform', 'Text transform')}
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
              'componentConfigs.storefront.addToCartButton.textTransformDescription',
              'Choose how text is displayed: normal (Viết hoa), uppercase (VIẾT HOA), or capitalize (Viết Hoa).',
            )}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <IconSelector
              value={value.icon}
              onChange={updateIcon}
              placeholder={t('componentConfigs.storefront.addToCartButton.iconPlaceholder', 'e.g., shopping-cart')}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('componentConfigs.storefront.addToCartButton.iconDescription', 'Select an icon to display on the button. Leave empty to hide icon.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('componentConfigs.storefront.addToCartButton.previewLight', 'Light mode preview')}
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-3" style={previewLightContainerStyle}>
            {previewStates.map((state) => (
              <div key={`light-${state.key}`} className="flex items-center justify-center">
                <button
                  className={`${sizeClass} px-6 rounded-lg font-medium transition-colors ${TEXT_TRANSFORM_CLASSES[value.textTransform]} ${
                    state.outOfStock ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  style={state.outOfStock ? outOfStockLightStyle : { ...defaultLightStyle, ...previewLightTextStyle }}
                  disabled={state.outOfStock}
                >
                  <div className="flex items-center justify-center gap-2">
                    {value.icon && (
                      <UnifiedIcon
                        icon={value.icon}
                        variant="button"
                        color={(state.outOfStock ? outOfStockLightStyle.color : defaultLightStyle.color) as string}
                      />
                    )}
                    <span>{state.label}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('componentConfigs.storefront.addToCartButton.previewDark', 'Dark mode preview')}
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-3" style={previewDarkContainerStyle}>
            {previewStates.map((state) => (
              <div key={`dark-${state.key}`} className="flex items-center justify-center">
                <button
                  className={`${sizeClass} px-6 rounded-lg font-medium transition-colors ${TEXT_TRANSFORM_CLASSES[value.textTransform]} ${
                    state.outOfStock ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  style={state.outOfStock ? outOfStockDarkStyle : { ...defaultDarkStyle, ...previewDarkTextStyle }}
                  disabled={state.outOfStock}
                >
                  <div className="flex items-center justify-center gap-2">
                    {value.icon && (
                      <UnifiedIcon
                        icon={value.icon}
                        variant="button"
                        color={(state.outOfStock ? outOfStockDarkStyle.color : defaultDarkStyle.color) as string}
                      />
                    )}
                    <span>{state.label}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartButtonEditor;

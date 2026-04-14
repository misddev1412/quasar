import React, { useMemo, useState } from 'react';
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
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { Select } from '@admin/components/common/Select';
import { Input } from '@admin/components/common/Input';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const previewItems = useMemo(() => {
    const fromConfig = Array.isArray(value.previewItems)
      ? value.previewItems.map((item) => (typeof item === 'string' ? item.trim() : '')).filter((item) => item.length > 0)
      : [];
    return fromConfig.length > 0 ? fromConfig : PREVIEW_ITEMS;
  }, [value.previewItems]);

  const updatePreviewItems = (items: string[]) => {
    const normalizedItems = items
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 10);

    onChange({
      ...value,
      previewItems: normalizedItems.length > 0 ? normalizedItems : PREVIEW_ITEMS,
    });
  };

  const updatePreviewItemLabel = (index: number, nextValue: string) => {
    const nextItems = [...previewItems];
    nextItems[index] = nextValue;
    updatePreviewItems(nextItems);
  };

  const movePreviewItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= previewItems.length || toIndex >= previewItems.length) {
      return;
    }
    const nextItems = [...previewItems];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    updatePreviewItems(nextItems);
  };

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

  const renderEditablePreviewItems = ({
    dark,
  }: {
    dark: boolean;
  }) => (
    <div className="flex flex-wrap gap-2">
      {previewItems.map((label, index) => (
        <span
          key={`${dark ? 'dark' : 'light'}-${index}-${label}`}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', String(index));
            event.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const fromIndex = Number(event.dataTransfer.getData('text/plain'));
            if (Number.isNaN(fromIndex)) {
              return;
            }
            movePreviewItem(fromIndex, index);
          }}
          className={`inline-flex items-center rounded-xl ${
            dark ? 'bg-black/30' : 'bg-white/70'
          } ${
            dark ? (darkTextColor ? '' : 'text-white') : (lightTextColor ? '' : 'text-gray-700')
          } ${ITEM_WEIGHT_CLASSES[value.itemWeight]} ${ITEM_TRANSFORM_CLASSES[value.itemTransform]} ${PREVIEW_ITEM_CLASSES[value.itemSize]} shadow-sm backdrop-blur`}
          style={dark ? previewDarkItemStyle : previewLightItemStyle}
          title={t('storefront.mainMenu.dragToReorder', 'Drag to reorder')}
        >
          {editingIndex === index ? (
            <input
              autoFocus
              value={label}
              onChange={(event) => updatePreviewItemLabel(index, event.target.value)}
              onBlur={() => setEditingIndex(null)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                  event.preventDefault();
                  setEditingIndex(null);
                }
              }}
              className={`w-28 rounded border border-neutral-300 bg-white/90 px-2 py-0.5 text-xs text-neutral-900 outline-none ring-1 ring-primary-500 ${
                value.itemSize === 'spacious' ? 'text-sm' : 'text-xs'
              }`}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingIndex(index)}
              className="bg-transparent p-0 text-inherit"
              title={t('storefront.mainMenu.clickToEditLabel', 'Click to edit label')}
            >
              {label}
            </button>
          )}
        </span>
      ))}
    </div>
  );

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
            {renderEditablePreviewItems({ dark: false })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('storefront.mainMenu.previewDark', 'Dark mode preview')}
            </p>
          </div>
          <div className="p-4" style={previewDarkStyle}>
            {renderEditablePreviewItems({ dark: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuAppearanceEditor;

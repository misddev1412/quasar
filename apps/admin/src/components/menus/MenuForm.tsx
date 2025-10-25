import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Select, SelectOption } from '../../components/common/Select';
import { Toggle } from '../../components/common/Toggle';
import { Input } from '../../components/common/Input';
import { ProductSelector } from './ProductSelector';
import { CategorySelector } from './CategorySelector';
import { BrandSelector } from './BrandSelector';
import ParentMenuSelector from './ParentMenuSelector';
import { IconSelector } from './IconSelector';
import { ColorSelector } from './ColorSelector';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { MenuFormState, MenuTranslationForm, DEFAULT_MENU_GROUP_OPTIONS, MENU_TYPE_OPTIONS, MENU_TARGET_OPTIONS } from '../../hooks/useMenuPage';
import { cn } from '@admin/lib/utils';

const asStringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const asNumberOrUndefined = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const normalizeBannerConfig = (
  value: unknown
): MenuFormState['bannerConfig'] | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const banner = value as Record<string, unknown>;

  const position = banner.position;
  const normalizedPosition =
    position === 'top' || position === 'bottom' ? position : undefined;

  return {
    title: asStringOrUndefined(banner.title),
    subtitle: asStringOrUndefined(banner.subtitle),
    description: asStringOrUndefined(banner.description),
    backgroundColor: asStringOrUndefined(banner.backgroundColor),
    textColor: asStringOrUndefined(banner.textColor),
    buttonText: asStringOrUndefined(banner.buttonText),
    buttonLink: asStringOrUndefined(banner.buttonLink),
    backgroundImage: asStringOrUndefined(banner.backgroundImage),
    position: normalizedPosition,
  };
};

interface MenuFormProps {
  menu?: AdminMenu;
  onSubmit: (data: MenuFormState) => void;
  onCancel: () => void;
  languages: any[];
  menuGroups: string[];
  menuTree: MenuTreeNode[];
  isSubmitting?: boolean;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  menu,
  onSubmit,
  onCancel,
  languages,
  menuGroups,
  menuTree,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<MenuFormState>(() => {
    if (menu) {
      const translations: Record<string, MenuTranslationForm> = {};
      menu.translations.forEach((translation) => {
        translations[translation.locale] = {
          label: translation.label || undefined,
          description: translation.description || undefined,
          customHtml: translation.customHtml || undefined,
          config: translation.config || undefined,
        };
      });

      return {
        menuGroup: menu.menuGroup,
        type: menu.type,
        url: menu.url || undefined,
        referenceId: menu.referenceId || undefined,
        target: menu.target,
        position: menu.position,
        isEnabled: menu.isEnabled,
        icon: menu.icon || undefined,
        textColor: menu.textColor || undefined,
        backgroundColor: menu.backgroundColor || undefined,
        config: menu.config,
        isMegaMenu: menu.isMegaMenu,
        megaMenuColumns: menu.megaMenuColumns ?? undefined,
        parentId: menu.parentId || undefined,
        translations,
        // Enhanced customization options
        badge: menu.config?.badge && typeof menu.config.badge === 'object' &&
          'text' in menu.config.badge ? menu.config.badge as any : undefined,
        hoverEffect: (menu.config?.hoverEffect as 'none' | 'scale' | 'slide' | 'fade') || undefined,
        customClass: (typeof menu.config?.customClass === 'string' ? menu.config.customClass : undefined) || undefined,
        imageSize: (menu.config?.imageSize as 'small' | 'medium' | 'large') || undefined,
        showDescription: menu.config?.showDescription !== false,
        // Section customization
        columnSpan: asNumberOrUndefined(menu.config?.columnSpan),
        borderColor: asStringOrUndefined(menu.config?.borderColor),
        titleColor: asStringOrUndefined(menu.config?.titleColor),
        showTitle: menu.config?.showTitle !== false,
        maxItems: asNumberOrUndefined(menu.config?.maxItems),
        layout: (menu.config?.layout as 'vertical' | 'grid' | 'horizontal') || undefined,
        // Banner customization
        bannerConfig: normalizeBannerConfig(menu.config?.bannerConfig),
      };
    }

    const defaultTranslations: Record<string, MenuTranslationForm> = {};
    languages.forEach((lang) => {
      defaultTranslations[lang.code] = {};
    });

    return {
      menuGroup: 'main',
      type: MenuType.LINK,
      target: MenuTarget.SELF,
      position: 0,
      isEnabled: true,
      config: {},
      isMegaMenu: false,
      translations: defaultTranslations,
    };
  });

  const [activeLocale, setActiveLocale] = useState<string>(() => {
    const defaultLanguage = languages.find((language) => language.isDefault);
    return defaultLanguage?.code || languages[0]?.code || 'en';
  });

  const translationLocales = languages.length > 0 ? languages.map((language) => language.code) : ['en'];

  const ensureTranslation = (locale: string) => {
    if (!formData.translations[locale]) {
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            label: '',
            description: '',
            customHtml: '',
            config: {},
          },
        },
      }));
    }
  };

  useEffect(() => {
    translationLocales.forEach(ensureTranslation);
  }, [translationLocales.join(',')]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof MenuFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (locale: string, field: keyof MenuTranslationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  // Helper function to safely update badge
  const updateBadge = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      badge: {
        text: '',
        color: '#FFFFFF',
        backgroundColor: '#EF4444',
        ...prev.badge,
        [field]: value
      }
    }));
  };

  // Helper function to safely update banner config
  const updateBannerConfig = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      bannerConfig: {
        ...prev.bannerConfig,
        [field]: value
      }
    }));
  };

  const groupOptions: SelectOption[] = [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...menuGroups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Menu Group</label>
          <Select
            value={formData.menuGroup}
            onChange={(value) => updateFormData('menuGroup', value)}
            options={groupOptions}
            className="mt-1"
            size="md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onChange={(value) => updateFormData('type', value as MenuType)}
            options={MENU_TYPE_OPTIONS}
            className="mt-1"
            size="md"
          />
        </div>
      </div>

      <div>
        <ParentMenuSelector
          value={formData.parentId}
          onChange={(parentId) => updateFormData('parentId', parentId)}
          menuTree={menuTree}
          currentMenuId={menu?.id}
          menuGroup={formData.menuGroup}
        />
      </div>

      {(formData.type === MenuType.LINK || formData.type === MenuType.BANNER) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <Input
              value={formData.url || ''}
              onChange={(e) => updateFormData('url', e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target</label>
            <Select
              value={formData.target}
              onChange={(value) => updateFormData('target', value as MenuTarget)}
              options={MENU_TARGET_OPTIONS}
              className="mt-1"
              size="md"
            />
          </div>
        </div>
      )}

      {formData.type === MenuType.PRODUCT && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Product</label>
          <div className="mt-1">
            <ProductSelector
              value={formData.referenceId}
              onChange={(productId) => updateFormData('referenceId', productId)}
            />
          </div>
        </div>
      )}

      {formData.type === MenuType.CATEGORY && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <div className="mt-1">
            <CategorySelector
              value={formData.referenceId}
              onChange={(categoryId) => updateFormData('referenceId', categoryId)}
            />
          </div>
        </div>
      )}

      {formData.type === MenuType.BRAND && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <div className="mt-1">
            <BrandSelector
              value={formData.referenceId}
              onChange={(brandId) => updateFormData('referenceId', brandId)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <Input
            type="number"
            value={formData.position}
            onChange={(e) => updateFormData('position', parseInt(e.target.value) || 0)}
            className="mt-1"
            inputSize="md"
          />
        </div>

        <div className="flex items-end gap-4">
          <Toggle
            checked={formData.isEnabled}
            onChange={(checked) => updateFormData('isEnabled', checked)}
            label="Enabled"
          />
          <Toggle
            checked={formData.isMegaMenu}
            onChange={(checked) => updateFormData('isMegaMenu', checked)}
            label="Mega Menu"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IconSelector
          value={formData.icon}
          onChange={(icon) => updateFormData('icon', icon)}
        />

        <ColorSelector
          value={formData.textColor}
          onChange={(color) => updateFormData('textColor', color)}
          placeholder="#000000"
          label="Text Color"
        />
      </div>

      <ColorSelector
        value={formData.backgroundColor}
        onChange={(color) => updateFormData('backgroundColor', color)}
        placeholder="#FFFFFF"
        label="Background Color"
      />

      {/* Enhanced Customization Options */}
      {formData.isMegaMenu && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Mega Menu Customization</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Layout</label>
              <Select
                value={formData.layout || 'vertical'}
                onChange={(value) => updateFormData('layout', value as 'vertical' | 'grid' | 'horizontal')}
                options={[
                  { value: 'vertical', label: 'Vertical' },
                  { value: 'grid', label: 'Grid' },
                  { value: 'horizontal', label: 'Horizontal' }
                ]}
                className="mt-1"
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Icon Size</label>
              <Select
                value={formData.imageSize || 'medium'}
                onChange={(value) => updateFormData('imageSize', value as 'small' | 'medium' | 'large')}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ]}
                className="mt-1"
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hover Effect</label>
              <Select
                value={formData.hoverEffect || 'none'}
                onChange={(value) => updateFormData('hoverEffect', value as 'none' | 'scale' | 'slide' | 'fade')}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'scale', label: 'Scale' },
                  { value: 'slide', label: 'Slide' },
                  { value: 'fade', label: 'Fade' }
                ]}
                className="mt-1"
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Items</label>
              <Input
                type="number"
                value={formData.maxItems || ''}
                onChange={(e) => updateFormData('maxItems', parseInt(e.target.value) || undefined)}
                placeholder="Unlimited"
                className="mt-1"
                inputSize="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Column Span</label>
              <Input
                type="number"
                value={formData.columnSpan || ''}
                onChange={(e) => updateFormData('columnSpan', parseInt(e.target.value) || undefined)}
                placeholder="1"
                className="mt-1"
                inputSize="md"
              />
            </div>

            <ColorSelector
              value={formData.borderColor}
              onChange={(color) => updateFormData('borderColor', color)}
              placeholder="#E5E7EB"
              label="Border Color"
            />
          </div>

          <div className="flex items-center gap-4">
            <Toggle
              checked={formData.showTitle !== false}
              onChange={(checked) => updateFormData('showTitle', checked)}
              label="Show Title"
            />
            <Toggle
              checked={formData.showDescription !== false}
              onChange={(checked) => updateFormData('showDescription', checked)}
              label="Show Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Custom CSS Class</label>
            <Input
              value={formData.customClass || ''}
              onChange={(e) => updateFormData('customClass', e.target.value)}
              placeholder="custom-class"
              className="mt-1"
              inputSize="md"
            />
          </div>
        </div>
      )}

      {/* Badge Configuration */}
      <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Badge Configuration</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700">Badge Text</label>
          <Input
            value={formData.badge?.text || ''}
            onChange={(e) => updateBadge('text', e.target.value)}
            placeholder="New"
            className="mt-1"
            inputSize="md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSelector
            value={formData.badge?.color}
            onChange={(color) => updateBadge('color', color)}
            placeholder="#FFFFFF"
            label="Badge Text Color"
          />
          <ColorSelector
            value={formData.badge?.backgroundColor}
            onChange={(color) => updateBadge('backgroundColor', color)}
            placeholder="#EF4444"
            label="Badge Background Color"
          />
        </div>
      </div>

      {/* Banner Configuration */}
      {formData.type === MenuType.BANNER && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Banner Configuration</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700">Banner Title</label>
            <Input
              value={formData.bannerConfig?.title || ''}
              onChange={(e) => updateBannerConfig('title', e.target.value)}
              placeholder="Special Offer"
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <Input
              value={formData.bannerConfig?.subtitle || ''}
              onChange={(e) => updateBannerConfig('subtitle', e.target.value)}
              placeholder="Limited Time"
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.bannerConfig?.description || ''}
              onChange={(e) => updateBannerConfig('description', e.target.value)}
              placeholder="Special description for banner"
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <Input
                value={formData.bannerConfig?.buttonText || ''}
                onChange={(e) => updateBannerConfig('buttonText', e.target.value)}
                placeholder="Shop Now"
                className="mt-1"
                inputSize="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Button Link</label>
              <Input
                value={formData.bannerConfig?.buttonLink || ''}
                onChange={(e) => updateBannerConfig('buttonLink', e.target.value)}
                placeholder="/special-offers"
                className="mt-1"
                inputSize="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSelector
              value={formData.bannerConfig?.backgroundColor}
              onChange={(color) => updateBannerConfig('backgroundColor', color)}
              placeholder="#7C3AED"
              label="Banner Background"
            />
            <ColorSelector
              value={formData.bannerConfig?.textColor}
              onChange={(color) => updateBannerConfig('textColor', color)}
              placeholder="#FFFFFF"
              label="Banner Text Color"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <Select
                value={formData.bannerConfig?.position || 'bottom'}
                onChange={(value) => updateBannerConfig('position', value as 'top' | 'bottom')}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'bottom', label: 'Bottom' }
                ]}
                className="mt-1"
                size="md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Background Image URL</label>
            <Input
              value={formData.bannerConfig?.backgroundImage || ''}
              onChange={(e) => updateBannerConfig('backgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
              inputSize="md"
            />
          </div>
        </div>
      )}

      {/* Translations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Translations</h4>
          <div className="flex items-center gap-2">
            {translationLocales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                  activeLocale === locale
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
                )}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <Input
              value={formData.translations[activeLocale]?.label || ''}
              onChange={(e) => updateTranslation(activeLocale, 'label', e.target.value)}
              placeholder="Menu label"
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.translations[activeLocale]?.description || ''}
              onChange={(e) => updateTranslation(activeLocale, 'description', e.target.value)}
              placeholder="Menu description"
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
            />
          </div>

          {formData.type === MenuType.CUSTOM_HTML && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom HTML</label>
              <textarea
                value={formData.translations[activeLocale]?.customHtml || ''}
                onChange={(e) => updateTranslation(activeLocale, 'customHtml', e.target.value)}
                placeholder="Custom HTML content"
                rows={6}
                className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {menu ? 'Update Menu' : 'Create Menu'}
        </Button>
      </div>
    </form>
  );
};

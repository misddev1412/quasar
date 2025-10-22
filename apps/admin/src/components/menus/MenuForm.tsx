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
        megaMenuColumns: menu.megaMenuColumns || undefined,
        parentId: menu.parentId || undefined,
        translations,
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onChange={(value) => updateFormData('type', value as MenuType)}
            options={MENU_TYPE_OPTIONS}
            className="mt-1"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target</label>
            <Select
              value={formData.target}
              onChange={(value) => updateFormData('target', value as MenuTarget)}
              options={MENU_TARGET_OPTIONS}
              className="mt-1"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.translations[activeLocale]?.description || ''}
              onChange={(e) => updateTranslation(activeLocale, 'description', e.target.value)}
              placeholder="Menu description"
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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

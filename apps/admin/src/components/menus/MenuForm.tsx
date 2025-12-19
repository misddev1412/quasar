import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/common/Button';
import { Select, SelectOption } from '../../components/common/Select';
import { Toggle } from '../../components/common/Toggle';
import { Input } from '../../components/common/Input';
import { ProductSelector } from './ProductSelector';
import { CategorySelector } from './CategorySelector';
import { BrandSelector } from './BrandSelector';
import ParentMenuSelector from './ParentMenuSelector';
import { IconSelector } from './IconSelector';
import { ColorSelector } from '../common/ColorSelector';
import { MeasurementPresetInput } from '../common/MeasurementPresetInput';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import {
  MenuType,
  MenuTarget,
  TopMenuTimeFormat,
  TOP_MENU_TIME_FORMAT_LABELS,
} from '@shared/enums/menu.enums';
import {
  MenuFormState,
  MenuTranslationForm,
  DEFAULT_MENU_GROUP_OPTIONS,
  MENU_TYPE_OPTIONS,
  MENU_TARGET_OPTIONS,
  TOP_MENU_GROUP,
  SUB_MENU_GROUP,
  TOP_MENU_ALLOWED_TYPES,
  ALL_MENU_TYPE_OPTIONS,
} from '../../hooks/useMenuPage';
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

const requiresUrl = (type: MenuType) => type === MenuType.LINK || type === MenuType.BANNER;
const requiresReferenceId = (type: MenuType) =>
  type === MenuType.PRODUCT || type === MenuType.CATEGORY || type === MenuType.BRAND;

const TOP_MENU_CONFIG_KEYS = ['topPhoneNumber', 'topEmailAddress', 'topTimeFormat'] as const;
const TOP_MENU_ONLY_TYPES = [MenuType.TOP_PHONE, MenuType.TOP_EMAIL, MenuType.TOP_CURRENT_TIME] as const;
const CALL_BUTTON_CONFIG_KEY = 'callButtonNumber';

const getConfigStringValue = (
  config: Record<string, unknown> | undefined,
  key: string,
) => {
  const value = config?.[key];
  return typeof value === 'string' ? value : '';
};

const TOP_TIME_FORMAT_OPTIONS: SelectOption[] = (Object.values(TopMenuTimeFormat) as TopMenuTimeFormat[]).map(
  (value) => ({
    value,
    label: TOP_MENU_TIME_FORMAT_LABELS[value],
  }),
);

const sanitizeConfigForType = (config: Record<string, unknown> | undefined, type: MenuType) => {
  const nextConfig: Record<string, unknown> = { ...(config || {}) };

  if (!TOP_MENU_ALLOWED_TYPES.includes(type)) {
    TOP_MENU_CONFIG_KEYS.forEach((key) => {
      if (key in nextConfig) {
        delete nextConfig[key];
      }
    });
  }

  if (type !== MenuType.CALL_BUTTON && CALL_BUTTON_CONFIG_KEY in nextConfig) {
    delete nextConfig[CALL_BUTTON_CONFIG_KEY];
  }

  return nextConfig;
};

const getTopMenuConfigValue = (
  config: Record<string, unknown> | undefined,
  key: typeof TOP_MENU_CONFIG_KEYS[number],
) => {
  return getConfigStringValue(config, key);
};

interface MenuFormProps {
  menu?: AdminMenu;
  onSubmit: (data: MenuFormState) => void;
  onCancel: () => void;
  languages: any[];
  menuGroups: string[];
  menuTree: MenuTreeNode[];
  currentMenuGroup: string;
  isSubmitting?: boolean;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  menu,
  onSubmit,
  onCancel,
  languages,
  menuGroups,
  menuTree,
  currentMenuGroup,
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
        borderColor: menu.borderColor || undefined,
        borderWidth: menu.borderWidth || undefined,
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
        titleColor: asStringOrUndefined(menu.config?.titleColor),
        showTitle: menu.config?.showTitle !== false,
        maxItems: asNumberOrUndefined(menu.config?.maxItems),
        layout: (menu.config?.layout as 'vertical' | 'grid' | 'horizontal') || undefined,
        // Banner customization
        bannerConfig: normalizeBannerConfig(menu.config?.bannerConfig),
        subMenuVariant: (menu.config?.subMenuVariant as 'link' | 'button') || undefined,
        buttonBorderRadius: asStringOrUndefined(menu.config?.buttonBorderRadius),
        buttonAnimation: (menu.config?.buttonAnimation as 'none' | 'pulse' | 'float') || undefined,
      };
    }

    const defaultTranslations: Record<string, MenuTranslationForm> = {};
    languages.forEach((lang) => {
      defaultTranslations[lang.code] = {};
    });

    return {
      menuGroup: currentMenuGroup || 'main',
      type: MenuType.LINK,
      target: MenuTarget.SELF,
      position: 0,
      isEnabled: true,
      config: {},
      isMegaMenu: false,
      translations: defaultTranslations,
      borderColor: undefined,
      borderWidth: undefined,
      subMenuVariant: currentMenuGroup === SUB_MENU_GROUP ? 'button' : undefined,
      buttonBorderRadius: currentMenuGroup === SUB_MENU_GROUP ? '9999px' : undefined,
    };
  });
  const [parentMenuTree, setParentMenuTree] = useState<MenuTreeNode[]>(menuTree);
  const [isParentLoading, setIsParentLoading] = useState(false);
  const [parentMenuError, setParentMenuError] = useState<string | null>(null);

  const isTopMenu = formData.menuGroup === TOP_MENU_GROUP;
  const isSubMenu = formData.menuGroup === SUB_MENU_GROUP;

  const menuTypeOptions = useMemo<SelectOption[]>(() => {
    const source = isTopMenu
      ? ALL_MENU_TYPE_OPTIONS.filter(option => TOP_MENU_ALLOWED_TYPES.includes(option.value))
      : MENU_TYPE_OPTIONS;

    return source.map(option => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
    }));
  }, [isTopMenu]);

  useEffect(() => {
    if (!isTopMenu) {
      setFormData(prev => ({
        ...prev,
        config: sanitizeConfigForType(prev.config, prev.type),
      }));
      return;
    }

    setFormData(prev => {
      const nextType = TOP_MENU_ALLOWED_TYPES.includes(prev.type)
        ? prev.type
        : TOP_MENU_ALLOWED_TYPES[0];

      const nextConfig = sanitizeConfigForType(prev.config, nextType);
      if (nextType === MenuType.TOP_CURRENT_TIME && typeof nextConfig['topTimeFormat'] !== 'string') {
        nextConfig['topTimeFormat'] = TopMenuTimeFormat.HOURS_MINUTES;
      }

      return {
        ...prev,
        type: nextType,
        isMegaMenu: false,
        megaMenuColumns: undefined,
        url: requiresUrl(nextType) ? prev.url : undefined,
        referenceId: requiresReferenceId(nextType) ? prev.referenceId : undefined,
        config: nextConfig,
      };
    });
  }, [isTopMenu]);

  useEffect(() => {
    if (formData.menuGroup !== currentMenuGroup) {
      return;
    }

    setParentMenuTree(menuTree);
    setParentMenuError(null);
    setIsParentLoading(false);
  }, [formData.menuGroup, currentMenuGroup, menuTree]);

  useEffect(() => {
    if (formData.menuGroup === currentMenuGroup) {
      return;
    }

    let isMounted = true;
    const selectedGroup = formData.menuGroup;

    const fetchParentTree = async () => {
      setIsParentLoading(true);
      setParentMenuError(null);

      try {
        const { trpcClient } = await import('../../utils/trpc');
        const response = await trpcClient.adminMenus.tree.query({ menuGroup: selectedGroup });
        const fetchedTree = Array.isArray((response as any)?.data)
          ? ((response as any).data as MenuTreeNode[])
          : (response as MenuTreeNode[]);

        if (!isMounted) {
          return;
        }

        setParentMenuTree(fetchedTree);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setParentMenuTree([]);
        setParentMenuError('Unable to load parent menus for this group');
      } finally {
        if (isMounted) {
          setIsParentLoading(false);
        }
      }
    };

    void fetchParentTree();

    return () => {
      isMounted = false;
    };
  }, [formData.menuGroup, currentMenuGroup]);

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

  const trimString = (value?: string) => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const buildConfigPayload = () => {
    const managedKeys = [
      'badge',
      'hoverEffect',
      'customClass',
      'imageSize',
      'showDescription',
      'columnSpan',
      'titleColor',
      'showTitle',
      'maxItems',
      'layout',
      'bannerConfig',
      'subMenuVariant',
      'buttonBorderRadius',
      'buttonAnimation',
    ];

    const baseConfig: Record<string, unknown> = { ...(formData.config || {}) };
    managedKeys.forEach(key => {
      if (key in baseConfig) {
        delete baseConfig[key];
      }
    });

    const normalizedBadge = formData.badge && trimString(formData.badge.text)
      ? {
          text: trimString(formData.badge.text)!,
          color: trimString(formData.badge.color) || formData.badge.color || '#1d4ed8',
          backgroundColor: trimString(formData.badge.backgroundColor) || formData.badge.backgroundColor || 'rgba(59, 130, 246, 0.15)',
        }
      : undefined;

    let bannerConfig = formData.bannerConfig
      ? Object.entries(formData.bannerConfig).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
              acc[key] = trimmed;
            }
          } else if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, unknown>)
      : undefined;

    if (bannerConfig && Object.keys(bannerConfig).length === 0) {
      bannerConfig = undefined;
    }

    const normalizedHoverEffect =
      formData.hoverEffect && formData.hoverEffect !== 'none'
        ? formData.hoverEffect
        : undefined;

    const normalizedCustomClass = trimString(formData.customClass);
    const normalizedTitleColor = trimString(formData.titleColor);
    const normalizedSubMenuVariant = isSubMenu ? (formData.subMenuVariant || 'button') : undefined;
    const normalizedButtonBorderRadius =
      normalizedSubMenuVariant === 'button' ? trimString(formData.buttonBorderRadius) : undefined;
    const normalizedButtonAnimation =
      normalizedSubMenuVariant === 'button' && formData.buttonAnimation && formData.buttonAnimation !== 'none'
        ? formData.buttonAnimation
        : undefined;

    const assign = (key: string, value: unknown) => {
      if (value === undefined) {
        delete baseConfig[key];
      } else {
        baseConfig[key] = value;
      }
    };

    assign('badge', normalizedBadge);
    assign('hoverEffect', normalizedHoverEffect);
    assign('customClass', normalizedCustomClass);
    assign('imageSize', formData.imageSize);
    assign('showDescription', typeof formData.showDescription === 'boolean' ? formData.showDescription : undefined);
    assign('columnSpan', formData.columnSpan);
    assign('titleColor', normalizedTitleColor);
    assign('showTitle', typeof formData.showTitle === 'boolean' ? formData.showTitle : undefined);
    assign('maxItems', formData.maxItems);
    assign('layout', formData.layout);
    assign('bannerConfig', bannerConfig);
    assign('subMenuVariant', normalizedSubMenuVariant);
    assign('buttonBorderRadius', normalizedButtonBorderRadius);
    assign('buttonAnimation', normalizedButtonAnimation);

    return baseConfig;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      textColor: trimString(formData.textColor),
      backgroundColor: trimString(formData.backgroundColor),
      borderColor: trimString(formData.borderColor),
      borderWidth: trimString(formData.borderWidth),
      config: buildConfigPayload(),
    };
    onSubmit(payload);
  };

  const updateFormData = (field: keyof MenuFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArbitraryConfigValue = (key: string, value: unknown) => {
    setFormData(prev => {
      const nextConfig = { ...(prev.config || {}) };

      if (value === '' || value === undefined || value === null) {
        delete nextConfig[key];
      } else {
        nextConfig[key] = value;
      }

      return {
        ...prev,
        config: nextConfig,
      };
    });
  };

  const updateConfigValue = (key: typeof TOP_MENU_CONFIG_KEYS[number], value: string) => {
    updateArbitraryConfigValue(key, value);
  };

  const handleTypeChange = (type: MenuType) => {
    setFormData(prev => {
      const nextConfig = sanitizeConfigForType(prev.config, type);

      if (type === MenuType.TOP_CURRENT_TIME && typeof nextConfig['topTimeFormat'] !== 'string') {
        nextConfig['topTimeFormat'] = TopMenuTimeFormat.HOURS_MINUTES;
      }

      return {
        ...prev,
        type,
        url: requiresUrl(type) ? prev.url : undefined,
        referenceId: requiresReferenceId(type) ? prev.referenceId : undefined,
        config: nextConfig,
      };
    });
  };

  const handleMenuGroupChange = (group: string) => {
    setFormData(prev => {
      const isTopGroup = group === TOP_MENU_GROUP;
      const isSubGroup = group === SUB_MENU_GROUP;

      let nextType = prev.type;
      if (isTopGroup && !TOP_MENU_ALLOWED_TYPES.includes(nextType)) {
        nextType = TOP_MENU_ALLOWED_TYPES[0];
      }

      if (!isTopGroup && TOP_MENU_ONLY_TYPES.includes(nextType as typeof TOP_MENU_ONLY_TYPES[number])) {
        nextType = MenuType.LINK;
      }

      const nextConfig = sanitizeConfigForType(prev.config, nextType);
      if (isTopGroup && nextType === MenuType.TOP_CURRENT_TIME && typeof nextConfig['topTimeFormat'] !== 'string') {
        nextConfig['topTimeFormat'] = TopMenuTimeFormat.HOURS_MINUTES;
      }

      return {
        ...prev,
        menuGroup: group,
        type: nextType,
        parentId: undefined,
        isMegaMenu: isTopGroup ? false : prev.isMegaMenu,
        megaMenuColumns: isTopGroup ? undefined : prev.megaMenuColumns,
        url: requiresUrl(nextType) ? prev.url : undefined,
        referenceId: requiresReferenceId(nextType) ? prev.referenceId : undefined,
        config: nextConfig,
        subMenuVariant: isSubGroup ? (prev.subMenuVariant || 'button') : undefined,
        buttonBorderRadius: isSubGroup ? (prev.buttonBorderRadius || '9999px') : undefined,
        buttonAnimation: isSubGroup ? prev.buttonAnimation : undefined,
      };
    });
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

  const handleSubMenuVariantChange = (variant: 'link' | 'button') => {
    setFormData(prev => ({
      ...prev,
      subMenuVariant: variant,
      buttonBorderRadius: variant === 'button' ? (prev.buttonBorderRadius || '9999px') : undefined,
      buttonAnimation: variant === 'button' ? (prev.buttonAnimation || 'none') : undefined,
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
            onChange={handleMenuGroupChange}
            options={groupOptions}
            className="mt-1"
            size="md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onChange={(value) => handleTypeChange(value as MenuType)}
            options={menuTypeOptions}
            className="mt-1"
            size="md"
          />
        </div>
      </div>

      <div>
        <ParentMenuSelector
          value={formData.parentId}
          onChange={(parentId) => updateFormData('parentId', parentId)}
          menuTree={parentMenuTree}
          currentMenuId={menu?.id}
          menuGroup={formData.menuGroup}
        />
        {isParentLoading && (
          <p className="text-xs text-gray-500 mt-1">Loading available parent menus…</p>
        )}
        {!isParentLoading && parentMenuError && (
          <p className="text-xs text-red-500 mt-1">{parentMenuError}</p>
        )}
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

      {formData.type === MenuType.TOP_PHONE && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            value={getTopMenuConfigValue(formData.config, 'topPhoneNumber')}
            onChange={(e) => updateConfigValue('topPhoneNumber', e.target.value)}
            placeholder="(+84) 123 456 789"
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1">Displayed as a hotline button in the storefront top bar.</p>
        </div>
      )}

      {formData.type === MenuType.TOP_EMAIL && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <Input
            type="email"
            value={getTopMenuConfigValue(formData.config, 'topEmailAddress')}
            onChange={(e) => updateConfigValue('topEmailAddress', e.target.value)}
            placeholder="support@example.com"
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1">Adds a quick mailto link for store visitors.</p>
        </div>
      )}

      {formData.type === MenuType.TOP_CURRENT_TIME && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Date &amp; Time Format</label>
          <Select
            value={
              getTopMenuConfigValue(formData.config, 'topTimeFormat') || TopMenuTimeFormat.HOURS_MINUTES
            }
            onChange={(value) => updateConfigValue('topTimeFormat', value)}
            options={TOP_TIME_FORMAT_OPTIONS}
            className="mt-1"
            size="md"
          />
          <p className="text-xs text-gray-500 mt-1">Formats follow Day.js tokens. Default selection uses <code>HH:mm</code>.</p>
        </div>
      )}

      {formData.type === MenuType.CALL_BUTTON && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            value={getConfigStringValue(formData.config, CALL_BUTTON_CONFIG_KEY)}
            onChange={(e) => updateArbitraryConfigValue(CALL_BUTTON_CONFIG_KEY, e.target.value)}
            placeholder="(+84) 123 456 789"
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number used when creating the <code>tel:</code> link. The visible label still comes from translations.
          </p>
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
            checked={isTopMenu ? false : formData.isMegaMenu}
            onChange={(checked) => {
              if (isTopMenu) {
                return;
              }
              updateFormData('isMegaMenu', checked);
            }}
            label="Mega Menu"
            disabled={isTopMenu}
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

      <ColorSelector
        value={formData.borderColor}
        onChange={(color) => updateFormData('borderColor', color)}
        placeholder="#E5E7EB"
        label="Border Color"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Border Width</label>
        <Input
          value={formData.borderWidth || ''}
          onChange={(e) => updateFormData('borderWidth', e.target.value)}
          placeholder="1px"
          className="mt-1"
          inputSize="md"
        />
      </div>

      {isSubMenu && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub Menu Display</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Type</label>
            <Select
              value={formData.subMenuVariant || 'link'}
              onChange={(value) => handleSubMenuVariantChange(value as 'link' | 'button')}
              options={[
                { value: 'link', label: 'Menu Item' },
                { value: 'button', label: 'Custom Button' },
              ]}
              className="mt-1"
              size="md"
            />
          </div>

          {formData.subMenuVariant === 'button' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Button Border Radius</label>
                  <MeasurementPresetInput
                    value={formData.buttonBorderRadius || ''}
                    onChange={(val) => updateFormData('buttonBorderRadius', val || undefined)}
                    presets={{ small: '4px', medium: '12px', large: '9999px' }}
                    labels={{
                      default: 'Use default',
                      small: 'Small',
                      medium: 'Medium',
                      large: 'Large',
                      custom: 'Custom',
                      customHelper: 'Enter a number and choose px, rem, or em.',
                    }}
                    className="mt-1"
                    selectPlaceholder="Choose a preset"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pick a preset or use Custom to enter your own radius with px, rem, or em.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Button Animation</label>
                  <Select
                    value={formData.buttonAnimation || 'none'}
                    onChange={(value) => updateFormData('buttonAnimation', value as 'none' | 'pulse' | 'float')}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'pulse', label: 'Pulse' },
                      { value: 'float', label: 'Floating' },
                    ]}
                    className="mt-1"
                    size="md"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Use the color, icon, and link fields above to finish styling the button.</p>
            </>
          )}
        </div>
      )}

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

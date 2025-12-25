import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('menus');
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
        buttonSize: (menu.config?.buttonSize as 'small' | 'medium' | 'large') || undefined,
        buttonAnimation: (menu.config?.buttonAnimation as 'none' | 'pulse' | 'float' | 'ring') || undefined,
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
      label: t(`menus.types.${option.value}`),
      disabled: option.disabled,
    }));
  }, [isTopMenu, t]);

  const topTimeFormatOptions = useMemo<SelectOption[]>(() =>
    (Object.values(TopMenuTimeFormat) as TopMenuTimeFormat[]).map((value) => ({
      value,
      label: t(`menus.timeFormats.${value}`),
    })),
    [t]);

  const targetOptions = useMemo(() => MENU_TARGET_OPTIONS.map(opt => ({
    value: opt.value as MenuTarget,
    label: t(`menus.targets.${opt.value}`)
  })), [t]);

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
      'buttonSize',
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
    assign('buttonSize', normalizedSubMenuVariant === 'button' ? (formData.buttonSize || 'medium') : undefined);

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
    ...DEFAULT_MENU_GROUP_OPTIONS.map(opt => ({
      value: opt.value,
      label: t(`menus.groups.${opt.value}`)
    })),
    ...menuGroups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.menuGroup')}</label>
          <Select
            value={formData.menuGroup}
            onChange={handleMenuGroupChange}
            options={groupOptions}
            className="mt-1"
            size="md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.type')}</label>
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
          <p className="text-xs text-gray-500 mt-1">{t('form.helpers.loadingParents')}</p>
        )}
        {!isParentLoading && parentMenuError && (
          <p className="text-xs text-red-500 mt-1">{t('form.helpers.errorLoadingParents')}</p>
        )}
      </div>

      {(formData.type === MenuType.LINK || formData.type === MenuType.BANNER) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.url')}</label>
            <Input
              value={formData.url || ''}
              onChange={(e) => updateFormData('url', e.target.value)}
              placeholder={t('form.placeholders.exampleUrl')}
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.target')}</label>
            <Select
              value={formData.target}
              onChange={(value) => updateFormData('target', value as MenuTarget)}
              options={targetOptions}
              className="mt-1"
              size="md"
            />
          </div>
        </div>
      )}

      {formData.type === MenuType.PRODUCT && (
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.product')}</label>
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
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.category')}</label>
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
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.brand')}</label>
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
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.phoneNumber')}</label>
          <Input
            value={getTopMenuConfigValue(formData.config, 'topPhoneNumber')}
            onChange={(e) => updateConfigValue('topPhoneNumber', e.target.value)}
            placeholder={t('form.placeholders.phoneExample')}
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1">{t('form.helpers.topPhone')}</p>
        </div>
      )}

      {formData.type === MenuType.TOP_EMAIL && (
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.emailAddress')}</label>
          <Input
            type="email"
            value={getTopMenuConfigValue(formData.config, 'topEmailAddress')}
            onChange={(e) => updateConfigValue('topEmailAddress', e.target.value)}
            placeholder={t('form.placeholders.emailExample')}
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1">{t('form.helpers.topEmail')}</p>
        </div>
      )}

      {formData.type === MenuType.TOP_CURRENT_TIME && (
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.dateTimeFormat')}</label>
          <Select
            value={
              getTopMenuConfigValue(formData.config, 'topTimeFormat') || TopMenuTimeFormat.HOURS_MINUTES
            }
            onChange={(value) => updateConfigValue('topTimeFormat', value)}
            options={topTimeFormatOptions}
            className="mt-1"
            size="md"
          />
          <p className="text-xs text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: t('form.helpers.topTime') }} />
        </div>
      )}

      {formData.type === MenuType.CALL_BUTTON && (
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.phoneNumber')}</label>
          <Input
            value={getConfigStringValue(formData.config, CALL_BUTTON_CONFIG_KEY)}
            onChange={(e) => updateArbitraryConfigValue(CALL_BUTTON_CONFIG_KEY, e.target.value)}
            placeholder={t('form.placeholders.phoneExample')}
            className="mt-1"
            inputSize="md"
          />
          <p className="text-xs text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: t('form.helpers.callButton') }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.position')}</label>
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
            label={t('form.labels.enabled')}
          />
          <Toggle
            checked={isTopMenu ? false : formData.isMegaMenu}
            onChange={(checked) => {
              if (isTopMenu) {
                return;
              }
              updateFormData('isMegaMenu', checked);
            }}
            label={t('form.labels.megaMenu')}
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
          label={t('form.labels.textColor')}
        />
      </div>

      <ColorSelector
        value={formData.backgroundColor}
        onChange={(color) => updateFormData('backgroundColor', color)}
        placeholder="#FFFFFF"
        label={t('form.labels.backgroundColor')}
      />

      <ColorSelector
        value={formData.borderColor}
        onChange={(color) => updateFormData('borderColor', color)}
        placeholder="#E5E7EB"
        label={t('form.labels.borderColor')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('form.labels.borderWidth')}</label>
        <Input
          value={formData.borderWidth || ''}
          onChange={(e) => updateFormData('borderWidth', e.target.value)}
          placeholder={t('form.placeholders.pxExample')}
          className="mt-1"
          inputSize="md"
        />
      </div>

      {isSubMenu && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('form.labels.subMenuDisplay')}</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.displayType')}</label>
            <Select
              value={formData.subMenuVariant || 'link'}
              onChange={(value) => handleSubMenuVariantChange(value as 'link' | 'button')}
              options={[
                { value: 'link', label: t('form.options.menuItem') },
                { value: 'button', label: t('form.options.customButton') },
              ]}
              className="mt-1"
              size="md"
            />
          </div>

          {formData.subMenuVariant === 'button' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('form.labels.buttonBorderRadius')}</label>
                  <MeasurementPresetInput
                    value={formData.buttonBorderRadius || ''}
                    onChange={(val) => updateFormData('buttonBorderRadius', val || undefined)}
                    presets={{ small: '4px', medium: '12px', large: '9999px' }}
                    labels={{
                      default: t('form.options.useDefault'),
                      small: t('form.options.small'),
                      medium: t('form.options.medium'),
                      large: t('form.options.large'),
                      custom: t('form.options.custom'),
                      customHelper: t('form.helpers.measurementCustomHelper'),
                    }}
                    className="mt-1"
                    selectPlaceholder="Choose a preset"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('form.helpers.buttonBorderRadius')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('form.labels.buttonSize')}</label>
                  <Select
                    value={formData.buttonSize || 'medium'}
                    onChange={(value) => updateFormData('buttonSize', value as 'small' | 'medium' | 'large')}
                    options={[
                      { value: 'small', label: t('form.options.small') },
                      { value: 'medium', label: t('form.options.medium') },
                      { value: 'large', label: t('form.options.large') },
                    ]}
                    className="mt-1"
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('form.labels.buttonAnimation')}</label>
                  <Select
                    value={formData.buttonAnimation || 'none'}
                    onChange={(value) => updateFormData('buttonAnimation', value as 'none' | 'pulse' | 'float' | 'ring')}
                    options={[
                      { value: 'none', label: t('form.options.none') },
                      { value: 'pulse', label: t('form.options.pulse') },
                      { value: 'float', label: t('form.options.floating') },
                      { value: 'ring', label: t('form.options.ring') },
                    ]}
                    className="mt-1"
                    size="md"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">{t('form.helpers.buttonStyling')}</p>
            </>
          )}
        </div>
      )}

      {/* Enhanced Customization Options */}
      {formData.isMegaMenu && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('form.labels.megaMenuCustomization')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.layout')}</label>
              <Select
                value={formData.layout || 'vertical'}
                onChange={(value) => updateFormData('layout', value as 'vertical' | 'grid' | 'horizontal')}
                options={[
                  { value: 'vertical', label: t('form.options.vertical') },
                  { value: 'grid', label: t('form.options.grid') },
                  { value: 'horizontal', label: t('form.options.horizontal') }
                ]}
                className="mt-1"
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.iconSize')}</label>
              <Select
                value={formData.imageSize || 'medium'}
                onChange={(value) => updateFormData('imageSize', value as 'small' | 'medium' | 'large')}
                options={[
                  { value: 'small', label: t('form.options.small') },
                  { value: 'medium', label: t('form.options.medium') },
                  { value: 'large', label: t('form.options.large') }
                ]}
                className="mt-1"
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.hoverEffect')}</label>
              <Select
                value={formData.hoverEffect || 'none'}
                onChange={(value) => updateFormData('hoverEffect', value as 'none' | 'scale' | 'slide' | 'fade')}
                options={[
                  { value: 'none', label: t('form.options.none') },
                  { value: 'scale', label: t('form.options.scale') },
                  { value: 'slide', label: t('form.options.slide') },
                  { value: 'fade', label: t('form.options.fade') }
                ]}
                className="mt-1"
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.maxItems')}</label>
              <Input
                type="number"
                value={formData.maxItems || ''}
                onChange={(e) => updateFormData('maxItems', parseInt(e.target.value) || undefined)}
                placeholder={t('form.placeholders.unlimited')}
                className="mt-1"
                inputSize="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.columnSpan')}</label>
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
              label={t('form.labels.showTitle')}
            />
            <Toggle
              checked={formData.showDescription !== false}
              onChange={(checked) => updateFormData('showDescription', checked)}
              label={t('form.labels.showDescription')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.customCssClass')}</label>
            <Input
              value={formData.customClass || ''}
              onChange={(e) => updateFormData('customClass', e.target.value)}
              placeholder={t('form.placeholders.customClassExample')}
              className="mt-1"
              inputSize="md"
            />
          </div>
        </div>
      )}

      {/* Badge Configuration */}
      <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('form.labels.badgeConfiguration')}</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('form.labels.badgeText')}</label>
          <Input
            value={formData.badge?.text || ''}
            onChange={(e) => updateBadge('text', e.target.value)}
            placeholder={t('form.placeholders.badgeTextNew')}
            className="mt-1"
            inputSize="md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSelector
            value={formData.badge?.color}
            onChange={(color) => updateBadge('color', color)}
            placeholder={t('form.placeholders.colorExample').replace('#000000', '#FFFFFF')}
            label={t('form.labels.badgeTextColor')}
          />
          <ColorSelector
            value={formData.badge?.backgroundColor}
            onChange={(color) => updateBadge('backgroundColor', color)}
            placeholder="#EF4444"
            label={t('form.labels.badgeBackgroundColor')}
          />
        </div>
      </div>

      {/* Banner Configuration */}
      {formData.type === MenuType.BANNER && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('form.labels.bannerConfiguration')}</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.bannerTitle')}</label>
            <Input
              value={formData.bannerConfig?.title || ''}
              onChange={(e) => updateBannerConfig('title', e.target.value)}
              placeholder={t('form.placeholders.bannerTitle')}
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.subtitle')}</label>
            <Input
              value={formData.bannerConfig?.subtitle || ''}
              onChange={(e) => updateBannerConfig('subtitle', e.target.value)}
              placeholder={t('form.placeholders.bannerSubtitle')}
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.description')}</label>
            <textarea
              value={formData.bannerConfig?.description || ''}
              onChange={(e) => updateBannerConfig('description', e.target.value)}
              placeholder={t('form.placeholders.bannerDescription')}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.buttonText')}</label>
              <Input
                value={formData.bannerConfig?.buttonText || ''}
                onChange={(e) => updateBannerConfig('buttonText', e.target.value)}
                placeholder={t('form.placeholders.shopNow')}
                className="mt-1"
                inputSize="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.buttonLink')}</label>
              <Input
                value={formData.bannerConfig?.buttonLink || ''}
                onChange={(e) => updateBannerConfig('buttonLink', e.target.value)}
                placeholder={t('form.placeholders.specialOffers')}
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
              label={t('form.labels.bannerBackground')}
            />
            <ColorSelector
              value={formData.bannerConfig?.textColor}
              onChange={(color) => updateBannerConfig('textColor', color)}
              placeholder={t('form.placeholders.colorExample').replace('#000000', '#FFFFFF')}
              label={t('form.labels.bannerTextColor')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.position')}</label>
              <Select
                value={formData.bannerConfig?.position || 'bottom'}
                onChange={(value) => updateBannerConfig('position', value as 'top' | 'bottom')}
                options={[
                  { value: 'top', label: t('form.options.top') },
                  { value: 'bottom', label: t('form.options.bottom') }
                ]}
                className="mt-1"
                size="md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.backgroundImageUrl')}</label>
            <Input
              value={formData.bannerConfig?.backgroundImage || ''}
              onChange={(e) => updateBannerConfig('backgroundImage', e.target.value)}
              placeholder={t('form.placeholders.imageUrl')}
              className="mt-1"
              inputSize="md"
            />
          </div>
        </div>
      )}

      {/* Translations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">{t('form.labels.translations')}</h4>
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
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.label')}</label>
            <Input
              value={formData.translations[activeLocale]?.label || ''}
              onChange={(e) => updateTranslation(activeLocale, 'label', e.target.value)}
              placeholder={t('form.placeholders.menuLabel')}
              className="mt-1"
              inputSize="md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('form.labels.description')}</label>
            <textarea
              value={formData.translations[activeLocale]?.description || ''}
              onChange={(e) => updateTranslation(activeLocale, 'description', e.target.value)}
              placeholder={t('form.placeholders.menuDescription')}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
            />
          </div>

          {formData.type === MenuType.CUSTOM_HTML && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('form.labels.customHtml')}</label>
              <textarea
                value={formData.translations[activeLocale]?.customHtml || ''}
                onChange={(e) => updateTranslation(activeLocale, 'customHtml', e.target.value)}
                placeholder={t('form.placeholders.customHtmlContent')}
                rows={6}
                className="mt-1 w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 resize-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel} type="button">
          {t('form.buttons.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {menu ? t('form.buttons.update') : t('form.buttons.create')}
        </Button>
      </div>
    </form>
  );
};

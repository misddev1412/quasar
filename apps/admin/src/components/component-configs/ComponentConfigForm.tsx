import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';
import { SECTION_TYPE_LABELS } from '@shared/enums/section.enums';
import { Input } from '../common/Input';
import { Select, type SelectOption } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { JsonEditor } from '../common/JsonEditor';
import { Toggle } from '../common/Toggle';
import { Button } from '../common/Button';
import { FiChevronDown, FiChevronRight, FiCode, FiList, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Layers, SlidersHorizontal, Database, PanelLeft } from 'lucide-react';
import { IconSelector } from '../menus/IconSelector';
import { ColorSelector } from '../common/ColorSelector';
import { CategorySelector } from '../menus/CategorySelector';
import { ProductSelector } from '../menus/ProductSelector';
import { BrandSelector } from '../menus/BrandSelector';
import { UnifiedIcon } from '../common/UnifiedIcon';
import Tabs from '../common/Tabs';
import { Link } from 'react-router-dom';
import type { ComponentConfigNode } from './componentConfigTree';
import { SearchSelect } from '../common/SearchSelect';
import type { MultiValue } from 'react-select';
import { trpc } from '../../utils/trpc';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import type { AdminSection } from '../../hooks/useSectionsManager';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { createMainMenuConfig, type MainMenuConfig } from '@shared/types/navigation.types';
import MainMenuAppearanceEditor from './MainMenuAppearanceEditor';

type TranslationFn = ReturnType<typeof useTranslationWithBackend>['t'];

type SidebarLinkType = 'custom' | 'category' | 'product' | 'brand';
type SidebarTitleFontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type SidebarTitleFontSize = 'xs' | 'sm' | 'base' | 'lg';
type SidebarTextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase';

interface SidebarMenuItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: string;
  linkType: SidebarLinkType;
  referenceId: string;
  textTransform: SidebarTextTransform;
  children: SidebarMenuItem[];
}

interface SidebarMenuSection {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  titleFontColor: string;
  titleFontWeight: SidebarTitleFontWeight;
  titleFontSize: SidebarTitleFontSize;
  titleUppercase: boolean;
  titleIcon: string;
  showTitleIcon: boolean;
  showItemIcons: boolean;
  itemFontSize: SidebarTitleFontSize;
  itemFontWeight: SidebarTitleFontWeight;
  itemFontColor: string;
  itemUppercase: boolean;
  items: SidebarMenuItem[];
}

interface SidebarMenuConfig {
  enabled: boolean;
  title: string;
  description: string;
  showTitle: boolean;
  showSidebarHeader: boolean;
  showDescription: boolean;
  sections: SidebarMenuSection[];
}

interface ComponentOption {
  id: string;
  componentKey: string;
  displayName: string;
  depth: number;
}

interface SectionSelectOption {
  value: string;
  label: string;
  data: AdminSection;
}

type ProductCardLayout = 'vertical' | 'horizontal';
type ProductCardBadgeStyle = 'pill' | 'square';
type ProductCardPriceDisplay = 'stacked' | 'inline';
type ProductCardFontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type ProductCardFontSize = 'sm' | 'base' | 'lg' | 'xl';
type ProductCardPriceTone = 'muted' | 'default' | 'emphasis' | 'custom';
type ProductCardThumbnailOrientation = 'portrait' | 'landscape';

interface ProductCardTitleStyle {
  fontWeight: ProductCardFontWeight;
  fontSize: ProductCardFontSize;
}

interface ProductCardPriceStyle {
  colorTone: ProductCardPriceTone;
  customColor?: string;
}

interface ProductCardThumbnailSettings {
  orientation: ProductCardThumbnailOrientation;
}

interface ProductCardConfigState extends Record<string, unknown> {
  layout: ProductCardLayout;
  imageHeight: string;
  showAddToCart: boolean;
  showWishlist: boolean;
  showQuickView: boolean;
  showRating: boolean;
  showShortDescription: boolean;
  badgeStyle: ProductCardBadgeStyle;
  priceDisplay: ProductCardPriceDisplay;
  titleStyle: ProductCardTitleStyle;
  priceStyle: ProductCardPriceStyle;
  thumbnail: ProductCardThumbnailSettings;
}

interface ProductCardTitleConfigState extends Record<string, unknown> {
  clampLines: number;
  htmlTag: string;
  fontWeight: ProductCardFontWeight;
  fontSize: ProductCardFontSize;
  textColor: string;
  uppercase: boolean;
}

interface ProductCardPriceConfigState extends Record<string, unknown> {
  locale: string;
  currency: string;
  showCompareAtPrice: boolean;
  showDivider: boolean;
  fontWeight: ProductCardFontWeight;
  fontSize: ProductCardFontSize;
  colorTone: ProductCardPriceTone;
  customColor: string;
}

const SIDEBAR_TITLE_FONT_WEIGHT_VALUES: SidebarTitleFontWeight[] = ['normal', 'medium', 'semibold', 'bold'];
const SIDEBAR_TITLE_FONT_SIZE_VALUES: SidebarTitleFontSize[] = ['xs', 'sm', 'base', 'lg'];

const isSidebarTitleFontWeight = (value: unknown): value is SidebarTitleFontWeight =>
  typeof value === 'string' && SIDEBAR_TITLE_FONT_WEIGHT_VALUES.includes(value as SidebarTitleFontWeight);

const isSidebarTitleFontSize = (value: unknown): value is SidebarTitleFontSize =>
  typeof value === 'string' && SIDEBAR_TITLE_FONT_SIZE_VALUES.includes(value as SidebarTitleFontSize);

interface PersistedSidebarItem extends Record<string, unknown> {
  id?: string;
  label?: string;
  href?: string;
  description?: string;
  icon?: string;
  linkType?: SidebarLinkType;
  referenceId?: string;
  textTransform?: SidebarTextTransform;
  children?: PersistedSidebarItem[];
}

interface PersistedSidebarSection extends Record<string, unknown> {
  id?: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  titleFontColor?: string;
  titleFontWeight?: SidebarTitleFontWeight;
  titleFontSize?: SidebarTitleFontSize;
  titleUppercase?: boolean;
  titleIcon?: string;
  showTitleIcon?: boolean;
  showItemIcons?: boolean;
  itemFontSize?: SidebarTitleFontSize;
  itemFontWeight?: SidebarTitleFontWeight;
  itemFontColor?: string;
  itemUppercase?: boolean;
  items?: PersistedSidebarItem[];
}

interface PersistedSidebarConfig extends Record<string, unknown> {
  enabled?: boolean;
  title?: string;
  description?: string;
  showTitle?: boolean;
  showSidebarHeader?: boolean;
  showDescription?: boolean;
  sections?: PersistedSidebarSection[];
}

const createSidebarId = () => `sidebar-${Math.random().toString(36).slice(2, 10)}`;

const createSidebarItem = (): SidebarMenuItem => ({
  id: createSidebarId(),
  label: '',
  href: '',
  description: '',
  icon: '',
  linkType: 'custom',
  referenceId: '',
  textTransform: 'none',
  children: [],
});

const createSidebarSection = (): SidebarMenuSection => ({
  id: createSidebarId(),
  title: '',
  description: '',
  backgroundColor: '',
  titleFontColor: '',
  titleFontWeight: 'semibold',
  titleFontSize: 'sm',
  titleUppercase: false,
  titleIcon: '',
  showTitleIcon: true,
  showItemIcons: true,
  itemFontSize: 'sm',
  itemFontWeight: 'normal',
  itemFontColor: '',
  itemUppercase: false,
  items: [createSidebarItem()],
});

const formatPageLabel = (page: string) =>
  page.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const isSidebarLinkType = (value: unknown): value is SidebarLinkType =>
  value === 'custom' || value === 'category' || value === 'product' || value === 'brand';

const isSidebarTextTransform = (value: unknown): value is SidebarTextTransform =>
  value === 'none' || value === 'uppercase' || value === 'capitalize' || value === 'lowercase';

const parseSidebarItems = (
  rawItems?: PersistedSidebarItem[],
  parentId?: string,
  { fallbackToDefault }: { fallbackToDefault: boolean } = { fallbackToDefault: true },
): SidebarMenuItem[] => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return fallbackToDefault ? [createSidebarItem()] : [];
  }

  return rawItems.map((item, index) => {
    const baseId = typeof item?.id === 'string' && item.id.trim().length > 0
      ? item.id
      : `${parentId || createSidebarId()}-item-${index}`;
    const normalizedLinkType = isSidebarLinkType(item?.linkType) ? item.linkType : 'custom';
    const children = parseSidebarItems(item?.children as PersistedSidebarItem[] | undefined, baseId, {
      fallbackToDefault: false,
    });

    return {
      id: baseId,
      label: typeof item?.label === 'string' ? item.label : '',
      href: typeof item?.href === 'string' ? item.href : '',
      description: typeof item?.description === 'string' ? item.description : '',
      icon: typeof item?.icon === 'string' ? item.icon : '',
      linkType: normalizedLinkType,
      referenceId: typeof item?.referenceId === 'string' ? item.referenceId : '',
      textTransform: isSidebarTextTransform(item?.textTransform) ? item.textTransform : 'none',
      children,
    };
  });
};

const parseSidebarConfig = (raw?: PersistedSidebarConfig | null): SidebarMenuConfig => {
  if (!raw) {
    return {
      enabled: true,
      title: '',
      description: '',
      showTitle: true,
      showSidebarHeader: true,
      showDescription: true,
      sections: [createSidebarSection()],
    };
  }

  const sections = Array.isArray(raw.sections)
    ? raw.sections.map((section, index) => {
      const baseId = typeof section?.id === 'string' && section.id.trim().length > 0
        ? section.id
        : `${createSidebarId()}-${index}`;
      const items = parseSidebarItems(section?.items as PersistedSidebarItem[] | undefined, baseId, {
        fallbackToDefault: true,
      });
      const showTitleIcon = section?.showTitleIcon !== false;
      return {
        id: baseId,
        title: typeof section?.title === 'string' ? section.title : '',
        description: typeof section?.description === 'string' ? section.description : '',
        backgroundColor: typeof section?.backgroundColor === 'string' ? section.backgroundColor : '',
        titleFontColor: typeof section?.titleFontColor === 'string' ? section.titleFontColor : '',
        titleFontWeight: isSidebarTitleFontWeight(section?.titleFontWeight) ? section.titleFontWeight : 'semibold',
        titleFontSize: isSidebarTitleFontSize(section?.titleFontSize) ? section.titleFontSize : 'sm',
        titleUppercase: Boolean(section?.titleUppercase),
        titleIcon: typeof section?.titleIcon === 'string' ? section.titleIcon : '',
        showTitleIcon,
        showItemIcons: typeof section?.showItemIcons === 'boolean' ? section.showItemIcons : true,
        itemFontSize: isSidebarTitleFontSize(section?.itemFontSize) ? section.itemFontSize : 'sm',
        itemFontWeight: isSidebarTitleFontWeight(section?.itemFontWeight) ? section.itemFontWeight : 'normal',
        itemFontColor: typeof section?.itemFontColor === 'string' ? section.itemFontColor : '',
        itemUppercase: Boolean(section?.itemUppercase),
        items: items.length > 0 ? items : [createSidebarItem()],
      };
    })
    : [createSidebarSection()];

  return {
    enabled: Boolean(raw.enabled ?? true),
    title: typeof raw.title === 'string' ? raw.title : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    showTitle: raw.showTitle !== false,
    showSidebarHeader: raw.showSidebarHeader !== false,
    showDescription: raw.showDescription !== false,
    sections: sections.length > 0 ? sections : [createSidebarSection()],
  };
};

const PRODUCT_CARD_FONT_WEIGHTS: ProductCardFontWeight[] = ['normal', 'medium', 'semibold', 'bold'];
const PRODUCT_CARD_FONT_SIZES: ProductCardFontSize[] = ['sm', 'base', 'lg', 'xl'];
const PRODUCT_CARD_PRICE_TONES: ProductCardPriceTone[] = ['muted', 'default', 'emphasis', 'custom'];
const PRODUCT_CARD_ORIENTATIONS: ProductCardThumbnailOrientation[] = ['portrait', 'landscape'];

const isProductCardFontWeight = (value: unknown): value is ProductCardFontWeight =>
  typeof value === 'string' && PRODUCT_CARD_FONT_WEIGHTS.includes(value as ProductCardFontWeight);

const isProductCardFontSize = (value: unknown): value is ProductCardFontSize =>
  typeof value === 'string' && PRODUCT_CARD_FONT_SIZES.includes(value as ProductCardFontSize);

const isProductCardPriceTone = (value: unknown): value is ProductCardPriceTone =>
  typeof value === 'string' && PRODUCT_CARD_PRICE_TONES.includes(value as ProductCardPriceTone);

const isProductCardOrientation = (value: unknown): value is ProductCardThumbnailOrientation =>
  typeof value === 'string' && PRODUCT_CARD_ORIENTATIONS.includes(value as ProductCardThumbnailOrientation);

const normalizeStringValue = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  return fallback;
};

const normalizeBooleanValue = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeProductCardConfig = (raw?: Record<string, unknown>): ProductCardConfigState => {
  const source = (raw ?? {}) as Record<string, unknown>;
  const titleStyleSource =
    typeof source.titleStyle === 'object' && source.titleStyle !== null ? (source.titleStyle as Record<string, unknown>) : {};
  const priceStyleSource =
    typeof source.priceStyle === 'object' && source.priceStyle !== null ? (source.priceStyle as Record<string, unknown>) : {};
  const thumbnailSource =
    typeof source.thumbnail === 'object' && source.thumbnail !== null ? (source.thumbnail as Record<string, unknown>) : {};

  const normalized: ProductCardConfigState = {
    ...source,
    layout: source.layout === 'horizontal' ? 'horizontal' : 'vertical',
    imageHeight: normalizeStringValue(source.imageHeight, 'h-72'),
    showAddToCart: normalizeBooleanValue(source.showAddToCart, true),
    showWishlist: normalizeBooleanValue(source.showWishlist, true),
    showQuickView: normalizeBooleanValue(source.showQuickView, false),
    showRating: normalizeBooleanValue(source.showRating, true),
    showShortDescription: normalizeBooleanValue(source.showShortDescription, false),
    badgeStyle: source.badgeStyle === 'square' ? 'square' : 'pill',
    priceDisplay: source.priceDisplay === 'inline' ? 'inline' : 'stacked',
    titleStyle: {
      fontWeight: isProductCardFontWeight(titleStyleSource.fontWeight) ? titleStyleSource.fontWeight : 'semibold',
      fontSize: isProductCardFontSize(titleStyleSource.fontSize) ? titleStyleSource.fontSize : 'lg',
    },
    priceStyle: {
      colorTone: isProductCardPriceTone(priceStyleSource.colorTone) ? priceStyleSource.colorTone : 'emphasis',
      customColor: normalizeStringValue(priceStyleSource.customColor || priceStyleSource.color),
    },
    thumbnail: {
      orientation: isProductCardOrientation(thumbnailSource.orientation) ? thumbnailSource.orientation : 'portrait',
    },
  };

  if (normalized.priceStyle.colorTone !== 'custom') {
    normalized.priceStyle.customColor = '';
  }

  return normalized;
};

const clampWithinRange = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeClampLines = (value: unknown, fallback = 2) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return clampWithinRange(Math.floor(parsed), 1, 6);
  }
  return fallback;
};

const normalizeProductCardTitleConfig = (raw?: Record<string, unknown>): ProductCardTitleConfigState => {
  const source = (raw ?? {}) as Record<string, unknown>;
  const normalized: ProductCardTitleConfigState = {
    clampLines: normalizeClampLines(source.clampLines, 2),
    htmlTag: normalizeStringValue(source.htmlTag, 'h3') || 'h3',
    fontWeight: isProductCardFontWeight(source.fontWeight) ? source.fontWeight : 'semibold',
    fontSize: isProductCardFontSize(source.fontSize) ? source.fontSize : 'lg',
    textColor: normalizeStringValue(source.textColor),
    uppercase: normalizeBooleanValue(source.uppercase, false),
  };

  return normalized;
};

const normalizeProductCardPriceConfig = (raw?: Record<string, unknown>): ProductCardPriceConfigState => {
  const source = (raw ?? {}) as Record<string, unknown>;
  const normalized: ProductCardPriceConfigState = {
    locale: normalizeStringValue(source.locale, 'vi-VN'),
    currency: normalizeStringValue(source.currency, 'VND') || 'VND',
    showCompareAtPrice: normalizeBooleanValue(source.showCompareAtPrice, true),
    showDivider: normalizeBooleanValue(source.showDivider, false),
    fontWeight: isProductCardFontWeight(source.fontWeight) ? source.fontWeight : 'bold',
    fontSize: isProductCardFontSize(source.fontSize) ? source.fontSize : 'lg',
    colorTone: isProductCardPriceTone(source.colorTone) ? source.colorTone : 'emphasis',
    customColor: normalizeStringValue(source.customColor),
  };

  if (normalized.colorTone !== 'custom') {
    normalized.customColor = '';
  }

  return normalized;
};

const sanitizeSidebarItem = (item: SidebarMenuItem): PersistedSidebarItem | null => {
  const trimmedLabel = item.label.trim();
  if (!trimmedLabel) {
    return null;
  }

  const trimmedHref = item.href.trim();
  const trimmedDescriptionItem = item.description.trim();
  const trimmedIcon = item.icon.trim();
  const trimmedReferenceId = item.referenceId.trim();
  const normalizedLinkType = isSidebarLinkType(item.linkType) ? item.linkType : 'custom';

  const sanitizedChildren = (item.children || [])
    .map(sanitizeSidebarItem)
    .filter((child): child is PersistedSidebarItem => Boolean(child));

  const sanitizedItem: PersistedSidebarItem = {
    id: item.id,
    label: trimmedLabel,
    href: trimmedHref || undefined,
    description: trimmedDescriptionItem || undefined,
    icon: trimmedIcon || undefined,
    textTransform: item.textTransform !== 'none' ? item.textTransform : undefined,
  };

  if (normalizedLinkType !== 'custom') {
    sanitizedItem.linkType = normalizedLinkType;
  }

  if (trimmedReferenceId) {
    sanitizedItem.referenceId = trimmedReferenceId;
  }

  if (sanitizedChildren.length > 0) {
    sanitizedItem.children = sanitizedChildren;
  }

  return sanitizedItem;
};

const sanitizeSidebarConfig = (sidebar: SidebarMenuConfig): PersistedSidebarConfig => {
  const trimmedTitle = sidebar.title.trim();
  const trimmedDescription = sidebar.description.trim();
  const showTitle = sidebar.showTitle !== false;
  const showSidebarHeader = sidebar.showSidebarHeader !== false;
  const showDescription = sidebar.showDescription !== false;

  const sections = sidebar.sections
    .map((section) => {
      const trimmedSectionTitle = section.title.trim();
      const trimmedSectionDescription = section.description.trim();
      const trimmedBackgroundColor = section.backgroundColor.trim();
      const trimmedTitleFontColor = section.titleFontColor.trim();
      const trimmedItemFontColor = section.itemFontColor.trim();
      const trimmedTitleIcon = section.titleIcon.trim();
      const showTitleIcon = section.showTitleIcon !== false;
      const showItemIcons = section.showItemIcons !== false;
      const normalizedTitleFontWeight = isSidebarTitleFontWeight(section.titleFontWeight)
        ? section.titleFontWeight
        : 'semibold';
      const normalizedTitleFontSize = isSidebarTitleFontSize(section.titleFontSize)
        ? section.titleFontSize
        : 'sm';
      const normalizedItemFontWeight = isSidebarTitleFontWeight(section.itemFontWeight)
        ? section.itemFontWeight
        : 'normal';
      const normalizedItemFontSize = isSidebarTitleFontSize(section.itemFontSize)
        ? section.itemFontSize
        : 'sm';
      const items = section.items
        .map(sanitizeSidebarItem)
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      if (!trimmedSectionTitle && !trimmedSectionDescription && items.length === 0) {
        return null;
      }

      const sanitizedSection: PersistedSidebarSection = {
        id: section.id,
        title: trimmedSectionTitle || undefined,
        description: trimmedSectionDescription || undefined,
        items,
      };

      if (trimmedBackgroundColor) {
        sanitizedSection.backgroundColor = trimmedBackgroundColor;
      }
      if (trimmedTitleFontColor) {
        sanitizedSection.titleFontColor = trimmedTitleFontColor;
      }
      if (trimmedItemFontColor) {
        sanitizedSection.itemFontColor = trimmedItemFontColor;
      }
      if (section.titleUppercase) {
        sanitizedSection.titleUppercase = true;
      }
      if (section.itemUppercase) {
        sanitizedSection.itemUppercase = true;
      }
      if (normalizedTitleFontWeight !== 'semibold') {
        sanitizedSection.titleFontWeight = normalizedTitleFontWeight;
      }
      if (normalizedItemFontWeight !== 'normal') {
        sanitizedSection.itemFontWeight = normalizedItemFontWeight;
      }
      if (normalizedTitleFontSize !== 'sm') {
        sanitizedSection.titleFontSize = normalizedTitleFontSize;
      }
      if (normalizedItemFontSize !== 'sm') {
        sanitizedSection.itemFontSize = normalizedItemFontSize;
      }
      if (trimmedTitleIcon) {
        sanitizedSection.titleIcon = trimmedTitleIcon;
      }
      if (!showTitleIcon) {
        sanitizedSection.showTitleIcon = false;
      }
      if (!showItemIcons) {
        sanitizedSection.showItemIcons = false;
      }

      return sanitizedSection;
    })
    .filter((section): section is NonNullable<typeof section> => Boolean(section));

  const sanitized: PersistedSidebarConfig = {
    enabled: Boolean(sidebar.enabled),
    title: trimmedTitle || undefined,
    description: trimmedDescription || undefined,
    showTitle,
    showSidebarHeader,
    showDescription,
    sections,
  };

  return sanitized;
};

const extractDefaultConfigWithoutSidebar = (config?: Record<string, unknown>): Record<string, unknown> => {
  if (!config || typeof config !== 'object') {
    return {};
  }
  const clone = JSON.parse(JSON.stringify(config));
  if (clone && typeof clone === 'object' && 'sidebar' in clone) {
    delete (clone as Record<string, unknown>).sidebar;
  }
  return clone;
};

const extractPersistedSidebar = (config?: Record<string, unknown> | null): PersistedSidebarConfig | undefined => {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const sidebar = (config as Record<string, unknown>).sidebar;
  if (!sidebar || typeof sidebar !== 'object') {
    return undefined;
  }
  return sidebar as PersistedSidebarConfig;
};

type KeyValueType = 'string' | 'number' | 'boolean' | 'json';

interface KeyValueEntry {
  id: string;
  key: string;
  value: string;
  type: KeyValueType;
}

const createKeyValueId = () => `kv-${Math.random().toString(36).slice(2, 10)}`;

const createKeyValueEntry = (overrides?: Partial<KeyValueEntry>): KeyValueEntry => ({
  id: createKeyValueId(),
  key: '',
  value: '',
  type: 'string',
  ...overrides,
});

const objectToKeyValueEntries = (value?: Record<string, unknown>): KeyValueEntry[] => {
  if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
    return [createKeyValueEntry()];
  }

  return Object.entries(value).map(([key, entryValue]) => {
    if (typeof entryValue === 'number') {
      return createKeyValueEntry({ key, value: String(entryValue), type: 'number' });
    }
    if (typeof entryValue === 'boolean') {
      return createKeyValueEntry({ key, value: entryValue ? 'true' : 'false', type: 'boolean' });
    }
    if (typeof entryValue === 'string') {
      return createKeyValueEntry({ key, value: entryValue, type: 'string' });
    }
    return createKeyValueEntry({
      key,
      value: JSON.stringify(entryValue, null, 2),
      type: 'json',
    });
  });
};



export interface ComponentConfigFormValues {
  componentKey: string;
  displayName: string;
  description?: string | null;
  componentType: ComponentStructureType;
  category: ComponentCategory;
  position?: number;
  isEnabled: boolean;
  defaultConfig: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  allowedChildKeys: string[];
  previewMediaUrl?: string | null;
  parentId?: string | null;
  slotKey?: string | null;
  sectionIds?: string[];
  sections?: ComponentConfigNode['sections'];
}

interface ComponentConfigFormProps {
  initialValues?: Partial<ComponentConfigFormValues>;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
  parentOptions: SelectOption[];
  disallowedParentIds?: string[];
  componentOptions: ComponentOption[];
  childComponents?: ComponentConfigNode[];
  onSubmit: (values: ComponentConfigFormValues) => void;
  onCancel: () => void;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

const categoryOptions = Object.values(ComponentCategory).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const structureOptions = Object.values(ComponentStructureType).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type JsonErrorState = Partial<Record<'defaultConfig' | 'configSchema' | 'metadata', string>>;

export const ComponentConfigForm: React.FC<ComponentConfigFormProps> = ({
  initialValues,
  mode,
  isSubmitting = false,
  parentOptions,
  disallowedParentIds = [],
  componentOptions = [],
  childComponents = [],
  onSubmit,
  onCancel,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();

  const KEY_VALUE_TYPE_OPTIONS = [
    { value: 'string', label: t('componentConfigs.keyValueTypeText') },
    { value: 'number', label: t('componentConfigs.keyValueTypeNumber') },
    { value: 'boolean', label: t('componentConfigs.keyValueTypeToggle') },
    { value: 'json', label: t('componentConfigs.keyValueTypeJson') },
  ];

  const parseEntriesToObject = (
    entries: KeyValueEntry[],
  ): { data: Record<string, unknown>; errors: Record<string, string | undefined>; isValid: boolean } => {
    const data: Record<string, unknown> = {};
    const errors: Record<string, string | undefined> = {};

    for (const entry of entries) {
      const trimmedKey = entry.key.trim();
      const trimmedValue = entry.value.trim();

      if (!trimmedKey) {
        if (!trimmedValue) {
          errors[entry.id] = undefined;
        } else {
          errors[entry.id] = t('componentConfigs.fieldNameRequired');
        }
        return;
      }

      switch (entry.type) {
        case 'boolean':
          data[trimmedKey] = entry.value === 'true';
          errors[entry.id] = undefined;
          break;
        case 'number': {
          if (!trimmedValue) {
            errors[entry.id] = t('componentConfigs.enterNumber');
            break;
          }
          const parsedNumber = Number(trimmedValue);
          if (Number.isNaN(parsedNumber)) {
            errors[entry.id] = t('componentConfigs.invalidNumber');
            break;
          }
          data[trimmedKey] = parsedNumber;
          errors[entry.id] = undefined;
          break;
        }
        case 'json': {
          if (!trimmedValue) {
            errors[entry.id] = t('componentConfigs.provideJsonValue');
            break;
          }
          try {
            data[trimmedKey] = JSON.parse(trimmedValue);
            errors[entry.id] = undefined;
          } catch (error) {
            errors[entry.id] = t('componentConfigs.invalidJson');
          }
          break;
        }
        default:
          data[trimmedKey] = entry.value;
          errors[entry.id] = undefined;
          break;
      }
    }

    const isValid = Object.values(errors).every((error) => !error);
    return {
      data: isValid ? data : {},
      errors,
      isValid,
    };
  };

  const sanitizedInitialDefaultConfig = useMemo(
    () => extractDefaultConfigWithoutSidebar(initialValues?.defaultConfig),
    [initialValues?.defaultConfig],
  );
  const initialMetadata = useMemo(
    () => (initialValues?.metadata as Record<string, unknown> | undefined) ?? {},
    [initialValues?.metadata],
  );
  const initialConfigSchema = useMemo(
    () => (initialValues?.configSchema as Record<string, unknown> | undefined) ?? {},
    [initialValues?.configSchema],
  );

  const [formState, setFormState] = useState(() => {
    return {
      componentKey: initialValues?.componentKey ?? '',
      displayName: initialValues?.displayName ?? '',
      description: initialValues?.description ?? '',
      componentType: initialValues?.componentType ?? ComponentStructureType.COMPOSITE,
      category: initialValues?.category ?? ComponentCategory.PRODUCT,
      position: initialValues?.position != null ? String(initialValues.position) : '',
      isEnabled: initialValues?.isEnabled ?? true,
      parentId: initialValues?.parentId ?? '',
      slotKey: initialValues?.slotKey ?? '',
      previewMediaUrl: initialValues?.previewMediaUrl ?? '',
      allowedChildKeys: (initialValues?.allowedChildKeys ?? []).join('\n'),
    };
  });

  const [defaultConfigEntries, setDefaultConfigEntries] = useState<KeyValueEntry[]>(() =>
    objectToKeyValueEntries(sanitizedInitialDefaultConfig),
  );
  const [metadataEntries, setMetadataEntries] = useState<KeyValueEntry[]>(() =>
    objectToKeyValueEntries(initialMetadata),
  );
  const [productCardConfig, setProductCardConfig] = useState<ProductCardConfigState>(() =>
    normalizeProductCardConfig(sanitizedInitialDefaultConfig),
  );
  const [productCardTitleConfig, setProductCardTitleConfig] = useState<ProductCardTitleConfigState>(() =>
    normalizeProductCardTitleConfig(sanitizedInitialDefaultConfig),
  );
  const [productCardPriceConfig, setProductCardPriceConfig] = useState<ProductCardPriceConfigState>(() =>
    normalizeProductCardPriceConfig(sanitizedInitialDefaultConfig),
  );
  const [mainMenuConfig, setMainMenuConfig] = useState<MainMenuConfig>(() =>
    createMainMenuConfig(sanitizedInitialDefaultConfig as Partial<MainMenuConfig>),
  );
  const [defaultConfigEntryErrors, setDefaultConfigEntryErrors] = useState<Record<string, string | undefined>>({});
  const [metadataEntryErrors, setMetadataEntryErrors] = useState<Record<string, string | undefined>>({});
  const [defaultConfigMode, setDefaultConfigMode] = useState<'friendly' | 'json'>('friendly');
  const [metadataMode, setMetadataMode] = useState<'friendly' | 'json'>('friendly');
  const [defaultConfigRaw, setDefaultConfigRaw] = useState(() =>
    JSON.stringify(sanitizedInitialDefaultConfig, null, 2),
  );
  const [metadataRaw, setMetadataRaw] = useState(() => JSON.stringify(initialMetadata, null, 2));
  const [configSchemaValue, setConfigSchemaValue] = useState(() =>
    JSON.stringify(initialConfigSchema, null, 2),
  );
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [jsonErrors, setJsonErrors] = useState<JsonErrorState>({});
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  const [sidebarConfig, setSidebarConfig] = useState<SidebarMenuConfig>(() =>
    parseSidebarConfig(extractPersistedSidebar(initialValues?.defaultConfig as Record<string, unknown> | undefined)),
  );

  const isProductsByCategory = formState.componentKey === 'products_by_category';
  const isProductCard = formState.componentKey === 'product_card';
  const isProductCardTitle = formState.componentKey === 'product_card.info.title';
  const isProductCardPrice = formState.componentKey === 'product_card.info.price';
  const isMainMenuAppearance = formState.componentKey === 'navigation.main_menu';
  const [pendingChildKey, setPendingChildKey] = useState('');

  const syncDefaultConfigState = useCallback((config: Record<string, unknown> | MainMenuConfig) => {
    const serializable = config as Record<string, unknown>;
    setDefaultConfigRaw(JSON.stringify(serializable, null, 2));
    setDefaultConfigEntries(objectToKeyValueEntries(serializable));
  }, []);

  useEffect(() => {
    setSidebarConfig(parseSidebarConfig(extractPersistedSidebar(initialValues?.defaultConfig as Record<string, unknown> | undefined)));
  }, [initialValues?.defaultConfig]);

  useEffect(() => {
    if (!isProductCard) {
      return;
    }
    const normalized = normalizeProductCardConfig(sanitizedInitialDefaultConfig);
    setProductCardConfig(normalized);
    syncDefaultConfigState(normalized);
  }, [isProductCard, sanitizedInitialDefaultConfig, syncDefaultConfigState]);

  useEffect(() => {
    if (!isProductCardTitle) {
      return;
    }
    const normalized = normalizeProductCardTitleConfig(sanitizedInitialDefaultConfig);
    setProductCardTitleConfig(normalized);
    syncDefaultConfigState(normalized);
  }, [isProductCardTitle, sanitizedInitialDefaultConfig, syncDefaultConfigState]);

  useEffect(() => {
    if (!isProductCardPrice) {
      return;
    }
    const normalized = normalizeProductCardPriceConfig(sanitizedInitialDefaultConfig);
    setProductCardPriceConfig(normalized);
    syncDefaultConfigState(normalized);
  }, [isProductCardPrice, sanitizedInitialDefaultConfig, syncDefaultConfigState]);

  useEffect(() => {
    if (!isMainMenuAppearance) {
      return;
    }
    const normalized = createMainMenuConfig(sanitizedInitialDefaultConfig as Partial<MainMenuConfig>);
    setMainMenuConfig(normalized);
    syncDefaultConfigState(normalized);
  }, [isMainMenuAppearance, sanitizedInitialDefaultConfig, syncDefaultConfigState]);

  // Generic sync for other components
  useEffect(() => {
    if (isProductCard || isProductCardTitle || isProductCardPrice || isMainMenuAppearance) {
      return;
    }
    const serializable = sanitizedInitialDefaultConfig as Record<string, unknown>;
    setDefaultConfigRaw(JSON.stringify(serializable, null, 2));
    setDefaultConfigEntries(objectToKeyValueEntries(serializable));
  }, [
    isProductCard,
    isProductCardTitle,
    isProductCardPrice,
    isMainMenuAppearance,
    sanitizedInitialDefaultConfig,
  ]);

  useEffect(() => {
    setMetadataRaw(JSON.stringify(initialMetadata, null, 2));
    setMetadataEntries(objectToKeyValueEntries(initialMetadata));
  }, [initialMetadata]);

  useEffect(() => {
    setConfigSchemaValue(JSON.stringify(initialConfigSchema, null, 2));
  }, [initialConfigSchema]);

  const parentSelectOptions = useMemo(() => {
    return parentOptions.map((option) => ({
      ...option,
      disabled: option.disabled || (option.value && disallowedParentIds.includes(option.value)),
    }));
  }, [parentOptions, disallowedParentIds]);

  const allowedChildKeysArray = useMemo(() => (
    formState.allowedChildKeys
      .split('\n')
      .map((key) => key.trim())
      .filter((key) => key.length > 0)
  ), [formState.allowedChildKeys]);

  const componentOptionLookup = useMemo(() => {
    const map = new Map<string, ComponentOption>();
    componentOptions.forEach((option) => {
      map.set(option.componentKey, option);
    });
    return map;
  }, [componentOptions]);

  const selectableChildOptions = useMemo(() => (
    componentOptions
      .filter((option) => !allowedChildKeysArray.includes(option.componentKey))
      .map((option) => ({
        value: option.componentKey,
        label: `${'— '.repeat(option.depth)}${option.displayName} (${option.componentKey})`,
      }))
  ), [componentOptions, allowedChildKeysArray]);

  const sectionsQuery = trpc.sections.listAll.useQuery<ApiResponse<AdminSection[]>>(
    {},
    { staleTime: 5 * 60 * 1000 },
  );

  const sectionOptions = useMemo<SectionSelectOption[]>(() => {
    const records = sectionsQuery.data?.data ?? [];
    return records.map((section) => ({
      value: section.id,
      label: `${formatPageLabel(section.page)} • ${SECTION_TYPE_LABELS[section.type] ?? section.type}`,
      data: section,
    }));
  }, [sectionsQuery.data]);

  const initialSectionIds = useMemo(() => {
    if (Array.isArray(initialValues?.sectionIds) && initialValues.sectionIds.length > 0) {
      return initialValues.sectionIds;
    }
    const linkedSections = (initialValues as ComponentConfigNode | undefined)?.sections;
    if (Array.isArray(linkedSections)) {
      return linkedSections
        .map((section) => section?.id)
        .filter((id): id is string => Boolean(id));
    }
    return [];
  }, [initialValues]);

  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(initialSectionIds);

  useEffect(() => {
    setSelectedSectionIds(initialSectionIds);
  }, [initialSectionIds]);

  const selectedSectionOptions = useMemo(() => {
    const optionMap = new Map(sectionOptions.map((option) => [option.value, option]));
    return selectedSectionIds
      .map((id) => optionMap.get(id))
      .filter((option): option is SectionSelectOption => Boolean(option));
  }, [sectionOptions, selectedSectionIds]);

  const handleSectionAssignmentsChange = useCallback(
    (options: MultiValue<SectionSelectOption>) => {
      setSelectedSectionIds(options.map((option) => option.value));
    },
    [],
  );

  const updateField = useCallback((field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleProductCardConfigChange = (
    nextValue: ProductCardConfigState | ((prev: ProductCardConfigState) => ProductCardConfigState),
  ) => {
    setProductCardConfig((prev) => {
      const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
      const normalized = normalizeProductCardConfig(resolved);
      if (isProductCard) {
        syncDefaultConfigState(normalized);
      }
      return normalized;
    });
  };

  const handleProductCardTitleConfigChange = (
    nextValue: ProductCardTitleConfigState | ((prev: ProductCardTitleConfigState) => ProductCardTitleConfigState),
  ) => {
    setProductCardTitleConfig((prev) => {
      const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
      const normalized = normalizeProductCardTitleConfig(resolved);
      if (isProductCardTitle) {
        syncDefaultConfigState(normalized);
      }
      return normalized;
    });
  };

  const handleProductCardPriceConfigChange = (
    nextValue: ProductCardPriceConfigState | ((prev: ProductCardPriceConfigState) => ProductCardPriceConfigState),
  ) => {
    setProductCardPriceConfig((prev) => {
      const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
      const normalized = normalizeProductCardPriceConfig(resolved);
      if (isProductCardPrice) {
        syncDefaultConfigState(normalized);
      }
      return normalized;
    });
  };

  const handleMainMenuConfigChange = (
    nextValue: MainMenuConfig | ((prev: MainMenuConfig) => MainMenuConfig),
  ) => {
    setMainMenuConfig((prev) => {
      const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
      const normalized = createMainMenuConfig(resolved);
      if (isMainMenuAppearance) {
        syncDefaultConfigState(normalized);
      }
      return normalized;
    });
  };

  const handleAddAllowedChildKey = useCallback((childKey: string) => {
    const trimmedKey = childKey.trim();
    if (!trimmedKey || allowedChildKeysArray.includes(trimmedKey)) {
      return;
    }
    const nextKeys = [...allowedChildKeysArray, trimmedKey];
    updateField('allowedChildKeys', nextKeys.join('\n'));
  }, [allowedChildKeysArray, updateField]);

  const handleRemoveAllowedChildKey = useCallback((childKey: string) => {
    const nextKeys = allowedChildKeysArray.filter((key) => key !== childKey);
    updateField('allowedChildKeys', nextKeys.join('\n'));
  }, [allowedChildKeysArray, updateField]);

  const handleChildSelectionAdd = useCallback(() => {
    if (!pendingChildKey) return;
    handleAddAllowedChildKey(pendingChildKey);
    setPendingChildKey('');
  }, [pendingChildKey, handleAddAllowedChildKey]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setJsonErrors({});
    setDefaultConfigEntryErrors({});
    setMetadataEntryErrors({});

    let parsedDefault: Record<string, unknown> = {};
    let parsedSchema: Record<string, unknown> = {};
    let parsedMetadata: Record<string, unknown> = {};

    if (defaultConfigMode === 'json') {
      try {
        parsedDefault = defaultConfigRaw.trim() ? JSON.parse(defaultConfigRaw) : {};
      } catch (error) {
        setJsonErrors((prev) => ({ ...prev, defaultConfig: (error as Error)?.message || t('componentConfigs.invalidJson') }));
        return;
      }
    } else if (isMainMenuAppearance) {
      parsedDefault = createMainMenuConfig(mainMenuConfig);
    } else if (isProductCard) {
      parsedDefault = productCardConfig;
    } else if (isProductCardTitle) {
      parsedDefault = productCardTitleConfig;
    } else if (isProductCardPrice) {
      parsedDefault = productCardPriceConfig;
    } else {
      const result = parseEntriesToObject(defaultConfigEntries);
      setDefaultConfigEntryErrors(result.errors);
      if (!result.isValid) {
        return;
      }
      parsedDefault = result.data;
    }

    if (metadataMode === 'json') {
      try {
        parsedMetadata = metadataRaw.trim() ? JSON.parse(metadataRaw) : {};
      } catch (error) {
        setJsonErrors((prev) => ({ ...prev, metadata: (error as Error)?.message || t('componentConfigs.invalidJson') }));
        return;
      }
    } else {
      const result = parseEntriesToObject(metadataEntries);
      setMetadataEntryErrors(result.errors);
      if (!result.isValid) {
        return;
      }
      parsedMetadata = result.data;
    }

    try {
      parsedSchema = configSchemaValue.trim() ? JSON.parse(configSchemaValue) : {};
    } catch (error) {
      setJsonErrors((prev) => ({ ...prev, configSchema: (error as Error)?.message || t('componentConfigs.invalidJson') }));
      return;
    }

    const allowedChildKeys = allowedChildKeysArray;

    if (isProductsByCategory) {
      parsedDefault.sidebar = sanitizeSidebarConfig(sidebarConfig);
    } else if (parsedDefault.sidebar) {
      delete parsedDefault.sidebar;
    }

    const payload: ComponentConfigFormValues = {
      componentKey: formState.componentKey.trim(),
      displayName: formState.displayName.trim(),
      description: formState.description?.trim() || undefined,
      componentType: formState.componentType,
      category: formState.category,
      position: formState.position ? Number(formState.position) : undefined,
      isEnabled: formState.isEnabled,
      parentId: formState.parentId ? formState.parentId : undefined,
      slotKey: formState.slotKey?.trim() || undefined,
      previewMediaUrl: formState.previewMediaUrl?.trim() || undefined,
      defaultConfig: parsedDefault,
      configSchema: parsedSchema,
      metadata: parsedMetadata,
      allowedChildKeys,
      sectionIds: selectedSectionIds,
    };

    onSubmit(payload);
  };

  const handleDefaultEntriesChange = (entries: KeyValueEntry[]) => {
    const normalized = entries.length > 0 ? entries : [createKeyValueEntry()];
    setDefaultConfigEntries(normalized);
    const validation = parseEntriesToObject(normalized);
    setDefaultConfigEntryErrors(validation.errors);
    if (validation.isValid) {
      setDefaultConfigRaw(JSON.stringify(validation.data, null, 2));
      setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
    }
  };

  const handleMetadataEntriesChange = (entries: KeyValueEntry[]) => {
    const normalized = entries.length > 0 ? entries : [createKeyValueEntry()];
    setMetadataEntries(normalized);
    const validation = parseEntriesToObject(normalized);
    setMetadataEntryErrors(validation.errors);
    if (validation.isValid) {
      setMetadataRaw(JSON.stringify(validation.data, null, 2));
      setJsonErrors((prev) => ({ ...prev, metadata: undefined }));
    }
  };

  const handleDefaultJsonChange = (value: string) => {
    setDefaultConfigRaw(value);
    setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
  };

  const handleMetadataJsonChange = (value: string) => {
    setMetadataRaw(value);
    setJsonErrors((prev) => ({ ...prev, metadata: undefined }));
  };

  const handleConfigSchemaChange = (value: string) => {
    setConfigSchemaValue(value);
    setJsonErrors((prev) => ({ ...prev, configSchema: undefined }));
  };

  const switchDefaultConfigMode = (nextMode: 'friendly' | 'json') => {
    if (nextMode === defaultConfigMode) {
      return;
    }

    if (isProductCard || isProductCardTitle || isProductCardPrice || isMainMenuAppearance) {
      const currentConfig = isProductCard
        ? productCardConfig
        : isProductCardTitle
          ? productCardTitleConfig
          : isProductCardPrice
            ? productCardPriceConfig
            : mainMenuConfig;

      const normalizeCustomConfig = (value: Record<string, unknown>) => {
        if (isProductCard) {
          return normalizeProductCardConfig(value);
        }
        if (isProductCardTitle) {
          return normalizeProductCardTitleConfig(value);
        }
        if (isProductCardPrice) {
          return normalizeProductCardPriceConfig(value);
        }
        return createMainMenuConfig(value as Partial<MainMenuConfig>);
      };

      const applyNormalizedConfig = (config: Record<string, unknown>) => {
        if (isProductCard) {
          setProductCardConfig(config as ProductCardConfigState);
          syncDefaultConfigState(config);
          return;
        }
        if (isProductCardTitle) {
          setProductCardTitleConfig(config as ProductCardTitleConfigState);
          syncDefaultConfigState(config);
          return;
        }
        if (isProductCardPrice) {
          setProductCardPriceConfig(config as ProductCardPriceConfigState);
          syncDefaultConfigState(config);
          return;
        }
        const normalizedMenu = createMainMenuConfig(config as Partial<MainMenuConfig>);
        setMainMenuConfig(normalizedMenu);
        syncDefaultConfigState(normalizedMenu);
      };

      if (nextMode === 'json') {
        syncDefaultConfigState(currentConfig);
        setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
        setDefaultConfigMode('json');
        return;
      }

      try {
        const parsed = defaultConfigRaw.trim() ? JSON.parse(defaultConfigRaw) : {};
        const normalized = normalizeCustomConfig(parsed);
        applyNormalizedConfig(normalized);
        setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
        setDefaultConfigMode('friendly');
      } catch (error) {
        setJsonErrors((prev) => ({
          ...prev,
          defaultConfig: (error as Error)?.message || t('componentConfigs.invalidJson'),
        }));
      }
      return;
    }

    if (nextMode === 'json') {
      const validation = parseEntriesToObject(defaultConfigEntries);
      setDefaultConfigEntryErrors(validation.errors);
      if (!validation.isValid) {
        return;
      }
      setDefaultConfigRaw(JSON.stringify(validation.data, null, 2));
      setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
      setDefaultConfigMode('json');
      return;
    }

    try {
      const parsed = defaultConfigRaw.trim() ? JSON.parse(defaultConfigRaw) : {};
      setDefaultConfigEntries(objectToKeyValueEntries(parsed));
      setDefaultConfigEntryErrors({});
      setJsonErrors((prev) => ({ ...prev, defaultConfig: undefined }));
      setDefaultConfigMode('friendly');
    } catch (error) {
      setJsonErrors((prev) => ({
        ...prev,
        defaultConfig: (error as Error)?.message || t('componentConfigs.invalidJson'),
      }));
    }
  };

  const switchMetadataMode = (nextMode: 'friendly' | 'json') => {
    if (nextMode === metadataMode) {
      return;
    }

    if (nextMode === 'json') {
      const validation = parseEntriesToObject(metadataEntries);
      setMetadataEntryErrors(validation.errors);
      if (!validation.isValid) {
        return;
      }
      setMetadataRaw(JSON.stringify(validation.data, null, 2));
      setJsonErrors((prev) => ({ ...prev, metadata: undefined }));
      setMetadataMode('json');
      return;
    }

    try {
      const parsed = metadataRaw.trim() ? JSON.parse(metadataRaw) : {};
      setMetadataEntries(objectToKeyValueEntries(parsed));
      setMetadataEntryErrors({});
      setJsonErrors((prev) => ({ ...prev, metadata: undefined }));
      setMetadataMode('friendly');
    } catch (error) {
      setJsonErrors((prev) => ({
        ...prev,
        metadata: (error as Error)?.message || t('componentConfigs.invalidJson'),
      }));
    }
  };

  const totalTabs = isProductsByCategory ? 4 : 3;
  const resolvedActiveTab = typeof controlledActiveTab === 'number' ? controlledActiveTab : internalActiveTab;
  const handleTabChange = useCallback(
    (nextTab: number) => {
      if (onTabChange) {
        onTabChange(nextTab);
      } else {
        setInternalActiveTab(nextTab);
      }
    },
    [onTabChange],
  );

  useEffect(() => {
    if (resolvedActiveTab >= totalTabs) {
      handleTabChange(Math.max(0, totalTabs - 1));
    }
  }, [resolvedActiveTab, totalTabs, handleTabChange]);

  const structureTab = (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.componentVisibility')}</p>
          <p className="text-xs text-neutral-500">
            {t('componentConfigs.componentVisibilityDesc')}
          </p>
        </div>
        <Toggle
          checked={formState.isEnabled}
          onChange={(checked) => updateField('isEnabled', checked)}
          label=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.componentKey')}</label>
          <Input
            value={formState.componentKey}
            onChange={(e) => updateField('componentKey', e.target.value)}
            required
            placeholder={t('componentConfigs.componentKeyPlaceholder')}
          />
          <p className="text-xs text-neutral-500">{t('componentConfigs.componentKeyDesc')}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.displayName')}</label>
          <Input
            value={formState.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            required
            placeholder={t('componentConfigs.displayNamePlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.componentType')}</label>
          <Select
            value={formState.componentType}
            onChange={(value) => updateField('componentType', value as ComponentStructureType)}
            options={structureOptions}
            placeholder={t('componentConfigs.selectType')}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.category')}</label>
          <Select
            value={formState.category}
            onChange={(value) => updateField('category', value as ComponentCategory)}
            options={categoryOptions}
            placeholder={t('componentConfigs.selectCategory')}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.parentComponent')}</label>
          <Select
            value={formState.parentId}
            onChange={(value) => updateField('parentId', value)}
            options={parentSelectOptions}
            placeholder={t('componentConfigs.topLevelComponentPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.slotKey')}</label>
          <Input
            value={formState.slotKey}
            onChange={(e) => updateField('slotKey', e.target.value)}
            placeholder={t('componentConfigs.slotKeyPlaceholder')}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">{t('componentConfigs.sectionAssignments')}</p>
            {sectionsQuery.isFetching && (
              <span className="text-xs text-neutral-500">{t('componentConfigs.sectionAssignmentsRefreshing')}</span>
            )}
          </div>
          <SearchSelect<SectionSelectOption, true>
            isMulti
            options={sectionOptions}
            value={selectedSectionOptions}
            onChange={handleSectionAssignmentsChange}
            placeholder={t('componentConfigs.appliesToEverySection')}
            isLoading={sectionsQuery.isLoading}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            noOptionsMessage={() => t('componentConfigs.noSectionsAvailable')}
          />
          <p className="text-xs text-neutral-500">
            {t('componentConfigs.sectionAssignmentsDesc')}
          </p>
          {sectionsQuery.error && (
            <p className="text-xs text-red-500">
              {t('componentConfigs.unableToLoadSections')}
              {sectionsQuery.error.message ?? t('componentConfigs.unknownError')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.previewMediaUrl')}</label>
          <Input
            value={formState.previewMediaUrl}
            onChange={(e) => updateField('previewMediaUrl', e.target.value)}
            placeholder={t('componentConfigs.previewMediaUrlPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t('componentConfigs.position')}</label>
          <Input
            type="number"
            value={formState.position}
            onChange={(e) => updateField('position', e.target.value)}
            placeholder={t('componentConfigs.positionPlaceholder')}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-neutral-700">{t('common.description')}</label>
          <Textarea
            value={formState.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            placeholder={t('componentConfigs.descriptionPlaceholder')}
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.allowedChildComponents')}</p>
            <p className="text-xs text-neutral-500">{t('componentConfigs.allowedChildComponentsDesc')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                value={pendingChildKey}
                onChange={(value) => setPendingChildKey(value || '')}
                options={selectableChildOptions}
                placeholder={selectableChildOptions.length ? t('componentConfigs.selectChildComponent') : t('componentConfigs.noComponentsAvailable')}
                disabled={!selectableChildOptions.length}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChildSelectionAdd}
              disabled={!pendingChildKey}
            >
              {t('componentConfigs.addChildComponent')}
            </Button>
          </div>
          {allowedChildKeysArray.length > 0 ? (
            <div className="space-y-2">
              {allowedChildKeysArray.map((childKey) => {
                const option = componentOptionLookup.get(childKey);
                return (
                  <div
                    key={childKey}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {option?.displayName || childKey}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span>{childKey}</span>
                        {option?.id && (
                          <Link
                            to={`/component-configs/${option.id}/edit`}
                            className="text-primary-600 hover:text-primary-500 font-medium"
                          >
                            {t('componentConfigs.viewDetails')}
                          </Link>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAllowedChildKey(childKey)}
                      startIcon={<FiTrash2 className="h-4 w-4" />}
                    >
                      {t('componentConfigs.remove')}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">{t('componentConfigs.noChildComponentsSelected')}</p>
          )}
        </div>
        {childComponents.length > 0 && (
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t('componentConfigs.componentsUnder')} {formState.displayName || formState.componentKey}
              </p>
              <span className="text-xs text-neutral-500">{childComponents.length} {t('componentConfigs.items')}</span>
            </div>
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {childComponents.map((child) => (
                <Link
                  key={child.id}
                  to={`/component-configs/${child.id}/edit`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{child.displayName}</p>
                    <p className="text-xs text-neutral-500 truncate">{child.componentKey}</p>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const defaultsTab = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.defaultContent')}</p>
            <p className="text-xs text-neutral-500">{t('componentConfigs.defaultContentDesc')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => switchDefaultConfigMode(defaultConfigMode === 'friendly' ? 'json' : 'friendly')}
            startIcon={
              defaultConfigMode === 'friendly' ? <FiCode className="h-3.5 w-3.5" /> : <FiList className="h-3.5 w-3.5" />
            }
          >
            {defaultConfigMode === 'friendly' ? t('componentConfigs.editJson') : t('componentConfigs.simpleMode')}
          </Button>
        </div>
        <div className="mt-4">
          {defaultConfigMode === 'friendly' ? (
            isProductCard ? (
              <ProductCardDefaultsEditor
                value={productCardConfig}
                onChange={(next) => handleProductCardConfigChange(next)}
              />
            ) : isProductCardTitle ? (
              <ProductCardTitleEditor
                value={productCardTitleConfig}
                onChange={(next) => handleProductCardTitleConfigChange(next)}
              />
            ) : isProductCardPrice ? (
              <ProductCardPriceEditor
                value={productCardPriceConfig}
                onChange={(next) => handleProductCardPriceConfigChange(next)}
              />
            ) : isMainMenuAppearance ? (
              <MainMenuAppearanceEditor
                value={mainMenuConfig}
                onChange={(next) => handleMainMenuConfigChange(next)}
                t={t}
              />
            ) : (
              <KeyValueEditor
                entries={defaultConfigEntries}
                errors={defaultConfigEntryErrors}
                onChange={handleDefaultEntriesChange}
                t={t}
                keyValueTypeOptions={KEY_VALUE_TYPE_OPTIONS}
              />
            )
          ) : (
            <JsonEditor
              value={defaultConfigRaw}
              onChange={(value) => handleDefaultJsonChange(value)}
              height="400px"
              error={jsonErrors.defaultConfig}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.metadata')}</p>
            <p className="text-xs text-neutral-500">{t('componentConfigs.metadataDesc')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => switchMetadataMode(metadataMode === 'friendly' ? 'json' : 'friendly')}
            startIcon={
              metadataMode === 'friendly' ? <FiCode className="h-3.5 w-3.5" /> : <FiList className="h-3.5 w-3.5" />
            }
          >
            {metadataMode === 'friendly' ? t('componentConfigs.editJson') : t('componentConfigs.simpleMode')}
          </Button>
        </div>
        <div className="mt-4">
          {metadataMode === 'friendly' ? (
            <KeyValueEditor
              entries={metadataEntries}
              errors={metadataEntryErrors}
              onChange={handleMetadataEntriesChange}
              t={t}
              keyValueTypeOptions={KEY_VALUE_TYPE_OPTIONS}
            />
          ) : (
            <JsonEditor
              value={metadataRaw}
              onChange={(value) => handleMetadataJsonChange(value)}
              height="300px"
              error={jsonErrors.metadata}
            />
          )}
        </div>
      </div>
    </div>
  );

  const advancedTab = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShowSchemaEditor((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.validationSchema')}</p>
            <p className="text-xs text-neutral-500">{t('componentConfigs.validationSchemaDesc')}</p>
          </div>
          <FiChevronDown
            className={`h-5 w-5 text-neutral-500 transition-transform ${showSchemaEditor ? 'rotate-180' : ''}`}
          />
        </button>
        {showSchemaEditor && (
          <div className="border-t border-neutral-100 px-5 py-5">
            <JsonEditor
              value={configSchemaValue}
              onChange={(value) => handleConfigSchemaChange(value)}
              height="400px"
              error={jsonErrors.configSchema}
            />
          </div>
        )}
      </div>
    </div>
  );

  const getTabIconClass = (index: number) =>
    resolvedActiveTab === index ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500';

  const tabs = [
    { label: t('componentConfigs.tabStructure'), icon: <Layers className={`w-4 h-4 ${getTabIconClass(0)}`} />, content: structureTab },
    { label: t('componentConfigs.tabDefaults'), icon: <SlidersHorizontal className={`w-4 h-4 ${getTabIconClass(1)}`} />, content: defaultsTab },
    { label: t('componentConfigs.tabAdvanced'), icon: <Database className={`w-4 h-4 ${getTabIconClass(2)}`} />, content: advancedTab },
  ];

  if (isProductsByCategory) {
    const sidebarIndex = tabs.length;
    tabs.push({
      label: t('componentConfigs.tabSidebar'),
      icon: <PanelLeft className={`w-4 h-4 ${getTabIconClass(sidebarIndex)}`} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            {t('componentConfigs.sidebarMegaMenu')} <code>defaultConfig.sidebar</code>.
          </p>
          <ProductsByCategorySidebarEditor value={sidebarConfig} onChange={setSidebarConfig} />
        </div>
      ),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs tabs={tabs} activeTab={resolvedActiveTab} onTabChange={handleTabChange} />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-neutral-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {mode === 'create' ? t('componentConfigs.createComponent') : t('componentConfigs.saveChanges')}
        </Button>
      </div>
    </form>
  );

};

export default ComponentConfigForm;

interface ProductsByCategorySidebarEditorProps {
  value: SidebarMenuConfig;
  onChange: (config: SidebarMenuConfig) => void;
}

interface ProductCardDefaultsEditorProps {
  value: ProductCardConfigState;
  onChange: (config: ProductCardConfigState) => void;
}

interface KeyValueEditorProps {
  entries: KeyValueEntry[];
  errors: Record<string, string | undefined>;
  onChange: (entries: KeyValueEntry[]) => void;
  t: TranslationFn;
  keyValueTypeOptions: Array<{ value: string; label: string }>;
}

const useProductCardOptions = (t: TranslationFn) => ({
  PRODUCT_CARD_LAYOUT_OPTIONS: [
    { value: 'vertical', label: t('componentConfigs.productCardLayoutVertical') },
    { value: 'horizontal', label: t('componentConfigs.productCardLayoutHorizontal') },
  ],
  PRODUCT_CARD_BADGE_STYLE_OPTIONS: [
    { value: 'pill', label: t('componentConfigs.productCardBadgePill') },
    { value: 'square', label: t('componentConfigs.productCardBadgeSquare') },
  ],
  PRODUCT_CARD_PRICE_DISPLAY_OPTIONS: [
    { value: 'stacked', label: t('componentConfigs.productCardPriceStacked') },
    { value: 'inline', label: t('componentConfigs.productCardPriceInline') },
  ],
  PRODUCT_CARD_FONT_WEIGHT_OPTIONS: [
    { value: 'normal', label: t('componentConfigs.fontWeightThin') },
    { value: 'medium', label: t('componentConfigs.fontWeightMedium') },
    { value: 'semibold', label: t('componentConfigs.fontWeightSemibold') },
    { value: 'bold', label: t('componentConfigs.fontWeightBold') },
  ],
  PRODUCT_CARD_FONT_SIZE_OPTIONS: [
    { value: 'sm', label: t('componentConfigs.fontSizeSmall') },
    { value: 'base', label: t('componentConfigs.fontSizeBase') },
    { value: 'lg', label: t('componentConfigs.fontSizeLarge') },
    { value: 'xl', label: t('componentConfigs.fontSizeXLarge') },
  ],
  PRODUCT_CARD_PRICE_TONE_OPTIONS: [
    { value: 'muted', label: t('componentConfigs.priceToneMuted') },
    { value: 'default', label: t('componentConfigs.priceToneDefault') },
    { value: 'emphasis', label: t('componentConfigs.priceToneEmphasis') },
    { value: 'custom', label: t('componentConfigs.priceToneCustom') },
  ],
  PRODUCT_CARD_ORIENTATION_OPTIONS: [
    { value: 'portrait', label: t('componentConfigs.orientationPortrait') },
    { value: 'landscape', label: t('componentConfigs.orientationLandscape') },
  ],
  PRICE_TONE_DESCRIPTIONS: {
    muted: t('componentConfigs.priceToneMutedDesc'),
    default: t('componentConfigs.priceToneDefaultDesc'),
    emphasis: t('componentConfigs.priceToneEmphasisDesc'),
    custom: t('componentConfigs.priceToneCustomDesc'),
  } as Record<ProductCardPriceTone, string>,
  PRODUCT_TITLE_HTML_TAG_OPTIONS: [
    { value: 'h2', label: '<h2>' },
    { value: 'h3', label: '<h3>' },
    { value: 'h4', label: '<h4>' },
    { value: 'h5', label: '<h5>' },
    { value: 'p', label: '<p>' },
    { value: 'span', label: '<span>' },
  ],
});

const useSidebarOptions = (t: TranslationFn) => ({
  SECTION_TITLE_FONT_WEIGHT_OPTIONS: [
    { value: 'normal', label: t('componentConfigs.fontWeightNormal') },
    { value: 'medium', label: t('componentConfigs.fontWeightMediumLabel') },
    { value: 'semibold', label: t('componentConfigs.fontWeightSemiboldLabel') },
    { value: 'bold', label: t('componentConfigs.fontWeightBoldLabel') },
  ],
  SECTION_TITLE_FONT_SIZE_OPTIONS: [
    { value: 'xs', label: t('componentConfigs.fontSizeXS') },
    { value: 'sm', label: t('componentConfigs.fontSizeSM') },
    { value: 'base', label: t('componentConfigs.fontSizeBaseLabel') },
    { value: 'lg', label: t('componentConfigs.fontSizeLG') },
  ],
  LINK_TYPE_OPTIONS: [
    { value: 'custom', label: t('componentConfigs.linkTypeCustom') },
    { value: 'category', label: t('componentConfigs.linkTypeCategory') },
    { value: 'product', label: t('componentConfigs.linkTypeProduct') },
    { value: 'product', label: t('componentConfigs.linkTypeProduct') },
    { value: 'brand', label: t('componentConfigs.linkTypeBrand') },
  ],
  TEXT_TRANSFORM_OPTIONS: [
    { value: 'none', label: t('componentConfigs.transformNone') },
    { value: 'uppercase', label: t('componentConfigs.transformUppercase') },
    { value: 'capitalize', label: t('componentConfigs.transformCapitalize') },
    { value: 'lowercase', label: t('componentConfigs.transformLowercase') },
  ],
});

const ProductCardDefaultsEditor: React.FC<ProductCardDefaultsEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslationWithBackend();
  const {
    PRODUCT_CARD_LAYOUT_OPTIONS,
    PRODUCT_CARD_BADGE_STYLE_OPTIONS,
    PRODUCT_CARD_PRICE_DISPLAY_OPTIONS,
    PRODUCT_CARD_FONT_WEIGHT_OPTIONS,
    PRODUCT_CARD_FONT_SIZE_OPTIONS,
    PRODUCT_CARD_PRICE_TONE_OPTIONS,
    PRODUCT_CARD_ORIENTATION_OPTIONS,
    PRICE_TONE_DESCRIPTIONS,
  } = useProductCardOptions(t);

  const handleChange = (updates: Partial<ProductCardConfigState>) => {
    onChange({
      ...value,
      ...updates,
    });
  };

  const handleTitleStyleChange = (updates: Partial<ProductCardTitleStyle>) => {
    handleChange({
      titleStyle: {
        ...value.titleStyle,
        ...updates,
      },
    });
  };

  const handlePriceStyleChange = (updates: Partial<ProductCardPriceStyle>) => {
    handleChange({
      priceStyle: {
        ...value.priceStyle,
        ...updates,
      },
    });
  };

  const handleThumbnailChange = (updates: Partial<ProductCardThumbnailSettings>) => {
    handleChange({
      thumbnail: {
        ...value.thumbnail,
        ...updates,
      },
    });
  };

  const handleToneChange = (tone: ProductCardPriceTone) => {
    handlePriceStyleChange({
      colorTone: tone,
      customColor: tone === 'custom' ? value.priceStyle.customColor : '',
    });
  };

  const handleToggleChange = (key: keyof ProductCardConfigState, checked: boolean) => {
    handleChange({ [key]: checked } as Partial<ProductCardConfigState>);
  };

  const toggleItems: Array<{ key: keyof ProductCardConfigState; label: string; description: string }> = [
    { key: 'showShortDescription', label: t('componentConfigs.showShortDescription'), description: t('componentConfigs.showShortDescriptionDesc') },
    { key: 'showRating', label: t('componentConfigs.showRating'), description: t('componentConfigs.showRatingDesc') },
    { key: 'showAddToCart', label: t('componentConfigs.showAddToCart'), description: t('componentConfigs.showAddToCartDesc') },
    { key: 'showWishlist', label: t('componentConfigs.showWishlist'), description: t('componentConfigs.showWishlistDesc') },
    { key: 'showQuickView', label: t('componentConfigs.showQuickView'), description: t('componentConfigs.showQuickViewDesc') },
  ];

  const layoutHelper =
    value.layout === 'horizontal'
      ? t('componentConfigs.layoutHorizontalHelper')
      : t('componentConfigs.layoutVerticalHelper');

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.layoutOverview')}</p>
            <p className="text-xs text-neutral-500">{layoutHelper}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.layout')}
              value={value.layout}
              onChange={(next) => handleChange({ layout: (next as ProductCardLayout) || 'vertical' })}
              options={PRODUCT_CARD_LAYOUT_OPTIONS}
              placeholder={t('componentConfigs.selectLayout')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.imageHeight')}</label>
            <Input
              value={value.imageHeight}
              onChange={(event) => handleChange({ imageHeight: event.target.value })}
              placeholder={t('componentConfigs.imageHeightPlaceholder')}
            />
            <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.imageHeightDesc')}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.badgeStyle')}
              value={value.badgeStyle}
              onChange={(next) => handleChange({ badgeStyle: (next as ProductCardBadgeStyle) || 'pill' })}
              options={PRODUCT_CARD_BADGE_STYLE_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.priceDisplay')}
              value={value.priceDisplay}
              onChange={(next) => handleChange({ priceDisplay: (next as ProductCardPriceDisplay) || 'stacked' })}
              options={PRODUCT_CARD_PRICE_DISPLAY_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.thumbnailFormat')}
              value={value.thumbnail.orientation}
              onChange={(next) =>
                handleThumbnailChange({
                  orientation: (next as ProductCardThumbnailOrientation) || 'portrait',
                })
              }
              options={PRODUCT_CARD_ORIENTATION_OPTIONS}
            />
            <p className="text-[11px] text-neutral-500 mb-0">
              {t('componentConfigs.thumbnailFormatDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.productTitle')}</p>
        <p className="text-xs text-neutral-500">{t('componentConfigs.productTitleDesc')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontWeight')}
              value={value.titleStyle.fontWeight}
              onChange={(next) =>
                handleTitleStyleChange({
                  fontWeight: (next as ProductCardFontWeight) || 'semibold',
                })
              }
              options={PRODUCT_CARD_FONT_WEIGHT_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontSize')}
              value={value.titleStyle.fontSize}
              onChange={(next) =>
                handleTitleStyleChange({
                  fontSize: (next as ProductCardFontSize) || 'lg',
                })
              }
              options={PRODUCT_CARD_FONT_SIZE_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.priceStyle')}</p>
        <p className="text-xs text-neutral-500">{t('componentConfigs.priceStyleDesc')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.colorContrast')}
              value={value.priceStyle.colorTone}
              onChange={(next) => handleToneChange((next as ProductCardPriceTone) || 'emphasis')}
              options={PRODUCT_CARD_PRICE_TONE_OPTIONS}
            />
            <p className="text-[11px] text-neutral-500 mb-0">{PRICE_TONE_DESCRIPTIONS[value.priceStyle.colorTone]}</p>
          </div>
          {value.priceStyle.colorTone === 'custom' && (
            <div className="space-y-1">
              <ColorSelector
                value={value.priceStyle.customColor || undefined}
                onChange={(color) => handlePriceStyleChange({ customColor: color || '' })}
                label={t('componentConfigs.customColor')}
                placeholder={t('componentConfigs.customColorPlaceholder')}
              />
              <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.leaveEmptyForDefault')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.contentActions')}</p>
        <p className="text-xs text-neutral-500">{t('componentConfigs.contentActionsDesc')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {toggleItems.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-0">{item.label}</p>
                <p className="text-xs text-neutral-500 mb-0">{item.description}</p>
              </div>
              <Toggle
                checked={Boolean(value[item.key])}
                onChange={(checked) => handleToggleChange(item.key, checked)}
                size="sm"
                aria-label={item.label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProductCardTitleEditorProps {
  value: ProductCardTitleConfigState;
  onChange: (config: ProductCardTitleConfigState) => void;
}

const ProductCardTitleEditor: React.FC<ProductCardTitleEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslationWithBackend();
  const {
    PRODUCT_CARD_FONT_WEIGHT_OPTIONS,
    PRODUCT_CARD_FONT_SIZE_OPTIONS,
    PRODUCT_TITLE_HTML_TAG_OPTIONS,
  } = useProductCardOptions(t);

  const handleChange = (updates: Partial<ProductCardTitleConfigState>) => {
    onChange({
      ...value,
      ...updates,
    });
  };

  const handleClampChange = (next: string) => {
    const parsed = Number(next);
    const clamped = Number.isFinite(parsed) ? clampWithinRange(Math.floor(parsed), 1, 6) : value.clampLines;
    handleChange({ clampLines: clamped });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.productTitleControl')}</p>
        <p className="text-xs text-neutral-500">{t('componentConfigs.productTitleControlDesc')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.htmlTag')}
              value={value.htmlTag}
              onChange={(next) => handleChange({ htmlTag: (next as string) || 'h3' })}
              options={PRODUCT_TITLE_HTML_TAG_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.maxLines')}</label>
            <Input
              type="number"
              min={1}
              max={6}
              value={value.clampLines}
              onChange={(event) => handleClampChange(event.target.value)}
            />
            <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.maxLinesDesc')}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontWeight')}
              value={value.fontWeight}
              onChange={(next) =>
                handleChange({
                  fontWeight: (next as ProductCardFontWeight) || 'semibold',
                })
              }
              options={PRODUCT_CARD_FONT_WEIGHT_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontSize')}
              value={value.fontSize}
              onChange={(next) =>
                handleChange({
                  fontSize: (next as ProductCardFontSize) || 'lg',
                })
              }
              options={PRODUCT_CARD_FONT_SIZE_OPTIONS}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ColorSelector
            value={value.textColor || undefined}
            onChange={(color) => handleChange({ textColor: color || '' })}
            label={t('componentConfigs.textColor')}
            placeholder={t('componentConfigs.textColorPlaceholder')}
          />
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-neutral-900 mb-0">{t('componentConfigs.uppercase')}</p>
              <p className="text-xs text-neutral-500 mb-0">{t('componentConfigs.uppercaseDesc')}</p>
            </div>
            <Toggle
              checked={value.uppercase}
              onChange={(checked) => handleChange({ uppercase: checked })}
              size="sm"
              aria-label={t('componentConfigs.uppercase')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductCardPriceEditorProps {
  value: ProductCardPriceConfigState;
  onChange: (config: ProductCardPriceConfigState) => void;
}

const ProductCardPriceEditor: React.FC<ProductCardPriceEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslationWithBackend();
  const {
    PRODUCT_CARD_FONT_WEIGHT_OPTIONS,
    PRODUCT_CARD_FONT_SIZE_OPTIONS,
    PRODUCT_CARD_PRICE_TONE_OPTIONS,
    PRICE_TONE_DESCRIPTIONS,
  } = useProductCardOptions(t);

  const handleChange = (updates: Partial<ProductCardPriceConfigState>) => {
    onChange({
      ...value,
      ...updates,
    });
  };

  const handleToneChange = (tone: ProductCardPriceTone) => {
    handleChange({
      colorTone: tone,
      customColor: tone === 'custom' ? value.customColor : '',
    });
  };

  const toggleOptions: Array<{ key: keyof ProductCardPriceConfigState; label: string; description: string }> = [
    { key: 'showCompareAtPrice', label: t('componentConfigs.showCompareAtPrice'), description: t('componentConfigs.showCompareAtPriceDesc') },
    { key: 'showDivider', label: t('componentConfigs.showDivider'), description: t('componentConfigs.showDividerDesc') },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.currencyFormat')}</p>
        <p className="text-xs text-neutral-500">{t('componentConfigs.currencyFormatDesc')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.locale')}</label>
            <Input
              value={value.locale}
              onChange={(event) => handleChange({ locale: event.target.value })}
              placeholder={t('componentConfigs.localePlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.currency')}</label>
            <Input
              value={value.currency}
              onChange={(event) => handleChange({ currency: event.target.value.toUpperCase() })}
              placeholder={t('componentConfigs.currencyPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.typographyColor')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontWeight')}
              value={value.fontWeight}
              onChange={(next) =>
                handleChange({
                  fontWeight: (next as ProductCardFontWeight) || 'bold',
                })
              }
              options={PRODUCT_CARD_FONT_WEIGHT_OPTIONS}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.fontSize')}
              value={value.fontSize}
              onChange={(next) =>
                handleChange({
                  fontSize: (next as ProductCardFontSize) || 'lg',
                })
              }
              options={PRODUCT_CARD_FONT_SIZE_OPTIONS}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.colorContrast')}
              value={value.colorTone}
              onChange={(next) => handleToneChange((next as ProductCardPriceTone) || 'emphasis')}
              options={PRODUCT_CARD_PRICE_TONE_OPTIONS}
            />
            <p className="text-[11px] text-neutral-500 mb-0">{PRICE_TONE_DESCRIPTIONS[value.colorTone]}</p>
          </div>
          {value.colorTone === 'custom' && (
            <ColorSelector
              value={value.customColor || undefined}
              onChange={(color) => handleChange({ customColor: color || '' })}
              label={t('componentConfigs.customColor')}
              placeholder={t('componentConfigs.customColorPlaceholder')}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.advancedDisplay')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {toggleOptions.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-0">{item.label}</p>
                <p className="text-xs text-neutral-500 mb-0">{item.description}</p>
              </div>
              <Toggle
                checked={Boolean(value[item.key])}
                onChange={(checked) => handleChange({ [item.key]: checked } as Partial<ProductCardPriceConfigState>)}
                size="sm"
                aria-label={item.label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ entries, errors, onChange, t, keyValueTypeOptions }) => {
  const resolvedEntries = entries.length > 0 ? entries : [createKeyValueEntry()];

  const handleEntryChange = (id: string, updates: Partial<KeyValueEntry>) => {
    onChange(
      resolvedEntries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const handleAddEntry = () => {
    onChange([...resolvedEntries, createKeyValueEntry()]);
  };

  const handleRemoveEntry = (id: string) => {
    if (resolvedEntries.length === 1) {
      onChange([createKeyValueEntry()]);
      return;
    }
    onChange(resolvedEntries.filter((entry) => entry.id !== id));
  };

  const renderValueInput = (entry: KeyValueEntry) => {
    if (entry.type === 'boolean') {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2">
          <Toggle
            checked={entry.value === 'true'}
            onChange={(checked) => handleEntryChange(entry.id, { value: checked ? 'true' : 'false' })}
            label=""
            size="sm"
          />
          <span className="text-sm text-neutral-600">{entry.value === 'true' ? t('common.enabled') : t('common.disabled')}</span>
        </div>
      );
    }

    if (entry.type === 'json') {
      return (
        <Textarea
          value={entry.value}
          onChange={(event) => handleEntryChange(entry.id, { value: event.target.value })}
          rows={3}
          placeholder={t('componentConfigs.provideJsonValue')}
        />
      );
    }

    return (
      <Input
        value={entry.value}
        onChange={(event) => handleEntryChange(entry.id, { value: event.target.value })}
        placeholder={entry.type === 'number' ? t('componentConfigs.exampleNumber') : t('componentConfigs.valuePlaceholder')}
      />
    );
  };

  return (
    <div className="space-y-3">
      {resolvedEntries.map((entry, index) => (
        <div key={entry.id} className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-[160px] flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.fieldName')}</label>
              <Input
                value={entry.key}
                onChange={(event) => handleEntryChange(entry.id, { key: event.target.value })}
                placeholder={t('componentConfigs.fieldNamePlaceholder')}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={t('componentConfigs.type')}
                value={entry.type}
                onChange={(value) => handleEntryChange(entry.id, { type: (value as KeyValueType) || 'string' })}
                options={keyValueTypeOptions}
                size="sm"
              />
            </div>
            <div className="flex items-end pt-5 sm:pt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEntry(entry.id)}
                startIcon={<FiTrash2 className="h-4 w-4" />}
              >
                {t('componentConfigs.remove')}
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t('componentConfigs.value')}</label>
            {renderValueInput(entry)}
            {errors[entry.id] && <p className="mt-1 text-xs text-red-600">{errors[entry.id]}</p>}
          </div>
          <p className="mt-2 text-xs text-neutral-500">{t('componentConfigs.entryNumber')}{index + 1}</p>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAddEntry} startIcon={<FiPlus className="h-4 w-4" />}>
        {t('componentConfigs.addField')}
      </Button>
    </div>
  );
};

const ProductsByCategorySidebarEditor: React.FC<ProductsByCategorySidebarEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslationWithBackend();
  const handleToggle = (checked: boolean) => {
    onChange({ ...value, enabled: checked });
  };

  const handleFieldChange = (field: 'title' | 'description', nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  const handleVisibilityToggle = (field: 'showTitle' | 'showDescription' | 'showSidebarHeader', nextValue: boolean) => {
    onChange({ ...value, [field]: nextValue });
  };

  const handleSectionChange = (sectionId: string, nextSection: SidebarMenuSection) => {
    const updated = value.sections.map((section) => (section.id === sectionId ? nextSection : section));
    onChange({ ...value, sections: updated });
  };

  const handleAddSection = () => {
    onChange({ ...value, sections: [...value.sections, createSidebarSection()] });
  };

  const handleRemoveSection = (sectionId: string) => {
    const filtered = value.sections.filter((section) => section.id !== sectionId);
    onChange({ ...value, sections: filtered.length > 0 ? filtered : [createSidebarSection()] });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-neutral-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.sidebarMegaMenuTitle')}</p>
          <p className="text-xs text-neutral-500">{t('componentConfigs.sidebarMegaMenuDesc')}</p>
        </div>
        <Toggle
          checked={value.enabled}
          onChange={handleToggle}
          label={value.enabled ? t('componentConfigs.currentlyEnabled') : t('componentConfigs.currentlyDisabled')}
        />
      </div>

      {value.enabled && (
        <div className="space-y-5 px-5 py-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.sidebarTitle')}</label>
              <Input
                value={value.title}
                onChange={(event) => handleFieldChange('title', event.target.value)}
                placeholder={t('componentConfigs.sidebarTitlePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.sidebarDescription')}</label>
              <Textarea
                value={value.description}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                rows={3}
                placeholder={t('componentConfigs.sidebarDescriptionPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.showHeaderFrame')}</p>
                  <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.showHeaderFrameDesc')}</p>
                </div>
                <Toggle
                  checked={value.showSidebarHeader}
                  onChange={(checked) => handleVisibilityToggle('showSidebarHeader', checked)}
                  size="sm"
                  aria-label={t('componentConfigs.showHeaderFrame')}
                />
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.showTitle')}</p>
                  <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.showTitleDesc')}</p>
                </div>
                <Toggle
                  checked={value.showTitle}
                  onChange={(checked) => handleVisibilityToggle('showTitle', checked)}
                  size="sm"
                  aria-label={t('componentConfigs.showTitle')}
                />
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.showDescription')}</p>
                  <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.showDescriptionDesc')}</p>
                </div>
                <Toggle
                  checked={value.showDescription}
                  onChange={(checked) => handleVisibilityToggle('showDescription', checked)}
                  size="sm"
                  aria-label={t('componentConfigs.showDescription')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {value.sections.map((section, index) => (
              <SidebarSectionEditor
                key={section.id}
                section={section}
                index={index}
                canRemove={value.sections.length > 1}
                onChange={(nextSection) => handleSectionChange(section.id, nextSection)}
                onRemove={() => handleRemoveSection(section.id)}
              />
            ))}

            <button
              type="button"
              onClick={handleAddSection}
              className="w-full rounded-lg border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              {t('componentConfigs.addMenuGroup')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarSectionEditorProps {
  section: SidebarMenuSection;
  index: number;
  onChange: (section: SidebarMenuSection) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const SidebarSectionEditor: React.FC<SidebarSectionEditorProps> = ({ section, index, onChange, onRemove, canRemove }) => {
  const { t } = useTranslationWithBackend();
  const { SECTION_TITLE_FONT_WEIGHT_OPTIONS, SECTION_TITLE_FONT_SIZE_OPTIONS } = useSidebarOptions(t);
  const handleItemChange = (itemId: string, nextItem: SidebarMenuItem) => {
    const updated = section.items.map((item) => (item.id === itemId ? nextItem : item));
    onChange({ ...section, items: updated });
  };

  const handleAddItem = () => {
    onChange({ ...section, items: [...section.items, createSidebarItem()] });
  };

  const handleRemoveItem = (itemId: string) => {
    const filtered = section.items.filter((item) => item.id !== itemId);
    onChange({ ...section, items: filtered.length > 0 ? filtered : [createSidebarItem()] });
  };

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const hasTitle = section.title?.trim();
    const hasDescription = section.description?.trim();
    return Boolean(hasTitle || hasDescription);
  });

  const previewLabel = section.title?.trim() || `${t('componentConfigs.menuGroup')}${index + 1}`;
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const collapseLabel = isCollapsed ? t('componentConfigs.expand') : t('componentConfigs.collapse');

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/70">
      <div className="flex flex-col gap-2 border-b border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.menuGroup')}{index + 1}</p>
          <p className="text-xs text-neutral-500 mb-0">{previewLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleCollapse}
            startIcon={<FiChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />}
          >
            {collapseLabel}
          </Button>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              startIcon={<FiTrash2 className="w-4 h-4" />}
            >
              {t('componentConfigs.removeGroup')}
            </Button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="space-y-4 px-4 py-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.groupTitle')}</label>
            <Input
              value={section.title}
              onChange={(event) => onChange({ ...section, title: event.target.value })}
              placeholder={t('componentConfigs.groupTitlePlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.groupDescription')}</label>
            <Textarea
              value={section.description}
              onChange={(event) => onChange({ ...section, description: event.target.value })}
              rows={2}
              placeholder={t('componentConfigs.groupDescriptionPlaceholder')}
            />
          </div>
          <div className="space-y-4">
            <IconSelector
              value={section.titleIcon}
              onChange={(icon) => onChange({ ...section, titleIcon: icon || '' })}
            />
            <div className="flex items-start justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2 bg-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.showTitleIcon')}</p>
                <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.showTitleIconDesc')}</p>
              </div>
              <Toggle
                checked={section.showTitleIcon}
                onChange={(checked) => onChange({ ...section, showTitleIcon: checked })}
                size="sm"
                aria-label={t('componentConfigs.showTitleIcon')}
              />
            </div>
            <div className="flex items-start justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2 bg-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.uppercaseTitle')}</p>
                <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.uppercaseTitleDesc')}</p>
              </div>
              <Toggle
                checked={section.titleUppercase}
                onChange={(checked) => onChange({ ...section, titleUppercase: checked })}
                size="sm"
                aria-label={t('componentConfigs.uppercaseTitle')}
              />
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2 bg-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.showItemIcons')}</p>
              <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.showItemIconsDesc')}</p>
            </div>
            <Toggle
              checked={section.showItemIcons}
              onChange={(checked) => onChange({ ...section, showItemIcons: checked })}
              size="sm"
              aria-label={t('componentConfigs.showItemIcons')}
            />
          </div>
          <div className="flex items-start justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2 bg-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{t('componentConfigs.uppercaseItem')}</p>
              <p className="text-[11px] text-neutral-500 mb-0">{t('componentConfigs.uppercaseItemDesc')}</p>
            </div>
            <Toggle
              checked={section.itemUppercase}
              onChange={(checked) => onChange({ ...section, itemUppercase: checked })}
              size="sm"
              aria-label={t('componentConfigs.uppercaseItem')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Select
                label={t('componentConfigs.titleFontWeight')}
                value={section.titleFontWeight}
                onChange={(value) => onChange({
                  ...section,
                  titleFontWeight: isSidebarTitleFontWeight(value) ? value : 'semibold',
                })}
                options={SECTION_TITLE_FONT_WEIGHT_OPTIONS}
                placeholder={t('componentConfigs.titleFontWeightPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Select
                label={t('componentConfigs.titleFontSize')}
                value={section.titleFontSize}
                onChange={(value) => onChange({
                  ...section,
                  titleFontSize: isSidebarTitleFontSize(value) ? value : 'sm',
                })}
                options={SECTION_TITLE_FONT_SIZE_OPTIONS}
                placeholder={t('componentConfigs.titleFontSizePlaceholder')}
              />
            </div>
            <ColorSelector
              value={section.titleFontColor || undefined}
              onChange={(color) => onChange({ ...section, titleFontColor: color || '' })}
              placeholder={t('componentConfigs.textColorPlaceholder')}
              label={t('componentConfigs.titleTextColor')}
              className="space-y-1"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Select
                label={t('componentConfigs.itemFontWeight')}
                value={section.itemFontWeight}
                onChange={(value) => onChange({
                  ...section,
                  itemFontWeight: isSidebarTitleFontWeight(value) ? value : 'normal',
                })}
                options={SECTION_TITLE_FONT_WEIGHT_OPTIONS}
                placeholder={t('componentConfigs.itemFontWeightPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Select
                label={t('componentConfigs.itemFontSize')}
                value={section.itemFontSize}
                onChange={(value) => onChange({
                  ...section,
                  itemFontSize: isSidebarTitleFontSize(value) ? value : 'sm',
                })}
                options={SECTION_TITLE_FONT_SIZE_OPTIONS}
                placeholder={t('componentConfigs.itemFontSizePlaceholder')}
              />
            </div>
            <ColorSelector
              value={section.itemFontColor || undefined}
              onChange={(color) => onChange({ ...section, itemFontColor: color || '' })}
              placeholder={t('componentConfigs.textColorPlaceholder')}
              label={t('componentConfigs.itemTextColor')}
              className="space-y-1"
            />
          </div>
          <div className="space-y-1">
            <ColorSelector
              value={section.backgroundColor || undefined}
              onChange={(color) => onChange({ ...section, backgroundColor: color || '' })}
              placeholder={t('componentConfigs.groupBackgroundPlaceholder')}
              label={t('componentConfigs.groupBackgroundColor')}
            />
            <p className="text-xs text-neutral-500">{t('componentConfigs.leaveEmptyForDefaultBackground')}</p>
          </div>

          <div className="space-y-3">
            {section.items.map((item, itemIndex) => (
              <SidebarItemEditor
                key={item.id}
                item={item}
                index={itemIndex}
                canRemove={section.items.length > 1}
                depth={0}
                showIcons={section.showItemIcons}
                onChange={(nextItem) => handleItemChange(item.id, nextItem)}
                onRemove={() => handleRemoveItem(item.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-neutral-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {t('componentConfigs.addLink')}
          </button>
        </div>
      )}
    </div>
  );
};

interface SidebarItemEditorProps {
  item: SidebarMenuItem;
  index: number;
  onChange: (item: SidebarMenuItem) => void;
  onRemove: () => void;
  canRemove: boolean;
  depth?: number;
  showIcons?: boolean;
}

const buildHrefForLinkType = (type: SidebarLinkType, referenceId?: string) => {
  if (!referenceId) {
    return '';
  }
  switch (type) {
    case 'category':
      return `/categories/${referenceId}`;
    case 'product':
      return `/products/${referenceId}`;
    case 'brand':
      return `/brands/${referenceId}`;
    default:
      return referenceId;
  }
};

const SidebarItemEditor: React.FC<SidebarItemEditorProps> = ({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  depth = 0,
  showIcons = false,
}) => {
  const { t } = useTranslationWithBackend();
  const { LINK_TYPE_OPTIONS, TEXT_TRANSFORM_OPTIONS } = useSidebarOptions(t);
  const resolvedLinkType: SidebarLinkType = item.linkType || 'custom';
  const childItems = item.children || [];
  const canNestChildren = depth === 0;
  const [isCollapsed, setIsCollapsed] = useState(() => Boolean(item.label?.trim()));

  const handleLinkTypeChange = (value: string | undefined) => {
    const nextType: SidebarLinkType = isSidebarLinkType(value) ? value : 'custom';
    if (nextType === 'custom') {
      onChange({
        ...item,
        linkType: nextType,
        referenceId: '',
        href: item.href,
      });
      return;
    }
    onChange({
      ...item,
      linkType: nextType,
      referenceId: '',
      href: '',
    });
  };

  const handleResourceChange = (referenceId: string | undefined, type: SidebarLinkType) => {
    const normalizedId = referenceId?.trim() ?? '';
    const href = normalizedId ? buildHrefForLinkType(type, normalizedId) : '';
    onChange({
      ...item,
      linkType: type,
      referenceId: normalizedId,
      href,
    });
  };

  const handleManualHrefChange = (nextHref: string) => {
    onChange({
      ...item,
      linkType: 'custom',
      referenceId: '',
      href: nextHref,
    });
  };

  const handleChildItemChange = (childId: string, nextChild: SidebarMenuItem) => {
    const updatedChildren = childItems.map((child) => (child.id === childId ? nextChild : child));
    onChange({ ...item, children: updatedChildren });
  };

  const handleAddChildItem = () => {
    onChange({ ...item, children: [...childItems, createSidebarItem()] });
  };

  const handleRemoveChildItem = (childId: string) => {
    const updatedChildren = childItems.filter((child) => child.id !== childId);
    onChange({ ...item, children: updatedChildren });
  };

  const renderLinkInput = () => {
    if (resolvedLinkType === 'category') {
      return (
        <div className="space-y-2">
          <CategorySelector
            value={item.referenceId || undefined}
            onChange={(categoryId) => handleResourceChange(categoryId, 'category')}
          />
          <p className="text-xs text-neutral-500">
            {t('componentConfigs.pathWillBe')} <span className="font-medium text-neutral-700">{item.href || t('componentConfigs.noCategorySelected')}</span>
          </p>
        </div>
      );
    }
    if (resolvedLinkType === 'product') {
      return (
        <div className="space-y-2">
          <ProductSelector
            value={item.referenceId || undefined}
            onChange={(productId) => handleResourceChange(productId, 'product')}
          />
          <p className="text-xs text-neutral-500">
            {t('componentConfigs.pathWillBe')} <span className="font-medium text-neutral-700">{item.href || t('componentConfigs.noProductSelected')}</span>
          </p>
        </div>
      );
    }
    if (resolvedLinkType === 'brand') {
      return (
        <div className="space-y-2">
          <BrandSelector
            value={item.referenceId || undefined}
            onChange={(brandId) => handleResourceChange(brandId, 'brand')}
          />
          <p className="text-xs text-neutral-500">
            {t('componentConfigs.pathWillBe')} <span className="font-medium text-neutral-700">{item.href || t('componentConfigs.noBrandSelected')}</span>
          </p>
        </div>
      );
    }

    return (
      <Input
        value={item.href}
        onChange={(event) => handleManualHrefChange(event.target.value)}
        placeholder={t('componentConfigs.urlPlaceholder')}
      />
    );
  };

  const cardBorderClass = depth === 0
    ? 'border border-white/70'
    : 'border border-dashed border-indigo-100';
  const headingLabel = depth > 0 ? `${t('componentConfigs.childLinkNumber')}${index + 1}` : `${t('componentConfigs.linkNumber')}${index + 1}`;
  const previewLabel = item.label?.trim() || t('componentConfigs.noTitle');
  const previewHref = item.href?.trim();
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const collapseLabel = isCollapsed ? t('componentConfigs.expand') : t('componentConfigs.collapse');

  return (
    <div className={`rounded-lg ${cardBorderClass} bg-white shadow-sm`}>
      <div className="border-b border-neutral-100 px-4 py-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            {showIcons && (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                {item.icon ? <UnifiedIcon icon={item.icon} className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              </span>
            )}
            <div>
              <p className="mb-0">{headingLabel}</p>
              <p className="text-xs font-normal text-neutral-500 mb-0">
                {previewLabel}
                {previewHref ? ` • ${previewHref}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleCollapse}
              startIcon={<FiChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />}
            >
              {collapseLabel}
            </Button>
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                startIcon={<FiTrash2 className="w-4 h-4" />}
              >
                {t('componentConfigs.remove')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.linkTitle')}</label>
            <Input
              value={item.label}
              onChange={(event) => onChange({ ...item, label: event.target.value })}
              placeholder={t('componentConfigs.linkTitlePlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.linkType')}
              value={resolvedLinkType}
              onChange={(value) => handleLinkTypeChange(value)}
              options={LINK_TYPE_OPTIONS}
              placeholder={t('componentConfigs.linkTypePlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <Select
              label={t('componentConfigs.textTransform')}
              value={item.textTransform}
              onChange={(value) => onChange({ ...item, textTransform: (value as SidebarTextTransform) || 'none' })}
              options={TEXT_TRANSFORM_OPTIONS}
              placeholder={t('componentConfigs.textTransformPlaceholder')}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {resolvedLinkType === 'custom' ? t('componentConfigs.targetUrl') : t('componentConfigs.selectDataSource')}
            </label>
            {renderLinkInput()}
          </div>
          {showIcons && (
            <div className="space-y-1">
              <IconSelector
                value={item.icon}
                onChange={(icon) => onChange({ ...item, icon })}
              />
            </div>
          )}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.descriptionShort')}</label>
            <Textarea
              value={item.description}
              onChange={(event) => onChange({ ...item, description: event.target.value })}
              rows={2}
              placeholder={t('componentConfigs.descriptionShortPlaceholder')}
            />
          </div>
          {canNestChildren && (
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {t('componentConfigs.childMenu')}
                </label>
                {childItems.length > 0 && (
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">{t('componentConfigs.maxOneLevel')}</p>
                )}
              </div>
              {childItems.length > 0 && (
                <div className="space-y-3">
                  {childItems.map((child, childIndex) => (
                    <SidebarItemEditor
                      key={child.id}
                      item={child}
                      index={childIndex}
                      depth={depth + 1}
                      canRemove
                      showIcons={showIcons}
                      onChange={(nextChild) => handleChildItemChange(child.id, nextChild)}
                      onRemove={() => handleRemoveChildItem(child.id)}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleAddChildItem}
                className="w-full rounded-lg border border-dashed border-neutral-300 py-2 text-sm font-medium text-neutral-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                {t('componentConfigs.addChildLink')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

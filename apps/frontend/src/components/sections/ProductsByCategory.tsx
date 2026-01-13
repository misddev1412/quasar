'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from './SectionHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';
import ProductCard from '../../components/ecommerce/ProductCard';
import type { Category, Product } from '../../types/product';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ProductsByCategorySidebar } from './ProductsByCategorySidebar';
import SectionContainer from './SectionContainer';
import { ViewMoreButton } from '../common/ViewMoreButton';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';

export type ProductsByCategoryStrategy = 'latest' | 'featured' | 'bestsellers' | 'custom';

export interface ProductsByCategoryRowConfig {
  id?: string;
  categoryId?: string;
  title?: string;
  strategy?: ProductsByCategoryStrategy;
  productIds?: string[];
  limit?: number;
  displayStyle?: 'grid' | 'carousel';
  showDisplayTitle?: boolean;
  showCategoryLabel?: boolean;
  showStrategyLabel?: boolean;
  headingStyle?: 'default' | 'banner';
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  headingTitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  headingBarHeight?: number;
}

export interface ProductsByCategoryConfig {
  rows?: ProductsByCategoryRowConfig[];
  displayStyle?: 'grid' | 'carousel';
  sidebarEnabled?: boolean;
  // Legacy fields kept for backward compatibility
  categoryId?: string;
  productIds?: string[];
  sort?: string;
  limit?: number;
  sidebar?: ProductsByCategorySidebarConfig;
}

export interface ProductsByCategorySidebarItemConfig {
  id?: string;
  label?: string;
  href?: string;
  description?: string;
  icon?: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  linkType?: 'custom' | 'category' | 'product' | 'brand';
  referenceId?: string;
  children?: ProductsByCategorySidebarItemConfig[];
}

type SidebarTitleFontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type SidebarTitleFontSize = 'xs' | 'sm' | 'base' | 'lg';

export interface ProductsByCategorySidebarSectionConfig {
  id?: string;
  title?: string;
  description?: string;
  borderRadius?: string;
  headerBackgroundColor?: string;
  backgroundColor?: string;
  titleFontColor?: string;
  titleFontWeight?: SidebarTitleFontWeight;
  titleFontSize?: SidebarTitleFontSize;
  titleTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  titleIcon?: string;
  showTitleIcon?: boolean;
  showItemIcons?: boolean;
  itemFontSize?: SidebarTitleFontSize;
  itemFontWeight?: SidebarTitleFontWeight;
  itemFontColor?: string;
  itemTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  items?: ProductsByCategorySidebarItemConfig[];
}

export interface ProductsByCategorySidebarConfig {
  enabled?: boolean;
  title?: string;
  borderRadius?: string;
  headerBackgroundColor?: string;
  description?: string;
  showTitle?: boolean;
  showSidebarHeader?: boolean;
  showDescription?: boolean;
  sections?: ProductsByCategorySidebarSectionConfig[];
}

interface ProductsByCategoryProps {
  config: ProductsByCategoryConfig;
  translation?: SectionTranslationContent | null;
  viewMoreButtonConfig?: ViewMoreButtonConfig;
}

interface NormalizedRowConfig {
  id: string;
  categoryId?: string;
  title: string | null;
  strategy: ProductsByCategoryStrategy;
  productIds: string[];
  limit: number;
  displayStyle: 'grid' | 'carousel';
  showDisplayTitle: boolean;
  showCategoryLabel: boolean;
  showStrategyLabel: boolean;
  headingStyle: 'default' | 'banner';
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  headingTitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  headingBarHeight?: number;
}

interface RowRenderState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

interface CategoryMeta {
  id: string | null;
  name: string | null;
  slug: string | null;
}

interface CategoryReference {
  id?: string | null;
  slug?: string | null;
}

const DEFAULT_LIMIT = 6;
const SIDEBAR_TITLE_FONT_WEIGHT_VALUES: SidebarTitleFontWeight[] = ['normal', 'medium', 'semibold', 'bold'];
const SIDEBAR_TITLE_FONT_SIZE_VALUES: SidebarTitleFontSize[] = ['xs', 'sm', 'base', 'lg'];
const HEADING_TEXT_TRANSFORM_VALUES = ['none', 'uppercase', 'capitalize', 'lowercase'] as const;
const HEADING_TITLE_SIZE_VALUES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const normalizeSidebarFontWeight = (value?: string | null): SidebarTitleFontWeight => {
  const normalized = normalizeString(value) as SidebarTitleFontWeight;
  return SIDEBAR_TITLE_FONT_WEIGHT_VALUES.includes(normalized) ? normalized : 'semibold';
};

const normalizeSidebarFontSize = (value?: string | null): SidebarTitleFontSize => {
  const normalized = normalizeString(value) as SidebarTitleFontSize;
  return SIDEBAR_TITLE_FONT_SIZE_VALUES.includes(normalized) ? normalized : 'sm';
};

const isValidUuid = (value?: string | null): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(trimmed);
};

const ensurePositiveInteger = (value: number | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const clamped = Math.floor(parsed);
  return clamped > 0 ? clamped : fallback;
};

const normalizeString = (value?: string | null): string => (typeof value === 'string' ? value.trim() : '');

const normalizeStrategy = (value?: string | null): ProductsByCategoryStrategy => {
  const normalized = normalizeString(value);
  switch (normalized) {
    case 'featured':
      return 'featured';
    case 'bestsellers':
      return 'bestsellers';
    case 'custom':
      return 'custom';
    case 'most_viewed':
      return 'featured';
    default:
      return 'latest';
  }
};

const normalizeHeadingTextTransform = (value?: string | null) => {
  const normalized = normalizeString(value).toLowerCase();
  return HEADING_TEXT_TRANSFORM_VALUES.includes(normalized as (typeof HEADING_TEXT_TRANSFORM_VALUES)[number])
    ? (normalized as (typeof HEADING_TEXT_TRANSFORM_VALUES)[number])
    : undefined;
};

const normalizeHeadingTitleSize = (value?: string | null) => {
  const normalized = normalizeString(value).toLowerCase();
  return HEADING_TITLE_SIZE_VALUES.includes(normalized as (typeof HEADING_TITLE_SIZE_VALUES)[number])
    ? (normalized as (typeof HEADING_TITLE_SIZE_VALUES)[number])
    : undefined;
};

const normalizeHeadingBarHeight = (value?: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
};

const normalizeDisplayStyle = (value?: string | null): 'grid' | 'carousel' => {
  const normalized = normalizeString(value).toLowerCase();
  return normalized === 'carousel' ? 'carousel' : 'grid';
};

export interface NormalizedSidebarItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: string;
  textTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  children: NormalizedSidebarItem[];
}

export interface NormalizedSidebarSection {
  id: string;
  title: string;
  borderRadius?: string;
  description: string;
  headerBackgroundColor: string;
  backgroundColor: string;
  titleFontColor: string;
  titleFontWeight: SidebarTitleFontWeight;
  titleFontSize: SidebarTitleFontSize;
  titleTextTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  titleIcon: string;
  showTitleIcon: boolean;
  showItemIcons: boolean;
  itemFontSize: SidebarTitleFontSize;
  itemFontWeight: SidebarTitleFontWeight;
  itemFontColor: string;
  itemTextTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  items: NormalizedSidebarItem[];
}

export interface NormalizedSidebarConfig {
  enabled: boolean;
  title: string;
  borderRadius?: string;
  headerBackgroundColor: string;
  description: string;
  showTitle: boolean;
  showSidebarHeader: boolean;
  showDescription: boolean;
  sections: NormalizedSidebarSection[];
}

const toLowerCaseOrNull = (value?: string | null): string | null => {
  const normalized = normalizeString(value);
  return normalized ? normalized.toLowerCase() : null;
};

const normalizeSidebarItems = (
  items?: ProductsByCategorySidebarItemConfig[],
  sectionId?: string,
): NormalizedSidebarItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => {
      const baseId = normalizeString(item?.id) || `${sectionId || 'sidebar'}-item-${index}`;
      const id = index === 0 ? baseId : `${baseId}-${index}`;
      const label = normalizeString(item?.label);
      const href = normalizeString(item?.href);
      const description = normalizeString(item?.description);
      // Filter out unsupported lucide icons that might exist in old data
      let icon = normalizeString(item?.icon);
      if (icon.startsWith('lucide:')) {
        icon = '';
      }
      const textTransform = item?.textTransform || 'none';
      const children = normalizeSidebarItems(item?.children, id);

      return {
        id,
        label,
        href,
        description,
        icon,
        textTransform,
        children,
      };
    })
    .filter((item) => item.label.length > 0);
};

const normalizeSidebarConfig = (sidebar?: ProductsByCategorySidebarConfig | null): NormalizedSidebarConfig => {
  const rawSections = Array.isArray(sidebar?.sections) ? sidebar?.sections : [];
  const showTitle = sidebar?.showTitle !== false;
  const showSidebarHeader = sidebar?.showSidebarHeader !== false;
  const showDescription = sidebar?.showDescription !== false;
  const globalBorderRadius = normalizeString(sidebar?.borderRadius);

  const sections = rawSections
    .map((section, index) => {
      const baseId = normalizeString(section?.id) || `sidebar-section-${index}`;
      const id = index === 0 ? baseId : `${baseId}-${index}`;
      const title = normalizeString(section?.title);
      const borderRadius = normalizeString(section?.borderRadius) || globalBorderRadius || undefined;
      const description = normalizeString(section?.description);
      const headerBackgroundColor = normalizeString(section?.headerBackgroundColor);
      const backgroundColor = normalizeString(section?.backgroundColor);
      const titleFontColor = normalizeString(section?.titleFontColor);
      const titleFontWeight = normalizeSidebarFontWeight(section?.titleFontWeight);
      const titleFontSize = normalizeSidebarFontSize(section?.titleFontSize);
      const titleUppercase = Boolean((section as any)?.titleUppercase);
      const titleTextTransform = section?.titleTextTransform || (titleUppercase ? 'uppercase' : 'none');
      const titleIcon = normalizeString(section?.titleIcon);
      const showTitleIcon = section?.showTitleIcon !== false;
      const showItemIcons = typeof section?.showItemIcons === 'boolean' ? section.showItemIcons : true;
      const itemFontSize = normalizeSidebarFontSize(section?.itemFontSize);
      const itemFontWeight = normalizeSidebarFontWeight(section?.itemFontWeight);
      const itemFontColor = normalizeString(section?.itemFontColor);
      const itemUppercase = Boolean((section as any)?.itemUppercase);
      const itemTextTransform = section?.itemTextTransform || (itemUppercase ? 'uppercase' : 'none');
      const items = normalizeSidebarItems(section?.items, id);

      return {
        id,
        title,
        borderRadius,
        description,
        headerBackgroundColor,
        backgroundColor,
        titleFontColor,
        titleFontWeight,
        titleFontSize,
        titleTextTransform,
        titleIcon,
        showTitleIcon,
        showItemIcons,
        itemFontSize,
        itemFontWeight,
        itemFontColor,
        itemTextTransform,
        items,
      };
    })
    .filter((section) => section.items.length > 0 || section.title.length > 0 || section.description.length > 0);

  return {
    enabled: Boolean(sidebar?.enabled) && sections.length > 0,
    title: normalizeString(sidebar?.title),
    borderRadius: normalizeString(sidebar?.borderRadius) || undefined,
    headerBackgroundColor: normalizeString(sidebar?.headerBackgroundColor),
    description: normalizeString(sidebar?.description),
    showTitle,
    showSidebarHeader,
    showDescription,
    sections,
  };
};

const getCategoryName = (category?: Category | null): string | null => {
  if (!category) return null;
  const directName = normalizeString(category.name);
  if (directName) return directName;

  if (Array.isArray(category.translations)) {
    const translationWithName = category.translations.find((translation) => normalizeString(translation?.name));
    if (translationWithName?.name) {
      const translatedName = normalizeString(translationWithName.name);
      if (translatedName) {
        return translatedName;
      }
    }
  }

  return null;
};

const getCategorySlug = (category?: Category | null): string | null => {
  if (!category) return null;

  const directSlug = normalizeString((category as any)?.slug);
  if (directSlug) {
    return directSlug;
  }

  if (Array.isArray(category.translations)) {
    const translationWithSlug = category.translations.find((translation) => normalizeString(translation?.slug));
    if (translationWithSlug?.slug) {
      const translatedSlug = normalizeString(translationWithSlug.slug);
      if (translatedSlug) {
        return translatedSlug;
      }
    }
  }

  return null;
};

const toTimestamp = (value: unknown): number => {
  if (!value) return 0;
  const date = new Date(value as any);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
};

const normalizeRows = (config: ProductsByCategoryConfig): NormalizedRowConfig[] => {
  const rows: NormalizedRowConfig[] = [];

  if (Array.isArray(config.rows) && config.rows.length > 0) {
    const fallbackDisplayStyle = normalizeDisplayStyle(config.displayStyle);
    config.rows.forEach((row, index) => {
      const baseId = normalizeString(row.id);
      const id = baseId || `row-${index}`;
      const strategy = normalizeStrategy(row.strategy as string);
      const productIds = Array.isArray(row.productIds)
        ? row.productIds.filter((idValue): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
        : [];
      const limit = ensurePositiveInteger(row.limit, config.limit ?? DEFAULT_LIMIT);
      const title = normalizeString(row.title) || null;
      const displayStyle = normalizeDisplayStyle(row.displayStyle as string ?? fallbackDisplayStyle);
      const showDisplayTitle = row.showDisplayTitle !== false;
      const showCategoryLabel = row.showCategoryLabel !== false;
      const showStrategyLabel = row.showStrategyLabel !== false;

      rows.push({
        id: index === 0 ? id : `${id}-${index}`,
        categoryId: typeof row.categoryId === 'string' ? row.categoryId : undefined,
        title,
        strategy,
        productIds,
        limit,
        displayStyle,
        showDisplayTitle,
        showCategoryLabel,
        showStrategyLabel,
        headingStyle: (row.headingStyle === 'banner' ? 'banner' : 'default'),
        headingBackgroundColor: typeof row.headingBackgroundColor === 'string' ? row.headingBackgroundColor : undefined,
        headingTextColor: typeof row.headingTextColor === 'string' ? row.headingTextColor : undefined,
        headingTextTransform: normalizeHeadingTextTransform(row.headingTextTransform),
        headingTitleSize: normalizeHeadingTitleSize(row.headingTitleSize),
        headingBarHeight: normalizeHeadingBarHeight(row.headingBarHeight),
      });
    });

    return rows;
  }

  // Legacy config fallback
  const legacyCategoryId = typeof config.categoryId === 'string' ? config.categoryId : undefined;
  const legacyProductIds = Array.isArray(config.productIds)
    ? config.productIds.filter((idValue): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
    : [];
  const legacySort = typeof config.sort === 'string' ? config.sort : 'latest';

  const fallbackId = legacyCategoryId ? `legacy-${legacyCategoryId}` : 'legacy-row';

  rows.push({
    id: fallbackId,
    categoryId: legacyCategoryId,
    title: null,
    strategy: normalizeStrategy(legacySort),
    productIds: legacyProductIds,
    limit: ensurePositiveInteger(config.limit, DEFAULT_LIMIT),
    displayStyle: normalizeDisplayStyle(config.displayStyle),
    showDisplayTitle: true,
    showCategoryLabel: true,
    showStrategyLabel: true,
    headingStyle: 'default',
    headingTextTransform: undefined,
    headingTitleSize: undefined,
    headingBarHeight: undefined,
  });

  return rows;
};

const applyStrategySorting = (items: Product[], strategy: ProductsByCategoryStrategy): Product[] => {
  if (items.length <= 1) {
    return items;
  }

  const sorted = [...items];

  switch (strategy) {
    case 'latest':
      return sorted.sort((a, b) => toTimestamp(b.updatedAt ?? b.createdAt) - toTimestamp(a.updatedAt ?? a.createdAt));
    case 'featured':
      return sorted.sort((a, b) => toTimestamp(b.updatedAt ?? b.createdAt) - toTimestamp(a.updatedAt ?? a.createdAt));
    case 'bestsellers':
      return sorted.sort((a, b) => (b.totalStock ?? 0) - (a.totalStock ?? 0));
    default:
      return sorted;
  }
};

const filterProductsByCategory = (items: Product[], category?: CategoryReference): Product[] => {
  const categoryId = toLowerCaseOrNull(category?.id);
  const categorySlug = toLowerCaseOrNull(category?.slug);

  if (!categoryId && !categorySlug) {
    return items;
  }

  return items.filter((product) => {
    if (!Array.isArray(product.categories)) {
      return true;
    }

    return product.categories.some((categoryItem: any) => {
      if (!categoryItem) {
        return false;
      }

      const candidateId = toLowerCaseOrNull(
        typeof categoryItem.id === 'string'
          ? categoryItem.id
          : typeof categoryItem.categoryId === 'string'
            ? categoryItem.categoryId
            : undefined,
      );

      if (categoryId && candidateId && candidateId === categoryId) {
        return true;
      }

      const nestedSlugSource =
        typeof categoryItem.slug === 'string'
          ? categoryItem.slug
          : typeof categoryItem.category?.slug === 'string'
            ? categoryItem.category.slug
            : undefined;

      const candidateSlug = toLowerCaseOrNull(nestedSlugSource);

      if (categorySlug && candidateSlug && candidateSlug === categorySlug) {
        return true;
      }

      return false;
    });
  });
};

const strategyBadgeClassMap: Record<ProductsByCategoryStrategy, string> = {
  latest: 'bg-blue-50 text-blue-600',
  featured: 'bg-amber-50 text-amber-600',
  bestsellers: 'bg-purple-50 text-purple-600',
  custom: 'bg-emerald-50 text-emerald-600',
};

const strategyTranslationKeyMap: Record<ProductsByCategoryStrategy, string> = {
  latest: 'sections.products_by_category.strategies.latest',
  featured: 'sections.products_by_category.strategies.featured',
  bestsellers: 'sections.products_by_category.strategies.bestsellers',
  custom: 'sections.products_by_category.strategies.custom',
};

export const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({ config, translation, viewMoreButtonConfig }) => {
  const { t, i18n } = useTranslation();

  const configKey = useMemo(() => JSON.stringify(config ?? {}), [config]);
  const rows = useMemo(() => normalizeRows(config), [configKey]);
  const sidebarConfig = useMemo(() => normalizeSidebarConfig(config?.sidebar), [configKey]);
  const sectionSidebarEnabled = typeof config.sidebarEnabled === 'boolean' ? config.sidebarEnabled : true;
  const normalizedRowsKey = useMemo(
    () => JSON.stringify(rows.map((row) => ({
      id: row.id,
      categoryId: row.categoryId,
      strategy: row.strategy,
      productIds: row.productIds,
      limit: row.limit,
      title: row.title,
      displayStyle: row.displayStyle,
      showDisplayTitle: row.showDisplayTitle,
      showCategoryLabel: row.showCategoryLabel,
      showStrategyLabel: row.showStrategyLabel,
      headingStyle: row.headingStyle,
      headingBackgroundColor: row.headingBackgroundColor,
      headingTextColor: row.headingTextColor,
    }))),
    [rows],
  );

  const [rowStates, setRowStates] = useState<Record<string, RowRenderState>>({});

  useEffect(() => {
    if (rows.length === 0) {
      setRowStates({});
      return;
    }

    let cancelled = false;
    const categoryCache = new Map<string, CategoryMeta>();

    const cacheMeta = (key: string | null | undefined, meta: CategoryMeta) => {
      const normalizedKey = normalizeString(key);
      if (!normalizedKey) {
        return;
      }
      categoryCache.set(normalizedKey, meta);
    };

    const storeMeta = (identifier: string, meta: CategoryMeta) => {
      cacheMeta(identifier, meta);
      cacheMeta(meta.id ?? null, meta);
      cacheMeta(meta.slug ?? null, meta);
    };

    const fetchCategoryMeta = async (categoryIdentifier?: string): Promise<CategoryMeta> => {
      const normalizedIdentifier = normalizeString(categoryIdentifier);
      if (!normalizedIdentifier) {
        return { id: null, name: null, slug: null };
      }

      const cached = categoryCache.get(normalizedIdentifier);
      if (cached) {
        return cached;
      }

      try {
        if (isValidUuid(normalizedIdentifier)) {
          const category = await CategoryService.getCategoryById(normalizedIdentifier);
          if (!category) {
            const fallback: CategoryMeta = { id: null, name: null, slug: null };
            storeMeta(normalizedIdentifier, fallback);
            return fallback;
          }

          const meta: CategoryMeta = {
            id: category.id ?? null,
            name: getCategoryName(category),
            slug: getCategorySlug(category),
          };
          storeMeta(normalizedIdentifier, meta);
          return meta;
        }

        const category = await CategoryService.getCategoryBySlug(normalizedIdentifier);
        if (!category) {
          const fallback: CategoryMeta = { id: null, name: null, slug: normalizedIdentifier };
          storeMeta(normalizedIdentifier, fallback);
          return fallback;
        }

        const meta: CategoryMeta = {
          id: category.id ?? null,
          name: getCategoryName(category),
          slug: getCategorySlug(category) ?? normalizedIdentifier,
        };
        storeMeta(normalizedIdentifier, meta);
        return meta;
      } catch (error) {
        console.error('Failed to fetch category meta', error);
        const fallback: CategoryMeta = {
          id: null,
          name: null,
          slug: isValidUuid(normalizedIdentifier) ? null : normalizedIdentifier,
        };
        storeMeta(normalizedIdentifier, fallback);
        return fallback;
      }
    };

    const fetchRowData = async (row: NormalizedRowConfig): Promise<[string, RowRenderState]> => {
      const { categoryId, strategy, productIds, limit } = row;
      const baseState: RowRenderState = {
        products: [],
        isLoading: false,
        error: null,
        categoryName: null,
        categorySlug: null,
      };

      const categoryMeta = await fetchCategoryMeta(categoryId);
      const normalizedIdentifier = normalizeString(categoryId);
      const resolvedCategoryId = categoryMeta.id && isValidUuid(categoryMeta.id)
        ? categoryMeta.id
        : isValidUuid(normalizedIdentifier)
          ? normalizedIdentifier
          : null;
      const fallbackSlug = !isValidUuid(normalizedIdentifier) ? normalizedIdentifier : null;
      const resolvedCategorySlug = normalizeString(categoryMeta.slug ?? fallbackSlug) || null;
      const resolvedCategoryName = normalizeString(categoryMeta.name) || null;
      const categoryReference: CategoryReference = {
        id: resolvedCategoryId,
        slug: resolvedCategorySlug,
      };

      if (strategy !== 'custom' && !resolvedCategoryId) {
        const errorKey = normalizedIdentifier ? 'sections.products_by_category.invalid_category' : 'sections.products_by_category.missing_category';
        return [row.id, {
          ...baseState,
          categoryName: resolvedCategoryName,
          categorySlug: resolvedCategorySlug,
          error: t(errorKey),
        }];
      }

      if (strategy === 'bestsellers') {
        return [row.id, {
          ...baseState,
          categoryName: resolvedCategoryName,
          categorySlug: resolvedCategorySlug,
          error: t('sections.products_by_category.bestsellers_disabled'),
        }];
      }

      if (strategy === 'custom' && productIds.length === 0) {
        return [row.id, {
          ...baseState,
          categoryName: resolvedCategoryName,
          categorySlug: resolvedCategorySlug,
          error: t('sections.products_by_category.custom_empty'),
        }];
      }

      try {
        let items: Product[] = [];

        if (strategy === 'custom') {
          const fetched = await ProductService.getProductsByIds(productIds);
          const productMap = new Map<string, Product>();
          fetched.forEach((product) => {
            productMap.set(product.id, product);
          });
          items = productIds
            .map((idValue) => productMap.get(idValue))
            .filter((product): product is Product => Boolean(product));

          if (categoryReference.id || categoryReference.slug) {
            items = filterProductsByCategory(items, categoryReference);
          }
        } else if (resolvedCategoryId) {
          const response = await ProductService.getProductsByCategory(resolvedCategoryId, { strategy });
          items = Array.isArray(response.items) ? response.items : [];
          items = filterProductsByCategory(items, categoryReference);
          items = applyStrategySorting(items, strategy);
        }

        if (items.length > limit) {
          items = items.slice(0, limit);
        }

        return [row.id, {
          ...baseState,
          products: items,
          categoryName: resolvedCategoryName,
          categorySlug: resolvedCategorySlug,
        }];
      } catch (error: any) {
        console.error('Failed to load products for category row', error);
        return [row.id, {
          ...baseState,
          categoryName: resolvedCategoryName,
          categorySlug: resolvedCategorySlug,
          error: error?.message || t('sections.products_by_category.error'),
        }];
      }
    };

    setRowStates((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        next[row.id] = {
          products: prev[row.id]?.products ?? [],
          isLoading: true,
          error: null,
          categoryName: prev[row.id]?.categoryName ?? null,
          categorySlug: prev[row.id]?.categorySlug ?? null,
        };
      });
      return next;
    });

    Promise.all(rows.map(fetchRowData)).then((results) => {
      if (cancelled) return;
      setRowStates((prev) => {
        const next = { ...prev };
        results.forEach(([rowId, state]) => {
          next[rowId] = { ...state, isLoading: false };
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [rows, normalizedRowsKey, i18n.language]);

  // null means field is hidden by admin, undefined/empty means visible but no value
  const sectionHeading = translation?.title === null ? '' : (translation?.title || t('sections.products_by_category.title'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || t('sections.products_by_category.description'));
  const sectionCuratedLabel = translation?.subtitle === null ? '' : normalizeString(translation?.subtitle);
  const hasHeaderContent = sectionHeading || sectionDescription || sectionCuratedLabel;
  const isSidebarEnabled = sectionSidebarEnabled && sidebarConfig.enabled;
  const sidebarTitleText = sidebarConfig.title || t('sections.products_by_category.sidebar_default_title');
  const sidebarHeaderBg = sidebarConfig.headerBackgroundColor;
  const sidebarDescriptionText = sidebarConfig.description || t('sections.products_by_category.sidebar_default_description');
  const sidebarShowTitle = sidebarConfig.showTitle;
  const sidebarShowSidebarHeader = sidebarConfig.showSidebarHeader;
  const sidebarShowDescription = sidebarConfig.showDescription;
  const sidebarSectionFallback = t('sections.products_by_category.sidebar_section_title');

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <SectionContainer paddingClassName="px-6 lg:px-8">
        {hasHeaderContent && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              {sectionCuratedLabel && (
                <p className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-300">
                  {sectionCuratedLabel}
                </p>
              )}
              {sectionHeading && (
                <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{sectionHeading}</h2>
              )}
              {sectionDescription && <p className="mt-2 text-gray-500 dark:text-gray-400">{sectionDescription}</p>}
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-12 ${isSidebarEnabled ? 'lg:flex-row' : ''}`}>
          {isSidebarEnabled && (
            <ProductsByCategorySidebar
              sidebarLabel={t('sections.products_by_category.sidebar_label')}
              title={sidebarTitleText}
              borderRadius={sidebarConfig.borderRadius}
              headerBackgroundColor={sidebarHeaderBg}
              description={sidebarDescriptionText}
              showTitle={sidebarShowTitle}
              showSidebarHeader={sidebarShowSidebarHeader}
              showDescription={sidebarShowDescription}
              sections={sidebarConfig.sections}
              sectionFallbackTitle={sidebarSectionFallback}
              getLinkAriaLabel={(label) => t('sections.products_by_category.sidebar_link_aria', { label })}
            />
          )}
          <div className={`${isSidebarEnabled ? 'w-full lg:w-4/5' : 'w-full'} space-y-16`}>
            {rows.map((row) => {
              const state = rowStates[row.id] ?? {
                products: [],
                isLoading: true,
                error: null,
                categoryName: null,
                categorySlug: null,
              };

              const rowCustomTitle = row.title && row.title.trim().length > 0 ? row.title.trim() : null;
              const categoryLabel = rowCustomTitle
                ? rowCustomTitle
                : state.categoryName
                  ? t('sections.products_by_category.category_label', { category: state.categoryName })
                  : t('sections.products_by_category.curated_category');
              const normalizedCategoryName = state.categoryName?.trim() || null;

              const normalizedRowCategoryId = normalizeString(row.categoryId);
              const fallbackSlug = normalizedRowCategoryId && !isValidUuid(normalizedRowCategoryId)
                ? normalizedRowCategoryId
                : null;
              const resolvedSlugForCta = state.categorySlug || fallbackSlug;
              const hasCategoryNavigation = Boolean(resolvedSlugForCta);
              const ctaHref = resolvedSlugForCta
                ? `/categories/${resolvedSlugForCta}`
                : '/products';

              const strategyLabel = t(strategyTranslationKeyMap[row.strategy]);
              const badgeClass = strategyBadgeClassMap[row.strategy];
              const rowDisplayStyle = row.displayStyle;
              const showDisplayTitle = row.showDisplayTitle;
              const showCategoryLabel = row.showCategoryLabel;
              const showStrategyLabel = row.showStrategyLabel;
              const showNormalizedCategoryLabel = showCategoryLabel && Boolean(normalizedCategoryName) && (!showDisplayTitle || normalizedCategoryName !== categoryLabel);
              const shouldRenderMetaRow = showStrategyLabel || showNormalizedCategoryLabel;
              const metaWrapperClass = `${showDisplayTitle ? 'mt-2 ' : ''}flex flex-wrap items-center gap-2`;

              const renderLoading = () => {
                const placeholderCount = rowDisplayStyle === 'carousel'
                  ? Math.min(Math.max(row.limit, 4), 6)
                  : row.limit;
                const placeholders = Array.from({ length: placeholderCount });

                if (rowDisplayStyle === 'carousel') {
                  return (
                    <div className="flex gap-4 overflow-hidden pb-2">
                      {placeholders.map((_, index) => (
                        <div key={`loading-${row.id}-${index}`} className="min-w-[240px] max-w-xs flex-shrink-0">
                          <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 shadow-sm">
                            <div className="h-44 rounded-t-xl bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                            <div className="p-4 space-y-3">
                              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {placeholders.map((_, index) => (
                      <div key={`loading-${row.id}-${index}`} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 shadow-sm">
                        <div className="h-44 rounded-t-xl bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                        <div className="p-4 space-y-3">
                          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              };

              const Carousel = () => {
                const carouselRef = useRef<HTMLDivElement>(null);
                const [isAtStart, setIsAtStart] = useState(true);
                const [isAtEnd, setIsAtEnd] = useState(false);

                const updateScrollState = useCallback(() => {
                  const node = carouselRef.current;
                  if (!node) {
                    setIsAtStart(true);
                    setIsAtEnd(true);
                    return;
                  }
                  const { scrollLeft, scrollWidth, clientWidth } = node;
                  setIsAtStart(scrollLeft <= 0);
                  setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
                }, []);

                const scrollCarousel = (direction: 'left' | 'right') => {
                  const node = carouselRef.current;
                  if (!node) return;
                  const distance = node.clientWidth * 0.8 * (direction === 'left' ? -1 : 1);
                  node.scrollBy({ left: distance, behavior: 'smooth' });
                };

                useEffect(() => {
                  const node = carouselRef.current;
                  if (!node) return undefined;

                  updateScrollState();
                  const handleScroll = () => updateScrollState();
                  node.addEventListener('scroll', handleScroll);
                  return () => {
                    node.removeEventListener('scroll', handleScroll);
                  };
                }, [state.products.length, updateScrollState]);

                return (
                  <div className="relative">
                    <button
                      type="button"
                      className="hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 transform items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                      onClick={() => scrollCarousel('left')}
                      disabled={isAtStart}
                      aria-label={t('sections.products_by_category.carousel_prev')}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
                    >
                      {state.products.map((product) => (
                        <div key={`${row.id}-${product.id}`} className="min-w-[240px] max-w-xs flex-shrink-0 snap-start">
                          <ProductCard
                            product={product}
                            showAddToCart={true}
                            showWishlist={false}
                            showQuickView={false}
                            imageHeight="h-56"
                            className="h-full"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 transform items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                      onClick={() => scrollCarousel('right')}
                      disabled={isAtEnd}
                      aria-label={t('sections.products_by_category.carousel_next')}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </button>
                  </div>
                );
              };

              const Grid = () => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {state.products.map((product) => (
                    <ProductCard
                      key={`${row.id}-${product.id}`}
                      product={product}
                      showAddToCart={true}
                      showWishlist={false}
                      showQuickView={false}
                      imageHeight="h-56"
                      className="h-full"
                    />
                  ))}
                </div>
              );

              let bodyContent: React.ReactNode = null;

              if (state.isLoading) {
                bodyContent = renderLoading();
              } else if (state.error) {
                bodyContent = (
                  <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-6 text-sm text-red-600 dark:text-red-200">
                    {state.error}
                  </div>
                );
              } else if (state.products.length === 0) {
                bodyContent = (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
                    {t('sections.products_by_category.empty')}
                  </div>
                );
              } else {
                bodyContent = rowDisplayStyle === 'carousel' ? <Carousel /> : <Grid />;
              }

              return (
                <div key={row.id} className="space-y-6">
                  <SectionHeader
                    title={showDisplayTitle ? (categoryLabel || undefined) : undefined}
                    subtitle={showStrategyLabel ? (strategyLabel || undefined) : undefined}
                    description={showNormalizedCategoryLabel ? (normalizedCategoryName || undefined) : undefined}
                    ctaLabel={hasCategoryNavigation ? t('sections.products_by_category.view_category') : undefined}
                    ctaLink={hasCategoryNavigation ? ctaHref : undefined}
                    headingStyle={row.headingStyle}
                    headingBackgroundColor={row.headingBackgroundColor}
                    headingTextColor={row.headingTextColor}
                    headingTextTransform={row.headingTextTransform}
                    headingTitleSize={row.headingTitleSize}
                    headingBarHeight={row.headingBarHeight}
                    className="mb-8"
                  />

                  {bodyContent}
                </div>
              );
            })}
          </div>
        </div>
      </SectionContainer>
    </section >
  );
};

export default ProductsByCategory;

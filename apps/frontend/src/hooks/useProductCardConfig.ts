import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { ApiResponse } from '../types/api';

type ProductCardLayout = 'vertical' | 'horizontal';
type ProductCardPriceDisplay = 'stacked' | 'inline';
type ProductCardBadgeStyle = 'pill' | 'square';
type ProductCardFontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type ProductCardFontSize = 'sm' | 'base' | 'lg' | 'xl';
type ProductCardPriceTone = 'muted' | 'default' | 'emphasis' | 'custom';
type ProductCardThumbnailOrientation = 'portrait' | 'landscape';
type ProductCardContentBlock = 'title' | 'sku' | 'shortDescription' | 'price' | 'button';

interface ComponentConfigResponse {
  id: string;
  componentKey: string;
  defaultConfig?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  slotKey?: string | null;
  parentId?: string | null;
}

interface ProductCardBaseConfig {
  layout: ProductCardLayout;
  imageHeight: string;
  showAddToCart: boolean;
  showWishlist: boolean;
  showQuickView: boolean;
  showRating: boolean;
  showSku: boolean;
  showShortDescription: boolean;
  badgeStyle: ProductCardBadgeStyle;
  priceDisplay: ProductCardPriceDisplay;
  contentFontSizes: {
    sku: ProductCardFontSize;
    shortDescription: ProductCardFontSize;
    contactPrice: ProductCardFontSize;
    actionLabel: ProductCardFontSize;
  };
  contentOrder: ProductCardContentBlock[];
  thumbnail: {
    orientation: ProductCardThumbnailOrientation;
  };
}

interface ProductCardTitleConfig {
  clampLines: number;
  htmlTag: 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span';
  fontWeight: ProductCardFontWeight;
  fontSize: ProductCardFontSize;
  textColor?: string;
  uppercase: boolean;
}

interface ProductCardPriceConfig {
  locale?: string;
  currency?: string;
  showCompareAtPrice: boolean;
  showDivider: boolean;
  fontWeight: ProductCardFontWeight;
  fontSize: ProductCardFontSize;
  colorTone: ProductCardPriceTone;
  customColor?: string;
}

interface ProductCardResolvedConfig {
  card: ProductCardBaseConfig;
  title: ProductCardTitleConfig;
  price: ProductCardPriceConfig;
}

const PRODUCT_CARD_COMPONENT_KEYS = [
  'product_card',
  'product_card.info.title',
  'product_card.info.price',
] as const;

const DEFAULT_CARD_CONFIG: ProductCardBaseConfig = {
  layout: 'vertical',
  imageHeight: 'h-60',
  showAddToCart: true,
  showWishlist: true,
  showQuickView: false,
  showRating: true,
  showSku: true,
  showShortDescription: false,
  badgeStyle: 'pill',
  priceDisplay: 'stacked',
  contentFontSizes: {
    sku: 'sm',
    shortDescription: 'sm',
    contactPrice: 'lg',
    actionLabel: 'base',
  },
  contentOrder: ['title', 'sku', 'shortDescription', 'price', 'button'],
  thumbnail: {
    orientation: 'portrait',
  },
};

const DEFAULT_TITLE_CONFIG: ProductCardTitleConfig = {
  clampLines: 2,
  htmlTag: 'h3',
  fontWeight: 'semibold',
  fontSize: 'base',
  uppercase: false,
};

const DEFAULT_PRICE_CONFIG: ProductCardPriceConfig = {
  locale: undefined,
  currency: undefined,
  showCompareAtPrice: true,
  showDivider: false,
  fontWeight: 'bold',
  fontSize: 'base',
  colorTone: 'emphasis',
};

const isFontWeight = (value: unknown): value is ProductCardFontWeight =>
  value === 'normal' || value === 'medium' || value === 'semibold' || value === 'bold';

const isFontSize = (value: unknown): value is ProductCardFontSize =>
  value === 'sm' || value === 'base' || value === 'lg' || value === 'xl';

const isLayout = (value: unknown): value is ProductCardLayout =>
  value === 'vertical' || value === 'horizontal';

const isPriceDisplay = (value: unknown): value is ProductCardPriceDisplay =>
  value === 'stacked' || value === 'inline';

const isBadgeStyle = (value: unknown): value is ProductCardBadgeStyle =>
  value === 'pill' || value === 'square';

const isPriceTone = (value: unknown): value is ProductCardPriceTone =>
  value === 'muted' || value === 'default' || value === 'emphasis' || value === 'custom';

const isThumbnailOrientation = (value: unknown): value is ProductCardThumbnailOrientation =>
  value === 'portrait' || value === 'landscape';

const isContentBlock = (value: unknown): value is ProductCardContentBlock =>
  value === 'title' || value === 'sku' || value === 'shortDescription' || value === 'price' || value === 'button';

const normalizeBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeCardConfig = (raw?: Record<string, unknown> | null): ProductCardBaseConfig => {
  if (!raw) {
    return DEFAULT_CARD_CONFIG;
  }

  const thumbnailSource =
    typeof raw.thumbnail === 'object' && raw.thumbnail !== null ? raw.thumbnail as Record<string, unknown> : {};
  const contentFontSizesSource =
    typeof raw.contentFontSizes === 'object' && raw.contentFontSizes !== null
      ? raw.contentFontSizes as Record<string, unknown>
      : {};
  const rawContentOrder = Array.isArray(raw.contentOrder) ? raw.contentOrder : [];
  const normalizedContentOrder = rawContentOrder.filter(isContentBlock);
  const contentOrder = DEFAULT_CARD_CONFIG.contentOrder.filter((block) => normalizedContentOrder.includes(block));
  DEFAULT_CARD_CONFIG.contentOrder.forEach((block) => {
    if (!contentOrder.includes(block)) {
      contentOrder.push(block);
    }
  });

  return {
    layout: isLayout(raw.layout) ? raw.layout : DEFAULT_CARD_CONFIG.layout,
    imageHeight: typeof raw.imageHeight === 'string' && raw.imageHeight.trim().length > 0
      ? raw.imageHeight
      : DEFAULT_CARD_CONFIG.imageHeight,
    showAddToCart: normalizeBoolean(raw.showAddToCart, DEFAULT_CARD_CONFIG.showAddToCart),
    showWishlist: normalizeBoolean(raw.showWishlist, DEFAULT_CARD_CONFIG.showWishlist),
    showQuickView: normalizeBoolean(raw.showQuickView, DEFAULT_CARD_CONFIG.showQuickView),
    showRating: normalizeBoolean(raw.showRating, DEFAULT_CARD_CONFIG.showRating),
    showSku: normalizeBoolean(raw.showSku, DEFAULT_CARD_CONFIG.showSku),
    showShortDescription: normalizeBoolean(raw.showShortDescription, DEFAULT_CARD_CONFIG.showShortDescription),
    badgeStyle: isBadgeStyle(raw.badgeStyle) ? raw.badgeStyle : DEFAULT_CARD_CONFIG.badgeStyle,
    priceDisplay: isPriceDisplay(raw.priceDisplay) ? raw.priceDisplay : DEFAULT_CARD_CONFIG.priceDisplay,
    contentFontSizes: {
      sku: isFontSize(contentFontSizesSource.sku)
        ? contentFontSizesSource.sku
        : DEFAULT_CARD_CONFIG.contentFontSizes.sku,
      shortDescription: isFontSize(contentFontSizesSource.shortDescription)
        ? contentFontSizesSource.shortDescription
        : DEFAULT_CARD_CONFIG.contentFontSizes.shortDescription,
      contactPrice: isFontSize(contentFontSizesSource.contactPrice)
        ? contentFontSizesSource.contactPrice
        : DEFAULT_CARD_CONFIG.contentFontSizes.contactPrice,
      actionLabel: isFontSize(contentFontSizesSource.actionLabel)
        ? contentFontSizesSource.actionLabel
        : DEFAULT_CARD_CONFIG.contentFontSizes.actionLabel,
    },
    contentOrder,
    thumbnail: {
      orientation: isThumbnailOrientation(thumbnailSource.orientation)
        ? thumbnailSource.orientation
        : DEFAULT_CARD_CONFIG.thumbnail.orientation,
    },
  };
};

const mergeConfigSources = (
  ...sources: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> | null => {
  const merged: Record<string, unknown> = {};
  for (const source of sources) {
    if (source && typeof source === 'object') {
      Object.assign(merged, source);
    }
  }
  return Object.keys(merged).length > 0 ? merged : null;
};

const normalizeTitleConfig = (raw?: Record<string, unknown> | null): ProductCardTitleConfig => {
  if (!raw) {
    return DEFAULT_TITLE_CONFIG;
  }

  const clampLines = typeof raw.clampLines === 'number' ? raw.clampLines : DEFAULT_TITLE_CONFIG.clampLines;
  const htmlTag =
    raw.htmlTag === 'h2' ||
      raw.htmlTag === 'h3' ||
      raw.htmlTag === 'h4' ||
      raw.htmlTag === 'h5' ||
      raw.htmlTag === 'p' ||
      raw.htmlTag === 'span'
      ? raw.htmlTag
      : DEFAULT_TITLE_CONFIG.htmlTag;

  return {
    clampLines: Math.max(1, Math.min(5, clampLines)),
    htmlTag,
    fontWeight: isFontWeight(raw.fontWeight) ? raw.fontWeight : DEFAULT_TITLE_CONFIG.fontWeight,
    fontSize: isFontSize(raw.fontSize) ? raw.fontSize : DEFAULT_TITLE_CONFIG.fontSize,
    textColor: typeof raw.textColor === 'string' ? raw.textColor : undefined,
    uppercase: normalizeBoolean(raw.uppercase, DEFAULT_TITLE_CONFIG.uppercase),
  };
};

const normalizePriceConfig = (raw?: Record<string, unknown> | null): ProductCardPriceConfig => {
  if (!raw) {
    return DEFAULT_PRICE_CONFIG;
  }

  return {
    locale: typeof raw.locale === 'string' && raw.locale.trim().length > 0 ? raw.locale : undefined,
    currency: typeof raw.currency === 'string' && raw.currency.trim().length > 0 ? raw.currency : undefined,
    showCompareAtPrice: normalizeBoolean(raw.showCompareAtPrice, DEFAULT_PRICE_CONFIG.showCompareAtPrice),
    showDivider: normalizeBoolean(raw.showDivider, DEFAULT_PRICE_CONFIG.showDivider),
    fontWeight: isFontWeight(raw.fontWeight) ? raw.fontWeight : DEFAULT_PRICE_CONFIG.fontWeight,
    fontSize: isFontSize(raw.fontSize) ? raw.fontSize : DEFAULT_PRICE_CONFIG.fontSize,
    colorTone: isPriceTone(raw.colorTone) ? raw.colorTone : DEFAULT_PRICE_CONFIG.colorTone,
    customColor: typeof raw.customColor === 'string' && raw.customColor.trim().length > 0 ? raw.customColor : undefined,
  };
};

export const useProductCardConfig = () => {
  const listInput = useMemo(
    () => ({
      componentKeys: [...PRODUCT_CARD_COMPONENT_KEYS],
    }),
    [],
  );
  const query = trpc.clientComponentConfigs.listByKeys.useQuery(listInput);

  const config = useMemo<ProductCardResolvedConfig>(() => {
    const response = query.data as ApiResponse<ComponentConfigResponse[]> | undefined;
    const items = response?.data ?? [];
    const map = items.reduce<Record<string, ComponentConfigResponse>>((acc, item) => {
      acc[item.componentKey] = item;
      return acc;
    }, {});

    const rawCard = map['product_card']?.defaultConfig ?? null;
    const cardTitleStyle =
      typeof rawCard === 'object' && rawCard && 'titleStyle' in rawCard
        ? (rawCard.titleStyle as Record<string, unknown> | null)
        : null;
    const cardPriceStyle =
      typeof rawCard === 'object' && rawCard && 'priceStyle' in rawCard
        ? (rawCard.priceStyle as Record<string, unknown> | null)
        : null;

    const rawTitle = mergeConfigSources(
      map['product_card.info.title']?.defaultConfig ?? null,
      cardTitleStyle,
    );
    const rawPrice = mergeConfigSources(
      map['product_card.info.price']?.defaultConfig ?? null,
      cardPriceStyle,
    );

    return {
      card: normalizeCardConfig(rawCard as Record<string, unknown> | null),
      title: normalizeTitleConfig(rawTitle),
      price: normalizePriceConfig(rawPrice),
    };
  }, [query.data]);

  return {
    config,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export type UseProductCardConfigReturn = ReturnType<typeof useProductCardConfig>;

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiLayers, FiMove } from 'react-icons/fi';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JsonEditor } from '@admin/components/common/JsonEditor';
import { Badge } from '@admin/components/common/Badge';
import MainMenuAppearanceEditor from '@admin/components/component-configs/MainMenuAppearanceEditor';
import AddToCartButtonEditor, {
  type AddToCartButtonConfig,
  type AddToCartPreviewLabelKey,
  type AddToCartButtonSize,
  type AddToCartButtonTextTransform,
} from '@admin/components/component-configs/AddToCartButtonEditor';
import type { ComponentConfigNode } from '@admin/components/component-configs/componentConfigTree';
import type { ComponentConfigOption } from '@admin/types/component-config';
import { createMainMenuConfig, type MainMenuConfig } from '@shared/types/navigation.types';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

const SortableList = SortableContext as unknown as React.ComponentType<{
  items: string[];
  strategy: typeof verticalListSortingStrategy;
  children: React.ReactNode;
}>;

export interface ComponentConfigVisualBuilderSubmitPayload {
  defaultConfig: Record<string, unknown>;
  childOrder: string[];
}

interface ComponentConfigVisualBuilderProps {
  component: ComponentConfigNode;
  childComponents?: ComponentConfigNode[];
  componentOptions?: ComponentConfigOption[];
  isSubmitting?: boolean;
  formId?: string;
  onSave: (payload: ComponentConfigVisualBuilderSubmitPayload) => Promise<void> | void;
}

type ProductCardLayout = 'vertical' | 'horizontal';
type ProductCardFontSize = 'sm' | 'base' | 'lg' | 'xl';
type ProductCardPriceTone = 'muted' | 'default' | 'emphasis' | 'custom';
type ProductCardContentBlock = 'title' | 'sku' | 'shortDescription' | 'price' | 'button';

interface ProductCardConfigState extends Record<string, unknown> {
  layout: ProductCardLayout;
  imageHeight: string;
  imageBorderRadius: string;
  showAddToCart: boolean;
  showWishlist: boolean;
  showQuickView: boolean;
  showRating: boolean;
  showSku: boolean;
  showShortDescription: boolean;
  priceStyle: {
    colorTone: ProductCardPriceTone;
    customColor?: string;
  };
  contentFontSizes: {
    sku: ProductCardFontSize;
    shortDescription: ProductCardFontSize;
    contactPrice: ProductCardFontSize;
    actionLabel: ProductCardFontSize;
  };
  contentOrder: ProductCardContentBlock[];
}

const PRODUCT_CARD_CONTENT_BLOCKS: ProductCardContentBlock[] = ['title', 'sku', 'shortDescription', 'price', 'button'];

const ADD_TO_CART_SIZES: AddToCartButtonSize[] = ['sm', 'md', 'lg'];
const ADD_TO_CART_TEXT_TRANSFORMS: AddToCartButtonTextTransform[] = ['normal', 'uppercase', 'capitalize'];

const DEFAULT_ADD_TO_CART_BUTTON_CONFIG: AddToCartButtonConfig = {
  backgroundColor: {
    light: '#2563eb',
    dark: '#3b82f6',
  },
  textColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  outOfStockBackgroundColor: {
    light: '#94a3b8',
    dark: '#64748b',
  },
  outOfStockTextColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  size: 'md',
  textTransform: 'normal',
  icon: 'cart',
};

const isAddToCartButtonSize = (value: unknown): value is AddToCartButtonSize =>
  typeof value === 'string' && ADD_TO_CART_SIZES.includes(value as AddToCartButtonSize);

const isAddToCartButtonTextTransform = (value: unknown): value is AddToCartButtonTextTransform =>
  typeof value === 'string' && ADD_TO_CART_TEXT_TRANSFORMS.includes(value as AddToCartButtonTextTransform);

const normalizeAddToCartButtonConfig = (raw?: Record<string, unknown>): AddToCartButtonConfig => {
  const source = (raw || {}) as Record<string, unknown>;
  const backgroundColor = source.backgroundColor && typeof source.backgroundColor === 'object'
    ? source.backgroundColor as Record<string, unknown>
    : {};
  const textColor = source.textColor && typeof source.textColor === 'object'
    ? source.textColor as Record<string, unknown>
    : {};
  const outOfStockBackgroundColor = source.outOfStockBackgroundColor && typeof source.outOfStockBackgroundColor === 'object'
    ? source.outOfStockBackgroundColor as Record<string, unknown>
    : {};
  const outOfStockTextColor = source.outOfStockTextColor && typeof source.outOfStockTextColor === 'object'
    ? source.outOfStockTextColor as Record<string, unknown>
    : {};
  const previewLabels = source.previewLabels && typeof source.previewLabels === 'object'
    ? source.previewLabels as Record<string, unknown>
    : {};

  const normalizePreviewLabel = (key: AddToCartPreviewLabelKey): string | undefined => {
    const label = previewLabels[key];
    return typeof label === 'string' ? label : undefined;
  };

  return {
    backgroundColor: {
      light: typeof backgroundColor.light === 'string' ? backgroundColor.light : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.backgroundColor.light,
      dark: typeof backgroundColor.dark === 'string' ? backgroundColor.dark : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.backgroundColor.dark,
    },
    textColor: {
      light: typeof textColor.light === 'string' ? textColor.light : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textColor.light,
      dark: typeof textColor.dark === 'string' ? textColor.dark : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textColor.dark,
    },
    outOfStockBackgroundColor: {
      light: typeof outOfStockBackgroundColor.light === 'string'
        ? outOfStockBackgroundColor.light
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockBackgroundColor.light,
      dark: typeof outOfStockBackgroundColor.dark === 'string'
        ? outOfStockBackgroundColor.dark
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockBackgroundColor.dark,
    },
    outOfStockTextColor: {
      light: typeof outOfStockTextColor.light === 'string'
        ? outOfStockTextColor.light
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockTextColor.light,
      dark: typeof outOfStockTextColor.dark === 'string'
        ? outOfStockTextColor.dark
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockTextColor.dark,
    },
    size: isAddToCartButtonSize(source.size) ? source.size : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.size,
    textTransform: isAddToCartButtonTextTransform(source.textTransform)
      ? source.textTransform
      : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textTransform,
    icon: typeof source.icon === 'string' ? source.icon : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.icon,
    previewLabels: {
      add: normalizePreviewLabel('add'),
      out: normalizePreviewLabel('out'),
      contact: normalizePreviewLabel('contact'),
      select: normalizePreviewLabel('select'),
      incart: normalizePreviewLabel('incart'),
    },
  };
};

const serializeAddToCartButtonConfig = (config: AddToCartButtonConfig): Record<string, unknown> => ({
  backgroundColor: config.backgroundColor,
  textColor: config.textColor,
  outOfStockBackgroundColor: config.outOfStockBackgroundColor,
  outOfStockTextColor: config.outOfStockTextColor,
  size: config.size,
  textTransform: config.textTransform,
  icon: config.icon,
  previewLabels: config.previewLabels,
});

const normalizeBooleanValue = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

const normalizeStringValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const normalizeProductCardConfig = (raw?: Record<string, unknown>): ProductCardConfigState => {
  const source = (raw ?? {}) as Record<string, unknown>;
  const priceStyleSource = source.priceStyle && typeof source.priceStyle === 'object'
    ? source.priceStyle as Record<string, unknown>
    : {};
  const contentFontSizesSource = source.contentFontSizes && typeof source.contentFontSizes === 'object'
    ? source.contentFontSizes as Record<string, unknown>
    : {};
  const rawContentOrder = Array.isArray(source.contentOrder) ? source.contentOrder : [];
  const normalizedContentOrder = rawContentOrder.filter(
    (block): block is ProductCardContentBlock =>
      typeof block === 'string' && PRODUCT_CARD_CONTENT_BLOCKS.includes(block as ProductCardContentBlock),
  );
  const contentOrder = PRODUCT_CARD_CONTENT_BLOCKS.filter((block) => normalizedContentOrder.includes(block));
  PRODUCT_CARD_CONTENT_BLOCKS.forEach((block) => {
    if (!contentOrder.includes(block)) {
      contentOrder.push(block);
    }
  });

  return {
    ...source,
    layout: source.layout === 'horizontal' ? 'horizontal' : 'vertical',
    imageHeight: normalizeStringValue(source.imageHeight, '16rem'),
    imageBorderRadius: normalizeStringValue(source.imageBorderRadius),
    showAddToCart: normalizeBooleanValue(source.showAddToCart, true),
    showWishlist: normalizeBooleanValue(source.showWishlist, true),
    showQuickView: normalizeBooleanValue(source.showQuickView, false),
    showRating: normalizeBooleanValue(source.showRating, true),
    showSku: normalizeBooleanValue(source.showSku, true),
    showShortDescription: normalizeBooleanValue(source.showShortDescription, false),
    priceStyle: {
      colorTone: ['muted', 'default', 'emphasis', 'custom'].includes(String(priceStyleSource.colorTone))
        ? priceStyleSource.colorTone as ProductCardPriceTone
        : 'emphasis',
      customColor: normalizeStringValue(priceStyleSource.customColor),
    },
    contentFontSizes: {
      sku: ['sm', 'base', 'lg', 'xl'].includes(String(contentFontSizesSource.sku))
        ? contentFontSizesSource.sku as ProductCardFontSize
        : 'sm',
      shortDescription: ['sm', 'base', 'lg', 'xl'].includes(String(contentFontSizesSource.shortDescription))
        ? contentFontSizesSource.shortDescription as ProductCardFontSize
        : 'sm',
      contactPrice: ['sm', 'base', 'lg', 'xl'].includes(String(contentFontSizesSource.contactPrice))
        ? contentFontSizesSource.contactPrice as ProductCardFontSize
        : 'lg',
      actionLabel: ['sm', 'base', 'lg', 'xl'].includes(String(contentFontSizesSource.actionLabel))
        ? contentFontSizesSource.actionLabel as ProductCardFontSize
        : 'base',
    },
    contentOrder,
  };
};

const fontSizeClass: Record<ProductCardFontSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

interface ProductCardVisualEditorProps {
  value: ProductCardConfigState;
  onChange: (next: ProductCardConfigState) => void;
}

const ProductCardVisualEditor: React.FC<ProductCardVisualEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslationWithBackend();
  const [draggingBlock, setDraggingBlock] = useState<ProductCardContentBlock | null>(null);

  const setField = <K extends keyof ProductCardConfigState>(key: K, nextValue: ProductCardConfigState[K]) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const moveBlock = (from: ProductCardContentBlock, to: ProductCardContentBlock) => {
    const currentOrder = value.contentOrder.filter((block) => PRODUCT_CARD_CONTENT_BLOCKS.includes(block));
    const fromIndex = currentOrder.indexOf(from);
    const toIndex = currentOrder.indexOf(to);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const next = [...currentOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setField('contentOrder', next);
  };

  const blockLabel: Record<ProductCardContentBlock, string> = {
    title: t('componentConfigs.title', 'Title'),
    sku: t('componentConfigs.sku', 'SKU'),
    shortDescription: t('componentConfigs.shortDescription', 'Short Description'),
    price: t('componentConfigs.price', 'Price'),
    button: t('componentConfigs.button', 'Button'),
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.layout', 'Layout')}</span>
          <select
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={value.layout}
            onChange={(event) => setField('layout', event.target.value as ProductCardLayout)}
          >
            <option value="vertical">{t('componentConfigs.vertical', 'Vertical')}</option>
            <option value="horizontal">{t('componentConfigs.horizontal', 'Horizontal')}</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('componentConfigs.imageHeight', 'Image Height')}</span>
          <input
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={value.imageHeight}
            onChange={(event) => setField('imageHeight', event.target.value)}
            placeholder="16rem"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('componentConfigs.productCardImageBorderRadius', 'Image border radius')}
          </span>
          <input
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={value.imageBorderRadius}
            onChange={(event) => setField('imageBorderRadius', event.target.value)}
            placeholder="0.75rem 0.75rem 0 0"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={value.showSku} onChange={(e) => setField('showSku', e.target.checked)} />
          {t('componentConfigs.showSku', 'Show SKU')}
        </label>
        <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={value.showShortDescription}
            onChange={(e) => setField('showShortDescription', e.target.checked)}
          />
          {t('componentConfigs.showShortDescription', 'Show short description')}
        </label>
        <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={value.showAddToCart}
            onChange={(e) => setField('showAddToCart', e.target.checked)}
          />
          {t('componentConfigs.showAddToCart', 'Show add to cart')}
        </label>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-neutral-900">{t('componentConfigs.preview', 'Preview')}</p>
        <div className={`rounded-xl border border-neutral-200 bg-neutral-50 p-3 ${value.layout === 'horizontal' ? 'flex gap-3' : 'space-y-3'}`}>
          <div
            className={`${value.layout === 'horizontal' ? 'w-40 shrink-0' : 'w-full'} rounded-lg bg-neutral-200`}
            style={{
              height: value.imageHeight || '16rem',
              borderRadius: value.imageBorderRadius || undefined,
            }}
          />
          <div className="flex-1 space-y-2">
            {value.contentOrder.map((block) => {
              if (block === 'sku' && !value.showSku) return null;
              if (block === 'shortDescription' && !value.showShortDescription) return null;
              if (block === 'button' && !value.showAddToCart) return null;

              return (
                <div
                  key={block}
                  draggable
                  onDragStart={() => setDraggingBlock(block)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggingBlock) return;
                    moveBlock(draggingBlock, block);
                    setDraggingBlock(null);
                  }}
                  className="rounded-md border border-dashed border-neutral-300 bg-white px-3 py-2"
                >
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">{blockLabel[block]}</div>
                  {block === 'title' && <div className={`${fontSizeClass.lg} font-semibold text-neutral-900`}>Sample product title</div>}
                  {block === 'sku' && <div className={`${fontSizeClass[value.contentFontSizes.sku]} text-neutral-500`}>SKU: PROD-001</div>}
                  {block === 'shortDescription' && (
                    <div className={`${fontSizeClass[value.contentFontSizes.shortDescription]} text-neutral-600`}>
                      Short description of product shown to customers.
                    </div>
                  )}
                  {block === 'price' && (
                    <div className={`${fontSizeClass[value.contentFontSizes.contactPrice]} font-bold text-blue-700`}>
                      1,250,000 đ
                    </div>
                  )}
                  {block === 'button' && (
                    <button type="button" className={`rounded-md bg-blue-600 px-3 py-1.5 text-white ${fontSizeClass[value.contentFontSizes.actionLabel]}`}>
                      {t('ecommerce.cart.addToCart', 'Add to cart')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SortableChildRowProps {
  child: ComponentConfigNode;
}

const SortableChildRow: React.FC<SortableChildRowProps> = ({ child }) => {
  const { t } = useTranslationWithBackend();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: child.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{child.displayName}</p>
          <p className="truncate text-xs text-neutral-500">{child.componentKey}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/component-configs/${child.id}/edit`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-500"
          >
            {t('componentConfigs.viewDetails', 'View details')}
            <FiArrowRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            className="inline-flex cursor-grab items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
            {...attributes}
            {...listeners}
          >
            <FiMove className="h-3.5 w-3.5" />
            {t('common.reorder', 'Reorder')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ComponentConfigVisualBuilder: React.FC<ComponentConfigVisualBuilderProps> = ({
  component,
  childComponents = [],
  isSubmitting = false,
  formId,
  onSave,
}) => {
  const { t } = useTranslationWithBackend();
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);
  const [defaultConfigRaw, setDefaultConfigRaw] = useState(() => JSON.stringify(component.defaultConfig || {}, null, 2));
  const [orderedChildren, setOrderedChildren] = useState<ComponentConfigNode[]>(() => [...childComponents]);
  const [mainMenuConfig, setMainMenuConfig] = useState<MainMenuConfig>(() =>
    createMainMenuConfig((component.defaultConfig || {}) as Partial<MainMenuConfig>),
  );
  const [addToCartButtonConfig, setAddToCartButtonConfig] = useState<AddToCartButtonConfig>(() =>
    normalizeAddToCartButtonConfig(component.defaultConfig || {}),
  );
  const [productCardConfig, setProductCardConfig] = useState<ProductCardConfigState>(() =>
    normalizeProductCardConfig(component.defaultConfig || {}),
  );

  const isMainMenuAppearance = component.componentKey === 'navigation.main_menu';
  const isAddToCartButton = component.componentKey === 'add_to_cart_button';
  const isProductCard = component.componentKey === 'product_card';

  useEffect(() => {
    setDefaultConfigRaw(JSON.stringify(component.defaultConfig || {}, null, 2));
    setMainMenuConfig(createMainMenuConfig((component.defaultConfig || {}) as Partial<MainMenuConfig>));
    setAddToCartButtonConfig(normalizeAddToCartButtonConfig(component.defaultConfig || {}));
    setProductCardConfig(normalizeProductCardConfig(component.defaultConfig || {}));
    setJsonError(undefined);
  }, [component.id, component.defaultConfig]);

  useEffect(() => {
    setOrderedChildren([...childComponents]);
  }, [component.id, childComponents]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const childIds = useMemo(() => orderedChildren.map((child) => child.id), [orderedChildren]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setOrderedChildren((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setJsonError(undefined);

    let resolvedDefaultConfig: Record<string, unknown>;
    if (isMainMenuAppearance) {
      resolvedDefaultConfig = createMainMenuConfig(mainMenuConfig);
    } else if (isAddToCartButton) {
      resolvedDefaultConfig = serializeAddToCartButtonConfig(addToCartButtonConfig);
    } else if (isProductCard) {
      resolvedDefaultConfig = productCardConfig;
    } else {
      try {
        resolvedDefaultConfig = defaultConfigRaw.trim() ? JSON.parse(defaultConfigRaw) : {};
      } catch (error) {
        setJsonError((error as Error)?.message || t('componentConfigs.invalidJson', 'Invalid JSON payload'));
        return;
      }
    }

    await onSave({
      defaultConfig: resolvedDefaultConfig,
      childOrder: orderedChildren.map((child) => child.id),
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiLayers className="h-4 w-4 text-primary-600" />
          <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.componentSnapshot', 'Component snapshot')}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('componentConfigs.componentKey', 'Component key')}</p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{component.componentKey}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('componentConfigs.displayName', 'Display name')}</p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{component.displayName}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('componentConfigs.category', 'Category')}</p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{component.category}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('componentConfigs.componentType', 'Component type')}</p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{component.componentType}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.visualConfigBuilder', 'Visual config builder')}</p>
            <p className="text-xs text-neutral-500">
              {isMainMenuAppearance || isAddToCartButton || isProductCard
                ? t('componentConfigs.visualConfigBuilderDesc', 'This component supports a direct visual editor.')
                : t('componentConfigs.visualConfigJsonFallback', 'Visual editor is not available for this component. JSON editor is shown instead.')}
            </p>
          </div>
          <Badge variant="info">{isMainMenuAppearance || isAddToCartButton || isProductCard ? t('common.visual', 'Visual') : 'JSON'}</Badge>
        </div>

        {isMainMenuAppearance ? (
          <MainMenuAppearanceEditor value={mainMenuConfig} onChange={setMainMenuConfig} t={t} />
        ) : isAddToCartButton ? (
          <AddToCartButtonEditor value={addToCartButtonConfig} onChange={setAddToCartButtonConfig} t={t} />
        ) : isProductCard ? (
          <ProductCardVisualEditor value={productCardConfig} onChange={setProductCardConfig} />
        ) : (
          <JsonEditor
            value={defaultConfigRaw}
            onChange={setDefaultConfigRaw}
            error={jsonError}
            height="420px"
          />
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.childComponentsBuilder', 'Child components builder')}</p>
            <p className="text-xs text-neutral-500">{t('componentConfigs.childComponentsBuilderDesc', 'Drag and drop to reorder direct child components.')}</p>
          </div>
          <Badge variant="secondary">{orderedChildren.length} {t('componentConfigs.items', 'items')}</Badge>
        </div>

        {orderedChildren.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
            {t('componentConfigs.noChildComponentsYet', 'This component has no direct child components yet.')}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableList items={childIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {orderedChildren.map((child) => (
                  <SortableChildRow key={child.id} child={child} />
                ))}
              </div>
            </SortableList>
          </DndContext>
        )}
      </section>

      <button type="submit" className="hidden" disabled={isSubmitting} aria-hidden="true" />
    </form>
  );
};

export default ComponentConfigVisualBuilder;

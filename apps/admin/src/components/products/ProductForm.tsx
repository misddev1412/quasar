import React, { useEffect, useRef, useState } from 'react';
import { FolderPlus, Package, Image, Settings, Globe, Tag, Layers, Zap, Warehouse } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { TranslationTabs } from '../common/TranslationTabs';
import { FormTabConfig, FormActionsAlignment } from '../../types/forms';
import { CreateProductFormData, Product, ProductVariant, ProductMedia, ProductWarehouseQuantity } from '../../types/product';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';
import { ProductVariantsSection, VariantMatrixItem } from './ProductVariantsSection';
import { MediaType } from '../common/ProductMediaUpload';
import { ProductSpecificationsEditor, ProductSpecificationFormItem } from './ProductSpecificationsEditor';
import { ProductWarehouseQuantityManager } from './ProductWarehouseQuantityManager';
import { Input } from '../common/Input';
import { FormInput } from '../common/FormInput';
import { BASE_LABEL_CLASS } from '../common/styles';
import { stripNumberLeadingZeros } from '../../utils/inputUtils';
import { Button } from '../common/Button';
import { Switch } from '../common/Switch';

// MediaItem interface for frontend form - compatible with ProductMediaUpload component
interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary?: boolean;
  // Form-specific optional fields
  file?: File;
  preview?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

// Type guard to check if item is ProductMedia from backend
const isProductMedia = (item: any): item is ProductMedia => {
  return item && typeof item === 'object' && 'productId' in item;
};

// Transform ProductMedia to MediaItem format expected by ProductMediaUpload
const transformProductMediaToMediaItem = (media: ProductMedia): MediaItem => ({
  id: media.id,
  type: media.type as MediaType,
  url: media.url,
  altText: media.altText,
  caption: media.caption,
  sortOrder: media.sortOrder,
  fileSize: media.fileSize,
  mimeType: media.mimeType,
  width: media.width,
  height: media.height,
  duration: media.duration,
  thumbnailUrl: media.thumbnailUrl,
  isPrimary: media.isPrimary,
});

// Transform MediaItem back to format for backend submission (omit form-specific fields)
const transformMediaItemForBackend = (mediaItem: MediaItem) => ({
  id: mediaItem.id,
  type: mediaItem.type,
  url: mediaItem.url,
  altText: mediaItem.altText || null,
  caption: mediaItem.caption || null,
  sortOrder: Number(mediaItem.sortOrder) || 0,
  fileSize: mediaItem.fileSize ? Number(mediaItem.fileSize) : null,
  mimeType: mediaItem.mimeType || null,
  width: mediaItem.width ? Number(mediaItem.width) : null,
  height: mediaItem.height ? Number(mediaItem.height) : null,
  duration: mediaItem.duration ? Number(mediaItem.duration) : null,
  thumbnailUrl: mediaItem.thumbnailUrl || null,
  isPrimary: Boolean(mediaItem.isPrimary),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']),
  brandId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  warrantyId: z.string().optional(),
  media: z.any().optional(), // Simplified validation for media
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isContactPrice: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).nullable().optional(),
  stockQuantity: z.number().min(0).optional(),
  enableWarehouseQuantity: z.boolean().default(false),
  warehouseQuantities: z.array(z.object({
    warehouseId: z.string(),
    quantity: z.number().min(0),
  })).optional(),
  variants: z.any().optional(), // Add variants validation
}).passthrough();

// Backend variant format
export interface BackendVariant {
  id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  variantItems: Array<{
    attributeId: string;
    attributeValueId: string;
  }>;
}

const generateTempId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `temp-${Math.random().toString(36).slice(2, 11)}`
);

export interface SpecificationFormValue {
  id?: string;
  name: string;
  value: string;
  sortOrder?: number;
  labelId?: string | null;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  brandId?: string;
  categoryIds?: string[];
  warrantyId?: string;
  media?: MediaItem[]; // Use MediaItem for frontend form
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  price?: number;
  compareAtPrice?: number | null;
  isContactPrice: boolean;
  isFeatured: boolean;
  stockQuantity?: number;
  enableWarehouseQuantity: boolean;
  warehouseQuantities?: ProductWarehouseQuantity[];
  variants?: VariantMatrixItem[] | BackendVariant[];
  specifications?: SpecificationFormValue[];
}

const SUPPORTED_TRANSLATION_LOCALES = ['en', 'vi'] as const;
type SupportedTranslationLocale = (typeof SUPPORTED_TRANSLATION_LOCALES)[number];

const isSupportedTranslationLocale = (value: string): value is SupportedTranslationLocale =>
  (SUPPORTED_TRANSLATION_LOCALES as readonly string[]).includes(value);

interface ProductTranslationFormValues {
  name?: string;
  description?: string;
  shortDescription?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  [key: string]: string | undefined;
}

type TranslationState = Record<SupportedTranslationLocale, ProductTranslationFormValues>;

const createEmptyTranslationState = (): TranslationState =>
  SUPPORTED_TRANSLATION_LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {} as TranslationState);

const cloneTranslationState = (state: TranslationState): TranslationState =>
  JSON.parse(JSON.stringify(state));

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData, options?: ProductFormSubmitOptions) => Promise<any>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  actionsAlignment?: FormActionsAlignment;
}

export type ProductFormSubmitAction = 'save' | 'save_and_continue';

export interface ProductFormSubmitOptions {
  submitAction?: ProductFormSubmitAction;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
  actionsAlignment,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const showSaveAndContinueActions = Boolean(product?.id);
  const submitActionRef = useRef<ProductFormSubmitAction>('save');
  const [lastSubmitAction, setLastSubmitAction] = useState<ProductFormSubmitAction>('save');

  const handleSubmitActionSelect = (action: ProductFormSubmitAction) => {
    submitActionRef.current = action;
    setLastSubmitAction(action);
  };

  const [variants, setVariants] = useState<VariantMatrixItem[]>(() => {
    if (!product?.variants) return [];

    return product.variants.map(v => {
      // Build attribute combination from variantItems
      const attributeCombination: Record<string, string> = {};
      let combinationDisplay = v.name;

      if (v.variantItems && v.variantItems.length > 0) {
        const displayParts: string[] = [];
        v.variantItems.forEach(item => {
          attributeCombination[item.attributeId] = item.attributeValueId;
          const attrName = item.attribute?.displayName || item.attribute?.name || 'Unknown';
          const valueName = item.attributeValue?.displayValue || item.attributeValue?.value || 'Unknown';
          displayParts.push(`${attrName}: ${valueName}`);
        });
        if (displayParts.length > 0) {
          combinationDisplay = displayParts.join(', ');
        }
      }

      return {
        id: v.id,
        attributeCombination,
        combinationDisplay,
        price: typeof v.price === 'string' ? parseFloat(v.price) || 0 : (v.price || 0),
        quantity: typeof v.stockQuantity === 'string' ? parseInt(v.stockQuantity) || 0 : (v.stockQuantity || 0),
        sku: v.sku,
        image: v.image,
        isEnabled: v.isActive,
      };
    });
  });

  const [translations, setTranslations] = useState<TranslationState>(() => createEmptyTranslationState());
  const [initialTranslations, setInitialTranslations] = useState<TranslationState>(() => createEmptyTranslationState());

  const [enableWarehouseQuantity, setEnableWarehouseQuantity] = useState(() => product?.enableWarehouseQuantity || false);
  const [warehouseQuantities, setWarehouseQuantities] = useState<ProductWarehouseQuantity[]>(() => product?.warehouseQuantities || []);
  const [price, setPrice] = useState(() => product?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(() => {
    if (product?.compareAtPrice === undefined || product?.compareAtPrice === null) {
      return '';
    }
    return product.compareAtPrice;
  });
  const [stockQuantity, setStockQuantity] = useState(() => product?.stockQuantity || 0);
  const [isContactPrice, setIsContactPrice] = useState(() => product?.isContactPrice || false);

  const [specifications, setSpecifications] = useState<ProductSpecificationFormItem[]>(() => {
    if (!product?.specifications || product.specifications.length === 0) {
      return [];
    }

    return product.specifications
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((spec) => ({
        id: spec.id,
        name: spec.name,
        value: spec.value,
        sortOrder: spec.sortOrder,
        labelId: spec.labelId ?? null,
        labelName: spec.labelName ?? spec.name,
        labelGroupName: spec.labelGroupName ?? null,
        labelGroupCode: spec.labelGroupCode ?? null,
        _tempId: spec.id || generateTempId(),
      }));
  });

  useEffect(() => {
    if (!product?.translations || product.translations.length === 0) {
      const emptyState = createEmptyTranslationState();
      setTranslations(emptyState);
      setInitialTranslations(cloneTranslationState(emptyState));
      return;
    }

    const nextState = createEmptyTranslationState();
    product.translations.forEach((translation) => {
      if (!translation?.locale || !isSupportedTranslationLocale(translation.locale)) {
        return;
      }

      nextState[translation.locale] = {
        name: translation.name || '',
        description: translation.description || '',
        shortDescription: translation.shortDescription || '',
        slug: translation.slug || '',
        metaTitle: translation.metaTitle || '',
        metaDescription: translation.metaDescription || '',
        metaKeywords: translation.metaKeywords || '',
      };
    });

    setTranslations(nextState);
    setInitialTranslations(cloneTranslationState(nextState));
  }, [product?.translations]);

  const hasTranslationContent = (data?: ProductTranslationFormValues) => {
    if (!data) {
      return false;
    }

    return Boolean(
      data.name ||
      data.description ||
      data.shortDescription ||
      data.slug ||
      data.metaTitle ||
      data.metaDescription ||
      data.metaKeywords
    );
  };

  const isTranslationDifferent = (
    previous: ProductTranslationFormValues = {},
    current: ProductTranslationFormValues = {}
  ) => {
    const fields: Array<keyof ProductTranslationFormValues> = [
      'name',
      'description',
      'shortDescription',
      'slug',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
    ];

    return fields.some((field) => (previous[field] || '') !== (current[field] || ''));
  };

  const sanitizeNumberInputEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = stripNumberLeadingZeros(event.target.value);
    if (sanitizedValue !== event.target.value) {
      event.target.value = sanitizedValue;
    }
    return sanitizedValue;
  };

  // Fetch options for dropdowns
  const { data: categoriesData } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });
  const categories = (categoriesData as any)?.data || [];

  const { data: brandsData } = trpc.adminProductBrands.getAll.useQuery({});
  const brands = Array.isArray((brandsData as any)?.data?.data) ? (brandsData as any).data.data : [];

  const renderCategoryOptions = (categories: any[], level = 0): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [];

    categories.forEach(cat => {
      const indent = '—'.repeat(level);
      result.push({
        value: cat.id,
        label: `${indent} ${cat.name}`
      });

      if (cat.children && cat.children.length > 0) {
        result.push(...renderCategoryOptions(cat.children, level + 1));
      }
    });

    return result;
  };

  const categoryOptions = [
    { value: '', label: t('products.no_category', 'No category') },
    ...renderCategoryOptions(categories)
  ];

  const brandOptions = [
    { value: '', label: t('products.no_brand', 'No brand') },
    ...brands.map((brand: any) => ({
      value: brand.id,
      label: brand.name,
    })),
  ];

  const statusOptions = [
    { value: 'DRAFT', label: t('products.status.draft', 'Draft') },
    { value: 'ACTIVE', label: t('products.status.active', 'Active') },
    { value: 'INACTIVE', label: t('products.status.inactive', 'Inactive') },
    { value: 'DISCONTINUED', label: t('products.status.discontinued', 'Discontinued') },
  ];
  const { data: currenciesResponseData } = trpc.adminCurrency.getCurrencies.useQuery({
    page: 1,
    limit: 10,
    isActive: true,
  });
  const currenciesItems = ((currenciesResponseData as any)?.data?.items ?? []) as Array<{ code: string; symbol: string; isDefault?: boolean }>;
  const resolvedCurrency = currenciesItems.find((currency) => currency?.isDefault) || currenciesItems[0];
  const currencyCode = resolvedCurrency?.code || 'USD';
  const currencySymbol = resolvedCurrency?.symbol || '$';
  const currencyDisplay = currencySymbol || currencyCode;

  const adminProductsRouterAny = trpc.adminProducts as any;
  const ensureMutation = (mutation: any) => mutation ?? { mutateAsync: async () => undefined };
  const createTranslationMutation = ensureMutation(adminProductsRouterAny?.createProductTranslation?.useMutation?.());
  const updateTranslationMutation = ensureMutation(adminProductsRouterAny?.updateProductTranslation?.useMutation?.());
  const deleteTranslationMutation = ensureMutation(adminProductsRouterAny?.deleteProductTranslation?.useMutation?.());

  const handleTranslationChanges = async (targetProductId: string) => {
    for (const locale of SUPPORTED_TRANSLATION_LOCALES) {
      const current = translations[locale];
      const initial = initialTranslations[locale];
      const hasInitial = hasTranslationContent(initial);
      const hasCurrent = hasTranslationContent(current);

      if (!hasInitial && !hasCurrent) {
        continue;
      }

      if (!hasInitial && hasCurrent) {
        try {
          await createTranslationMutation.mutateAsync({
            productId: targetProductId,
            locale,
            ...current,
          });
        } catch (error) {
          console.warn('Failed to create product translation', error);
        }
        continue;
      }

      if (hasInitial && !hasCurrent) {
        try {
          await deleteTranslationMutation.mutateAsync({
            productId: targetProductId,
            locale,
          });
        } catch (error) {
          console.warn('Failed to delete product translation', error);
        }
        continue;
      }

      if (hasInitial && hasCurrent && isTranslationDifferent(initial, current)) {
        try {
          await updateTranslationMutation.mutateAsync({
            productId: targetProductId,
            locale,
            ...current,
          });
        } catch (error) {
          console.warn('Failed to update product translation', error);
        }
      }
    }

    setInitialTranslations(cloneTranslationState(translations));
  };

  const handleTranslationTabsChange = (updated: Record<string, Record<string, string | undefined>>) => {
    const nextState = cloneTranslationState(translations);

    Object.entries(updated).forEach(([locale, values]) => {
      if (!isSupportedTranslationLocale(locale)) {
        return;
      }

      nextState[locale] = {
        ...nextState[locale],
        ...values,
      };
    });

    setTranslations(nextState);
  };

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('products.general', 'General'),
      icon: <Package className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('products.basic_info_description', 'Enter the basic product information and details.'),
          icon: <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'name',
              label: t('products.name', 'Product Name'),
              type: 'text',
              placeholder: t('products.name_placeholder', 'Enter product name'),
              required: true,
              validation: {
                minLength: 1,
                maxLength: 255,
              },
            },
            {
              name: 'slug',
              label: t('products.slug', 'Slug'),
              type: 'slug',
              placeholder: t('products.slug_placeholder', 'product-slug'),
              required: true,
              sourceField: 'name',
              description: t('products.slug_description', 'URL-friendly identifier (auto-generated from name if left blank).'),
            },
            {
              name: 'description',
              label: t('products.description', 'Description'),
              type: 'richtext',
              placeholder: t('products.description_placeholder', 'Enter product description'),
              required: false,
              minHeight: '200px',
            },
            {
              name: 'shortDescription',
              label: t('products.short_description', 'Short Description'),
              type: 'textarea',
              placeholder: t('products.short_description_placeholder', 'Enter a short summary for product cards'),
              required: false,
              rows: 3,
              validation: {
                maxLength: 500,
              },
              description: t('products.short_description_help', 'Plain text shown on product cards.'),
            },
            {
              name: 'sku',
              label: t('products.sku', 'SKU'),
              type: 'text',
              placeholder: t('products.sku_placeholder', 'e.g., PROD-001'),
              required: false,
              validation: {
                maxLength: 100,
              },
            },
            {
              name: 'status',
              label: t('common.status', 'Status'),
              type: 'select',
              placeholder: t('products.select_status', 'Select status'),
              required: true,
              options: statusOptions,
            },
          ],
          customContent: variants.length > 0 ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t('products.variants_quantity_notice', 'Product has variants')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t('products.variants_quantity_description', 'Stock quantity is managed per variant. Please go to the Variants tab to set quantities for each variant.')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Switch
                id="isContactPrice"
                label={t('products.contact_price')}
                description={t('products.contact_price_help')}
                checked={isContactPrice}
                onChange={(checked) => setIsContactPrice(checked)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormInput
                    id="price"
                    type="number"
                    label={t('products.price', 'Price')}
                    rightElement={
                      <span className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                        ({currencyCode})
                      </span>
                    }
                    disabled={isContactPrice}
                    value={Number.isFinite(price) ? String(price) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const sanitizedValue = sanitizeNumberInputEvent(e);
                      setPrice(parseFloat(sanitizedValue) || 0);
                    }}
                    placeholder={t('products.price_placeholder', '0.00')}
                    icon={<span className="text-gray-500 dark:text-gray-400">{currencyDisplay}</span>}
                    useIconSpacing
                    iconSpacing="standard"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products.price_description', 'Base selling price for this product when no variants exist.')} ({currencyCode})
                  </p>
                </div>
                <div className="space-y-2">
                  <FormInput
                    id="compareAtPrice"
                    type="number"
                    label={t('products.sale_price', 'Sale Price')}
                    rightElement={
                      <span className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                        ({currencyCode})
                      </span>
                    }
                    disabled={isContactPrice}
                    value={compareAtPrice === '' ? '' : String(compareAtPrice)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const sanitizedValue = sanitizeNumberInputEvent(e);
                      if (sanitizedValue === '') {
                        setCompareAtPrice('');
                        return;
                      }
                      setCompareAtPrice(parseFloat(sanitizedValue) || 0);
                    }}
                    placeholder={t('products.sale_price_placeholder', 'Optional')}
                    icon={<span className="text-gray-500 dark:text-gray-400">{currencyDisplay}</span>}
                    useIconSpacing
                    iconSpacing="standard"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products.sale_price_description', 'Set a promotional price to highlight discounts. Leave blank to use the regular price.')} ({currencyCode})
                  </p>
                </div>
              </div>
              {!enableWarehouseQuantity && (
                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className={BASE_LABEL_CLASS}>
                    {t('products.stock_quantity', 'Stock Quantity')}
                  </label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => {
                      const sanitizedValue = sanitizeNumberInputEvent(e);
                      setStockQuantity(parseInt(sanitizedValue) || 0);
                    }}
                    placeholder={t('products.stock_quantity_placeholder', '0')}
                    min={0}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products.stock_quantity_description', 'Total available stock for this product. For warehouse-specific inventory, enable warehouse quantity tracking.')}
                  </p>
                </div>
              )}
              {enableWarehouseQuantity && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4">
                  <div className="flex items-start gap-3">
                    <Warehouse className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {t('products.warehouse_quantity_notice', 'Warehouse tracking enabled')}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {t('products.warehouse_quantity_description', 'Stock quantity is managed by warehouse. Please go to the Inventory tab to set quantities for each warehouse.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ),
        },
        {
          title: t('products.categorization', 'Categorization'),
          description: t('products.categorization_description', 'Organize your product with categories and brands.'),
          icon: <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'categoryIds',
              label: t('products.categories', 'Categories'),
              type: 'category-multiselect',
              placeholder: t('products.select_categories', 'Select categories'),
              required: false,
              description: t('products.categories_description', 'Select one or more categories for this product'),
              maxItems: 5,
            },
            {
              name: 'brandId',
              label: t('products.brand', 'Brand'),
              type: 'select',
              placeholder: t('products.select_brand', 'Select brand'),
              required: false,
              options: brandOptions,
            },
            {
              name: 'tags',
              label: t('products.tags', 'Tags'),
              type: 'tags',
              placeholder: t('products.tags_placeholder', 'Add tags'),
              required: false,
              description: t('products.tags_description', 'Add tags to help organize and find your products'),
            },
            {
              name: 'isFeatured',
              label: t('products.featured', 'Featured Product'),
              type: 'checkbox',
              required: false,
              description: t('products.featured_description', 'Mark this product as featured to highlight it'),
            },
          ],
        },
      ],
    },
    {
      id: 'media',
      label: t('products.media', 'Media'),
      icon: <Image className="w-4 h-4" />,
      sections: [
        {
          title: t('products.product_images', 'Product Images'),
          description: t('products.images_description', 'Upload images for your product. The first image will be used as the main image.'),
          icon: <Image className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'media',
              label: t('products.media', 'Media'),
              type: 'product-media',
              placeholder: t('products.select_media', 'Select product media'),
              required: false,
              maxSize: 100,
              maxItems: 10,
              allowedTypes: [MediaType.IMAGE, MediaType.VIDEO],
              description: t('products.media_help', 'Upload up to 10 media files (max 100MB each). Supports images and videos. First item will be the primary media.', {
                maxItems: 10,
                maxSize: 100,
                types: t('products.media_types.images_and_videos', 'images and videos')
              }),
            },
          ],
        },
      ],
    },
    {
      id: 'variants',
      label: t('products.variants', 'Variants'),
      icon: <Layers className="w-4 h-4" />,
      sections: [
        {
          title: t('products.product_variants', 'Product Variants'),
          description: t('products.variants_description', 'Create different variants of this product with varying attributes, prices, and inventory.'),
          icon: <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <ProductVariantsSection
              variants={variants as VariantMatrixItem[]}
              onVariantsChange={setVariants}
              productId={product?.id}
              currencyCode={currencyCode}
            />
          ),
        },
      ],
    },
    {
      id: 'inventory',
      label: t('products.inventory', 'Inventory'),
      icon: <Warehouse className="w-4 h-4" />,
      sections: [
        {
          title: t('products.inventory_management', 'Inventory Management'),
          description: t('products.inventory_description', 'Manage product stock across warehouses.'),
          icon: <Warehouse className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'enableWarehouseQuantity',
              label: t('products.enable_warehouse_quantity', 'Enable Warehouse Quantity'),
              type: 'checkbox',
              description: t('products.enable_warehouse_quantity_description', 'When enabled, track inventory by warehouse instead of a single quantity.'),
              required: false,
              onValueChange: (value: boolean) => setEnableWarehouseQuantity(value),
            },
          ],
          customContent: enableWarehouseQuantity ? (
            <ProductWarehouseQuantityManager
              warehouseQuantities={warehouseQuantities}
              onChange={setWarehouseQuantities}
            />
          ) : null,
        },
      ],
    },
    {
      id: 'specifications',
      label: t('products.specifications', 'Specifications'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('products.specifications_title', 'Product Specifications'),
          description: t('products.specifications_description', 'Define structured technical details or attributes that will be shown to customers.'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <ProductSpecificationsEditor
              items={specifications}
              onAdd={() => {
                setSpecifications((prev) => [
                  ...prev,
                  {
                    _tempId: generateTempId(),
                    name: '',
                    value: '',
                    sortOrder: prev.length,
                    labelId: null,
                    labelName: null,
                    labelGroupName: null,
                    labelGroupCode: null,
                  },
                ]);
              }}
              onRemove={(tempId) => {
                setSpecifications((prev) => prev.filter((item) => item._tempId !== tempId));
              }}
              onChange={(tempId, field, value) => {
                setSpecifications((prev) => prev.map((item) => {
                  if (item._tempId !== tempId) {
                    return item;
                  }

                  if (field === 'sortOrder') {
                    if (value === '') {
                      const { sortOrder, ...rest } = item;
                      return { ...rest, sortOrder: undefined } as ProductSpecificationFormItem;
                    }

                    const parsed = Number(value);
                    return {
                      ...item,
                      sortOrder: Number.isFinite(parsed) ? parsed : item.sortOrder,
                    };
                  }

                  if (field === 'labelId') {
                    return {
                      ...item,
                      labelId: value ? value : null,
                    };
                  }

                  if (field === 'labelName') {
                    return {
                      ...item,
                      labelName: value || null,
                    };
                  }

                  if (field === 'labelGroupName') {
                    return {
                      ...item,
                      labelGroupName: value || null,
                    };
                  }

                  if (field === 'labelGroupCode') {
                    return {
                      ...item,
                      labelGroupCode: value || null,
                    };
                  }

                  return {
                    ...item,
                    [field]: value,
                  } as ProductSpecificationFormItem;
                }));
              }}
            />
          ),
        },
      ],
    },
    {
      id: 'translations',
      label: t('admin.translations', 'Translations'),
      icon: <Globe className="w-4 h-4" />,
      sections: [
        {
          title: t('products.translations_title', 'Product Translations'),
          description: t('products.translations_description', 'Manage localized content for product details and SEO metadata.'),
          icon: <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <TranslationTabs
              translations={translations}
              onTranslationsChange={handleTranslationTabsChange}
              entityName={product?.name || ''}
              fields={[
                {
                  name: 'name',
                  label: t('products.name', 'Product Name'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('products.name_placeholder', 'Enter product name'),
                  required: false,
                },
                {
                  name: 'description',
                  label: t('products.description', 'Description'),
                  value: '',
                  onChange: () => { },
                  type: 'richtext',
                  placeholder: t('products.description_placeholder', 'Enter product description'),
                  required: false,
                  minHeight: '200px',
                },
                {
                  name: 'shortDescription',
                  label: t('products.short_description', 'Short Description'),
                  value: '',
                  onChange: () => { },
                  type: 'textarea',
                  placeholder: t('products.short_description_placeholder', 'Enter a short summary for product cards'),
                  required: false,
                  rows: 3,
                  validation: { maxLength: 500 },
                  description: t('products.short_description_help', 'Plain text shown on product cards.'),
                },
                {
                  name: 'slug',
                  label: t('products.slug', 'Slug'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('products.slug_placeholder', 'product-slug'),
                  required: false,
                  description: t('products.slug_description', 'URL-friendly identifier'),
                },
                {
                  name: 'metaTitle',
                  label: t('products.meta_title', 'Meta Title'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('products.meta_title_placeholder', 'Enter SEO title'),
                  required: false,
                  validation: { maxLength: 60 },
                },
                {
                  name: 'metaDescription',
                  label: t('products.meta_description', 'Meta Description'),
                  value: '',
                  onChange: () => { },
                  type: 'textarea',
                  placeholder: t('products.meta_description_placeholder', 'Enter SEO description'),
                  required: false,
                  rows: 3,
                  validation: { maxLength: 160 },
                },
                {
                  name: 'metaKeywords',
                  label: t('products.meta_keywords', 'Meta Keywords'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('products.meta_keywords_placeholder', 'keyword1, keyword2'),
                  required: false,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      id: 'seo',
      label: t('products.seo', 'SEO'),
      icon: <Globe className="w-4 h-4" />,
      sections: [
        {
          title: t('products.seo_settings', 'SEO Settings'),
          description: t('products.seo_description', 'Optimize your product for search engines.'),
          icon: <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'metaTitle',
              label: t('products.meta_title', 'Meta Title'),
              type: 'text',
              placeholder: t('products.meta_title_placeholder', 'Enter SEO title'),
              required: false,
              validation: {
                maxLength: 60,
              },
              description: t('products.meta_title_description', 'Recommended length: 50-60 characters'),
            },
            {
              name: 'metaDescription',
              label: t('products.meta_description', 'Meta Description'),
              type: 'textarea',
              placeholder: t('products.meta_description_placeholder', 'Enter SEO description'),
              required: false,
              rows: 3,
              validation: {
                maxLength: 160,
              },
              description: t('products.meta_description_help', 'Recommended length: 150-160 characters'),
            },
            {
              name: 'metaKeywords',
              label: t('products.meta_keywords', 'Meta Keywords'),
              type: 'text',
              placeholder: t('products.meta_keywords_placeholder', 'keyword1, keyword2, keyword3'),
              required: false,
              description: t('products.meta_keywords_description', 'Separate keywords with commas'),
            },
          ],
        },
      ],
    },
  ];

  const initialValues: Partial<ProductFormData> = {
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    sku: product?.sku || '',
    status: product?.status || 'DRAFT',
    brandId: product?.brandId || '',
    categoryIds: product?.categoryIds || [],
    warrantyId: product?.warrantyId || '',
    stockQuantity: product?.stockQuantity || 0,
    media: (() => {
      // Check both media and __media__ fields (backend may use __media__ due to TypeORM lazy loading)
      const mediaData = product?.media || (product as any)?.__media__;

      if (!mediaData || !Array.isArray(mediaData)) {
        return [];
      }

      return mediaData
        .filter(mediaItem => mediaItem && typeof mediaItem === 'object')
        .map(mediaItem => transformProductMediaToMediaItem(mediaItem))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    })(),
    tags: Array.isArray(product?.tags) ? product?.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    metaKeywords: product?.metaKeywords || '',
    price: product?.price || 0,
    compareAtPrice: product?.compareAtPrice ?? null,
    isContactPrice: product?.isContactPrice || false,
    isFeatured: product?.isFeatured || false,
    enableWarehouseQuantity: enableWarehouseQuantity,
    warehouseQuantities: warehouseQuantities,
    variants: variants,
    specifications: specifications,
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const normalizedCompareAtPrice = compareAtPrice === '' ? null : Number(compareAtPrice) || 0;
      const normalizedSlug = (data.slug || '').trim();
      // Transform variants from VariantMatrixItem to backend format only if there are variants
      let submitData: any = {
        ...data,
        slug: normalizedSlug,
        // Transform media back to backend format
        media: data.media ? data.media.map(transformMediaItemForBackend) : [],
        // Use local state for warehouse quantities, stock quantity, and enable flag
        stockQuantity: !enableWarehouseQuantity && variants.length === 0 ? stockQuantity : undefined,
        price: variants.length === 0 ? (Number(price) || 0) : undefined,
        compareAtPrice: variants.length === 0 ? normalizedCompareAtPrice : undefined,
        enableWarehouseQuantity: enableWarehouseQuantity,
        warehouseQuantities: warehouseQuantities,
        isContactPrice: isContactPrice,
      };

      // Only include variants if there are any to avoid validation issues
      if (variants && variants.length > 0) {
        const transformedVariants = variants.map((variant, index) => {
          const transformed: {
            id?: string;
            name: string;
            sku?: string;
            price: number;
            stockQuantity: number;
            trackInventory: boolean;
            allowBackorders: boolean;
            image?: string | null;
            isActive: boolean;
            sortOrder: number;
            variantItems: { attributeId: string; attributeValueId: string }[];
          } = {
            name: variant.combinationDisplay || `Variant ${index + 1}`,
            price: Number(variant.price) || 0,
            stockQuantity: Number(variant.quantity) || 0,
            trackInventory: true,
            allowBackorders: false,
            isActive: Boolean(variant.isEnabled),
            sortOrder: index,
            variantItems: Object.entries(variant.attributeCombination || {}).map(([attributeId, attributeValueId]) => ({
              attributeId,
              attributeValueId,
            })),
          };

          if (variant.id) {
            transformed.id = variant.id;
          }

          if (variant.sku && variant.sku.trim() !== '') {
            transformed.sku = variant.sku.trim();
          }

          if (variant.image !== undefined) {
            transformed.image = variant.image;
          }

          return transformed;
        });

        submitData.variants = transformedVariants;
      }

      const normalizedSpecifications = specifications
        .map((spec, index) => {
          const name = spec.name.trim();
          const value = spec.value.trim();
          if (!name || !value) {
            return null;
          }

          const fallbackOrder = spec.sortOrder ?? index;
          const sortOrder = Number.isFinite(fallbackOrder) ? fallbackOrder : index;

          return {
            id: spec.id,
            name,
            value,
            sortOrder,
            labelId: spec.labelId ?? undefined,
          } as SpecificationFormValue;
        })
        .filter((spec): spec is SpecificationFormValue => Boolean(spec));

      submitData.specifications = normalizedSpecifications.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      const currentSubmitAction: ProductFormSubmitAction = showSaveAndContinueActions
        ? submitActionRef.current
        : 'save';

      const submitResult = await onSubmit(submitData, { submitAction: currentSubmitAction });

      const resolvedProductId =
        product?.id ||
        ((submitResult as any)?.data?.id ??
          (submitResult && typeof submitResult === 'object' && 'id' in submitResult
            ? (submitResult as any).id
            : undefined));

      if (resolvedProductId) {
        await handleTranslationChanges(resolvedProductId);
      }
    } catch (error) {
      console.error('❌ Product form submission error:', error);
      addToast({
        type: 'error',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
      });
      throw error;
    }
  };

  const primarySubmitText = product
    ? t('products.update_product', 'Update Product')
    : t('products.create_product', 'Create Product');

  const customActions = showSaveAndContinueActions ? (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {t('common.cancel', 'Cancel')}
      </Button>
      <Button
        type="submit"
        variant="secondary"
        onClick={() => handleSubmitActionSelect('save_and_continue')}
        isLoading={isSubmitting && lastSubmitAction === 'save_and_continue'}
        disabled={isSubmitting}
      >
        {isSubmitting && lastSubmitAction === 'save_and_continue'
          ? t('common.saving', 'Saving...')
          : t('common.save_and_continue', 'Save and Continue')}
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={() => handleSubmitActionSelect('save')}
        isLoading={isSubmitting && lastSubmitAction === 'save'}
        disabled={isSubmitting && lastSubmitAction !== 'save'}
      >
        {isSubmitting && lastSubmitAction === 'save'
          ? t('common.saving', 'Saving...')
          : primarySubmitText}
      </Button>
    </>
  ) : undefined;

  return (
    <EntityForm<ProductFormData>
      tabs={tabs}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={productSchema as any}
      submitButtonText={primarySubmitText}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actionsAlignment={actionsAlignment}
      customActions={customActions}
    />
  );
};

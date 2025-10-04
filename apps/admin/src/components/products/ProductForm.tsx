import React, { useState, useEffect } from 'react';
import { FolderPlus, Package, Image, Settings, Globe, Tag, Layers, Zap } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { CreateProductFormData, Product, ProductVariant, ProductMedia } from '../../types/product';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';
import { ProductVariantsSection, VariantMatrixItem } from './ProductVariantsSection';
import { MediaType } from '../common/ProductMediaUpload';
import { ProductSpecificationsEditor, ProductSpecificationFormItem } from './ProductSpecificationsEditor';

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
  description: z.string().optional(),
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
  isFeatured: z.boolean().default(false),
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
}

export interface ProductFormData {
  name: string;
  description?: string;
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
  isFeatured: boolean;
  variants?: VariantMatrixItem[] | BackendVariant[];
  specifications?: SpecificationFormValue[];
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

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
        _tempId: spec.id || generateTempId(),
      }));
  });

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
              name: 'description',
              label: t('products.description', 'Description'),
              type: 'richtext',
              placeholder: t('products.description_placeholder', 'Enter product description'),
              required: false,
              minHeight: '200px',
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
              label: t('products.status', 'Status'),
              type: 'select',
              placeholder: t('products.select_status', 'Select status'),
              required: true,
              options: statusOptions,
            },
          ],
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
              description: t('products.media_help', 'Upload up to 10 media files (max 100MB each). Supports images and videos. First item will be the primary media.'),
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
            />
          ),
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
    description: product?.description || '',
    sku: product?.sku || '',
    status: product?.status || 'DRAFT',
    brandId: product?.brandId || '',
    categoryIds: product?.categoryIds || [],
    warrantyId: product?.warrantyId || '',
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
    isFeatured: product?.isFeatured || false,
    variants: variants,
    specifications: specifications,
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Transform variants from VariantMatrixItem to backend format only if there are variants
      let submitData: any = {
        ...data,
        // Transform media back to backend format
        media: data.media ? data.media.map(transformMediaItemForBackend) : [],
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
          } as SpecificationFormValue;
        })
        .filter((spec): spec is SpecificationFormValue => Boolean(spec));

      submitData.specifications = normalizedSpecifications.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      await onSubmit(submitData);
    } catch (error) {
      console.error('❌ Product form submission error:', error);
      addToast({
        type: 'error',
        title: 'Form Submission Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
      });
      throw error;
    }
  };

  return (
    <EntityForm<ProductFormData>
      tabs={tabs}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={productSchema as any}
      submitButtonText={product ? t('products.update_product', 'Update Product') : t('products.create_product', 'Create Product')}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};

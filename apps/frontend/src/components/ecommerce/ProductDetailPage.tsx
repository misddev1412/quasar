'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button, Card, Chip, Modal, ModalContent, ModalHeader, ModalBody, Tabs, Tab } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FiHeart, FiHeart as FiHeartOutline } from 'react-icons/fi';
import ProductGallery from './ProductGallery';
import ProductDescription from './ProductDescription';
import ProductVideo from './ProductVideo';
import CommentSection, { Comment } from './CommentSection';
import ReviewList, { Review } from './ReviewList';
import ReviewForm from './ReviewForm';
import CrossSellSection from './CrossSellSection';
import PriceDisplay from './PriceDisplay';
import Rating from '../common/Rating';
import Input from '../common/Input';
import type { Product, ProductVariant } from '../../types/product';
import { buildVariantAttributes, buildVariantSelectionMap } from '../../utils/variantAttributes';
import { Breadcrumb } from 'ui';

const layout = {
  container: 'space-y-12 lg:space-y-16',
  breadcrumb: 'text-xs md:text-sm bg-white/95 dark:bg-neutral-900/80 shadow-sm border border-gray-200/70 dark:border-gray-700/60',
  mainGrid: 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12',
  galleryStack: 'space-y-6',
  galleryCard: 'rounded-2xl overflow-hidden shadow-md',
  infoCard: 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-sm p-6 lg:p-8 space-y-8',
  sectionCard: 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-sm p-6 lg:p-8',
  detailGrid: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
  reviewGrid: 'grid grid-cols-1 gap-6 lg:grid-cols-2'
} as const;

const typography = {
  pageTitle: 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white',
  sectionTitle: 'text-2xl font-semibold text-gray-900 dark:text-white',
  subsectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
  meta: 'text-sm text-gray-500 dark:text-gray-400',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300'
} as const;

interface ProductDetailPageProps {
  product: Product;
  relatedProducts?: Product[];
  frequentlyBoughtTogether?: Product[];
  recommendedProducts?: Product[];
  trendingProducts?: Product[];
  reviews?: Review[];
  comments?: Comment[];
  onAddToCart?: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  onWishlistToggle?: (productId: string) => void;
  onReviewSubmit?: (review: { rating: number; title: string; comment: string }) => void;
  onCommentSubmit?: (comment: { content: string; parentId?: string }) => void;
  onCommentLike?: (commentId: string) => void;
  loading?: boolean;
  className?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts = [],
  frequentlyBoughtTogether = [],
  recommendedProducts = [],
  trendingProducts = [],
  reviews = [],
  comments = [],
  onAddToCart,
  onWishlistToggle,
  onReviewSubmit,
  onCommentSubmit,
  onCommentLike,
  loading = false,
  className = '',
}) => {
  const t = useTranslations('product.detail');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const detailTabsRef = useRef<HTMLDivElement | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'reviews' | 'questions'>('details');

  const {
    id,
    name,
    description,
    slug,
    sku,
    status,
    isActive,
    isFeatured,
    variants,
    media,
    categories,
    brand,
    tags,
    specifications,
  } = product;

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (media && media.length > 0) {
      const primaryMedia = media.find(m => m.isPrimary);
      return primaryMedia?.url || media[0].url;
    }
    return '/placeholder-product.png';
  };

  const initialVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return product.variants.find((variant) => variant.stockQuantity > 0) ?? product.variants[0];
  }, [product.variants]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: t('breadcrumb.home'), href: '/' }];

    if (categories && categories.length > 0) {
      const primaryCategory = categories[0] as any;
      if (primaryCategory) {
        const categoryName = primaryCategory.name ?? primaryCategory?.title ?? t('breadcrumb.categoryFallback');
        const categorySlug = primaryCategory.slug;

        items.push({
          label: categoryName,
          href: categorySlug ? `/categories/${categorySlug}` : undefined,
        });
      }
    }

    items.push({ label: name, isCurrent: true });

    return items;
  }, [categories, name, t]);

  const variantAttributes = useMemo(
    () => buildVariantAttributes(product.variants),
    [product.variants]
  );

  const variantSelectionMap = useMemo(
    () => buildVariantSelectionMap(product.variants),
    [product.variants]
  );

  const computeSelectionsFromVariant = useCallback((variant: ProductVariant | null) => {
    if (!variant) {
      return {};
    }

    const selections = variantSelectionMap.get(variant.id);
    return selections ? { ...selections } : {};
  }, [variantSelectionMap]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialVariant);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    initialVariant ? computeSelectionsFromVariant(initialVariant) : {}
  );

  const attributeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    variantAttributes.forEach((attribute, index) => {
      map.set(attribute.attributeId, index);
    });
    return map;
  }, [variantAttributes]);

  const hasAttributeBasedVariants = variantAttributes.length > 0;

  const findMatchingVariant = useCallback((selections: Record<string, string>) => {
    const selectionEntries = Object.entries(selections).filter(([, valueId]) => Boolean(valueId));

    if (selectionEntries.length === 0) {
      return null;
    }

    return product.variants?.find((variant) => {
      const variantSelections = variantSelectionMap.get(variant.id);
      if (!variantSelections) {
        return false;
      }

      return selectionEntries.every(([attributeId, valueId]) => variantSelections[attributeId] === valueId);
    }) || null;
  }, [product.variants, variantSelectionMap]);

  const selectVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    setSelectedAttributes(computeSelectionsFromVariant(variant));
  }, [computeSelectionsFromVariant]);

  useEffect(() => {
    if (!initialVariant) {
      setSelectedVariant((prev) => (prev ? null : prev));
      setSelectedAttributes((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }

    if (hasAttributeBasedVariants) {
      setSelectedVariant((prev) => (prev ? null : prev));
      setSelectedAttributes((prev) => (Object.keys(prev).length ? {} : prev));
      setQuantity(1);
      return;
    }

    selectVariant(initialVariant);
  }, [hasAttributeBasedVariants, initialVariant, selectVariant]);

  const handleAttributeSelect = useCallback((attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => {
      const attributeIndex = attributeIndexMap.get(attributeId);

      if (attributeIndex === undefined) {
        return prev;
      }

      if (prev[attributeId] === valueId) {
        return prev;
      }

      const nextSelections = {
        ...prev,
        [attributeId]: valueId,
      };

      // Reset selections for subsequent attributes so users progress step-by-step
      for (let i = attributeIndex + 1; i < variantAttributes.length; i += 1) {
        const nextAttributeId = variantAttributes[i].attributeId;
        if (nextSelections[nextAttributeId]) {
          delete nextSelections[nextAttributeId];
        }
      }

      return nextSelections;
    });
  }, [attributeIndexMap, variantAttributes]);

  useEffect(() => {
    if (!hasAttributeBasedVariants) {
      return;
    }

    const selectedCount = Object.values(selectedAttributes).filter(Boolean).length;

    if (selectedCount < variantAttributes.length) {
      if (selectedVariant) {
        setSelectedVariant(null);
      }
      return;
    }

    const matchingVariant = findMatchingVariant(selectedAttributes);

    if (matchingVariant) {
      if (matchingVariant.id !== selectedVariant?.id) {
        setSelectedVariant(matchingVariant);
        setQuantity(1);
      }
    } else if (selectedVariant) {
      setSelectedVariant(null);
    }
  }, [findMatchingVariant, hasAttributeBasedVariants, selectedAttributes, selectedVariant, variantAttributes.length]);

  const isOptionDisabled = useCallback((attributeId: string, valueId: string) => {
    const attributeIndex = attributeIndexMap.get(attributeId);
    if (attributeIndex === undefined) {
      return true;
    }

    const isActiveStep = attributeIndex === 0 || Boolean(selectedAttributes[variantAttributes[attributeIndex - 1].attributeId]);
    if (!isActiveStep) {
      return true;
    }

    const tentativeSelections = {
      ...selectedAttributes,
      [attributeId]: valueId,
    };

    return !product.variants?.some((variant) => {
      const selections = variantSelectionMap.get(variant.id);
      if (!selections) {
        return false;
      }

      return Object.entries(tentativeSelections).every(([attrId, attrValueId]) => selections[attrId] === attrValueId);
    });
  }, [attributeIndexMap, product.variants, selectedAttributes, variantAttributes, variantSelectionMap]);

  // Get images for gallery
  const productImages = media
    ?.filter(m => m.isImage)
    .map(m => m.url) || [getPrimaryImage()];

  // Get videos
  const productVideos = useMemo(() => {
    if (!media) {
      return [];
    }

    return media
      .filter((m) => m.type === 'video')
      .map((m) => ({
        url: m.url,
        title: t('videos.itemTitle', { name }),
        thumbnail: undefined,
      }));
  }, [media, name, t]);

  // Check if product is in stock
  const inStock = isActive && status === 'ACTIVE';

  // Get current price from variants
  const currentPrice = selectedVariant?.price ||
    (variants && variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0);

  const originalPrice = selectedVariant?.compareAtPrice ||
    (variants && variants.length > 0 ? variants[0].compareAtPrice : undefined);

  const productFeatures = useMemo(() => {
    const raw = t.raw('overview.features');
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const defaultDescriptionDetails = useMemo(() => {
    const raw = t.raw('description.defaults');
    if (raw && typeof raw === 'object') {
      return raw as {
        materials?: string;
        careInstructions?: string[];
        dimensions?: string;
        weight?: string;
        origin?: string;
        warranty?: string;
      };
    }
    return {};
  }, [t]);

  const specificationItems = useMemo(() => {
    const explicit = (specifications ?? [])
      .filter((spec) => spec && typeof spec.name === 'string' && spec.name.trim() !== '' && spec.value !== undefined && spec.value !== null && String(spec.value).trim() !== '')
      .map((spec) => ({
        id: spec.id ?? `spec-${spec.name}-${spec.sortOrder ?? ''}`,
        name: spec.name.trim(),
        value: String(spec.value).trim(),
        sortOrder: spec.sortOrder ?? 0,
      }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const existingNames = new Set(explicit.map((spec) => spec.name.toLowerCase()));

    const autoEntries: { id: string; name: string; value: string; sortOrder: number }[] = [];
    const appendAuto = (name: string, rawValue: unknown) => {
      if (rawValue === undefined || rawValue === null) {
        return;
      }

      const value = typeof rawValue === 'string' ? rawValue : String(rawValue);
      if (!value.trim()) {
        return;
      }

      const lowerName = name.toLowerCase();
      if (existingNames.has(lowerName)) {
        return;
      }

      autoEntries.push({
        id: `auto-${lowerName}`,
        name,
        value: value.trim(),
        sortOrder: explicit.length + autoEntries.length,
      });
      existingNames.add(lowerName);
    };

    const autoLabels = {
      brand: t('specifications.autoLabels.brand'),
      sku: t('specifications.autoLabels.sku'),
      category: t('specifications.autoLabels.category'),
      status: t('specifications.autoLabels.status'),
      weight: t('specifications.autoLabels.weight'),
      dimensions: t('specifications.autoLabels.dimensions'),
    };

    appendAuto(autoLabels.brand, (brand as any)?.name);
    appendAuto(autoLabels.sku, sku);
    appendAuto(autoLabels.category, (categories?.[0] as any)?.name);
    appendAuto(autoLabels.status, status);
    appendAuto(autoLabels.weight, variants?.[0]?.weight);
    appendAuto(autoLabels.dimensions, variants?.[0]?.dimensions);

    return [...explicit, ...autoEntries];
  }, [specifications, brand, sku, categories, status, variants, t]);

  const formatSpecificationLabel = (label: string) => {
    const withSpaces = label.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ');
    return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase()).trim();
  };

  // Product details
  const productDetails = {
    materials: defaultDescriptionDetails.materials ?? '',
    careInstructions: Array.isArray(defaultDescriptionDetails.careInstructions)
      ? defaultDescriptionDetails.careInstructions
      : [],
    dimensions: variants?.[0]?.dimensions || defaultDescriptionDetails.dimensions || '',
    weight: variants?.[0]?.weight
      ? String(variants[0].weight)
      : defaultDescriptionDetails.weight || '',
    origin: defaultDescriptionDetails.origin ?? '',
    warranty: defaultDescriptionDetails.warranty ?? '',
  };

  const descriptionText = description && description.trim().length > 0
    ? description
    : t('description.fallback');

  const handleQuantityChange = (newQuantity: number) => {
    if (Number.isNaN(newQuantity)) {
      return;
    }

    const clamped = Math.min(99, Math.max(1, Math.floor(newQuantity)));
    setQuantity(clamped);
  };

  const handleScrollToReviews = useCallback(() => {
    setActiveDetailTab('reviews');

    if (typeof window === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      detailTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [detailTabsRef, setActiveDetailTab]);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, selectedVariant);
    }
  };

  const handleWishlistToggle = () => {
    setWishlistAdded(!wishlistAdded);
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleReviewSubmit = (review: { rating: number; title: string; comment: string }) => {
    if (onReviewSubmit) {
      onReviewSubmit(review);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className={clsx(layout.container, className)}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={breadcrumbItems}
        linkComponent={Link}
        className={clsx(layout.breadcrumb, 'w-full md:w-auto')}
      />

      {/* Main Product Section */}
      <section className={layout.mainGrid}>
          {/* Product Gallery */}
          <div className={layout.galleryStack}>
            <ProductGallery
              images={productImages}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              className={clsx(layout.galleryCard, 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40')}
            />

            {/* Product Videos */}
            {productVideos.length > 0 && (
              <div className="space-y-5">
                <h3 className={typography.subsectionTitle}>Product Videos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {productVideos.slice(0, 2).map((video, index) => (
                    <ProductVideo
                      key={index}
                      videoUrl={video.url}
                      thumbnailUrl={video.thumbnail}
                      title={video.title}
                      className="rounded-lg overflow-hidden"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <Card className={layout.infoCard}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <h1 className={typography.pageTitle}>{name}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {brand && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Brand</span>
                      <span className="text-gray-600 dark:text-gray-400">{(brand as any).name}</span>
                    </div>
                  )}
                  {sku && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">SKU</span>
                      <span className="font-mono text-xs md:text-sm text-gray-500 dark:text-gray-400">{sku}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                isIconOnly
                size="lg"
                variant="flat"
                color={wishlistAdded ? 'danger' : 'default'}
                className="flex-shrink-0"
                onPress={handleWishlistToggle}
              >
                {wishlistAdded ? <FiHeart className="text-2xl text-red-500" /> : <FiHeartOutline className="text-2xl" />}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Rating value={averageRating} readOnly size="md" />
                <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              </div>
              <span className={typography.meta}>({reviews.length} reviews)</span>
              {reviews.length > 0 && (
                <Button variant="flat" size="sm" onPress={handleScrollToReviews}>
                  View Reviews
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <PriceDisplay
                price={currentPrice}
                originalPrice={originalPrice}
                size="lg"
                className="text-3xl md:text-4xl"
              />
              {variants && variants.length > 1 && (
                <p className={typography.meta}>
                  Starting from ${Math.min(...variants.map(v => v.price)).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              {inStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {(variantAttributes.length > 0 || (variants && variants.length > 0)) && (
              <div className="space-y-6">
                {variantAttributes.length > 0
                  ? variantAttributes.map((attribute) => {
                      const attributeIndex = attributeIndexMap.get(attribute.attributeId) ?? 0;
                      const previousAttributeId = attributeIndex > 0
                        ? variantAttributes[attributeIndex - 1]?.attributeId
                        : undefined;
                      const hasPreviousSelection = previousAttributeId
                        ? Boolean(selectedAttributes[previousAttributeId])
                        : true;
                      const isActiveStep = attributeIndex === 0 || hasPreviousSelection;
                      const selectedLabel = attribute.values.find(
                        (value) => value.valueId === selectedAttributes[attribute.attributeId]
                      )?.label;

                      return (
                        <div
                          key={attribute.attributeId}
                          className={clsx(
                            'space-y-4 rounded-2xl border p-5 transition-colors',
                            isActiveStep
                              ? 'border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/40'
                              : 'border-dashed border-gray-200 bg-gray-50/70 dark:border-gray-700/60 dark:bg-gray-900/30 opacity-80'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                              {attribute.name}
                            </span>
                            {selectedLabel && (
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {selectedLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attribute.values.map((value) => {
                              const isSelected = selectedAttributes[attribute.attributeId] === value.valueId;
                              const disabled = isOptionDisabled(attribute.attributeId, value.valueId);

                              return (
                                <Button
                                  key={value.valueId}
                                  size="sm"
                                  variant={isSelected ? 'solid' : 'bordered'}
                                  color={isSelected ? 'primary' : 'default'}
                                  isDisabled={disabled}
                                  onPress={() => handleAttributeSelect(attribute.attributeId, value.valueId)}
                                  className={clsx(
                                    'rounded-full px-4 py-1 text-sm font-medium transition-all duration-150',
                                    isSelected
                                      ? 'shadow-sm'
                                      : 'bg-white/95 text-gray-600 hover:border-gray-300 dark:bg-gray-900/60 dark:text-gray-300',
                                    disabled && 'opacity-50 pointer-events-none'
                                  )}
                                >
                                  {value.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  : variants?.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const variantPrice = typeof variant.price === 'number' ? variant.price : Number(variant.price || 0);

                      return (
                        <button
                          key={variant.id}
                          onClick={() => selectVariant(variant)}
                          disabled={variant.stockQuantity <= 0}
                          className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          } ${
                            variant.stockQuantity <= 0
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{variant.name}</h4>
                              {variant.sku && <p className="text-sm text-gray-500">SKU: {variant.sku}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${variantPrice.toFixed(2)}</p>
                              <p className={`text-sm ${variant.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {variant.stockQuantity > 0
                                  ? t('variants.inStock', { count: variant.stockQuantity })
                                  : t('variants.outOfStock')}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
              </div>
            )}

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className={typography.label}>Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-full shadow-sm"
                    onPress={() => handleQuantityChange(quantity - 1)}
                    isDisabled={quantity <= 1}
                  >
                    <span className="text-base font-semibold">−</span>
                  </Button>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={String(quantity)}
                      onValueChange={(value) => {
                        const parsed = Number(value);
                        if (Number.isNaN(parsed)) {
                          return;
                        }
                        handleQuantityChange(parsed);
                      }}
                      min={1}
                      max={99}
                      size="md"
                      variant="bordered"
                      inputMode="numeric"
                      classNames={{
                        inputWrapper: 'h-10 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/70',
                        input: 'text-center font-semibold text-base'
                      }}
                    />
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-full shadow-sm"
                    onPress={() => handleQuantityChange(quantity + 1)}
                    isDisabled={quantity >= 99}
                  >
                    <span className="text-base font-semibold">+</span>
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  color="primary"
                  className="flex-1 font-semibold py-3"
                  onPress={handleAddToCart}
                  isDisabled={!inStock || (variantAttributes.length > 0 && !selectedVariant)}
                >
                  {!inStock ? t('actions.outOfStock') : t('actions.addToCart')}
                </Button>

                <Button
                  size="lg"
                  variant="bordered"
                  className="flex-1 border border-gray-300 font-semibold py-3"
                  onPress={() => setShowQuickView(true)}
                >
                  {t('actions.quickView')}
                </Button>
              </div>
            </div>

            {tags && tags.length > 0 && (
              <div className="space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('tags.title')}</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Chip
                      key={(tag as any).id}
                      size="sm"
                      variant="flat"
                      className="bg-gray-100 dark:bg-gray-800"
                    >
                      {(tag as any).name}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </Card>
      </section>

      {/* Product Details */}
      <section ref={detailTabsRef} className="space-y-8">
        <Card className={clsx(layout.sectionCard, 'space-y-8')}>
          <Tabs
            selectedKey={activeDetailTab}
            onSelectionChange={(key) => setActiveDetailTab(key as 'details' | 'reviews' | 'questions')}
            variant="underlined"
            className="w-full"
          >
            <Tab key="details" title={t('tabs.details')}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className={typography.sectionTitle}>{t('overview.title')}</h3>
                      <p className={typography.meta}>{t('overview.subtitle')}</p>
                    </div>
                    <Button size="sm" variant="flat" className="text-primary-500" onPress={handleScrollToReviews}>
                      {t('overview.actions.viewReviews')}
                    </Button>
                  </div>
                  <ProductDescription
                    description={descriptionText}
                    features={productFeatures}
                    specifications={specificationItems}
                    details={productDetails}
                    videos={productVideos}
                    className="space-y-6"
                  />
                </div>
                <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="space-y-2">
                    <h4 className={typography.subsectionTitle}>{t('specifications.title')}</h4>
                    <p className={typography.meta}>{t('specifications.subtitle')}</p>
                  </div>

                  {specificationItems.length > 0 ? (
                    <div className="space-y-3">
                      {specificationItems.map((spec) => (
                        <div
                          key={spec.id || spec.name}
                          className="flex items-start justify-between gap-4 rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-gray-800/40"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatSpecificationLabel(spec.name)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-right">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('specifications.empty')}</p>
                  )}
                </div>
              </div>
            </Tab>

            <Tab
              key="reviews"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('tabs.reviews')}</span>
                  <Chip size="sm" variant="flat">{reviews.length}</Chip>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className={typography.sectionTitle}>{t('reviews.title')}</h3>
                    <p className={typography.meta}>{t('reviews.subtitle')}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-500">{t('reviews.countLabel', { count: reviews.length })}</span>
                </div>
                <ReviewList
                  productId={id}
                  reviews={reviews}
                  onHelpfulVote={(reviewId) => console.log('Helpful vote:', reviewId)}
                  onReportReview={(reviewId) => console.log('Report review:', reviewId)}
                />
                <div className="space-y-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-5 dark:border-gray-700/60 dark:bg-gray-900/40">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reviews.shareTitle')}</h4>
                  <p className={typography.meta}>{t('reviews.shareSubtitle')}</p>
                  <ReviewForm onSubmit={handleReviewSubmit} />
                </div>
              </div>
            </Tab>

            <Tab
              key="questions"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('tabs.questions')}</span>
                  <Chip size="sm" variant="flat">{comments.length}</Chip>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className={typography.sectionTitle}>{t('questions.title')}</h3>
                    <p className={typography.meta}>{t('questions.subtitle')}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-500">{t('questions.countLabel', { count: comments.length })}</span>
                </div>
                <CommentSection
                  productId={id}
                  comments={comments}
                  onCommentSubmit={onCommentSubmit}
                  onCommentLike={onCommentLike}
                />
              </div>
            </Tab>
          </Tabs>
        </Card>
      </section>

      {/* Cross-sell Products */}
      {(relatedProducts.length > 0 || frequentlyBoughtTogether.length > 0 ||
        recommendedProducts.length > 0 || trendingProducts.length > 0) && (
        <CrossSellSection
          products={{
            related: relatedProducts,
            frequentlyBoughtTogether: frequentlyBoughtTogether,
            recommended: recommendedProducts,
            trending: trendingProducts,
          }}
          onAddToCart={onAddToCart}
          onWishlistToggle={onWishlistToggle}
        />
      )}

      {/* Quick View Modal */}
      <Modal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        size="4xl"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className={typography.subsectionTitle}>{name}</h2>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <img
                  src={getPrimaryImage()}
                  alt={name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-5">
                <PriceDisplay price={currentPrice} originalPrice={originalPrice} size="lg" />
                <p className="text-base text-gray-600 line-clamp-3">{descriptionText}</p>
                <Button
                  color="primary"
                  onPress={() => {
                    handleAddToCart();
                    setShowQuickView(false);
                  }}
                  fullWidth
                >
                  {t('actions.addToCart')}
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;

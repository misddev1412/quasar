'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Button, Card, Chip, Tabs, Tab } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ProductGallery from './ProductGallery';
import ProductDescription from './ProductDescription';
import ProductVideo from './ProductVideo';
import CommentSection, { Comment } from './CommentSection';
import ReviewList, { Review } from './ReviewList';
import ReviewForm from './ReviewForm';
import CrossSellSection from './CrossSellSection';
import Rating from '../common/Rating';
import ProductInfo from './ProductInfo';
import ProductQuickView from './ProductQuickView';
import PageBreadcrumbs from '../common/PageBreadcrumbs';
import { useProductVariants } from '../../hooks/useProductVariants';
import { useProductState } from '../../hooks/useProductState';
import type { Product } from '../../types/product';
import { Breadcrumb } from 'ui';

const layout = {
  container: 'space-y-12 lg:space-y-16',
  breadcrumb: 'text-xs md:text-sm bg-white/95 dark:bg-neutral-900/80 shadow-sm border border-gray-200/70 dark:border-gray-700/60',
  mainGrid: 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12',
  galleryStack: 'space-y-6',
  galleryCard: 'rounded-2xl overflow-hidden shadow-md',
  sectionCard: 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-sm p-6 lg:p-8',
  detailGrid: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
  reviewGrid: 'grid grid-cols-1 gap-6 lg:grid-cols-2'
} as const;

const typography = {
  sectionTitle: 'text-2xl font-semibold text-gray-900 dark:text-white',
  subsectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
  meta: 'text-sm text-gray-500 dark:text-gray-400',
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
  const detailTabsRef = useRef<HTMLDivElement | null>(null);

  // Product state hook
  const {
    quantity,
    wishlistAdded,
    selectedImageIndex,
    showQuickView,
    activeDetailTab,
    handleQuantityChange,
    handleAddToCart: handleAddToCartState,
    handleWishlistToggle,
    handleImageSelect,
    handleQuickViewToggle,
    handleDetailTabChange,
  } = useProductState({
    productId: product.id,
    onAddToCart,
    onWishlistToggle,
  });

  // Product variants hook
  const {
    selectedVariant,
    selectedAttributes,
    variantAttributes,
    attributeIndexMap,
    hasAttributeBasedVariants,
    isOptionDisabled,
    handleAttributeSelect,
    selectVariant,
    setSelectedVariant,
  } = useProductVariants({
    variants: product.variants,
  });

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

  const handleScrollToReviews = useCallback(() => {
    handleDetailTabChange('reviews');

    if (typeof window === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      detailTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [detailTabsRef, handleDetailTabChange]);

  const handleAddToCart = () => {
    handleAddToCartState(product, selectedVariant);
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
      <PageBreadcrumbs
        items={breadcrumbItems}
        showBackground={false}
      />

      {/* Main Product Section */}
      <section className={layout.mainGrid}>
          {/* Product Gallery */}
          <div className={layout.galleryStack}>
            <ProductGallery
              images={productImages}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={handleImageSelect}
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
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            wishlistAdded={wishlistAdded}
            averageRating={averageRating}
            reviewCount={reviews.length}
            variantAttributes={variantAttributes}
            selectedAttributes={selectedAttributes}
            attributeIndexMap={attributeIndexMap}
            hasAttributeBasedVariants={hasAttributeBasedVariants}
            isOptionDisabled={isOptionDisabled}
            onQuantityChange={handleQuantityChange}
            onVariantSelect={selectVariant}
            onAttributeSelect={handleAttributeSelect}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickViewToggle}
            onScrollToReviews={handleScrollToReviews}
          />
      </section>

      {/* Product Details */}
      <section ref={detailTabsRef} className="space-y-8">
        <Card className={clsx(layout.sectionCard, 'space-y-8')}>
          <Tabs
            selectedKey={activeDetailTab}
            onSelectionChange={(key) => handleDetailTabChange(key as 'details' | 'reviews' | 'questions')}
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
      <ProductQuickView
        isOpen={showQuickView}
        onClose={handleQuickViewToggle}
        product={product}
        selectedVariant={selectedVariant}
        description={descriptionText}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductDetailPage;

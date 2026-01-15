'use client';

import React from 'react';
import clsx from 'clsx';
import ProductGallery from './ProductGallery';
import ProductVideo from './ProductVideo';
import CrossSellSection from './CrossSellSection';
import ProductInfo from './ProductInfo';
import PageBreadcrumbs from '../common/PageBreadcrumbs';
import Container from '../common/Container';
import type { Product, ProductVariant } from '@frontend/types/product';
import { Comment } from './CommentSection';
import { Review } from './ReviewList';
import { useProductPage } from '@frontend/hooks/useProductPage';
import { ProductDetailTabs } from './product-detail/ProductDetailTabs';
import { SectionType } from '@shared/enums/section.enums';
import type { SectionListItem } from '../../types/sections';
import { CustomHtmlSection, TestimonialsSection, VideoSection } from '../sections';

const layout = {
  mainGrid: 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12',
  galleryStack: 'space-y-6',
  galleryCard: 'rounded-2xl overflow-hidden shadow-md',
} as const;

const typography = {
  subsectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
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
  sections?: SectionListItem[];
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
  sections = [],
}) => {
  const {
    // State
    quantity,
    wishlistAdded,
    selectedImageIndex,
    activeDetailTab,
    selectedVariant,
    selectedAttributes,
    variantAttributes,
    attributeIndexMap,
    detailTabsRef,

    // Data
    productImages,
    productVideos,
    breadcrumbItems,
    productFeatures,
    productDetails,
    specificationItems,
    descriptionText,
    hasAttributeBasedVariants,
    isOptionDisabled,

    // Handlers
    handleQuantityChange,
    handleAddToCart,
    handleWishlistToggle,
    handleImageSelect,
    handleDetailTabChange,
    handleAttributeSelect,
    selectVariant,
    handleBuyNow,
    handleScrollToReviews,
    handleReviewSubmit,
  } = useProductPage({
    product,
    onAddToCart,
    onWishlistToggle,
    onReviewSubmit,
  });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const renderSection = (section: SectionListItem) => {
    switch (section.type) {
      case SectionType.PRODUCT_DETAILS:
        return (
          <ProductDetailTabs
            key={section.id}
            activeTab={activeDetailTab}
            onTabChange={handleDetailTabChange}
            tabRef={detailTabsRef}
            descriptionText={descriptionText}
            productFeatures={productFeatures}
            specificationItems={specificationItems}
            productDetails={productDetails}
            productVideos={productVideos}
            reviews={reviews}
            comments={comments}
            productId={product.id}
            onReviewSubmit={handleReviewSubmit}
            onCommentSubmit={onCommentSubmit}
            onCommentLike={onCommentLike}
            onScrollToReviews={handleScrollToReviews}
            className="mt-12 lg:mt-16"
            config={section.config}
          />
        );
      case SectionType.VIDEO:
        return <VideoSection key={section.id} config={section.config as any} translation={section.translation} />;
      case SectionType.TESTIMONIALS:
        return <TestimonialsSection key={section.id} config={section.config as any} translation={section.translation} />;
      case SectionType.CUSTOM_HTML:
        return <CustomHtmlSection key={section.id} config={section.config as any} translation={section.translation} />;
      default:
        // For other sections that might be added, we ignore them for now or implement generic rendering
        return null;
    }
  };

  return (
    <>
      <PageBreadcrumbs
        items={breadcrumbItems}
        fullWidth
      />

      <Container className={clsx('space-y-12 py-12 lg:space-y-16 lg:py-16', className)}>
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

            {/* Product Videos (Legacy/Hardcoded, separate from Sections?)
                If specific Product Video exists on Product entity, we show it here.
                This is distinct from the generic VIDEO section which is configurable content.
            */}
            {productVideos.length > 0 && (
              <div className="space-y-5">
                <h3 className={typography.subsectionTitle}>Product Videos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {productVideos.slice(0, 2).map((video: { url: string; title: string; thumbnail?: string }, index: number) => (
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
            onBuyNow={handleBuyNow}
            onScrollToReviews={handleScrollToReviews}
          />
        </section>

        {/* Dynamic Sections */}
        {sections.length > 0 ? (
          <div className="space-y-12 lg:space-y-16">
            {sections.map(section => renderSection(section))}
          </div>
        ) : (
          null
        )}

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
      </Container>
    </>
  );
};

export default ProductDetailPage;

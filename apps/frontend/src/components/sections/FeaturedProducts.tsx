'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { SectionHeader } from './SectionHeader';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
import ProductCard from '../../components/ecommerce/ProductCard';
import type { Product } from '../../types/product';
import { ProductService } from '../../services/product.service';
import SectionContainer from './SectionContainer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FeaturedProductsConfig {
  productIds?: string[];
  displayStyle?: 'grid' | 'carousel';
  itemsPerRow?: number;
  backgroundStyle?: 'surface' | 'muted' | 'contrast';
  headingStyle?: 'default' | 'banner';
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  headingTitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  headingBarHeight?: number;
  headingBorderRadius?: number;
  headingPaddingY?: number;
}

interface FeaturedProductsProps {
  config: FeaturedProductsConfig;
  translation?: SectionTranslationContent | null;
  viewMoreButtonConfig?: ViewMoreButtonConfig;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerRowState, setItemsPerRowState] = useState<number>(4);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateItemsPerRow = useCallback(() => {
    const configVal = Number(config.itemsPerRow);
    const configItemsPerRow = !isNaN(configVal) && configVal > 0 ? configVal : 4;

    if (typeof window === 'undefined') {
      setItemsPerRowState(configItemsPerRow);
      return;
    }

    if (window.innerWidth >= 1024) {
      setItemsPerRowState(configItemsPerRow);
    } else if (window.innerWidth >= 768) {
      setItemsPerRowState(Math.min(configItemsPerRow, 3));
    } else if (window.innerWidth >= 640) {
      setItemsPerRowState(Math.min(configItemsPerRow, 2));
    } else {
      setItemsPerRowState(1);
    }
  }, [config.itemsPerRow]);

  useEffect(() => {
    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, [updateItemsPerRow]);

  const productIds = useMemo(() => Array.isArray(config.productIds) ? config.productIds : [], [config.productIds]);
  const displayStyle = config.displayStyle === 'carousel' ? 'carousel' : 'grid';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetched = await ProductService.getProductsByIds(productIds);
        if (!isCancelled) {
          setProducts(fetched);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Unable to load featured products');
          setProducts([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [productIds]);

  const totalPages = Math.ceil(products.length / Math.max(1, itemsPerRowState));

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

      const items = scrollRef.current.querySelectorAll('.featured-product-item');
      if (items.length > 0) {
        const itemWidth = items[0].clientWidth;
        const pageIndex = Math.round(scrollLeft / ((itemWidth + 24) * itemsPerRowState));
        if (pageIndex !== activeIndex) {
          setActiveIndex(pageIndex);
        }
      }
    }
  }, [activeIndex, itemsPerRowState]);

  useEffect(() => {
    if (displayStyle === 'carousel') {
      checkScroll();
      const currentRef = scrollRef.current;
      if (currentRef) {
        currentRef.addEventListener('scroll', checkScroll);
      }
      window.addEventListener('resize', checkScroll);
      return () => {
        if (currentRef) {
          currentRef.removeEventListener('scroll', checkScroll);
        }
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [displayStyle, products, itemsPerRowState, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const items = scrollRef.current.querySelectorAll('.featured-product-item');
      const targetItemIndex = pageIndex * itemsPerRowState;
      if (items[targetItemIndex]) {
        const itemWidth = items[0].clientWidth;
        scrollRef.current.scrollTo({ left: targetItemIndex * (itemWidth + 24), behavior: 'smooth' });
      }
    }
  };

  // null means field is hidden by admin, undefined/empty means visible but no value
  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.featured_products.title'));
  const sectionSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || '');
  const sectionDescription = translation?.description === null ? '' : (translation?.description || '');
  const hasContent = sectionTitle || sectionSubtitle || sectionDescription;

  const renderContent = () => {
    if (productIds.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerRowState }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-6 text-center text-sm text-gray-400 dark:text-gray-500"
            >
              {t('sections.featured_products.placeholder_empty', 'Select products to showcase in this section.')}
            </div>
          ))}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productIds.slice(0, itemsPerRowState).map((id) => (
            <div key={`loading-${id}`} className="animate-pulse rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 bg-white dark:bg-gray-900/30">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-6 text-sm text-red-600 dark:text-red-200">
          {error}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
          {t('sections.featured_products.placeholder_empty', 'No featured products available.')}
        </div>
      );
    }

    if (displayStyle === 'carousel') {
      const desktopWidth = `lg:w-[calc(${100 / itemsPerRowState}%-${((itemsPerRowState - 1) * 24) / itemsPerRowState}px)]`;
      const tabletWidth = itemsPerRowState >= 3 ? "md:w-[calc(33.333%-16px)]" : itemsPerRowState === 2 ? "md:w-[calc(50%-12px)]" : "w-full";
      const mobileWidth = "w-[calc(100%-40px)]";

      return (
        <div className="relative group/section">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-800 transition-all opacity-0 group-hover/section:opacity-100 -ml-6 hover:bg-gray-50 focus:outline-none hidden md:flex",
              !canScrollLeft && "md:hidden"
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-800 transition-all opacity-0 group-hover/section:opacity-100 -mr-6 hover:bg-gray-50 focus:outline-none hidden md:flex",
              !canScrollRight && "md:hidden"
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scroll Area */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "featured-product-item flex-shrink-0 snap-start",
                  mobileWidth,
                  tabletWidth,
                  desktopWidth
                )}
              >
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

          {/* Pagination Dots */}
          {isMounted && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10 mb-2 relative z-30">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={`dot-page-${idx}`}
                  onClick={() => scrollToPage(idx)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300 border-2 focus:outline-none",
                    activeIndex === idx
                      ? "bg-orange-500 border-orange-500 scale-125 shadow-md"
                      : "bg-gray-300 border-transparent hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                  )}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default Grid Layout
    const gridClass = itemsPerRowState >= 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : itemsPerRowState === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

    return (
      <div className={cn("grid gap-6", gridClass)}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={true}
            showWishlist={false}
            showQuickView={false}
            imageHeight="h-56"
          />
        ))}
      </div>
    );
  };

  const backgroundStyle = config.backgroundStyle || 'surface';

  const getSectionStyle = (): React.CSSProperties => {
    switch (backgroundStyle) {
      case 'muted':
        return { backgroundColor: 'var(--storefront-surface)' };
      case 'contrast':
        return {
          backgroundColor: 'var(--storefront-text)',
          color: 'var(--storefront-body)',
        };
      case 'surface':
      default:
        return { backgroundColor: 'var(--storefront-body)' };
    }
  };

  return (
    <section className="py-4 lg:py-16" style={getSectionStyle()}>
      <SectionContainer paddingClassName="px-6 lg:px-8">
        {hasContent && (
          <SectionHeader
            title={sectionTitle}
            subtitle={sectionSubtitle}
            description={sectionDescription}
            ctaLabel={t('sections.featured_products.browse_catalog')}
            ctaLink="/products"
            headingStyle={config.headingStyle}
            headingBackgroundColor={config.headingBackgroundColor}
            headingTextColor={config.headingTextColor}
            headingTextTransform={config.headingTextTransform}
            headingTitleSize={config.headingTitleSize}
            headingBarHeight={config.headingBarHeight}
            headingBorderRadius={config.headingBorderRadius}
            headingPaddingY={config.headingPaddingY}
          />
        )}

        {renderContent()}
      </SectionContainer>
    </section>
  );
};

export default FeaturedProducts;


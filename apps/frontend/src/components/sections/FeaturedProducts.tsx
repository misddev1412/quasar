'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';
import ProductCard from '../../components/ecommerce/ProductCard';
import type { Product } from '../../types/product';
import { ProductService } from '../../services/product.service';

export interface FeaturedProductsConfig {
  productIds?: string[];
  displayStyle?: 'grid' | 'carousel';
  itemsPerRow?: number;
}

interface FeaturedProductsProps {
  config: FeaturedProductsConfig;
  translation?: SectionTranslationContent | null;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const itemsPerRow = config.itemsPerRow ?? 4;

  const productIds = useMemo(() => Array.isArray(config.productIds) ? config.productIds : [], [config.productIds]);
  const gridClass = useMemo(() => {
    if (itemsPerRow >= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (itemsPerRow === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2';
  }, [itemsPerRow]);

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

  return (
    <section id="sections" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              {translation?.title || t('sections.featured_products.title')}
            </h2>
            {translation?.subtitle && (
              <p className="mt-2 text-gray-500">{translation.subtitle}</p>
            )}
            {translation?.description && (
              <p className="mt-3 text-sm text-gray-500 max-w-2xl">
                {translation.description}
              </p>
            )}
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          >
            {t('sections.featured_products.browse_catalog')}
          </Link>
        </div>

        {productIds.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerRow }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400"
              >
                {t('sections.featured_products.placeholder_empty', 'Select products to showcase in this section.')}
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className={`grid gap-6 ${gridClass}`}>
            {productIds.map((id) => (
              <div key={`loading-${id}`} className="animate-pulse rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="h-40 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            {t('sections.featured_products.placeholder_empty', 'No featured products available.')}
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClass}`}>
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
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;

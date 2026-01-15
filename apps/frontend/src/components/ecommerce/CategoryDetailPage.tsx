'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import { Pagination } from '../common/Pagination';
import { CategoryService } from '../../services/category.service';
import type { Category, Product } from '../../types/product';
import type { PaginationInfo } from '../../types/trpc';

interface CategoryDetailPageProps {
  category: Category;
  categorySlug?: string;
  initialProducts: Product[];
  subcategories: Category[];
}

const layout = {
  wrapper: 'space-y-12',
  sectionHeader: 'flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between',
  sectionTitle: 'text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl',
  sectionDescription: 'text-sm text-gray-600 dark:text-gray-300 max-w-xl',
  mutedText: 'text-sm text-gray-600 dark:text-gray-300',
  statusBlock: 'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-12 text-center dark:border-gray-700/60 dark:bg-gray-900/30',
} as const;

const ensureNonNegativeInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  const parsed = Math.floor(value);
  return parsed >= 0 ? parsed : fallback;
};

const sanitizePaginationInfo = (pagination: PaginationInfo | undefined, fallbackLimit = 12): PaginationInfo => {
  const safeLimit = ensureNonNegativeInteger(pagination?.limit, fallbackLimit) || fallbackLimit;
  const safeTotal = ensureNonNegativeInteger(pagination?.total, 0);
  const safePage = ensureNonNegativeInteger(pagination?.page, 1) || 1;

  const candidateTotalPages = pagination?.totalPages;
  const safeTotalPages = (() => {
    if (typeof candidateTotalPages === 'number' && Number.isFinite(candidateTotalPages) && candidateTotalPages > 0) {
      return Math.floor(candidateTotalPages);
    }

    if (safeLimit > 0 && safeTotal > 0) {
      return Math.max(1, Math.ceil(safeTotal / safeLimit));
    }

    return 0;
  })();

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages: safeTotalPages,
  };
};

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  category,
  categorySlug,
  initialProducts,
  subcategories,
}) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const rawInitialTotal = category.productCount ?? initialProducts.length;
  const initialTotal = ensureNonNegativeInteger(rawInitialTotal, initialProducts.length);
  const [pagination, setPagination] = useState<PaginationInfo>(() =>
    sanitizePaginationInfo({
      page: 1,
      limit: 12,
      total: initialTotal,
      totalPages: initialTotal > 0 ? Math.max(1, Math.ceil(initialTotal / 12)) : 0,
    })
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);
  const totalKnownProducts = useMemo(() => {
    const candidates: Array<unknown> = [pagination.total, category.productCount, products.length];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
        return Math.floor(candidate);
      }
    }

    return 0;
  }, [pagination.total, category.productCount, products.length]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CategoryService.getCategoryProducts({
        categoryRef: categorySlug?.trim() || category.id,
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder: sortBy === 'price_DESC' ? 'DESC' : 'ASC',
      });

      setProducts(response.items);
      setPagination(sanitizePaginationInfo(response.pagination, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [category.id, categorySlug, currentPage, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    // Implement add to cart logic
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const isRefreshing = isLoading && currentPage === 1;
  const isPaginating = isLoading && currentPage > 1;
  const noProducts = products.length === 0;
  const showProductSkeleton = !error && isRefreshing && noProducts;
  const showEmptyState = !showProductSkeleton && noProducts && !error;
  const showPagination = !showProductSkeleton && !error && !showEmptyState;
  const skeletonCount = 12;

  return (
    <div className={layout.wrapper}>
      {subcategories.length > 0 && (
        <section aria-labelledby="subcategory-heading">
          <div className={layout.sectionHeader}>
            <div>
              <h2 id="subcategory-heading" className={layout.sectionTitle}>
                {t('pages.category_detail.subcategories_title', { category: category.name })}
              </h2>
              <p className={layout.sectionDescription}>
                {t('pages.category_detail.subcategories_description')}
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
            >
              {t('pages.category_detail.view_all_categories')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subcategories.map((subcategory) => (
              <CategoryCard
                key={subcategory.id}
                category={subcategory}
                className="transition-transform duration-200 hover:-translate-y-1"
              />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="category-products-heading">
        <div className={layout.sectionHeader}>
          <div>
            <h2 id="category-products-heading" className={layout.sectionTitle}>
              {t('pages.category_detail.products_title', { category: category.name })}
            </h2>
            <p className={layout.sectionDescription}>
              {t('pages.category_detail.products_description', {
                shown: numberFormatter.format(products.length),
                total: numberFormatter.format(totalKnownProducts),
              })}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {isRefreshing && (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-emerald-400 border-r-transparent" aria-hidden="true" />
                {t('pages.category_detail.updating_products')}
              </span>
            )}
            <div className="flex items-center gap-2">
              <label htmlFor="category-sort" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {t('common.sortBy')}
              </label>
              <select
                id="category-sort"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={sortBy}
                onChange={(event) => handleSortChange(event.target.value)}
              >
                <option value="createdAt">{t('pages.category_detail.sort.newest')}</option>
                <option value="price">{t('pages.category_detail.sort.price_low_high')}</option>
                <option value="price_DESC">{t('pages.category_detail.sort.price_high_low')}</option>
                <option value="name">{t('pages.category_detail.sort.name')}</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className={layout.statusBlock}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('pages.category_detail.error_title')}
              </h3>
              <p className={layout.mutedText}>
                {t('pages.category_detail.error_description')}
              </p>
            </div>
            <Button onClick={fetchProducts} color="primary" variant="solid">
              {t('pages.category_detail.try_again')}
            </Button>
          </div>
        ) : showProductSkeleton ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`category-products-skeleton-${index}`}
                className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/30"
              >
                <div className="h-44 rounded-t-xl bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmptyState ? (
          <div className={layout.statusBlock}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('pages.category_detail.empty_title')}
              </h3>
              <p className={layout.mutedText}>
                {t('pages.category_detail.empty_description')}
              </p>
            </div>
            <Link href="/categories">
              <Button color="primary" variant="bordered">
                {t('pages.category_detail.browse_other_categories')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  priceLoadingMode="skeleton"
                  className="transition-transform duration-200 hover:-translate-y-1"
                />
              ))}
            </div>

            {isPaginating && (
              <div className="flex justify-center pt-6">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-r-transparent" aria-hidden="true" />
                  {t('pages.category_detail.loading_more')}
                </span>
              </div>
            )}
          </>
        )}

        {showPagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setCurrentPage}
            showSinglePage
            className="mt-10"
          />
        )}
      </section>
    </div>
  );
};

export default CategoryDetailPage;

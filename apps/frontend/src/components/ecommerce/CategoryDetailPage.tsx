'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
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

const useVisiblePages = (totalPages: number, currentPage: number) => {
  return useMemo(() => {
    if (!totalPages || totalPages <= 0) {
      return [] as number[];
    }

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [totalPages, currentPage]);
};

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  category,
  categorySlug,
  initialProducts,
  subcategories,
}) => {
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

  const visiblePages = useVisiblePages(pagination.totalPages ?? 0, currentPage);

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
  const showInitialLoader = isRefreshing && noProducts;
  const showEmptyState = !isLoading && noProducts && !error;

  return (
    <div className={layout.wrapper}>
      {subcategories.length > 0 && (
        <section aria-labelledby="subcategory-heading">
          <div className={layout.sectionHeader}>
            <div>
              <h2 id="subcategory-heading" className={layout.sectionTitle}>
                Subcategories in {category.name}
              </h2>
              <p className={layout.sectionDescription}>
                Browse focused collections to narrow down your search.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
            >
              View all categories
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
              {category.name} picks
            </h2>
            <p className={layout.sectionDescription}>
              Showing {products.length > 0 ? numberFormatter.format(products.length) : '0'} of{' '}
              {numberFormatter.format(totalKnownProducts)} products.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {isRefreshing && (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-emerald-400 border-r-transparent" aria-hidden="true" />
                Updating products...
              </span>
            )}
            <div className="flex items-center gap-2">
              <label htmlFor="category-sort" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Sort by
              </label>
              <select
                id="category-sort"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={sortBy}
                onChange={(event) => handleSortChange(event.target.value)}
              >
                <option value="createdAt">Newest first</option>
                <option value="price">Price: Low to High</option>
                <option value="price_DESC">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className={layout.statusBlock}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">We hit a small snag</h3>
              <p className={layout.mutedText}>
                We could not refresh the products just now. Please try again in a moment.
              </p>
            </div>
            <Button onClick={fetchProducts} color="primary" variant="solid">
              Try again
            </Button>
          </div>
        ) : showInitialLoader ? (
          <div className={layout.statusBlock}>
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-hidden="true" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading products...</h3>
              <p className={layout.mutedText}>Hang tight while we bring in the latest items.</p>
            </div>
          </div>
        ) : showEmptyState ? (
          <div className={layout.statusBlock}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No products yet</h3>
              <p className={layout.mutedText}>
                This category is getting ready for its first arrivals. Explore other categories in the meantime.
              </p>
            </div>
            <Link href="/categories">
              <Button color="primary" variant="bordered">
                Browse other categories
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
                  className="transition-transform duration-200 hover:-translate-y-1"
                />
              ))}
            </div>

            {isPaginating && (
              <div className="flex justify-center pt-6">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-r-transparent" aria-hidden="true" />
                  Loading more products...
                </span>
              </div>
            )}
          </>
        )}

        {pagination.totalPages && pagination.totalPages > 1 && !showInitialLoader && !error && !showEmptyState && (
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:flex-row sm:justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                isDisabled={currentPage === 1}
                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                variant="bordered"
                size="sm"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {pagination.totalPages > 5 && visiblePages[0] > 1 && (
                  <>
                    <Button
                      onClick={() => setCurrentPage(1)}
                      variant={currentPage === 1 ? 'solid' : 'bordered'}
                      color={currentPage === 1 ? 'primary' : 'default'}
                      size="sm"
                    >
                      1
                    </Button>
                    {visiblePages[0] > 2 && <span className="px-1 text-sm text-gray-400">...</span>}
                  </>
                )}

                {visiblePages.map((page) => (
                  <Button
                    key={page}
                    isDisabled={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'solid' : 'bordered'}
                    color={currentPage === page ? 'primary' : 'default'}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}

                {pagination.totalPages > 5 && visiblePages[visiblePages.length - 1] < pagination.totalPages && (
                  <>
                    {visiblePages[visiblePages.length - 1] < pagination.totalPages - 1 && (
                      <span className="px-1 text-sm text-gray-400">...</span>
                    )}
                    <Button
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      variant={currentPage === pagination.totalPages ? 'solid' : 'bordered'}
                      color={currentPage === pagination.totalPages ? 'primary' : 'default'}
                      size="sm"
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                isDisabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((previous) => Math.min(pagination.totalPages, previous + 1))}
                variant="bordered"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryDetailPage;

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@heroui/react';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import type { BreadcrumbItem } from 'ui';
import PageBreadcrumbs from '../common/PageBreadcrumbs';
import { CategoryService } from '../../services/category.service';
import type { Category, Product } from '../../types/product';
import type { PaginationInfo } from '../../types/trpc';

interface CategoryDetailPageProps {
  category: Category;
  initialProducts: Product[];
  subcategories: Category[];
}

const layout = {
  container: 'space-y-12 lg:space-y-16',
  hero: 'relative overflow-hidden rounded-3xl border border-emerald-200/70 dark:border-emerald-400/15 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/45 dark:via-emerald-900/25 dark:to-cyan-900/25 px-6 py-10 sm:px-8 lg:px-12 shadow-sm',
  heroGrid: 'relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]',
  heroBadge: 'inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-200 bg-white/85 dark:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-500/20 rounded-full px-4 py-2 shadow-sm',
  heroTitle: 'text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-900 dark:text-white tracking-tight',
  heroDescription: 'text-base md:text-lg text-emerald-800/85 dark:text-emerald-100/85 leading-relaxed max-w-2xl',
  heroStats: 'flex flex-wrap items-center gap-3 mt-6',
  heroStatPill: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-500/20 text-sm font-medium text-emerald-800 dark:text-emerald-100 shadow-sm backdrop-blur',
  heroImageCard: 'relative w-full h-60 sm:h-72 lg:h-80 rounded-3xl overflow-hidden border border-emerald-100/70 dark:border-emerald-500/20 bg-white/75 dark:bg-emerald-950/40 shadow-lg',
  card: 'rounded-3xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900/50 shadow-sm p-6 sm:p-8 lg:p-10',
  sectionHeader: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800',
  sectionTitle: 'text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white',
  helpText: 'text-sm text-gray-500 dark:text-gray-400 max-w-xl',
  mutedText: 'text-sm text-gray-600 dark:text-gray-300',
  statusBlock: 'flex flex-col items-center justify-center gap-4 text-center py-12'
} as const;

const friendlyFallbackDescription = (name: string) =>
  `Discover cheerful finds in our ${name} corner. Everything here is handpicked to make shopping feel easy and welcoming.`;

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

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
      { label: category.name, isCurrent: true },
    ],
    [category.name]
  );

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

  const heroStats = useMemo(
    () => [
      {
        icon: '🛒',
        label: 'products',
        value: numberFormatter.format(totalKnownProducts),
      },
      {
        icon: '🧭',
        label: 'subcategories',
        value: numberFormatter.format(subcategories.length),
      },
      {
        icon: '✨',
        label: 'status',
        value: category.isActive ? 'Ready for you' : 'Coming soon',
      },
    ],
    [category.isActive, numberFormatter, subcategories.length, totalKnownProducts]
  );

  const visiblePages = useVisiblePages(pagination.totalPages ?? 0, currentPage);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CategoryService.getCategoryProducts({
        categoryId: category.id,
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
  }, [category.id, currentPage, sortBy]);

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

  const friendlyDescription = category.description?.trim() || friendlyFallbackDescription(category.name);

  return (
    <div className={layout.container}>
      <section className={layout.hero}>
        <div className="absolute -top-32 -right-24 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_60%)]" />

        <div className={layout.heroGrid}>
          <div>
            <div className={layout.heroBadge}>
              <span aria-hidden="true">🌿</span>
              <span>Curated with care</span>
            </div>
            <h1 className={`${layout.heroTitle} mt-6`}>{category.name}</h1>
            <p className={`${layout.heroDescription} mt-4`}>{friendlyDescription}</p>
            <div className={layout.heroStats}>
              {heroStats.map((stat) => (
                <span key={stat.label} className={layout.heroStatPill}>
                  <span aria-hidden="true" className="text-lg">{stat.icon}</span>
                  <span className="flex flex-col leading-none">
                    <span className="text-sm font-semibold">{stat.value}</span>
                    <span className="text-[11px] uppercase tracking-wide opacity-80">{stat.label}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className={layout.heroImageCard}>
            {category.image ? (
              <>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 32rem, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent" aria-hidden="true" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-emerald-700 dark:text-emerald-200">
                <span className="text-5xl" aria-hidden="true">🛍️</span>
                <p className="text-base font-semibold">We\'re dressing up this space</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-100/80">
                  A lovely photo will be here soon. Until then, enjoy the curated picks below.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <PageBreadcrumbs
            items={breadcrumbItems}
            showBackground={false}
            fullWidth={false}
          />
        </div>
      </section>

      {subcategories.length > 0 && (
        <section className={layout.card} aria-labelledby="subcategory-heading">
          <div className={layout.sectionHeader}>
            <div>
              <h2 id="subcategory-heading" className={layout.sectionTitle}>
                Explore friendly subcategories
              </h2>
              <p className={layout.helpText}>
                Narrow things down to find the perfect match within {category.name}.
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

      <section className={layout.card} aria-labelledby="category-products-heading">
        <div className={layout.sectionHeader}>
          <div>
            <h2 id="category-products-heading" className={layout.sectionTitle}>
              Cheerful picks in {category.name}
            </h2>
            <p className={layout.helpText}>
              Showing {products.length > 0 ? numberFormatter.format(products.length) : '0'} of{' '}
              {numberFormatter.format(totalKnownProducts)} friendly suggestions.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {isRefreshing && (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-emerald-400 border-r-transparent" aria-hidden="true" />
                Updating suggestions…
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
            <span className="text-4xl" aria-hidden="true">😅</span>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">We hit a small snag</h3>
              <p className={layout.mutedText}>
                We couldn\'t refresh the products just now. Give it another try and we\'ll gather new ideas for you.
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gathering lovely products…</h3>
              <p className={layout.mutedText}>Sit tight for a moment while we bring the best picks to the top.</p>
            </div>
          </div>
        ) : showEmptyState ? (
          <div className={layout.statusBlock}>
            <span className="text-5xl" aria-hidden="true">🌱</span>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No products yet</h3>
              <p className={layout.mutedText}>
                This category is getting ready for its first arrivals. Check back soon or keep exploring other areas.
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
                  Loading more friendly picks…
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
                    {visiblePages[0] > 2 && <span className="px-1 text-sm text-gray-400">…</span>}
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
                      <span className="px-1 text-sm text-gray-400">…</span>
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

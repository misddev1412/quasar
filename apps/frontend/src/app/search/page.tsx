import { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import ProductGrid from '../../components/ecommerce/ProductGrid';
import type { Product } from '../../types/product';
import type { PaginationInfo } from '../../types/api';
import { serverTrpc } from '../../utils/trpc-server';

const RESULTS_PER_PAGE = 12;
const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

interface SearchFilters {
  q?: string;
  page: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchResult {
  items: Product[];
  pagination: PaginationInfo;
}

const defaultPagination = (page = 1): PaginationInfo => ({
  page,
  limit: RESULTS_PER_PAGE,
  total: 0,
  totalPages: 0,
});

const defaultSearchResult = (page = 1): SearchResult => ({
  items: [],
  pagination: defaultPagination(page),
});

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const getFirstParam = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseNumericParam = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
};

const buildSearchHref = ({
  q,
  category,
  minPrice,
  maxPrice,
  page,
}: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}): string => {
  const params = new URLSearchParams();
  if (q) {
    params.set('q', q);
  }
  if (category) {
    params.set('category', category);
  }
  if (typeof minPrice === 'number') {
    params.set('minPrice', String(minPrice));
  }
  if (typeof maxPrice === 'number') {
    params.set('maxPrice', String(maxPrice));
  }
  if (page && page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : '/search';
};

const createPageNumbers = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
};

async function fetchSearchResults(filters: SearchFilters): Promise<SearchResult> {
  const { q, page, category, minPrice, maxPrice } = filters;

  try {
    const response = (await serverTrpc.clientProducts.getProducts.query({
      page,
      limit: RESULTS_PER_PAGE,
      search: q || undefined,
      category: category || undefined,
      minPrice,
      maxPrice,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })) as any;

    const data = response?.data;
    if (data?.items) {
      const pagination: PaginationInfo = {
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? RESULTS_PER_PAGE,
        total: data.pagination?.total ?? data.items.length ?? 0,
        totalPages:
          data.pagination?.totalPages ??
          (data.pagination?.limit
            ? Math.ceil((data.pagination?.total ?? data.items.length ?? 0) / data.pagination.limit)
            : 0),
      };

      return {
        items: data.items as Product[],
        pagination,
      };
    }

    return defaultSearchResult(page);
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch search results');
  }
}

async function resolveCategoryLabel(category?: string): Promise<string | null> {
  if (!category) {
    return null;
  }

  const trimmed = category.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (UUID_PATTERN.test(trimmed)) {
      const response = (await serverTrpc.clientCategories.getCategoryById.query({ id: trimmed })) as any;
      return response?.data?.name || null;
    }

    const response = (await serverTrpc.clientCategories.getCategoryBySlug.query({ slug: trimmed })) as any;
    return response?.data?.name || trimmed;
  } catch (error) {
    console.error('Error resolving category label:', error);
    return UUID_PATTERN.test(trimmed) ? null : trimmed;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolved = (await searchParams) || {};
  const query = getFirstParam(resolved.q)?.trim();
  const category = getFirstParam(resolved.category)?.trim();
  const minPrice = parseNumericParam(getFirstParam(resolved.minPrice));
  const maxPrice = parseNumericParam(getFirstParam(resolved.maxPrice));

  const siteName = 'Quasar';
  const safeQuery = query ? query.replace(/\s+/g, ' ').slice(0, 100) : '';
  const baseTitle = 'Search Products';
  const title = safeQuery
    ? `${baseTitle}: "${safeQuery}" | ${siteName}`
    : `${baseTitle} | ${siteName}`;

  const filterSummary: string[] = [];
  if (safeQuery) {
    filterSummary.push(`query "${safeQuery}"`);
  }
  if (category) {
    filterSummary.push('category filters');
  }
  if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
    filterSummary.push('price filters');
  }

  const description = filterSummary.length
    ? `Browse products matching ${filterSummary.join(', ')}.`
    : 'Search our catalogue to find the right products for you.';

  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const canonical = `${urlBase}${buildSearchHref({
    q: safeQuery,
    category: category || undefined,
    minPrice,
    maxPrice,
  })}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) || {};

  const rawQuery = getFirstParam(resolved.q) ?? '';
  const query = rawQuery.trim();
  const rawCategory = getFirstParam(resolved.category);
  const category = rawCategory?.trim() || undefined;
  const minPrice = parseNumericParam(getFirstParam(resolved.minPrice));
  const maxPrice = parseNumericParam(getFirstParam(resolved.maxPrice));

  const rawPage = getFirstParam(resolved.page);
  let page = Number.parseInt(rawPage ?? '1', 10);
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }

  let normalizedMinPrice = minPrice;
  let normalizedMaxPrice = maxPrice;
  if (
    typeof normalizedMinPrice === 'number' &&
    typeof normalizedMaxPrice === 'number' &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    [normalizedMinPrice, normalizedMaxPrice] = [normalizedMaxPrice, normalizedMinPrice];
  }

  const shouldFetch = Boolean(
    query ||
      category ||
      typeof normalizedMinPrice === 'number' ||
      typeof normalizedMaxPrice === 'number'
  );

  const categoryPromise = resolveCategoryLabel(category);
  const resultsPromise = shouldFetch
    ? fetchSearchResults({
        q: query,
        page,
        category,
        minPrice: normalizedMinPrice,
        maxPrice: normalizedMaxPrice,
      })
    : Promise.resolve(defaultSearchResult(page));

  const [categoryOutcome, resultsOutcome] = (await Promise.allSettled([
    categoryPromise,
    resultsPromise,
  ])) as [
    PromiseSettledResult<string | null>,
    PromiseSettledResult<SearchResult>
  ];

  const categoryLabel = categoryOutcome.status === 'fulfilled' ? categoryOutcome.value : null;

  let searchData = defaultSearchResult(page);
  let fetchError: string | null = null;
  if (resultsOutcome.status === 'fulfilled') {
    searchData = resultsOutcome.value;
  } else if (shouldFetch) {
    const reason = resultsOutcome.reason;
    fetchError = reason instanceof Error ? reason.message : 'Failed to load search results';
  }

  const { pagination } = searchData;
  const currentPage = pagination.page || page;
  const totalPages = pagination.totalPages || 0;
  const hasResults = searchData.items.length > 0;

  const startItem = hasResults
    ? (currentPage - 1) * pagination.limit + 1
    : 0;
  const endItem = hasResults
    ? Math.min(currentPage * pagination.limit, pagination.total)
    : 0;

  const appliedFilterChips: Array<{ label: string; href: string }> = [];
  if (categoryLabel) {
    appliedFilterChips.push({
      label: `Category: ${categoryLabel}`,
      href: buildSearchHref({
        q: query,
        minPrice: normalizedMinPrice,
        maxPrice: normalizedMaxPrice,
        page: 1,
      }),
    });
  }
  if (
    typeof normalizedMinPrice === 'number' ||
    typeof normalizedMaxPrice === 'number'
  ) {
    let label = 'Price';
    if (
      typeof normalizedMinPrice === 'number' &&
      typeof normalizedMaxPrice === 'number'
    ) {
      label = `Price: ${priceFormatter.format(normalizedMinPrice)} - ${priceFormatter.format(normalizedMaxPrice)}`;
    } else if (typeof normalizedMinPrice === 'number') {
      label = `Price: From ${priceFormatter.format(normalizedMinPrice)}`;
    } else if (typeof normalizedMaxPrice === 'number') {
      label = `Price: Up to ${priceFormatter.format(normalizedMaxPrice)}`;
    }

    appliedFilterChips.push({
      label,
      href: buildSearchHref({
        q: query,
        category,
        page: 1,
      }),
    });
  }

  const hasActiveFilters = appliedFilterChips.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find the products you love
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Search our catalogue and apply filters to pinpoint the perfect match for your needs.
          </p>

          <form action="/search" method="get" className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex-1 min-w-[240px]">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search for products..."
                className="w-full px-5 py-3 rounded-xl border border-transparent shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-base text-gray-900"
                aria-label="Search products"
              />
            </div>
            <input type="hidden" name="page" value="1" />
            {category && <input type="hidden" name="category" value={category} />}
            {typeof normalizedMinPrice === 'number' && (
              <input type="hidden" name="minPrice" value={String(normalizedMinPrice)} />
            )}
            {typeof normalizedMaxPrice === 'number' && (
              <input type="hidden" name="maxPrice" value={String(normalizedMaxPrice)} />
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/90 text-blue-700 font-semibold shadow-lg hover:bg-white transition-colors"
            >
              Search
            </button>
          </form>

          {hasActiveFilters && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {appliedFilterChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-blue-700 text-sm font-medium shadow"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden>x</span>
                </Link>
              ))}
              <Link
                href={buildSearchHref({ q: query })}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium text-white bg-blue-500/80 hover:bg-blue-500"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {shouldFetch ? 'Search results' : 'Start your search'}
              </h2>
              {shouldFetch && !fetchError ? (
                hasResults ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    Showing {startItem} - {endItem} of {pagination.total} result{pagination.total === 1 ? '' : 's'}
                    {query && (
                      <span>
                        {' '}for <span className="font-medium text-gray-900 dark:text-white">"""{query}"""</span>
                      </span>
                    )}
                    {categoryLabel && (
                      <span>
                        {' '}in <span className="font-medium text-gray-900 dark:text-white">{categoryLabel}</span>
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    No products matched your filters. Try adjusting your search terms or removing filters.
                  </p>
                )
              ) : shouldFetch && fetchError ? (
                <p className="text-red-600 dark:text-red-400">
                  {fetchError}
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  Use the search box above to explore our latest catalogue of products.
                </p>
              )}
            </div>
          </div>

          {shouldFetch ? (
            fetchError ? (
              <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  We could not load search results
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {fetchError}
                </p>
                <div className="mt-4">
                  <Link
                    href={buildSearchHref({ q: query, category, minPrice: normalizedMinPrice, maxPrice: normalizedMaxPrice, page: 1 })}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Try again
                  </Link>
                </div>
              </div>
            ) : hasResults ? (
              <>
                <ProductGrid
                  products={searchData.items}
                  className="mb-10"
                  showQuickView={false}
                  showWishlist={true}
                />

                {totalPages > 1 && (
                  <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" aria-label="Search pagination">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentPage > 1 && (
                        <Link
                          href={buildSearchHref({
                            q: query,
                            category,
                            minPrice: normalizedMinPrice,
                            maxPrice: normalizedMaxPrice,
                            page: currentPage - 1,
                          })}
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Previous
                        </Link>
                      )}

                      {createPageNumbers(currentPage, totalPages).map((pageNumber) => (
                        <Link
                          key={pageNumber}
                          href={buildSearchHref({
                            q: query,
                            category,
                            minPrice: normalizedMinPrice,
                            maxPrice: normalizedMaxPrice,
                            page: pageNumber,
                          })}
                          aria-current={pageNumber === currentPage ? 'page' : undefined}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pageNumber === currentPage
                              ? 'bg-blue-600 text-white shadow'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      ))}

                      {currentPage < totalPages && (
                        <Link
                          href={buildSearchHref({
                            q: query,
                            category,
                            minPrice: normalizedMinPrice,
                            maxPrice: normalizedMaxPrice,
                            page: currentPage + 1,
                          })}
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  </nav>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nothing matched your search
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try different keywords or remove some filters to see more products.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={buildSearchHref({ q: query })}
                    className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Reset filters
                  </Link>
                  <Link
                    href="/products"
                    className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Browse all products
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Ready to discover something new?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Enter a keyword above or explore categories to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/products"
                  className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  View all products
                </Link>
                <Link
                  href="/categories"
                  className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Browse categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

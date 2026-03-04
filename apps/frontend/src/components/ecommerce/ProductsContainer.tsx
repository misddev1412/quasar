'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import ProductFilterSidebar from './ProductFilterSidebar';
import { Button } from '@heroui/react';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Pagination } from '../common/Pagination';
import type { Product } from '../../types/product';
import type { ProductFilters } from '../../types/product';
import type { PaginationInfo } from '../../types/trpc';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ProductsContainerProps {
  initialProducts?: Product[];
  pageSize?: number;
  gridColumns?: number;
  showSidebar?: boolean;
  stickySidebar?: boolean;
  showSort?: boolean;
  showHeader?: boolean;
  heading?: string;
  subheading?: string;
}

const ProductsContainer: React.FC<ProductsContainerProps> = ({
  initialProducts,
  pageSize = 12,
  gridColumns = 3,
  showSidebar = true,
  stickySidebar = true,
  showSort = true,
  showHeader = true,
  heading,
  subheading,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const categoryFromQuery = searchParams.get('category')?.trim() || '';
  const resolvedHeading = heading === undefined ? 'All Products' : heading;
  const resolvedSubheading = subheading ?? '';
  const [activeCategoryId, setActiveCategoryId] = useState('');
  // State for products and filters
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: categoryFromQuery,
    brand: '',
    minPrice: undefined,
    maxPrice: undefined,
    isActive: true,
    isFeatured: undefined,
    inStock: undefined,
    hasDiscount: undefined,
    tags: [],
    rating: undefined,
  });

  // State for data
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  });
  const [availableFilters, setAvailableFilters] = useState<ProductFilters>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
  });
  const activeCategoryName = availableFilters.categories.find((category) => category.id === activeCategoryId)?.name || '';
  const computedHeading = activeCategoryName ? `Sản phẩm danh mục: ${activeCategoryName}` : resolvedHeading;
  const computedSubheading = activeCategoryName
    ? `Đang lọc theo danh mục ${activeCategoryName}`
    : resolvedSubheading;
  const hasHeading = computedHeading.trim().length > 0;
  const hasSubheading = computedSubheading.trim().length > 0;

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestProductsRequestRef = useRef(0);

  // Fetch products function
  const fetchProducts = async () => {
    const requestId = ++latestProductsRequestRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProductService.getProducts({
        page: currentPage,
        limit: pageSize,
        search: filters.search,
        category: filters.category,
        brand: filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isActive: filters.isActive,
        isFeatured: filters.isFeatured,
        sortBy,
        sortOrder: sortBy === 'price_DESC' ? 'DESC' : 'ASC',
      });

      if (latestProductsRequestRef.current !== requestId) {
        return;
      }

      setProducts(response.items);
      setPagination(response.pagination);
    } catch (err) {
      if (latestProductsRequestRef.current !== requestId) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      if (latestProductsRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  // Fetch filters function
  const fetchFilters = async () => {
    setIsFiltersLoading(true);
    try {
      const filters = await ProductService.getProductFilters();
      setAvailableFilters(filters);
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setIsFiltersLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, sortBy, filters.search, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.isActive, filters.isFeatured, filters.inStock, filters.hasDiscount, filters.tags, filters.rating]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncCategoryFromQuery = async () => {
      if (!categoryFromQuery) {
        setActiveCategoryId('');
        setFilters((prev) => (prev.category ? { ...prev, category: '' } : prev));
        return;
      }

      setFilters((prev) => {
        if (prev.category === categoryFromQuery) {
          return prev;
        }
        return { ...prev, category: categoryFromQuery };
      });

      try {
        const category = await CategoryService.getCategoryBySlug(categoryFromQuery);
        if (!cancelled) {
          setActiveCategoryId(category?.id ?? '');
        }
      } catch (error) {
        if (!cancelled) {
          setActiveCategoryId('');
        }
      }
    };

    syncCategoryFromQuery();

    return () => {
      cancelled = true;
    };
  }, [categoryFromQuery]);

  // Update pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, sortBy, filters.search, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.isActive, filters.isFeatured, filters.inStock, filters.hasDiscount, filters.tags, filters.rating]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      limit: pageSize,
      page: 1,
    }));
    setCurrentPage(1);
  }, [pageSize]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleAddToCart = (product: Product) => {
    // Simple add to cart logic
  };

  const handleFilterChange = (filterType: string, value: any) => {
    if (filterType === 'category') {
      setActiveCategoryId(typeof value === 'string' ? value : '');
      const selectedCategoryId = typeof value === 'string' ? value.trim() : '';

      if (!selectedCategoryId) {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('category');
        const nextQuery = nextParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      } else {
        CategoryService.getCategoryById(selectedCategoryId)
          .then((category) => {
            const slug = category?.translations?.find((translation) => translation?.slug)?.slug
              || selectedCategoryId;
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.set('category', slug);
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
          })
          .catch(() => {
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.set('category', selectedCategoryId);
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
          });
      }
    }
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('category');
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });

    setActiveCategoryId('');
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: undefined,
      maxPrice: undefined,
      isActive: true,
      isFeatured: undefined,
      inStock: undefined,
      hasDiscount: undefined,
      tags: [],
      rating: undefined,
    });
  };

  const gridClass =
    gridColumns >= 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : gridColumns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const shouldRenderHeader = showHeader || showSort;

  const renderProductGrid = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">Error loading products</div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <Button
              onClick={fetchProducts}
              color="primary"
              variant="bordered"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Results Header */}
        {shouldRenderHeader && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            {showHeader && (
              <div>
                {hasHeading && (
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {computedHeading}
                  </h2>
                )}
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {hasSubheading ? computedSubheading : `Showing ${products.length} of ${pagination.total} products`}
                </p>
              </div>
            )}
            {showSort && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</span>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price_DESC">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className={`grid ${gridClass} gap-6 lg:gap-8`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              className="transform hover:scale-105 transition-all duration-300"
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit || pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
      {/* Advanced Filter Sidebar */}
      {showSidebar && (
        <div className="lg:w-[30%]">
          <div className={stickySidebar ? 'sticky top-24' : ''}>
            <ProductFilterSidebar
              filters={filters}
              availableFilters={availableFilters}
              activeCategoryId={activeCategoryId}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className={showSidebar ? 'lg:w-[70%]' : 'w-full'}>
        {renderProductGrid()}
      </div>
    </div>
  );
};

export default ProductsContainer;

'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductFilterSidebar from './ProductFilterSidebar';
import { Button } from '@heroui/react';
import { ProductService } from '../../services/product.service';
import type { Product } from '../../types/product';
import type { ProductFilters } from '../../types/product';
import type { PaginationInfo } from '../../types/trpc';

interface ProductsContainerProps {
  initialProducts?: Product[];
}

const ProductsContainer: React.FC<ProductsContainerProps> = ({ initialProducts }) => {
  // State for products and filters
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
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

  // State for data
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [availableFilters, setAvailableFilters] = useState<ProductFilters>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products function
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProductService.getProducts({
        page: currentPage,
        limit: 12,
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

      setProducts(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
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
    fetchFilters();
  }, [currentPage, sortBy, filters.search, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.isActive, filters.isFeatured, filters.inStock, filters.hasDiscount, filters.tags, filters.rating]);

  // Update pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filters.search, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.isActive, filters.isFeatured, filters.inStock, filters.hasDiscount, filters.tags, filters.rating]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    // Simple add to cart logic
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
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

  // Handle loading and error states
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
      {/* Advanced Filter Sidebar */}
      <div className="lg:w-[30%]">
        <div className="sticky top-24">
          <ProductFilterSidebar
            filters={filters}
            availableFilters={availableFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="lg:w-[70%]">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>
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
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              variant="bordered"
              size="sm"
            >
              Previous
            </Button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    isDisabled={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'solid' : 'bordered'}
                    size="sm"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              isDisabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              variant="bordered"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsContainer;
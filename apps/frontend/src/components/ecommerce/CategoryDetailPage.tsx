'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';
import { Button } from '@heroui/react';
import { CategoryService } from '../../services/category.service';
import type { Category, Product } from '../../types/product';
import type { PaginationInfo } from '../../types/trpc';
import { Breadcrumb } from 'ui';

interface CategoryDetailPageProps {
  category: Category;
  initialProducts: Product[];
  subcategories: Category[];
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  category,
  initialProducts,
  subcategories,
}) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // State for data
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = React.useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
      { label: category.name, isCurrent: true },
    ],
    [category.name]
  );

  // Fetch products function
  const fetchProducts = async () => {
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
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch and when pagination/sort changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy]);

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    // Implement add to cart logic
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Handle loading and error states
  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Category Header */}
        <section className="relative bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Category Image */}
              {category.image && (
                <div className="relative w-full lg:w-1/3 h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Category Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl text-green-100 mb-6 leading-relaxed max-w-3xl">
                    {category.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-100">Active Category</span>
                  </div>
                  {category.productCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-100">•</span>
                      <span className="text-green-100">
                        {category.productCount} Products Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Breadcrumb
                items={breadcrumbItems}
                linkComponent={Link}
                className="bg-white/15 text-green-100 border-white/25 shadow-lg shadow-black/10 backdrop-blur"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Category Header */}
        <section className="relative bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Category Image */}
              {category.image && (
                <div className="relative w-full lg:w-1/3 h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Category Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl text-green-100 mb-6 leading-relaxed max-w-3xl">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Breadcrumb
                items={breadcrumbItems}
                linkComponent={Link}
                className="bg-white/15 text-green-100 border-white/25 shadow-lg shadow-black/10 backdrop-blur"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Header */}
      <section className="relative bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Category Image */}
            {category.image && (
              <div className="relative w-full lg:w-1/3 h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Category Info */}
            <div className="flex-1 text-center lg:text-left text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg md:text-xl text-green-100 mb-6 leading-relaxed max-w-3xl">
                  {category.description}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-100">Active Category</span>
                </div>
                {category.productCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-100">•</span>
                    <span className="text-green-100">
                      {category.productCount} Products Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb
              items={breadcrumbItems}
              linkComponent={Link}
              className="bg-white/15 text-green-100 border-white/25 shadow-lg shadow-black/10 backdrop-blur"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Subcategories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subcategories.map((subcategory) => (
                <CategoryCard
                  key={subcategory.id}
                  category={subcategory}
                  className="transform hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Products in {category.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Showing {products.length} of {pagination.total} products
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</span>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

          {/* Loading state for subsequent pages */}
          {isLoading && currentPage > 1 && (
            <div className="flex justify-center items-center h-32 mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  className="transform hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                There are no products available in this category yet.
              </p>
              <Link href="/categories">
                <Button color="primary" variant="bordered">
                  Browse Other Categories
                </Button>
              </Link>
            </div>
          ) : null}

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
        </section>
      </div>
    </div>
  );
};

export default CategoryDetailPage;

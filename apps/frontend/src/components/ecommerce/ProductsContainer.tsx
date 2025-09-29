'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@heroui/react';

// Static product data to avoid async issues
const staticProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    stockQuantity: 15,
    isActive: true,
    isFeatured: true,
    status: 'ACTIVE' as const,
    viewCount: 234,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'wireless-bluetooth-headphones',
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    brand: { id: '1', name: 'TechBrand' },
    images: ['/placeholder-headphones.jpg'],
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly cotton t-shirt',
    price: 29.99,
    stockQuantity: 50,
    isActive: true,
    isFeatured: false,
    status: 'ACTIVE' as const,
    viewCount: 156,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'organic-cotton-t-shirt',
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
    brand: { id: '2', name: 'EcoWear' },
    images: ['/placeholder-tshirt.jpg'],
  },
  {
    id: '3',
    name: 'Smart Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 149.99,
    stockQuantity: 8,
    isActive: true,
    isFeatured: true,
    status: 'ACTIVE' as const,
    viewCount: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'smart-fitness-tracker',
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    brand: { id: '3', name: 'FitTech' },
    images: ['/placeholder-fitness.jpg'],
  },
  {
    id: '4',
    name: 'Ceramic Plant Pot Set',
    description: 'Beautiful ceramic plant pots for indoor gardening',
    price: 39.99,
    stockQuantity: 25,
    isActive: true,
    isFeatured: false,
    status: 'ACTIVE' as const,
    viewCount: 67,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'ceramic-plant-pot-set',
    category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
    brand: { id: '4', name: 'HomeStyle' },
    images: ['/placeholder-pots.jpg'],
  },
  {
    id: '5',
    name: 'Running Shoes',
    description: 'Lightweight and comfortable running shoes',
    price: 79.99,
    stockQuantity: 0,
    isActive: true,
    isFeatured: false,
    status: 'ACTIVE' as const,
    viewCount: 345,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'running-shoes',
    category: { id: '4', name: 'Sports', slug: 'sports' },
    brand: { id: '5', name: 'SportMax' },
    images: ['/placeholder-shoes.jpg'],
  },
  {
    id: '6',
    name: 'Laptop Stand Adjustable',
    description: 'Ergonomic adjustable laptop stand for better posture',
    price: 49.99,
    stockQuantity: 20,
    isActive: true,
    isFeatured: true,
    status: 'ACTIVE' as const,
    viewCount: 128,
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'laptop-stand-adjustable',
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    brand: { id: '6', name: 'DeskPro' },
    images: ['/placeholder-stand.jpg'],
  },
];

interface ProductsContainerProps {
  initialProducts?: any[];
}

const ProductsContainer: React.FC<ProductsContainerProps> = ({ initialProducts }) => {
  // Simple state without complex async operations
  const [sortBy, setSortBy] = useState('createdAt');

  // Use static data instead of async tRPC calls
  const products = staticProducts;
  const totalProducts = products.length;

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleAddToCart = (product: any) => {
    console.log('Adding to cart:', product);
    // Simple add to cart logic
  };

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'price_DESC':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
      {/* Simple Filter Sidebar */}
      <div className="lg:w-[30%]">
        <div className="sticky top-24">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Filters</h3>

            {/* Simple category filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
              <div className="space-y-2">
                {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((category) => (
                  <label key={category} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" className="mr-2 rounded text-blue-600" />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Simple price filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
              <div className="space-y-2">
                {['Under $50', '$50 - $100', '$100 - $150', 'Over $150'].map((range) => (
                  <label key={range} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" className="mr-2 rounded text-blue-600" />
                    {range}
                  </label>
                ))}
              </div>
            </div>

            {/* Clear filters button */}
            <button
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => console.log('Clear filters')}
            >
              Clear all filters
            </button>
          </div>
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
              Showing {sortedProducts.length} of {totalProducts} products
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
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              className="transform hover:scale-105 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsContainer;
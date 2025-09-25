import React from 'react';
import { Product } from './ProductCard';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  emptyMessage?: string;
  skeletonCount?: number;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  error = null,
  showAddToCart = true,
  showWishlist = true,
  showQuickView = false,
  className = '',
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  emptyMessage = 'No products found.',
  skeletonCount = 5,
}) => {
  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="flex">
          <div className="w-32 h-32 bg-gray-200 animate-pulse"></div>
          <div className="flex-1 p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return <div className={`space-y-4 ${className}`}>{renderSkeletons()}</div>;
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 font-medium">Error loading products</div>
        <div className="text-gray-500 mt-1">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showAddToCart={showAddToCart}
          showWishlist={showWishlist}
          showQuickView={showQuickView}
          imageHeight="h-32"
          onAddToCart={onAddToCart}
          onWishlistToggle={onWishlistToggle}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductList;

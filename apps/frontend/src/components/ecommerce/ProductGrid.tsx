import React from 'react';
import { Product } from './ProductCard';
import ProductCard from './ProductCard';

interface ProductGridProps {
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
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
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
  skeletonCount = 8,
  columns = { xs: 2, sm: 3, md: 4, lg: 4, xl: 5 },
  gap = 'gap-4',
}) => {
  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div key={`skeleton-${index}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ));
  };

  const getGridClasses = () => {
    const { xs = 2, sm = 3, md = 4, lg = 4, xl = 5 } = columns;
    return `grid grid-cols-${xs} sm:grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl} ${gap}`;
  };

  if (loading) {
    return (
      <div className={`${getGridClasses()} ${className}`}>
        {renderSkeletons()}
      </div>
    );
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
    <div className={`${getGridClasses()} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showAddToCart={showAddToCart}
          showWishlist={showWishlist}
          showQuickView={showQuickView}
          onAddToCart={onAddToCart}
          onWishlistToggle={onWishlistToggle}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
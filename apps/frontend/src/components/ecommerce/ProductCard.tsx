import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image } from '@heroui/react';
import { PriceDisplay } from './PriceDisplay';
import { Rating } from './Rating';
import { AddToCartButton } from './AddToCartButton';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  slug: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceAdjustment?: number;
}

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
  imageHeight?: string;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = true,
  showWishlist = true,
  showQuickView = false,
  className = '',
  imageHeight = 'h-48',
  onAddToCart,
  onWishlistToggle,
  onQuickView,
}) => {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    discountPercentage,
    images,
    rating,
    reviewCount,
    inStock,
    slug,
    category,
  } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg ${className}`}>
      {/* Product Image */}
      <div className={`relative overflow-hidden ${imageHeight}`}>
        <Link to={`/products/${slug}`}>
          <Image
            src={images[0] || '/placeholder-product.png'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            removeWrapper
          />
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Out of Stock Badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showWishlist && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white rounded-full shadow-md"
              onClick={handleWishlistToggle}
            >
              <span className="text-lg">❤️</span>
            </Button>
          )}
          {showQuickView && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white rounded-full shadow-md"
              onClick={handleQuickView}
            >
              <span className="text-lg">👁️</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <Link 
            to={`/categories/${category.slug}`}
            className="text-xs text-gray-500 hover:text-primary-500 transition-colors"
          >
            {category.name}
          </Link>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${slug}`} className="block mt-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {name}
          </h3>
        </Link>
        
        {/* Product Description */}
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
        
        {/* Rating */}
        {rating && (
          <div className="mt-2 flex items-center">
            <Rating value={rating} size="sm" readonly />
            {reviewCount && (
              <span className="ml-1 text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2">
          <PriceDisplay 
            price={price} 
            originalPrice={originalPrice}
            size="md"
          />
        </div>
        
        {/* Add to Cart Button */}
        {showAddToCart && inStock && (
          <div className="mt-3">
            <AddToCartButton
              product={product}
              onAddToCart={onAddToCart}
              fullWidth
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
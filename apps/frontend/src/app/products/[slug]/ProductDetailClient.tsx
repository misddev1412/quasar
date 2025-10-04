'use client';

import React from 'react';
import ProductDetailPage from '../../../components/ecommerce/ProductDetailPage';
import { useCart } from '../../../components/ecommerce/CartProvider';
import type { Product, ProductVariant } from '../../../types/product';
import type { Review } from '../../../components/ecommerce/ReviewList';
import type { Comment } from '../../../components/ecommerce/CommentSection';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
  frequentlyBoughtTogether?: Product[];
  recommendedProducts?: Product[];
  trendingProducts?: Product[];
  reviews?: Review[];
  comments?: Comment[];
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts = [],
  frequentlyBoughtTogether = [],
  recommendedProducts = [],
  trendingProducts = [],
  reviews = [],
  comments = [],
}) => {
  const { addItem } = useCart();

  const handleAddToCart = async (product: Product, quantity?: number, variant?: ProductVariant | null) => {
    try {
      await addItem(product.id, quantity || 1, variant?.id);
      console.log('Added to cart:', { product, quantity, variant });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <ProductDetailPage
      product={product}
      relatedProducts={relatedProducts}
      frequentlyBoughtTogether={frequentlyBoughtTogether}
      recommendedProducts={recommendedProducts}
      trendingProducts={trendingProducts}
      reviews={reviews}
      comments={comments}
      onAddToCart={handleAddToCart}
    />
  );
};

export default ProductDetailClient;
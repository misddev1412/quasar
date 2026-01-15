'use client';

import React from 'react';
import ProductDetailPage from '../../components/ecommerce/ProductDetailPage';
import { useAddToCart } from '../../hooks/useAddToCart';
import type { Product, ProductVariant } from '../../types/product';
import type { Review } from '../../components/ecommerce/ReviewList';
import type { Comment } from '../../components/ecommerce/CommentSection';

import type { SectionListItem } from '../../types/sections';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
  frequentlyBoughtTogether?: Product[];
  recommendedProducts?: Product[];
  trendingProducts?: Product[];
  reviews?: Review[];
  comments?: Comment[];
  sections?: SectionListItem[];
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts = [],
  frequentlyBoughtTogether = [],
  recommendedProducts = [],
  trendingProducts = [],
  reviews = [],
  comments = [],
  sections = [],
}) => {
  const { addToCart } = useAddToCart();

  const handleAddToCart = (product: Product, quantity?: number, variant?: ProductVariant | null): void => {
    addToCart({ product, quantity, variant }).catch(error => {
      console.error('Failed to add to cart:', error);
    });
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
      sections={sections}
    />
  );
};

export default ProductDetailClient;

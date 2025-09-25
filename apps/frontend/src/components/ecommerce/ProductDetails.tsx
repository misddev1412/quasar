'use client';
import React, { useState } from 'react';
import { Button, Card, Divider, Tabs, Tab, Image } from '@heroui/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product } from './ProductCard';
import { PriceDisplay } from './PriceDisplay';
import { Rating } from './Rating';
import { AddToCartButton } from './AddToCartButton';
import { ProductGallery } from './ProductGallery';
import { ProductVariants } from './ProductVariants';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';

interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
  onAddToCart?: (product: Product, quantity?: number) => void;
  onAddToWishlist?: (productId: string) => void;
  onReviewSubmit?: (review: { rating: number; title: string; comment: string }) => void;
  loading?: boolean;
  className?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  relatedProducts = [],
  onAddToCart,
  onAddToWishlist,
  onReviewSubmit,
  loading = false,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][0] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

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
    brand,
    variants,
  } = product;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantSelect = (variant: Product['variants'][0]) => {
    setSelectedVariant(variant);
    // Reset quantity when variant changes
    setQuantity(1);
  };

  const handleAddToCart = (product: Product, qty?: number) => {
    if (onAddToCart) {
      onAddToCart(product, qty || quantity);
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(id);
    }
  };

  const handleReviewSubmit = (review: { rating: number; title: string; comment: string }) => {
    if (onReviewSubmit) {
      onReviewSubmit(review);
    }
  };

  const currentPrice =
    selectedVariant && selectedVariant.priceAdjustment
      ? price + selectedVariant.priceAdjustment
      : price;

  const currentOriginalPrice = originalPrice
    ? selectedVariant && selectedVariant.priceAdjustment
      ? originalPrice + selectedVariant.priceAdjustment
      : originalPrice
    : undefined;

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <div>
          <ProductGallery
            images={images}
            selectedImageIndex={selectedImageIndex}
            onImageSelect={setSelectedImageIndex}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-500">
              Home
            </Link>
            <span className="mx-2">/</span>
            {category && (
              <>
                <Link
                  href={category?.slug ? `/categories/${category.slug}` : '#'}
                  className="hover:text-primary-500"
                >
                  {category.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-900">{name}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>

          {/* Brand */}
          {brand && (
            <div>
              <span className="text-sm text-gray-500">Brand: </span>
              <Link
                href={brand?.slug ? `/brands/${brand.slug}` : '#'}
                className="text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                {brand.name}
              </Link>
            </div>
          )}

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-2">
              <Rating value={rating} readonly />
              {reviewCount && (
                <span className="text-sm text-gray-500">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div>
            <PriceDisplay
              price={currentPrice}
              originalPrice={currentOriginalPrice}
              discountPercentage={discountPercentage}
              size="lg"
            />
          </div>

          {/* Stock Status */}
          <div>
            {inStock ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Product Variants */}
          {variants && variants.length > 0 && (
            <ProductVariants
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantSelect={handleVariantSelect}
            />
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => handleQuantityChange(quantity - 1)}
                  isDisabled={quantity <= 1}
                >
                  <span className="text-lg">-</span>
                </Button>
                <span className="mx-4 w-8 text-center">{quantity}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => handleQuantityChange(quantity + 1)}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <AddToCartButton
                product={product}
                quantity={quantity}
                onAddToCart={handleAddToCart}
                size="lg"
                fullWidth
              />

              <Button
                isIconOnly
                size="lg"
                variant="flat"
                color="danger"
                onPress={handleAddToWishlist}
              >
                <span className="text-xl">❤️</span>
              </Button>
            </div>
          </div>

          {/* Product Features */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Premium quality materials</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>30-day money-back guarantee</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Free shipping on orders over $50</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>1-year warranty included</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          className="mb-6"
        >
          <Tab key="description" title="Description">
            <Card className="p-6">
              <div className="prose max-w-none">
                <p>{description}</p>
                {/* Additional product details can be added here */}
              </div>
            </Card>
          </Tab>

          <Tab key="specifications" title="Specifications">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">General</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Brand:</div>
                    <div>{brand?.name || 'N/A'}</div>
                    <div className="text-gray-500">Category:</div>
                    <div>{category?.name || 'N/A'}</div>
                    <div className="text-gray-500">Availability:</div>
                    <div>{inStock ? 'In Stock' : 'Out of Stock'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Dimensions</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Weight:</div>
                    <div>1.5 lbs</div>
                    <div className="text-gray-500">Height:</div>
                    <div>8 inches</div>
                    <div className="text-gray-500">Width:</div>
                    <div>6 inches</div>
                    <div className="text-gray-500">Depth:</div>
                    <div>2 inches</div>
                  </div>
                </div>
              </div>
            </Card>
          </Tab>

          <Tab key="reviews" title={`Reviews (${reviewCount || 0})`}>
            <div className="space-y-6">
              <ReviewList productId={id} />
              <ReviewForm onSubmit={handleReviewSubmit} />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onWishlistToggle={onAddToWishlist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

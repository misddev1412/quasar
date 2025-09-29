'use client';

import React, { useRef } from 'react';
import { trpcClient } from '../../utils/trpc';
import { Button } from '@heroui/react';

interface ProductDetailClientProps {
  slug: string;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ slug }) => {
  const [productData, setProductData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  const mountedRef = useRef(true);

  React.useEffect(() => {
    if (!mountedRef.current) return;

    const fetchProduct = async () => {
      if (!slug || !mountedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await trpcClient.clientProducts.getProductBySlug.query({ slug } as any);
        if (mountedRef.current) {
          setProductData(response);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err as any);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mountedRef.current = false;
    };
  }, [slug]);

  const product = productData?.data.json.product;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-4">Error loading product</div>
        <p className="text-gray-600 dark:text-gray-300">Please try again later.</p>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg font-medium mb-4">Product not found</div>
        <p className="text-gray-600 dark:text-gray-300">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Handle add to cart
  const handleAddToCart = () => {
    console.log('Adding to cart:', product);
    // Implement add to cart logic here
  };

  // Get primary image
  const primaryImage = product.media?.find((m: any) => m.isPrimary)?.url ||
                      product.media?.find((m: any) => m.isImage)?.url ||
                      '/placeholder-product.jpg';

  // Get price range if variants exist
  const priceRange = product.variants && product.variants.length > 0
    ? {
        min: Math.min(...product.variants.map((v: any) => v.price)),
        max: Math.max(...product.variants.map((v: any) => v.price)),
      }
    : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Additional images */}
          {product.media && product.media.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.media
                .filter((m: any) => m.isImage)
                .slice(0, 4)
                .map((media: any, index: number) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                    <img
                      src={media.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Brand: <span className="font-medium">{product.brand.name}</span>
              </p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            {priceRange ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600">
                    ${priceRange.min.toFixed(2)}
                  </span>
                  {priceRange.min !== priceRange.max && (
                    <span className="text-lg text-gray-500">
                      - ${priceRange.max.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Prices vary by variant
                </p>
              </>
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                ${(product.variants?.[0]?.price || 0).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category: any) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Availability
            </h3>
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-2">
                {product.variants.map((variant: any) => (
                  <div key={variant.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {variant.name || variant.sku}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        variant.stockQuantity > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {variant.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                No variants available
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              onPress={handleAddToCart}
              isDisabled={!product.variants?.some((v: any) => v.stockQuantity > 0)}
            >
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3"
            >
              Add to Wishlist
            </Button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {product.warranty && (
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Warranty:</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    {product.warranty.name} ({product.warranty.duration} months)
                  </span>
                </div>
              )}
              {product.supplier && (
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Supplier:</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    {product.supplier.name}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">
                  {product.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Featured:</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">
                  {product.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailClient;
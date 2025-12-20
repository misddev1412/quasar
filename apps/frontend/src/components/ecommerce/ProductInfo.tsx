'use client';

import React from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FiHeart, FiHeart as FiHeartOutline } from 'react-icons/fi';
import PriceDisplay from './PriceDisplay';
import Rating from '../common/Rating';
import Input from '../common/Input';
import AttributeSelector from './AttributeSelector';
import VariantSelector from './VariantSelector';
import type { Product, ProductVariant } from '../../types/product';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  quantity: number;
  wishlistAdded: boolean;
  averageRating: number;
  reviewCount: number;
  variantAttributes: any[];
  selectedAttributes: Record<string, string>;
  attributeIndexMap: Map<string, number>;
  hasAttributeBasedVariants: boolean;
  isOptionDisabled: (attributeId: string, valueId: string) => boolean;
  onQuantityChange: (quantity: number) => void;
  onVariantSelect: (variant: ProductVariant) => void;
  onAttributeSelect: (attributeId: string, valueId: string) => void;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onScrollToReviews: () => void;
}

const layout = {
  infoCard: 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-sm p-6 lg:p-8 space-y-8',
} as const;

const typography = {
  pageTitle: 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white',
  meta: 'text-sm text-gray-500 dark:text-gray-400',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300'
} as const;

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  quantity,
  wishlistAdded,
  averageRating,
  reviewCount,
  variantAttributes,
  selectedAttributes,
  attributeIndexMap,
  hasAttributeBasedVariants,
  isOptionDisabled,
  onQuantityChange,
  onVariantSelect,
  onAttributeSelect,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onScrollToReviews,
}) => {
  const t = useTranslations('product.detail');
  const { name, brand, sku, status, isActive, variants, tags } = product;
  const { formatCurrency } = useCurrencyFormatter({ currency: product.currencyCode });

  const currentPrice = selectedVariant?.price ||
    (variants && variants.length > 0 ? Math.min(...variants.map(v => v.price)) : product.price);

  const variantOriginalPrice = variants && variants.length > 0
    ? variants.find(variant => typeof variant.compareAtPrice === 'number')?.compareAtPrice
    : undefined;

  const originalPrice = selectedVariant?.compareAtPrice
    ?? variantOriginalPrice
    ?? product.compareAtPrice
    ?? undefined;

  const inStock = isActive && status === 'ACTIVE';

  return (
    <Card className={layout.infoCard}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <h1 className={typography.pageTitle}>{name}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            {brand && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Brand</span>
                <span className="text-gray-600 dark:text-gray-400">{(brand as any).name}</span>
              </div>
            )}
            {sku && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">SKU</span>
                <span className="font-mono text-xs md:text-sm text-gray-500 dark:text-gray-400">{sku}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          isIconOnly
          variant="flat"
          size="md"
          color={wishlistAdded ? 'danger' : 'default'}
          className="flex-shrink-0"
          onPress={onWishlistToggle}
        >
          {wishlistAdded ? <FiHeart className="text-2xl text-red-500" /> : <FiHeartOutline className="text-2xl" />}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Rating value={averageRating} readOnly size="md" />
          <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
        </div>
        <span className={typography.meta}>({reviewCount} reviews)</span>
        {reviewCount > 0 && (
          <Button variant="flat" size="sm" onPress={onScrollToReviews}>
            View Reviews
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <PriceDisplay
          price={currentPrice}
          originalPrice={originalPrice}
          size="lg"
          className="text-3xl md:text-4xl"
          currency={product.currencyCode}
        />
        {variants && variants.length > 1 && (
          <p className={typography.meta}>
            Starting from {formatCurrency(Math.min(...variants.map(v => v.price)))}
          </p>
        )}
      </div>

      <div>
        {inStock ? (
          <div className="flex items-center gap-2 text-green-600">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-sm font-medium">In Stock</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {(variantAttributes.length > 0 || (variants && variants.length > 0)) && (
        <div className="space-y-6">
          {variantAttributes.length > 0
            ? variantAttributes.map((attribute) => {
                const attributeIndex = attributeIndexMap.get(attribute.attributeId) ?? 0;
                const previousAttributeId = attributeIndex > 0
                  ? variantAttributes[attributeIndex - 1]?.attributeId
                  : undefined;
                const hasPreviousSelection = previousAttributeId
                  ? Boolean(selectedAttributes[previousAttributeId])
                  : true;
                const isActiveStep = attributeIndex === 0 || hasPreviousSelection;
                const selectedValue = selectedAttributes[attribute.attributeId];

                return (
                  <AttributeSelector
                    key={attribute.attributeId}
                    attribute={attribute}
                    selectedValue={selectedValue}
                    disabled={!isActiveStep}
                    isActiveStep={isActiveStep}
                    isOptionDisabled={(valueId) =>
                      isOptionDisabled(attribute.attributeId, valueId)
                    }
                    onSelect={onAttributeSelect}
                  />
                );
              })
            : (
              <VariantSelector
                variants={variants || []}
                selectedVariant={selectedVariant}
                onVariantSelect={onVariantSelect}
              />
            )}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <span className={typography.label}>Quantity</span>
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-full shadow-sm"
              onPress={() => onQuantityChange(quantity - 1)}
              isDisabled={quantity <= 1}
            >
              <span className="text-base font-semibold">−</span>
            </Button>
            <div className="w-24">
              <Input
                type="number"
                value={String(quantity)}
                onValueChange={(value) => {
                  const parsed = Number(value);
                  if (Number.isNaN(parsed)) {
                    return;
                  }
                  onQuantityChange(parsed);
                }}
                min={1}
                max={99}
                size="md"
                variant="bordered"
                inputMode="numeric"
                classNames={{
                  inputWrapper: 'h-10 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/70',
                  input: 'text-center font-semibold text-base'
                }}
              />
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-full shadow-sm"
              onPress={() => onQuantityChange(quantity + 1)}
              isDisabled={quantity >= 99}
            >
              <span className="text-base font-semibold">+</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            color="primary"
            className="flex-1 font-semibold"
            onPress={onAddToCart}
            isDisabled={!inStock || (hasAttributeBasedVariants && !selectedVariant)}
          >
            {!inStock ? t('actions.outOfStock') : t('actions.addToCart')}
          </Button>

          <Button
            color="secondary"
            className="flex-1 font-semibold"
            onPress={onBuyNow}
            isDisabled={!inStock || (hasAttributeBasedVariants && !selectedVariant)}
          >
            {t('actions.buyNow')}
          </Button>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('tags.title')}</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={(tag as any).id}
                size="sm"
                variant="flat"
                className="bg-gray-100 dark:bg-gray-800"
              >
                {(tag as any).name}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductInfo;

'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from '@heroui/react';
import { FiShoppingCart, FiCheck, FiLoader } from 'react-icons/fi';
import type { Product, ProductVariant } from '../../types/product';
import { useCart } from '../../contexts/CartContext';
import VariantSelectionModal from './VariantSelectionModal';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useTranslation } from 'react-i18next';
import { useAddToCartButtonConfig } from '../../hooks/useAddToCartButtonConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { UnifiedIcon } from '../common/UnifiedIcon';

interface AddToCartButtonProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number) => void | boolean | Promise<void | boolean>;
  onVariantAddToCart?: (variant: ProductVariant, quantity?: number) => void | boolean | Promise<void | boolean>;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  showQuantitySelector?: boolean;
  iconOnly?: boolean;
  useInternalVariantSelection?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  onAddToCart,
  onVariantAddToCart,
  quantity = 1,
  size = 'md',
  variant = 'solid',
  color = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
  showQuantitySelector = false,
  iconOnly = false,
  useInternalVariantSelection = true,
}) => {
  const { isInCart, getItemQuantity, canAddToCart } = useCart();
  const { addToCart, isAdding } = useAddToCart();
  const { t } = useTranslation();
  const { config: buttonConfig } = useAddToCartButtonConfig();
  const { theme } = useTheme();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDelegatedMode = !useInternalVariantSelection;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const stockQuantity = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, variant) => total + (Number(variant.stockQuantity) || 0), 0);
    }
    return product.isActive ? 1 : 0;
  }, [product]);

  const hasPurchasableVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return stockQuantity > 0;
    }

    return product.variants.some(variant => {
      const available = variant.stockQuantity ?? 0;
      return available > 0 || variant.allowBackorders || !variant.trackInventory;
    });
  }, [product, stockQuantity]);

  const currentQuantity = getItemQuantity(product.id);
  const isAlreadyInCart = isInCart(product.id);
  const canAdd = canAddToCart(product.id, selectedQuantity);
  const isLoading = isDelegatedMode ? isProcessing : isAdding;
  const isOutOfStock = product.variants && product.variants.length > 0 ? !hasPurchasableVariant : stockQuantity <= 0;
  const isDisabled = disabled || isOutOfStock || isLoading || !canAdd;

  const resetAddedIndicator = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsAdded(false), 2000);
  };

  const markAsAdded = () => {
    if (!mountedRef.current) {
      return;
    }
    setIsAdded(true);
    resetAddedIndicator();
  };

  const handleDelegatedAddToCart = async () => {
    if (!onAddToCart) {
      console.warn('AddToCartButton expects an onAddToCart handler when useInternalVariantSelection is false.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await Promise.resolve(onAddToCart(product, selectedQuantity));

      if (mountedRef.current && result !== false) {
        markAsAdded();
      }
    } catch (error) {
      console.error('Failed to add item via delegated handler', error);
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleAddToCart = async () => {
    if (isDelegatedMode) {
      await handleDelegatedAddToCart();
      return;
    }

    if (product.variants && product.variants.length > 0) {
      const requiresVariantSelection = product.variants.some((variant) =>
        Array.isArray(variant.variantItems) && variant.variantItems.length > 0
      );

      if (requiresVariantSelection) {
        if (useInternalVariantSelection) {
          setShowVariantModal(true);
        } else if (onAddToCart) {
          await Promise.resolve(onAddToCart(product, selectedQuantity));
        }
        return;
      }

      const defaultVariant = product.variants.find((variant) => (variant.stockQuantity ?? 0) > 0) || product.variants[0];

      if (defaultVariant) {
        const result = await addToCart({ product, quantity: selectedQuantity, variant: defaultVariant });

        if (!mountedRef.current) {
          return;
        }

        if (result.success) {
          if (onVariantAddToCart) {
            const callbackResult = await Promise.resolve(onVariantAddToCart(defaultVariant, selectedQuantity));
            if (callbackResult === false) {
              return;
            }
          }

          if (onAddToCart) {
            const callbackResult = await Promise.resolve(onAddToCart(product, selectedQuantity));
            if (callbackResult === false) {
              return;
            }
          }

          markAsAdded();
        }
      }

      return;
    }

    if (stockQuantity <= 0 || disabled || !mountedRef.current) {
      return;
    }

    const result = await addToCart({ product, quantity: selectedQuantity });

    if (!mountedRef.current) {
      return;
    }

    if (result.success) {
      if (onAddToCart) {
        const callbackResult = await Promise.resolve(onAddToCart(product, selectedQuantity));
        if (callbackResult === false) {
          return;
        }
      }

      markAsAdded();
    }
  };

  const handleVariantAdded = async (variant: ProductVariant, addedQuantity: number) => {
    if (onVariantAddToCart) {
      const callbackResult = await Promise.resolve(onVariantAddToCart(variant, addedQuantity));
      if (callbackResult === false) {
        return;
      }
    }

    if (!mountedRef.current) {
      return;
    }

    markAsAdded();
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuantity(parseInt(event.target.value, 10));
  };

  // Apply config styles
  const backgroundColor = theme === 'dark' ? buttonConfig.backgroundColor.dark : buttonConfig.backgroundColor.light;
  const textColor = theme === 'dark' ? buttonConfig.textColor.dark : buttonConfig.textColor.light;
  const textTransformClass = buttonConfig.textTransform === 'uppercase' 
    ? 'uppercase' 
    : buttonConfig.textTransform === 'capitalize' 
    ? 'capitalize' 
    : 'normal-case';
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || undefined,
    color: textColor || undefined,
  };

  const renderIcon = () => {
    if (!buttonConfig.icon) return null;
    return <UnifiedIcon icon={buttonConfig.icon} variant="button" size={18} color={textColor} />;
  };

  if (iconOnly) {
    return (
      <Button
        isIconOnly
        size={size}
        variant={variant}
        color={color}
        className={className}
        style={buttonStyle}
        onPress={handleAddToCart}
        isLoading={isLoading}
        isDisabled={isDisabled}
        aria-label={t('ecommerce.cart.addAriaLabel', 'Add to cart')}
      >
        {isLoading ? (
          <FiLoader className="animate-spin text-lg" />
        ) : isAdded ? (
          <FiCheck className="text-lg text-green-500" />
        ) : buttonConfig.icon ? (
          renderIcon()
        ) : (
          <FiShoppingCart className="text-lg" />
        )}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {showQuantitySelector && (
        <select
          value={selectedQuantity}
          onChange={handleQuantityChange}
          className={`border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'h-9'
          }`}
          disabled={isDisabled}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
      )}

      <Button
        size={size}
        variant={variant}
        color={color}
        className={`${className} ${fullWidth ? 'flex-1' : ''} ${textTransformClass}`}
        style={buttonStyle}
        onPress={handleAddToCart}
        isLoading={isLoading}
        isDisabled={isDisabled}
        startContent={
          !isLoading && !iconOnly && (
            isAdded ? (
              <FiCheck className="text-lg text-green-500" />
            ) : buttonConfig.icon ? (
              renderIcon()
            ) : (
              <FiShoppingCart className="text-lg" />
            )
          )
        }
      >
        {isLoading ? (
          <span>{t('ecommerce.cart.adding', 'Adding...')}</span>
        ) : isAdded ? (
          <div className="flex items-center gap-2">
            <span>{t('ecommerce.cart.added', 'Added!')}</span>
          </div>
        ) : isOutOfStock ? (
          t('ecommerce.cart.outOfStock', 'Out of Stock')
        ) : product.variants && product.variants.length > 0 ? (
          <div className="flex items-center gap-2">
            <span>{t('ecommerce.cart.selectOptions', 'Select Options')}</span>
          </div>
        ) : isAlreadyInCart ? (
          <div className="flex items-center gap-2">
            <span>{t('ecommerce.cart.inCart', { count: currentQuantity || 0 })}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{t('ecommerce.cart.add', 'Add to Cart')}</span>
          </div>
        )}
      </Button>

      {useInternalVariantSelection && (
        <VariantSelectionModal
          isOpen={showVariantModal}
          onOpenChange={setShowVariantModal}
          product={product}
          onVariantAdded={handleVariantAdded}
        />
      )}
    </div>
  );
};

export default AddToCartButton;

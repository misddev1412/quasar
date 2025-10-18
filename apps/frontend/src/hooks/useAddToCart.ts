import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import type { Product, ProductVariant } from '../types/product';

interface AddToCartParams {
  product: Product;
  quantity?: number;
  variant?: ProductVariant | null;
  suppressSuccessToast?: boolean;
}

interface AddToCartResult {
  success: boolean;
  error?: Error;
}

export const useAddToCart = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addToCart = useCallback(async ({
    product,
    quantity = 1,
    variant = null,
    suppressSuccessToast = false,
  }: AddToCartParams): Promise<AddToCartResult> => {
    if (!product?.id) {
      const error = new Error('Product information is missing.');
      showToast({
        type: 'error',
        title: 'Failed to add to cart',
        message: error.message,
      });
      return { success: false, error };
    }

    if (mountedRef.current) {
      setIsAdding(true);
    }

    try {
      await addItem(product.id, quantity, variant?.id);

      if (!suppressSuccessToast) {
        const variantLabel = variant?.name ? ` (${variant.name})` : '';
        showToast({
          type: 'success',
          title: 'Added to cart!',
          message: `${product.name}${variantLabel} has been added to your cart.`,
        });
      }

      return { success: true };
    } catch (unknownError) {
      const error =
        unknownError instanceof Error
          ? unknownError
          : new Error('An error occurred while adding the item to cart.');

      showToast({
        type: 'error',
        title: 'Failed to add to cart',
        message: error.message,
      });

      return { success: false, error };
    } finally {
      if (mountedRef.current) {
        setIsAdding(false);
      }
    }
  }, [addItem, showToast]);

  return {
    addToCart,
    isAdding,
  };
};

export type UseAddToCart = ReturnType<typeof useAddToCart>;

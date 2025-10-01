'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { CartContextType, CartItem, CartItemDetails, CartSummary, CartTotals, CartValidation, CartStorage, CartEvent, ShippingOption, AppliedDiscount, DiscountCode } from '../types/cart';
import { Product, ProductVariant } from '../types/product';

const CART_STORAGE_KEY = 'shopping-cart';
const CART_VERSION = '1.0.0';

interface CartState {
  items: CartItemDetails[];
  isLoading: boolean;
  isOpen: boolean;
  shippingOption?: ShippingOption;
  appliedDiscounts: AppliedDiscount[];
  validation: CartValidation;
  lastError?: string;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_IS_OPEN'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItemDetails[] }
  | { type: 'ADD_ITEM'; payload: CartItemDetails }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SHIPPING_OPTION'; payload: ShippingOption }
  | { type: 'SET_APPLIED_DISCOUNTS'; payload: AppliedDiscount[] }
  | { type: 'SET_VALIDATION'; payload: CartValidation }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  isLoading: false,
  isOpen: false,
  appliedDiscounts: [],
  validation: {
    isValid: true,
    errors: [],
    warnings: [],
  },
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_IS_OPEN':
      return { ...state, isOpen: action.payload };

    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity, updatedAt: new Date() }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        appliedDiscounts: [],
        shippingOption: undefined,
      };

    case 'SET_SHIPPING_OPTION':
      return { ...state, shippingOption: action.payload };

    case 'SET_APPLIED_DISCOUNTS':
      return { ...state, appliedDiscounts: action.payload };

    case 'SET_VALIDATION':
      return { ...state, validation: action.payload };

    case 'SET_ERROR':
      return { ...state, lastError: action.payload };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
  currency?: string;
  taxRate?: number;
  defaultShippingCost?: number;
  maxQuantity?: number;
}

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  currency = 'USD',
  taxRate = 0.08,
  defaultShippingCost = 5.99,
  maxQuantity = 99,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const eventListeners = useRef<((event: CartEvent) => void)[]>([]);

  // Calculate cart totals
  const calculateTotals = useCallback((): CartTotals => {
    const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = state.shippingOption?.cost || (state.items.length > 0 ? defaultShippingCost : 0);
    const tax = subtotal * taxRate;
    const discount = state.appliedDiscounts.reduce((sum, discount) => sum + discount.discount, 0);
    const total = Math.max(0, subtotal + shipping + tax - discount);

    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency,
    };
  }, [state.items, state.shippingOption, state.appliedDiscounts, taxRate, defaultShippingCost, currency]);

  // Calculate cart summary
  const calculateSummary = useCallback((): CartSummary => {
    const itemCount = state.items.length;
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totals = calculateTotals();
    const isEmpty = itemCount === 0;
    const hasOutOfStockItems = state.items.some(item => !item.inStock);
    const hasLowStockItems = state.items.some(item => item.lowStock);
    const isValid = !hasOutOfStockItems && state.validation.isValid;

    return {
      itemCount,
      totalItems,
      totals,
      items: state.items,
      isEmpty,
      hasOutOfStockItems,
      hasLowStockItems,
      isValid,
    };
  }, [state.items, state.validation, calculateTotals]);

  // Load cart from localStorage
  const loadCartFromStorage = useCallback(async () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const cartStorage: CartStorage = JSON.parse(stored);

        // Check version compatibility
        if (cartStorage.version !== CART_VERSION) {
          localStorage.removeItem(CART_STORAGE_KEY);
          return;
        }

        // Load items and restore state
        dispatch({
          type: 'SET_ITEMS',
          payload: await enrichCartItems(cartStorage.items),
        });

        if (cartStorage.shippingOption) {
          dispatch({
            type: 'SET_SHIPPING_OPTION',
            payload: cartStorage.shippingOption,
          });
        }

        if (cartStorage.appliedDiscounts) {
          dispatch({
            type: 'SET_APPLIED_DISCOUNTS',
            payload: cartStorage.appliedDiscounts,
          });
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Save cart to localStorage
  const saveCartToStorage = useCallback(() => {
    try {
      const cartStorage: CartStorage = {
        items: state.items.map(({ id, productId, variantId, quantity, addedAt, updatedAt }) => ({
          id,
          productId,
          variantId,
          quantity,
          addedAt,
          updatedAt,
        })),
        shippingOption: state.shippingOption,
        appliedDiscounts: state.appliedDiscounts,
        lastUpdated: new Date(),
        version: CART_VERSION,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartStorage));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [state]);

  // Enrich cart items with product details
  const enrichCartItems = async (items: CartItem[]): Promise<CartItemDetails[]> => {
    // In a real app, this would fetch from API
    // For now, we'll return basic details
    return items.map(item => ({
      ...item,
      product: {} as Product, // Would be fetched from API
      variant: item.variantId ? {} as ProductVariant : undefined,
      unitPrice: 0, // Would be calculated from product/variant
      totalPrice: 0, // Would be calculated
      inStock: true, // Would be checked from product/variant
      lowStock: false, // Would be checked from product/variant
      maxQuantity, // Would be determined by product/variant stock
    }));
  };

  // Emit cart event
  const emitEvent = useCallback((type: CartEvent['type'], data: unknown) => {
    const event: CartEvent = { type, data, timestamp: new Date() };
    eventListeners.current.forEach(listener => listener(event));
  }, []);

  // Validate cart
  const validateCart = useCallback(async (): Promise<CartValidation> => {
    const errors: CartValidation['errors'] = [];
    const warnings: CartValidation['warnings'] = [];

    state.items.forEach(item => {
      if (!item.inStock) {
        errors.push({
          type: 'out_of_stock',
          itemId: item.id,
          message: `${item.product.name} is out of stock`,
          severity: 'error',
        });
      }

      if (item.lowStock) {
        warnings.push({
          type: 'low_stock',
          itemId: item.id,
          message: `Only ${item.maxQuantity} ${item.product.name} left in stock`,
        });
      }

      if (item.quantity > item.maxQuantity) {
        errors.push({
          type: 'quantity_limit',
          itemId: item.id,
          message: `Quantity exceeds available stock for ${item.product.name}`,
          severity: 'error',
        });
      }
    });

    const validation = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    dispatch({ type: 'SET_VALIDATION', payload: validation });
    return validation;
  }, [state.items]);

  // Add item to cart
  const addItem = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: undefined });

    try {
      // In a real app, this would validate against inventory and fetch product details
      const existingItem = state.items.find(item =>
        item.productId === productId && item.variantId === variantId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > existingItem.maxQuantity) {
          throw new Error('Quantity exceeds available stock');
        }
        dispatch({
          type: 'UPDATE_QUANTITY',
          payload: { itemId: existingItem.id, quantity: newQuantity },
        });
      } else {
        // Create new cart item
        const newItem: CartItemDetails = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          variantId,
          quantity,
          addedAt: new Date(),
          updatedAt: new Date(),
          product: {} as Product, // Would be fetched from API
          variant: variantId ? {} as ProductVariant : undefined,
          unitPrice: 0, // Would be calculated from product/variant
          totalPrice: 0, // Would be calculated
          inStock: true, // Would be checked from product/variant
          lowStock: false, // Would be checked from product/variant
          maxQuantity, // Would be determined by product/variant stock
        };
        dispatch({ type: 'ADD_ITEM', payload: newItem });
      }

      emitEvent('item_added', { productId, quantity, variantId });
      await validateCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items, validateCart, emitEvent]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      emitEvent('item_removed', { itemId });
      await validateCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [validateCart, emitEvent]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const item = state.items.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      if (quantity > item.maxQuantity) {
        throw new Error('Quantity exceeds available stock');
      }

      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { itemId, quantity },
      });
      emitEvent('quantity_updated', { itemId, quantity });
      await validateCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update quantity';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items, removeItem, validateCart, emitEvent]);

  // Clear cart
  const clearCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      dispatch({ type: 'CLEAR_CART' });
      emitEvent('cart_cleared', {});
      await validateCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [validateCart, emitEvent]);

  // Apply discount code
  const applyDiscountCode = useCallback(async (code: string): Promise<boolean> => {
    // In a real app, this would validate the discount code with an API
    try {
      // Mock validation - replace with actual API call
      const discountCode: DiscountCode = {
        id: 'discount_1',
        code: code.toUpperCase(),
        type: 'percentage',
        value: 10, // 10% discount
        minimumAmount: 50,
      };

      if (calculateTotals().subtotal < (discountCode.minimumAmount || 0)) {
        throw new Error(`Minimum order of $${discountCode.minimumAmount} required`);
      }

      const discountAmount = discountCode.type === 'percentage'
        ? calculateTotals().subtotal * (discountCode.value / 100)
        : discountCode.value;

      const newDiscount: AppliedDiscount = {
        code: discountCode.code,
        discount: discountAmount,
        type: discountCode.type,
        description: `${discountCode.value}${discountCode.type === 'percentage' ? '%' : ' off'} discount`,
      };

      dispatch({
        type: 'SET_APPLIED_DISCOUNTS',
        payload: [...state.appliedDiscounts, newDiscount],
      });

      emitEvent('discount_applied', discountCode);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid discount code';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, [state.appliedDiscounts, calculateTotals, emitEvent]);

  // Remove discount
  const removeDiscount = useCallback((code: string) => {
    dispatch({
      type: 'SET_APPLIED_DISCOUNTS',
      payload: state.appliedDiscounts.filter(d => d.code !== code),
    });
    emitEvent('discount_removed', { code });
  }, [state.appliedDiscounts, emitEvent]);

  // Set shipping option
  const setShippingOption = useCallback((option: ShippingOption) => {
    dispatch({ type: 'SET_SHIPPING_OPTION', payload: option });
  }, []);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    await loadCartFromStorage();
    await validateCart();
  }, [loadCartFromStorage, validateCart]);

  // Cart UI controls
  const openCart = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: true });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: false });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'SET_IS_OPEN', payload: !state.isOpen });
  }, [state.isOpen]);

  // Utility functions
  const getItemQuantity = useCallback((productId: string, variantId?: string): number => {
    const item = state.items.find(item =>
      item.productId === productId && item.variantId === variantId
    );
    return item?.quantity || 0;
  }, [state.items]);

  const isInCart = useCallback((productId: string, variantId?: string): boolean => {
    return state.items.some(item =>
      item.productId === productId && item.variantId === variantId
    );
  }, [state.items]);

  const canAddToCart = useCallback((productId: string, quantity: number, variantId?: string): boolean => {
    const existingItem = state.items.find(item =>
      item.productId === productId && item.variantId === variantId
    );
    if (existingItem) {
      return existingItem.quantity + quantity <= existingItem.maxQuantity;
    }
    return true;
  }, [state.items]);

  // Initialize cart
  useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCartToStorage();
  }, [state, saveCartToStorage]);

  // Validate cart whenever items change
  useEffect(() => {
    if (state.items.length > 0) {
      validateCart();
    }
  }, [state.items, validateCart]);

  const contextValue: CartContextType = {
    // State
    items: state.items,
    summary: calculateSummary(),
    isLoading: state.isLoading,
    isOpen: state.isOpen,
    shippingOption: state.shippingOption,
    appliedDiscounts: state.appliedDiscounts,
    validation: state.validation,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscountCode,
    removeDiscount,
    setShippingOption,
    validateCart,
    refreshCart,
    openCart,
    closeCart,
    toggleCart,

    // Utilities
    getItemQuantity,
    isInCart,
    canAddToCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
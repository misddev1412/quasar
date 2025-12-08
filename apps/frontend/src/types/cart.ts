import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface CartItemDetails extends CartItem {
  product: Product;
  variant?: ProductVariant;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
  lowStock: boolean;
  maxQuantity: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

export interface CartSummary {
  itemCount: number;
  totalItems: number;
  totals: CartTotals;
  items: CartItemDetails[];
  isEmpty: boolean;
  hasOutOfStockItems: boolean;
  hasLowStockItems: boolean;
  isValid: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  type: 'standard' | 'express' | 'overnight';
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  applicableProducts?: string[];
  expiresAt?: Date;
  usageLimit?: number;
  usedCount?: number;
}

export interface AppliedDiscount {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

export interface CartValidation {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

export interface CartValidationError {
  type: 'out_of_stock' | 'quantity_limit' | 'product_unavailable' | 'variant_unavailable';
  itemId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CartValidationWarning {
  type: 'low_stock' | 'price_changed' | 'discount_expiring';
  itemId?: string;
  message: string;
}

export interface CartContextType {
  // State
  items: CartItemDetails[];
  summary: CartSummary;
  isLoading: boolean;
  isOpen: boolean;
  shippingOption?: ShippingOption;
  appliedDiscounts: AppliedDiscount[];
  validation: CartValidation;

  // Actions
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscount: (code: string) => void;
  setShippingOption: (option: ShippingOption) => void;
  validateCart: () => Promise<CartValidation>;
  refreshCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Utilities
  getItemQuantity: (productId: string, variantId?: string) => number;
  isInCart: (productId: string, variantId?: string) => boolean;
  canAddToCart: (productId: string, quantity: number, variantId?: string) => boolean;
}

export interface CartStorage {
  items: CartItem[];
  shippingOption?: ShippingOption;
  appliedDiscounts: AppliedDiscount[];
  lastUpdated: Date;
  version: string;
}

export interface CartEvent {
  type: 'item_added' | 'item_removed' | 'quantity_updated' | 'cart_cleared' | 'discount_applied' | 'discount_removed';
  data: unknown;
  timestamp: Date;
}
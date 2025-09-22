import React, { useState, useCallback, useMemo } from 'react';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiPackage } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Product } from '../../types/product';
import { Loading } from '../common/Loading';

export interface OrderItem {
  productId: string;
  productVariantId?: string;
  productName?: string; // Made optional since it can be auto-filled
  productSku?: string;
  variantName?: string;
  variantSku?: string;
  quantity: number;
  unitPrice?: number; // Made optional - will be auto-retrieved
  discountAmount?: number;
  taxAmount?: number;
  productImage?: string;
  productAttributes?: Record<string, string>;
  isDigital?: boolean;
  weight?: number;
  dimensions?: string;
  requiresShipping?: boolean;
  isGiftCard?: boolean;
  giftCardCode?: string;
  notes?: string;
  sortOrder?: number;
}

interface ProductSelectionSectionProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
}

export const ProductSelectionSection: React.FC<ProductSelectionSectionProps> = ({
  items,
  onItemsChange,
}) => {
  const { t } = useTranslationWithBackend();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products for selection
  const { data: productsData, isLoading: isLoadingProducts, error } = trpc.adminProducts.list.useQuery(
    {
      page: 1,
      limit: 20,
      search: debouncedSearchTerm || undefined,
      isActive: true,
    },
    {
      enabled: showProductSearch,
      retry: false,
    }
  );

  const products = (productsData as any)?.data?.items || [];

  const addProduct = useCallback(async (product: Product) => {
    // For now, let's add the product without auto-fetching price
    // The price will be automatically retrieved when the order is created
    const newItem: OrderItem = {
      productId: product.id,
      productVariantId: product.variants?.[0]?.id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      // Leave unitPrice undefined so it gets auto-filled on order creation
      discountAmount: 0,
      taxAmount: 0,
      productImage: product.media?.[0]?.url,
      isDigital: product.isDigital || false,
      requiresShipping: !product.isDigital,
      sortOrder: items.length,
    };

    onItemsChange([...items, newItem]);
    setShowProductSearch(false);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, [items, onItemsChange]);

  const updateItem = useCallback((index: number, updates: Partial<OrderItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const removeItem = useCallback((index: number) => {
    const filteredItems = items.filter((_, i) => i !== index);
    onItemsChange(filteredItems);
  }, [items, onItemsChange]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + ((item.unitPrice || 0) * item.quantity), 0);
  }, [items]);

  const totalDiscount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  }, [items]);

  const totalTax = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  }, [items]);

  const total = subtotal - totalDiscount + totalTax;

  return (
    <div className="space-y-6">
      {/* Add Product Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('admin.order_items')}
          </h3>
          <Button
            onClick={() => setShowProductSearch(true)}
            startIcon={<FiPlus className="w-4 h-4" />}
            variant="primary"
            size="sm"
          >
            {t('admin.add_product')}
          </Button>
        </div>

        {/* Product Search Modal */}
        {showProductSearch && (
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('admin.search_products')}</h4>
              <Button
                onClick={() => {
                  setShowProductSearch(false);
                  setSearchTerm('');
                  setDebouncedSearchTerm('');
                }}
                variant="ghost"
                size="sm"
              >
                {t('cancel')}
              </Button>
            </div>

            <FormInput
              id="productSearch"
              label=""
              name="productSearch"
              type="text"
              placeholder={t('admin.search_products_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FiSearch className="w-4 h-4" />}
              className="mb-3"
            />

            {isLoadingProducts ? (
              <Loading size="small" />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  {t('admin.error_loading_products') || 'Error loading products'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {error.message || t('admin.please_try_again_later')}
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {products.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {debouncedSearchTerm ? t('admin.no_products_found') : t('admin.start_typing_to_search')}
                  </p>
                ) : (
                  products.map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => addProduct(product)}
                    >
                      <div className="flex items-center space-x-3">
                        {product.media?.[0]?.url ? (
                          <img
                            src={product.media[0].url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.sku && `${t('admin.sku')}: ${product.sku}`}
                            {product.variants?.length > 0 && ` • ${product.variants.length} variant(s)`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FiPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Items List */}
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('admin.no_items_added')}</p>
            <p className="text-sm">{t('admin.click_add_product_to_start')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.productName || `Product ${item.productId}`}
                  </p>
                  {item.productSku && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.sku')}: {item.productSku}
                    </p>
                  )}
                  {item.variantName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.variant')}: {item.variantName}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                    variant="ghost"
                    size="sm"
                    disabled={item.quantity <= 1}
                  >
                    <FiMinus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    onClick={() => updateItem(index, { quantity: item.quantity + 1 })}
                    variant="ghost"
                    size="sm"
                  >
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>

                <FormInput
                  id={`unitPrice-${index}`}
                  label=""
                  name={`unitPrice-${index}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={(item.unitPrice || 0).toString()}
                  onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-24"
                  placeholder={item.unitPrice ? "" : "Auto"}
                />

                <div className="text-right min-w-[80px]">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${((item.unitPrice || 0) * item.quantity).toFixed(2)}
                  </p>
                  {!item.unitPrice && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Auto-calculated</p>
                  )}
                </div>

                <Button
                  onClick={() => removeItem(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Order Summary */}
      {items.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('admin.order_summary')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('admin.subtotal')}:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('admin.discount')}:</span>
                <span className="font-medium text-red-600">-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            {totalTax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('admin.tax')}:</span>
                <span className="font-medium">${totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-gray-100">{t('admin.total')}:</span>
                <span className="text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
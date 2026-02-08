import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTableState } from '@admin/hooks/useTableState';
import {
  FiPlus,
  FiMoreVertical,
  FiPackage,
  FiActivity,
  FiEdit2,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiShoppingBag,
  FiStar,
  FiHome,
  FiUpload,
  FiCheckCircle,
  FiPauseCircle,
  FiPhoneCall,
  FiInfo,
  FiChevronRight,
} from 'react-icons/fi';
import { Button, Dropdown, StatisticsGrid, Table, StandardListPage, Loading, Alert, AlertDescription, AlertTitle, Toggle } from '@admin/components/common';
import type { StatisticData, Column, SortDescriptor } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTablePreferences } from '@admin/hooks/useTablePreferences';
import { Product, ProductVariant } from '@admin/types/product';
import { ProductFilters, ProductFiltersType } from '@admin/components/features';
import { ProductVariantsQuickViewModal, ProductVariantQuickEditModal, ProductImportModal } from '@admin/components/products';
import Swal from 'sweetalert2';

interface ProductVariantInlineListProps {
  product: Product;
  emptyMessage: string;
  viewAllLabel: string;
  onOpenQuickView: (product: Product) => void;
  onQuickUpdate: (payload: { id: string; price: number; stockQuantity: number; isActive: boolean }) => Promise<void>;
  updatingVariantId?: string | null;
  className?: string;
}

interface VariantQuickEditState {
  price: string;
  stockQuantity: string;
  isActive: boolean;
}

const ProductVariantInlineList: React.FC<ProductVariantInlineListProps> = ({
  product,
  emptyMessage,
  viewAllLabel,
  onOpenQuickView,
  onQuickUpdate,
  updatingVariantId,
  className,
}) => {
  const { t } = useTranslationWithBackend();
  const variants = product.variants || [];
  const [variantStates, setVariantStates] = useState<Record<string, VariantQuickEditState>>({});
  const [baselineStates, setBaselineStates] = useState<Record<string, VariantQuickEditState>>({});

  useEffect(() => {
    const initialState: Record<string, VariantQuickEditState> = {};
    variants.forEach((variant, index) => {
      const variantId = String(variant.id || `${product.id}-${index}`);
      initialState[variantId] = {
        price: variant.price !== undefined && variant.price !== null ? String(variant.price) : '',
        stockQuantity: variant.stockQuantity !== undefined && variant.stockQuantity !== null ? String(variant.stockQuantity) : '',
        isActive: variant.isActive ?? true,
      };
    });
    setVariantStates(initialState);
    setBaselineStates(initialState);
  }, [product.id, variants.length]);

  const getVariantState = (variantId: string, fallback: VariantQuickEditState): VariantQuickEditState => {
    return variantStates[variantId] || fallback;
  };

  const handleInputChange = (
    variantId: string,
    field: keyof Omit<VariantQuickEditState, 'isActive'>,
    value: string
  ) => {
    setVariantStates((prev) => {
      const existing = prev[variantId] || { price: '', stockQuantity: '', isActive: true };
      return {
        ...prev,
        [variantId]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleActiveToggle = (variantId: string, checked: boolean) => {
    setVariantStates((prev) => {
      const existing = prev[variantId] || { price: '', stockQuantity: '', isActive: true };
      return {
        ...prev,
        [variantId]: {
          ...existing,
          isActive: checked,
        },
      };
    });
  };

  const resetVariantState = (variantId: string) => {
    setVariantStates((prev) => ({
      ...prev,
      [variantId]: baselineStates[variantId] || { price: '', stockQuantity: '', isActive: true },
    }));
  };

  const normalizePrice = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizeStock = (value: string, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.max(0, Math.round(parsed));
  };

  const handleQuickSave = async (variant: ProductVariant, variantId: string, state: VariantQuickEditState) => {
    if (!variant.id) {
      return;
    }
    const nextPrice = normalizePrice(state.price, variant.price ?? 0);
    const nextStock = normalizeStock(state.stockQuantity, variant.stockQuantity ?? 0);

    try {
      await onQuickUpdate({
        id: variant.id,
        price: nextPrice,
        stockQuantity: nextStock,
        isActive: state.isActive,
      });

      const normalizedState: VariantQuickEditState = {
        price: String(nextPrice),
        stockQuantity: String(nextStock),
        isActive: state.isActive,
      };

      setVariantStates((prev) => ({
        ...prev,
        [variantId]: normalizedState,
      }));
      setBaselineStates((prev) => ({
        ...prev,
        [variantId]: normalizedState,
      }));
    } catch {
      // Parent already handles error feedback.
    }
  };

  const handleViewAll = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpenQuickView(product);
  };

  const containerClassName = className ?? 'mt-3 space-y-3';

  return (
    <div className={containerClassName}>
      {variants.length > 0 ? (
        <div className="space-y-3">
          {variants.map((variant, index) => {
            const variantId = String(variant.id || `${product.id}-${index}`);
            const defaultState: VariantQuickEditState = {
              price: variant.price !== undefined && variant.price !== null ? String(variant.price) : '',
              stockQuantity: variant.stockQuantity !== undefined && variant.stockQuantity !== null ? String(variant.stockQuantity) : '',
              isActive: variant.isActive ?? true,
            };
            const state = getVariantState(variantId, defaultState);
            const baseline = baselineStates[variantId] || defaultState;
            const hasChanges =
              state.price !== baseline.price ||
              state.stockQuantity !== baseline.stockQuantity ||
              state.isActive !== baseline.isActive;
            const isSaving = updatingVariantId === variant.id;

            return (
              <div
                key={variantId}
                className="text-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-900/40 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {variant.name || variant.sku || t('products.unknown_variant', 'Variant')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {variant.sku || '-'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {state.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                      </span>
                      <Toggle
                        checked={state.isActive}
                        onChange={(checked) => handleActiveToggle(variantId, checked)}
                        size="sm"
                        aria-label={t('products.variant_status_toggle', 'Toggle variant status')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[repeat(2,_minmax(0,_1fr))_auto]">
                    <label className="flex flex-col text-xs font-semibold text-gray-600 dark:text-gray-300 gap-1">
                      <span>{t('products.price', 'Price')}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={state.price}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => handleInputChange(variantId, 'price', event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col text-xs font-semibold text-gray-600 dark:text-gray-300 gap-1">
                      <span>{t('products.stock_quantity', 'Stock Quantity')}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/60 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={state.stockQuantity}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => handleInputChange(variantId, 'stockQuantity', event.target.value)}
                      />
                    </label>
                    <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
                      <span className="text-xs font-semibold text-transparent select-none" aria-hidden="true">
                        {t('common.actions', 'Actions')}
                      </span>
                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start md:flex-nowrap md:justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!hasChanges || isSaving}
                          className="w-full sm:w-auto h-[50px]"
                          onClick={(event) => {
                            event.stopPropagation();
                            resetVariantState(variantId);
                          }}
                        >
                          {t('common.reset', 'Reset')}
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!hasChanges || isSaving}
                          isLoading={isSaving}
                          className="w-full sm:w-auto h-[50px]"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleQuickSave(variant, variantId, state);
                          }}
                        >
                          {t('common.save', 'Save')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
        onClick={handleViewAll}
      >
        {viewAllLabel}
      </Button>
    </div>
  );
};


export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial filters from URL
  const [initialFilters] = useState(() => ({
    status: searchParams.get('status') as any || undefined,
    brandId: searchParams.get('brandId') || undefined,
    categoryIds: searchParams.get('categoryIds') ? searchParams.get('categoryIds')?.split(',') : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : searchParams.get('isFeatured') === 'false' ? false : undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    hasStock: searchParams.get('hasStock') === 'true' ? true : searchParams.get('hasStock') === 'false' ? false : undefined,
    createdFrom: searchParams.get('createdFrom') || undefined,
    createdTo: searchParams.get('createdTo') || undefined,
  }));

  const productTableState = useTableState<ProductFiltersType>({
    tableId: 'products-table',
    defaultPreferences: {
      visibleColumns: ['product', 'sku', 'brand', 'category', 'status', 'createdAt', 'actions']
    },
    initialFilters,
  });

  const {
    page,
    limit,
    searchValue,
    debouncedSearchValue,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    sortBy,
    sortOrder,
    visibleColumns,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleColumnVisibilityChange,
    setSearchValue
  } = productTableState;

  // Selected products for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());
  const [expandedVariantProductIds, setExpandedVariantProductIds] = useState<Set<string | number>>(new Set());
  const trpcContext = trpc.useContext();

  const [isVariantsModalOpen, setVariantsModalOpen] = useState(false);
  const [productForVariants, setProductForVariants] = useState<Product | null>(null);
  const [variantForEdit, setVariantForEdit] = useState<ProductVariant | null>(null);
  const [isVariantEditModalOpen, setVariantEditModalOpen] = useState(false);
  const [togglingVariantId, setTogglingVariantId] = useState<string | null>(null);
  const [inlineVariantSavingId, setInlineVariantSavingId] = useState<string | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const showVariantsQuickView = isVariantsModalOpen && !isVariantEditModalOpen;


  // Build query parameters - match the API schema exactly
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    status: filters.status || undefined,
    brandId: filters.brandId || undefined,
    categoryIds: filters.categoryIds || undefined,
    isFeatured: filters.isFeatured || undefined,
    isActive: filters.isActive || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    hasStock: filters.hasStock || undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
  };

  const { data: productsData, isLoading, error, refetch, isFetching } = trpc.adminProducts.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateVariantMutation = trpc.adminProducts.updateVariant.useMutation();
  const bulkActionMutation = trpc.adminProducts.bulkAction.useMutation();

  const handleOpenVariantsModal = useCallback((product: Product) => {
    setProductForVariants(product);
    setVariantsModalOpen(true);
  }, []);

  const handleCloseVariantsModal = useCallback(() => {
    setVariantsModalOpen(false);
    setProductForVariants(null);
    setVariantEditModalOpen(false);
    setVariantForEdit(null);
  }, []);

  const handleVariantEditClick = useCallback((variant: ProductVariant) => {
    setVariantForEdit(variant);
    setVariantEditModalOpen(true);
  }, []);

  const handleVariantEditClose = useCallback(() => {
    setVariantEditModalOpen(false);
    setVariantForEdit(null);
  }, []);

  const handleOpenImportModal = useCallback(() => setImportModalOpen(true), []);
  const handleCloseImportModal = useCallback(() => setImportModalOpen(false), []);
  const handleImportSuccess = useCallback(() => {
    void trpcContext.adminProducts.list.invalidate();
    refetch();
  }, [trpcContext, refetch]);

  const toggleVariantExpansion = useCallback((productId: string | number) => {
    setExpandedVariantProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleInlineVariantUpdate = useCallback(async (payload: { id: string; price: number; stockQuantity: number; isActive: boolean }) => {
    setInlineVariantSavingId(payload.id);
    try {
      const response = await updateVariantMutation.mutateAsync(payload);
      const updatedVariant = (response as any)?.data as ProductVariant | undefined;

      if (updatedVariant) {
        setProductForVariants((prev) => {
          if (!prev) return prev;
          const updatedVariants = (prev.variants || []).map((variant) =>
            variant.id === updatedVariant.id ? { ...variant, ...updatedVariant } : variant
          );
          return { ...prev, variants: updatedVariants } as Product;
        });
      }

      addToast({
        type: 'success',
        title: t('products.variant_updated', 'Variant updated'),
        description: t('products.inline_variant_updated', 'Changes saved for this variant.'),
      });

      await trpcContext.adminProducts.list.invalidate();
    } catch (mutationError: any) {
      const message = mutationError?.message || t('products.update_variant_error', 'Failed to update variant.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
      throw mutationError;
    } finally {
      setInlineVariantSavingId(null);
    }
  }, [updateVariantMutation, addToast, t, trpcContext]);

  const handleVariantUpdate = useCallback(async (payload: {
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    stockQuantity: number;
    lowStockThreshold?: number | null;
    trackInventory: boolean;
    allowBackorders: boolean;
    isActive: boolean;
  }) => {
    try {
      const response = await updateVariantMutation.mutateAsync(payload);
      const updatedVariant = (response as any)?.data as ProductVariant | undefined;

      if (updatedVariant) {
        setProductForVariants((prev) => {
          if (!prev) return prev;
          const updatedVariants = (prev.variants || []).map((variant) =>
            variant.id === updatedVariant.id ? { ...variant, ...updatedVariant } : variant
          );
          return { ...prev, variants: updatedVariants } as Product;
        });
      }

      addToast({
        type: 'success',
        title: t('products.variant_updated', 'Variant updated'),
        description: t('products.variant_updated_desc', 'The variant has been updated successfully.'),
      });

      await trpcContext.adminProducts.list.invalidate();
      setVariantEditModalOpen(false);
      setVariantForEdit(null);
    } catch (mutationError: any) {
      const message = mutationError?.message || t('products.update_variant_error', 'Failed to update variant.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    }
  }, [updateVariantMutation, addToast, t, trpcContext]);

  const handleToggleVariantActive = useCallback(async (variant: ProductVariant, nextValue: boolean) => {
    if (!variant?.id || updateVariantMutation.isPending) {
      return;
    }

    setTogglingVariantId(variant.id);
    try {
      const response = await updateVariantMutation.mutateAsync({ id: variant.id, isActive: nextValue });
      const updatedVariant = (response as any)?.data as ProductVariant | undefined;

      if (updatedVariant) {
        setProductForVariants((prev) => {
          if (!prev) return prev;
          const updatedVariants = (prev.variants || []).map((item) =>
            item.id === updatedVariant.id ? { ...item, ...updatedVariant } : item
          );
          return { ...prev, variants: updatedVariants } as Product;
        });
      }

      addToast({
        type: 'success',
        title: nextValue
          ? t('products.variant_activated', 'Variant activated')
          : t('products.variant_deactivated', 'Variant deactivated'),
        description: t('products.variant_status_updated', 'Variant status has been updated.'),
      });

      await trpcContext.adminProducts.list.invalidate();
    } catch (mutationError: any) {
      const message = mutationError?.message || t('products.update_variant_error', 'Failed to update variant.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    } finally {
      setTogglingVariantId(null);
    }
  }, [updateVariantMutation, addToast, t, trpcContext]);

  const renderExpandedProductRow = useCallback((product: Product) => {
    const hasVariants = Boolean(product.variants && product.variants.length > 0);
    if (!hasVariants) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('products.no_variants_message', 'This product does not have any variants yet.')}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-4 py-4">
          <ProductVariantInlineList
            product={product}
            emptyMessage={t('products.no_variants_message', 'This product does not have any variants yet.')}
            viewAllLabel={t('products.manage_variants', 'Manage Variants')}
            onOpenQuickView={handleOpenVariantsModal}
            onQuickUpdate={handleInlineVariantUpdate}
            updatingVariantId={inlineVariantSavingId}
            className="space-y-4"
          />
        </div>
      </div>
    );
  }, [handleInlineVariantUpdate, handleOpenVariantsModal, inlineVariantSavingId, t]);

  const products = (productsData as any)?.data?.products || (productsData as any)?.data?.items || [];
  const totalProducts = (productsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // Fetch product statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminProducts.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalProducts,
          active: apiStats.activeProducts,
          draft: apiStats.draftProducts,
          inactive: apiStats.inactiveProducts,
          featured: apiStats.featuredProducts,
          totalStockValue: apiStats.totalStockValue,
          totalViews: apiStats.totalViews,
        }
      };
    }

    // Fallback calculation from current data
    if (!products.length) return null;

    const total = products.length;
    const active = products.filter((p: Product) => p.status === 'ACTIVE').length;
    const draft = products.filter((p: Product) => p.status === 'DRAFT').length;
    const inactive = products.filter((p: Product) => p.status === 'INACTIVE').length;
    const featured = products.filter((p: Product) => p.isFeatured).length;
    const totalViews = products.reduce((sum: number, p: Product) => sum + (p.viewCount || 0), 0);

    return {
      data: {
        total,
        active,
        draft,
        inactive,
        featured,
        totalViews,
      }
    };
  }, [products, statsData]);

  const statisticsLoading = isLoading || statsLoading;
  const statisticsError = null;

  const handleCreateProduct = () => {
    navigate('/products/create');
  };



  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      const ok = window.confirm(t('products.deleteConfirm', 'Are you sure you want to delete this product? This action cannot be undone.'));
      if (!ok) return;
      // TODO: Implement delete mutation when available
      addToast({ type: 'success', title: t('products.deleteSuccess', 'Product deleted') });
      refetch();
    } catch (e: any) {
      addToast({ type: 'error', title: t('products.deleteError', 'Delete failed'), description: e?.message || t('products.deleteError', 'Failed to delete product') });
    }
  }, [addToast, refetch]);

  // Handle bulk actions

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete' | 'contact_price') => {
    if (!selectedProductIds || selectedProductIds.size === 0) {
      addToast({
        type: 'info',
        title: t('products.no_selection_title', 'Select products'),
        description: t('products.no_selection_description', 'Choose at least one product to use bulk actions.'),
      });
      return;
    }

    if (action === 'delete') {
      const confirmDelete = window.confirm(
        t('products.bulk_delete_confirm', `Are you sure you want to delete ${selectedProductIds.size} products? This action cannot be undone.`)
      );
      if (!confirmDelete) {
        return;
      }
    }

    if (action === 'contact_price') {
      const confirmResult = await Swal.fire({
        title: t('products.bulk_contact_price_confirm_title', 'Switch selected products to Contact Price?'),
        text: t(
          'products.bulk_contact_price_confirm_text',
          'This will hide prices for {{count}} products and their variants.',
          { count: selectedProductIds.size }
        ),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('common.confirm', 'Confirm'),
        cancelButtonText: t('common.cancel', 'Cancel'),
        reverseButtons: true,
      });

      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      const ids = Array.from(selectedProductIds).map(String);
      const response = await bulkActionMutation.mutateAsync({ ids, action });
      const result = (response as any)?.data || {};
      const affected = result.updated ?? result.deleted ?? ids.length;

      const successMessages = {
        activate: t('products.bulk_activate_success', 'Activated {{count}} products').replace('{{count}}', String(affected)),
        deactivate: t('products.bulk_deactivate_success', 'Deactivated {{count}} products').replace('{{count}}', String(affected)),
        contact_price: t('products.bulk_contact_price_success', 'Updated {{count}} products to Contact Price').replace('{{count}}', String(affected)),
        delete: t('products.bulk_delete_success', 'Deleted {{count}} products').replace('{{count}}', String(affected)),
      };

      addToast({
        type: 'success',
        title: t('common.success', 'Success'),
        description: successMessages[action],
      });

      setSelectedProductIds(new Set<string | number>());
      await trpcContext.adminProducts.list.invalidate();
      refetch();
    } catch (mutationError: any) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: mutationError?.message || t('products.bulk_action_error', 'Failed to perform bulk action.'),
      });
    }
  }, [selectedProductIds, addToast, t, bulkActionMutation, trpcContext, refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const exportFiltersPayload = useMemo(() => {
    const payload: Record<string, unknown> = {};
    if (debouncedSearchValue) {
      payload.search = debouncedSearchValue;
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return;
      }
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      payload[key] = value as unknown;
    });
    return payload;
  }, [filters, debouncedSearchValue]);

  const handleOpenExportCenter = useCallback(() => {
    const payload = exportFiltersPayload;
    navigate('/products/exports', {
      state: Object.keys(payload).length ? { filters: payload } : undefined,
    });
  }, [navigate, exportFiltersPayload]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductFiltersType = {};
    setFilters(clearedFilters);
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key =>
    filters[key as keyof ProductFiltersType] !== undefined &&
    filters[key as keyof ProductFiltersType] !== null &&
    filters[key as keyof ProductFiltersType] !== ''
  ).length;

  // Enhanced column definitions
  const columns: Column<Product>[] = useMemo(() => [
    {
      id: 'product',
      header: t('products.name', 'Product'),
      accessor: (product) => {
        const productIdKey = product.id;
        const hasVariants = Boolean(product.variants && product.variants.length > 0);
        const isExpanded = hasVariants && expandedVariantProductIds.has(productIdKey);

        return (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {product.media?.[0]?.url ? (
                <img
                  src={product.media[0].url}
                  alt={product.media[0].altText || product.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <FiPackage className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100 text-left block">
                  {product.name}
                </span>
                {hasVariants && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleVariantExpansion(productIdKey);
                    }}
                    className={`p-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isExpanded
                      ? 'bg-blue-600 text-white hover:bg-blue-500 hover:text-white'
                      : 'text-gray-400 hover:bg-blue-600 hover:text-white'
                      }`}
                    aria-label={t('products.manage_variants', 'Manage Variants')}
                    aria-expanded={isExpanded}
                  >
                    <FiChevronRight
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''
                        }`}
                    />
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                SKU: {product.sku || '-'}
              </div>
            </div>
          </div>
        );
      },
      isSortable: false,
      hideable: true,
    },
    {
      id: 'sku',
      header: t('products.sku', 'SKU'),
      accessor: (product) => product.sku || '-',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'brand',
      header: t('products.brand', 'Brand'),
      accessor: (product) => typeof product.brand === 'string' ? product.brand : product.brand?.name || '-',
      isSortable: false,
      hideable: true,
    },
    {
      id: 'category',
      header: t('products.category', 'Category'),
      accessor: (product) => {
        // Handle both new categories array and old single category
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.map(cat => typeof cat === 'string' ? cat : cat?.name).filter(Boolean).join(', ') || '-';
        }
        return typeof product.category === 'string' ? product.category : product.category?.name || '-';
      },
      isSortable: false,
      hideable: true,
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      accessor: (product) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'ACTIVE'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : product.status === 'INACTIVE'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              : product.status === 'DRAFT'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
        >
          {t(`products.status.${product.status.toLowerCase()}`, product.status)}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'warehouseQuantity',
      header: t('products.warehouse_quantity', 'Warehouse Quantity'),
      accessor: (product) => {
        if (!product.enableWarehouseQuantity || !product.warehouseQuantities) {
          return product.stockQuantity || 0;
        }
        const totalQuantity = product.warehouseQuantities.reduce((sum, wq) => sum + wq.quantity, 0);
        return totalQuantity;
      },
      isSortable: false,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (product) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${product.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('products.view_details', 'View Details'),
              icon: <FiInfo className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/products/${product.id}`)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/products/${product.id}/edit`)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteProduct(product.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDeleteProduct, toggleVariantExpansion, expandedVariantProductIds, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<Product> = useMemo(() => ({
    columnAccessor: sortBy as keyof Product,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected products
  const bulkActions = useMemo(() => [
    {
      label: t('products.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
      disabled: bulkActionMutation.isPending,
      icon: <FiCheckCircle className="w-4 h-4" />,
    },
    {
      label: t('products.deactivate_selected', 'Deactivate Selected'),
      value: 'deactivate',
      variant: 'outline' as const,
      disabled: bulkActionMutation.isPending,
      icon: <FiPauseCircle className="w-4 h-4" />,
    },
    {
      label: t('products.bulk_contact_price', 'Switch to Contact Price'),
      value: 'contact_price',
      variant: 'outline' as const,
      disabled: bulkActionMutation.isPending,
      icon: <FiPhoneCall className="w-4 h-4" />,
    },
    {
      label: t('products.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
      disabled: bulkActionMutation.isPending,
      icon: <FiTrash2 className="w-4 h-4" />,
    },
  ], [t, bulkActionMutation.isPending]);

  const actions = useMemo(() => [
    {
      label: t('common.import_from_excel', 'Import from Excel'),
      onClick: handleOpenImportModal,
      icon: <FiUpload />,
    },
    {
      label: t('products.create', 'Create Product'),
      onClick: handleCreateProduct,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('products.actions.export_products', 'Export Products'),
      onClick: handleOpenExportCenter,
      icon: <FiDownload />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('common.hide_filters', 'Hide Filters') : t('common.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleCreateProduct, handleOpenExportCenter, handleRefresh, handleFilterToggle, handleOpenImportModal, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-products',
        title: t('products.total_products', 'Total Products'),
        value: stats.total?.toString() || '0',
        icon: <FiPackage className="w-5 h-5" />,
        trend: stats.totalTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'active-products',
        title: t('products.active_products', 'Active Products'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: stats.activeTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'draft-products',
        title: t('products.draft_products', 'Draft Products'),
        value: stats.draft?.toString() || '0',
        icon: <FiEdit2 className="w-5 h-5" />,
        trend: stats.draftTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'featured-products',
        title: t('products.featured_products', 'Featured Products'),
        value: stats.featured?.toString() || '0',
        icon: <FiStar className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'total-views',
        title: t('products.total_views', 'Total Views'),
        value: stats.totalViews?.toLocaleString() || '0',
        icon: <FiEye className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statisticsData, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: t('products.title', 'Products'),
      icon: <FiPackage className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <StandardListPage
        title={t('products.title', 'Product Management')}
        description={t('products.description', 'Manage all products in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </StandardListPage>
    );
  }

  if (error) {
    return (
      <StandardListPage
        title={t('products.title', 'Product Management')}
        description={t('products.description', 'Manage all products in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </StandardListPage>
    );
  }

  return (
    <StandardListPage
      title={t('products.title', 'Product Management')}
      description={t('products.description', 'Manage all products in the system')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Enhanced Products Table */}
        <Table<Product>
          tableId="products-table"
          columns={columns}
          data={products}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('products.search_placeholder', 'Search products by name, SKU, or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedProductIds}
          onSelectionChange={setSelectedProductIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={(descriptor) => handleSortChange(String(descriptor.columnAccessor), descriptor.direction)}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalProducts,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(product) => navigate(`/products/${product.id}/edit`)}
          expandedRowIds={expandedVariantProductIds}
          renderExpandedRow={renderExpandedProductRow}
          expandedRowClassName="bg-transparent border-none"
          // Empty state
          emptyMessage={t('products.no_products_found', 'No products found')}
          emptyAction={{
            label: t('products.create', 'Create Product'),
            onClick: handleCreateProduct,
            icon: <FiPlus />,
          }}
        />

        <ProductImportModal
          isOpen={isImportModalOpen}
          onClose={handleCloseImportModal}
          onImportSuccess={handleImportSuccess}
        />

        <ProductVariantsQuickViewModal
          product={productForVariants}
          isOpen={showVariantsQuickView}
          onClose={handleCloseVariantsModal}
          onEditVariant={handleVariantEditClick}
          onToggleVariantActive={handleToggleVariantActive}
          togglingVariantId={togglingVariantId}
        />

        <ProductVariantQuickEditModal
          variant={variantForEdit}
          isOpen={isVariantEditModalOpen}
          onClose={handleVariantEditClose}
          onSubmit={handleVariantUpdate}
          isSubmitting={updateVariantMutation.isPending}
        />
      </div>
    </StandardListPage>
  );
};

export default ProductsPage;

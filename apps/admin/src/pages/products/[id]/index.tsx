import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiPackage,
  FiEdit2,
  FiHome,
  FiImage,
  FiInfo,
  FiTag,
  FiDollarSign,
  FiLayers,
  FiFileText,
  FiTrendingUp,
  FiBox,
  FiEye,
  FiEyeOff,
  FiStar,
  FiGrid,
  FiMapPin,
  FiAward,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi';
import BaseLayout from '../../../components/layout/BaseLayout';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { trpc } from '../../../utils/trpc';
import { Product, ProductMedia, ProductVariant, ProductSpecification } from '../../../types/product';

const formatCurrency = (amount: number | null | undefined, currency?: string) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'warning';
    case 'INACTIVE':
      return 'secondary';
    case 'DISCONTINUED':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslationWithBackend();
  const [purchaseHistoryPage, setPurchaseHistoryPage] = useState(1);
  const purchaseHistoryLimit = 10;

  const {
    data: productData,
    isLoading,
    error,
  } = trpc.adminProducts.detail.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const {
    data: purchaseHistoryData,
    isLoading: purchaseHistoryLoading,
  } = trpc.adminProducts.getPurchaseHistory.useQuery(
    { productId: id!, page: purchaseHistoryPage, limit: purchaseHistoryLimit },
    { enabled: !!id }
  );

  const product = (productData as unknown as { data?: Product })?.data;
  const purchaseHistory = (purchaseHistoryData as unknown as { data?: {
    items: Array<{
      id: string;
      orderId: string;
      orderNumber: string;
      orderDate: Date;
      customerName: string;
      customerEmail: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      orderStatus: string;
      variantName?: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }})?.data;

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('products.products', 'Products'),
      href: '/products',
      icon: <FiPackage className="h-4 w-4" />,
    },
    {
      label: product?.name || t('product_details', 'Product Details'),
      icon: <FiPackage className="h-4 w-4" />,
    },
  ]), [product?.name, t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('products.product_details', 'Product Details')}
        description={t('products.product_details_description', 'View detailed product information')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error || !productData || !product) {
    return (
      <BaseLayout
        title={t('products.product_details', 'Product Details')}
        description={t('products.product_details_description', 'View detailed product information')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('products.error_loading_product', 'Error Loading Product')}</AlertTitle>
          <AlertDescription>
            {error?.message || t('products.product_not_found', 'Product not found')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const actions = [
    {
      label: t('products.edit_product', 'Edit Product'),
      onClick: () => navigate(`/products/${product.id}/edit`),
      icon: <FiEdit2 />,
    },
  ];

  const handleEditClick = () => {
    navigate(`/products/${product.id}/edit`);
  };

  const primaryImage = product.media?.find((m: ProductMedia) => m.isPrimary)?.url || product.images?.[0];
  const brandName: string | undefined = typeof product.brand === 'object' && product.brand !== null
    ? product.brand.name
    : typeof product.brand === 'string'
      ? product.brand
      : undefined;
  const categoryName: string | undefined = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : typeof product.category === 'string'
      ? product.category
      : undefined;
  const warrantyName = product.warranty?.name;

  return (
    <BaseLayout
      title={product.name}
      description={t('products.product_details_description', 'View detailed product information')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {product.name}
              </h2>
              {product.sku && (
                <p className="text-gray-600">{t('products.sku', 'SKU')}: {product.sku}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusBadgeVariant(product.status)}>
                {t(`products.status_types.${product.status}`, product.status)}
              </Badge>
              {product.isActive ? (
                <Badge variant="success">
                  <FiEye className="mr-1 h-3 w-3" />
                  {t('products.visible', 'Visible')}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <FiEyeOff className="mr-1 h-3 w-3" />
                  {t('products.hidden', 'Hidden')}
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="warning">
                  <FiStar className="mr-1 h-3 w-3" />
                  {t('products.featured', 'Featured')}
                </Badge>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex gap-2">
            <Button onClick={handleEditClick} className="bg-primary-600 hover:bg-primary-700 text-white">
              <FiEdit2 className="mr-2 h-4 w-4" />
              {t('products.edit_product', 'Edit Product')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            {(product.media?.length || product.images?.length) ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiImage className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.product_images', 'Product Images')}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.media && product.media.length > 0 ? (
                      product.media.map((media: ProductMedia, index: number) => (
                        <div key={media.id || index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {media.type === 'image' && (
                            <img
                              src={media.url}
                              alt={media.altText || product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {media.isPrimary && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="success" className="text-xs">
                                {t('products.primary', 'Primary')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      product.images?.map((image: string, index: number) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Product Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiInfo className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('products.product_information', 'Product Information')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {product.shortDescription && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('products.short_description', 'Short Description')}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{product.shortDescription}</p>
                  </div>
                )}
                {product.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('products.description', 'Description')}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.sku', 'SKU')}
                    </label>
                    <p className="text-gray-900">{product.sku || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.view_count', 'View Count')}
                    </label>
                    <p className="text-gray-900">{product.viewCount || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.created_at', 'Created At')}
                    </label>
                    <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.updated_at', 'Updated At')}
                    </label>
                    <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiLayers className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.product_variants', 'Product Variants')}</h2>
                    <Badge variant="info">{product.variants.length}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">{t('products.variant_name', 'Name')}</th>
                          <th className="px-4 py-3">{t('products.sku', 'SKU')}</th>
                          <th className="px-4 py-3">{t('products.price', 'Price')}</th>
                          <th className="px-4 py-3">{t('products.stock', 'Stock')}</th>
                          <th className="px-4 py-3">{t('common.status', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {product.variants.map((variant: ProductVariant) => (
                          <tr key={variant.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {variant.image && (
                                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={variant.image}
                                      alt={variant.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">{variant.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{variant.sku || '-'}</td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(variant.price, product.currencyCode)}
                                </div>
                                {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatCurrency(variant.compareAtPrice, product.currencyCode)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-medium ${variant.stockQuantity <= 0 ? 'text-red-600' : variant.stockQuantity <= (variant.lowStockThreshold || 10) ? 'text-yellow-600' : 'text-green-600'}`}>
                                {variant.stockQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={variant.isActive ? 'success' : 'secondary'}>
                                {variant.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Product Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.specifications', 'Specifications')}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec: ProductSpecification) => (
                      <div key={spec.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {spec.name}
                        </label>
                        <p className="text-gray-900">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEO Information */}
            {(product.metaTitle || product.metaDescription || product.metaKeywords) && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.seo_information', 'SEO Information')}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {product.metaTitle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('products.meta_title', 'Meta Title')}
                      </label>
                      <p className="text-gray-900">{product.metaTitle}</p>
                    </div>
                  )}
                  {product.metaDescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('products.meta_description', 'Meta Description')}
                      </label>
                      <p className="text-gray-900">{product.metaDescription}</p>
                    </div>
                  )}
                  {product.metaKeywords && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('products.meta_keywords', 'Meta Keywords')}
                      </label>
                      <p className="text-gray-900">{product.metaKeywords}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiShoppingBag className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('products.purchase_history', 'Purchase History')}</h2>
                  {purchaseHistory && purchaseHistory.total > 0 && (
                    <Badge variant="info">{purchaseHistory.total}</Badge>
                  )}
                </div>
              </div>
              <div className="p-6">
                {purchaseHistoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading />
                  </div>
                ) : !purchaseHistory || purchaseHistory.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('products.no_purchase_history', 'No purchase history found for this product.')}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-3">{t('products.order_number', 'Order')}</th>
                            <th className="px-4 py-3">{t('products.customer', 'Customer')}</th>
                            <th className="px-4 py-3">{t('products.variant', 'Variant')}</th>
                            <th className="px-4 py-3">{t('products.quantity', 'Qty')}</th>
                            <th className="px-4 py-3">{t('products.unit_price', 'Unit Price')}</th>
                            <th className="px-4 py-3">{t('products.total', 'Total')}</th>
                            <th className="px-4 py-3">{t('common.status', 'Status')}</th>
                            <th className="px-4 py-3">{t('common.date', 'Date')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                          {purchaseHistory.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <Link
                                  to={`/orders/${item.orderId}`}
                                  className="font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                                >
                                  #{item.orderNumber}
                                  <FiExternalLink className="h-3 w-3" />
                                </Link>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-900">{item.customerName}</div>
                                  <div className="text-xs text-gray-500">{item.customerEmail}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {item.variantName || '-'}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3">
                                {formatCurrency(item.unitPrice, product.currencyCode)}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {formatCurrency(item.totalPrice, product.currencyCode)}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={getStatusBadgeVariant(item.orderStatus)}>
                                  {t(`orders.status_types.${item.orderStatus}`, item.orderStatus)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">
                                {new Date(item.orderDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {purchaseHistory.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          {t('products.showing_entries', 'Showing {{from}} to {{to}} of {{total}} entries', {
                            from: (purchaseHistory.page - 1) * purchaseHistory.limit + 1,
                            to: Math.min(purchaseHistory.page * purchaseHistory.limit, purchaseHistory.total),
                            total: purchaseHistory.total,
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPurchaseHistoryPage((prev) => Math.max(prev - 1, 1))}
                            disabled={purchaseHistory.page <= 1}
                            className="min-w-[100px]"
                          >
                            <FiChevronLeft className="mr-1 h-4 w-4" />
                            {t('common.previous', 'Previous')}
                          </Button>
                          <span className="text-sm text-gray-500">
                            {t('common.page', 'Page')} {purchaseHistory.page} / {purchaseHistory.totalPages}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPurchaseHistoryPage((prev) => Math.min(prev + 1, purchaseHistory.totalPages))}
                            disabled={purchaseHistory.page >= purchaseHistory.totalPages}
                            className="min-w-[100px]"
                          >
                            {t('common.next', 'Next')}
                            <FiChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('products.pricing', 'Pricing')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {product.price !== undefined && product.price !== null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.price', 'Price')}
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(product.price, product.currencyCode)}
                    </p>
                  </div>
                )}
                {product.compareAtPrice && product.compareAtPrice > (product.price || 0) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.compare_at_price', 'Compare At Price')}
                    </label>
                    <p className="text-lg text-gray-600 line-through">
                      {formatCurrency(product.compareAtPrice, product.currencyCode)}
                    </p>
                  </div>
                )}
                {product.currencyCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.currency', 'Currency')}
                    </label>
                    <p className="text-gray-900">{product.currencyCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Information */}
            {!product.enableWarehouseQuantity && product.stockQuantity !== undefined && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiBox className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.stock', 'Stock')}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${product.stockQuantity <= 0 ? 'text-red-600' : product.stockQuantity <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stockQuantity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('products.units_available', 'Units Available')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warehouse Quantities */}
            {product.enableWarehouseQuantity && product.warehouseQuantities && product.warehouseQuantities.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('products.warehouse_quantities', 'Warehouse Quantities')}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {product.warehouseQuantities.map((wq) => (
                    <div key={wq.warehouseId} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {wq.warehouse?.name || wq.warehouseId}
                      </span>
                      <span className={`font-semibold ${wq.quantity <= 0 ? 'text-red-600' : wq.quantity <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {wq.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand & Category */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiGrid className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('products.categorization', 'Categorization')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {brandName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.brand', 'Brand')}
                    </label>
                    <p className="text-gray-900">{brandName}</p>
                  </div>
                )}
                {categoryName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products.category', 'Category')}
                    </label>
                    <p className="text-gray-900">{categoryName}</p>
                  </div>
                )}
                {warrantyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiAward className="inline-block mr-1 h-4 w-4" />
                      {t('products.warranty', 'Warranty')}
                    </label>
                    <p className="text-gray-900">{warrantyName}</p>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiTag className="inline-block mr-1 h-4 w-4" />
                      {t('products.tags', 'Tags')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => {
                        const tagName = typeof tag === 'object' && tag !== null && 'name' in tag ? tag.name : tag;
                        return (
                          <Badge key={index} variant="info">
                            {tagName}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ProductDetailPage;

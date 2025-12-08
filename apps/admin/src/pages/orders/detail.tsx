import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiShoppingBag,
  FiEdit2,
  FiTruck,
  FiCheck,
  FiX,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiMoreVertical,
  FiPrinter,
  FiDownload,
  FiCopy,
  FiHome,
  FiRefreshCw,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Link } from 'react-router-dom';
import type { CustomerTransaction, CustomerTransactionStatus } from '../../types/transactions';
import type { PaginatedResponse } from '@backend/trpc/schemas/response.schemas';
import type { AdministrativeDivisionType } from '../../../../backend/src/modules/products/entities/administrative-division.entity';
import { OrderTransactionModal } from '../../components/orders/OrderTransactionModal';

const formatAmount = (value: unknown) => {
  const numericValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : 0;

  if (!Number.isFinite(numericValue)) {
    return '0.00';
  }

  return numericValue.toFixed(2);
};

const getTransactionStatusBadgeVariant = (status: CustomerTransactionStatus) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'destructive';
    default:
      return 'info';
  }
};

const formatTransactionAmount = (transaction: Pick<CustomerTransaction, 'impactAmount' | 'currency'>) => {
  const amount = Number(transaction.impactAmount ?? 0);
  if (!Number.isFinite(amount)) {
    return `${transaction.currency ?? 'USD'} 0.00`;
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: transaction.currency || 'USD',
    }).format(amount);
  } catch {
    return `${transaction.currency ?? 'USD'} ${amount.toFixed(2)}`;
  }
};

type OrderAddress = {
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

const useAdministrativeDivisionNames = (address?: OrderAddress | null) => {
  const countryId = address?.country ?? '';
  const provinceId = address?.state ?? '';
  const cityId = address?.city ?? '';

  const provincesQuery = trpc.adminAddressBook.getAdministrativeDivisions.useQuery(
    { countryId, type: 'PROVINCE' as AdministrativeDivisionType },
    { enabled: Boolean(countryId) }
  );

  const wardsQuery = trpc.adminAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: provinceId },
    { enabled: Boolean(provinceId) }
  );

  const provinceName = useMemo(() => {
    if (!provinceId) {
      return '';
    }

    const divisions = (provincesQuery.data as { id: string; name: string }[] | undefined) ?? [];
    const match = divisions.find((division) => division.id === provinceId);
    return match?.name ?? provinceId;
  }, [provinceId, provincesQuery.data]);

  const cityName = useMemo(() => {
    if (!cityId) {
      return '';
    }

    const divisions = (wardsQuery.data as { id: string; name: string }[] | undefined) ?? [];
    const match = divisions.find((division) => division.id === cityId);
    return match?.name ?? cityId;
  }, [cityId, wardsQuery.data]);

  return {
    provinceName,
    cityName,
  };
};

const formatAddressLine = (city?: string, province?: string, postalCode?: string) => {
  const locationParts = [city, province].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0
  );
  const location = locationParts.map((part) => part.trim()).join(', ');
  const postal = typeof postalCode === 'string' ? postalCode.trim() : postalCode;

  if (!location && !postal) {
    return '';
  }

  if (!location) {
    return postal ?? '';
  }

  return postal ? `${location} ${postal}` : location;
};

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeOrderId } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [isUpdating, setIsUpdating] = useState(false);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPageSize = 10;
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Fetch order data
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = trpc.adminOrders.detail.useQuery(
    { id: routeOrderId! },
    { enabled: !!routeOrderId }
  );

  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      addToast({ title: t('order_status_updated_successfully'), type: 'success' });
      refetchOrder();
      setIsUpdating(false);
    },
    onError: (error) => {
      addToast({ title: error.message || t('failed_to_update_order_status'), type: 'error' });
      setIsUpdating(false);
    },
  });

  const shipOrderMutation = trpc.adminOrders.ship.useMutation({
    onSuccess: () => {
      addToast({ title: t('order_marked_as_shipped'), type: 'success' });
      refetchOrder();
      setIsUpdating(false);
    },
    onError: (error) => {
      addToast({ title: error.message || t('failed_to_ship_order'), type: 'error' });
      setIsUpdating(false);
    },
  });

  const cancelOrderMutation = trpc.adminOrders.cancel.useMutation({
    onSuccess: () => {
      addToast({ title: t('order_cancelled_successfully'), type: 'success' });
      refetchOrder();
      setIsUpdating(false);
    },
    onError: (error) => {
      addToast({ title: error.message || t('failed_to_cancel_order'), type: 'error' });
      setIsUpdating(false);
    },
  });

  const handleStatusUpdate = async (status: string) => {
    if (!routeOrderId) return;

    try {
      setIsUpdating(true);
      if (status === 'SHIPPED') {
        await shipOrderMutation.mutateAsync({ id: routeOrderId });
      } else if (status === 'CANCELLED') {
        await cancelOrderMutation.mutateAsync({ id: routeOrderId });
      } else {
        await updateStatusMutation.mutateAsync({ id: routeOrderId, status: status as any });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PROCESSING': return 'info';
      case 'SHIPPED': return 'success';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      case 'RETURNED': return 'secondary';
      case 'REFUNDED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'PARTIALLY_PAID': return 'warning';
      case 'FAILED': return 'destructive';
      case 'REFUNDED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const order = (orderData as any)?.data;
  const resolvedOrderId = order?.id ?? routeOrderId ?? '';

  useEffect(() => {
    if (resolvedOrderId) {
      setTransactionsPage(1);
    }
  }, [resolvedOrderId]);

  const orderTransactionsInput = useMemo(() => {
    if (!resolvedOrderId) {
      return undefined;
    }

    return {
      page: transactionsPage,
      limit: transactionsPageSize,
      relatedEntityType: 'order' as const,
      relatedEntityId: resolvedOrderId,
    };
  }, [resolvedOrderId, transactionsPage, transactionsPageSize]);

  const {
    data: orderTransactionsResponse,
    isLoading: orderTransactionsLoading,
    refetch: refetchOrderTransactions,
  } = trpc.adminCustomerTransactions.list.useQuery(
    orderTransactionsInput as any,
    { enabled: Boolean(orderTransactionsInput) },
  );

  const orderTransactionsResult = orderTransactionsResponse as PaginatedResponse<CustomerTransaction> | undefined;
  const rawOrderTransactions = orderTransactionsInput ? orderTransactionsResult?.data?.items ?? [] : [];
  const orderTransactions = resolvedOrderId
    ? rawOrderTransactions.filter((transaction) => transaction.relatedEntityId === resolvedOrderId)
    : rawOrderTransactions;
  const hasUnexpectedTransactions = rawOrderTransactions.some(
    (transaction) => transaction.relatedEntityId !== resolvedOrderId,
  );
  const orderTransactionsPageInfo = orderTransactionsResult?.data;
  const backendTotal = orderTransactionsPageInfo?.total ?? orderTransactions.length;
  const backendTotalPages = orderTransactionsPageInfo?.totalPages ?? Math.max(
    backendTotal > 0 ? 1 : 0,
    Math.ceil(backendTotal / (orderTransactionsPageInfo?.limit ?? transactionsPageSize)),
  );
  const orderTransactionsTotal = hasUnexpectedTransactions ? orderTransactions.length : backendTotal;
  const orderTransactionsTotalPages = hasUnexpectedTransactions
    ? (orderTransactionsTotal > 0 ? 1 : 0)
    : backendTotalPages;
  const orderTransactionsLimit = hasUnexpectedTransactions
    ? transactionsPageSize
    : orderTransactionsPageInfo?.limit ?? transactionsPageSize;
  const orderTransactionsPageNumber = hasUnexpectedTransactions
    ? 1
    : orderTransactionsPageInfo?.page ?? transactionsPage;
  const orderTransactionsFrom = orderTransactionsTotal === 0
    ? 0
    : hasUnexpectedTransactions
      ? 1
      : (orderTransactionsPageNumber - 1) * orderTransactionsLimit + 1;
  const orderTransactionsTo = orderTransactionsTotal === 0
    ? 0
    : hasUnexpectedTransactions
      ? orderTransactions.length
      : Math.min(orderTransactionsPageNumber * orderTransactionsLimit, orderTransactionsTotal);

  useEffect(() => {
    if (
      !orderTransactionsLoading &&
      orderTransactionsTotalPages > 0 &&
      transactionsPage > orderTransactionsTotalPages
    ) {
      setTransactionsPage(orderTransactionsTotalPages);
    }
  }, [orderTransactionsLoading, orderTransactionsTotalPages, transactionsPage]);

  const billingDivisions = useAdministrativeDivisionNames(order?.billingAddress);
  const shippingDivisions = useAdministrativeDivisionNames(order?.shippingAddress);

  const billingAddressLine = order?.billingAddress
    ? formatAddressLine(
        billingDivisions.cityName || order.billingAddress.city,
        billingDivisions.provinceName || order.billingAddress.state,
        order.billingAddress.postalCode
      )
    : '';

  const shippingAddressLine = order?.shippingAddress
    ? formatAddressLine(
        shippingDivisions.cityName || order.shippingAddress.city,
        shippingDivisions.provinceName || order.shippingAddress.state,
        order.shippingAddress.postalCode
      )
    : '';

  const orderNumber = order?.orderNumber;

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('orders.title'),
      href: '/orders',
      icon: <FiShoppingBag className="h-4 w-4" />,
    },
    {
      label: orderNumber ? `#${orderNumber}` : t('order_details'),
      icon: <FiShoppingBag className="h-4 w-4" />,
    },
  ]), [orderNumber, t]);

  if (orderLoading) {
    return (
      <BaseLayout
        title={t('order_details')}
        description={t('order_details_description')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (orderError || !orderData || !order) {
    return (
      <BaseLayout
        title={t('order_details')}
        description={t('order_details_description')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('error_loading_order')}</AlertTitle>
          <AlertDescription>
            {orderError?.message || t('order_not_found')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const actions = [
    {
      label: t('edit_order'),
      onClick: () => navigate(`/orders/${order.id}/edit`),
      icon: <FiEdit2 />,
    },
    {
      label: t('print_order'),
      onClick: () => window.print(),
      icon: <FiPrinter />,
    },
    {
      label: t('export_order'),
      onClick: () => {
        // Handle export logic
      },
      icon: <FiDownload />,
    },
  ];

  return (
    <BaseLayout
      title={`${t('order')} #${order.orderNumber}`}
      description={t('order_details_description')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('order_details')}
              </h2>
              <p className="text-gray-600">
                {t('placed_on')} {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              <Badge variant={getStatusBadgeVariant(order.status) as any}>
                {t(`orders.status_types.${order.status}`)}
              </Badge>
              <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any}>
                {t(`orders.payment_status_types.${order.paymentStatus}`)}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {order.status === 'PROCESSING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('SHIPPED')}
                disabled={isUpdating}
              >
                <FiTruck className="mr-1 h-4 w-4" />
                {t('mark_as_shipped')}
              </Button>
            )}
            {order.status === 'SHIPPED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('DELIVERED')}
                disabled={isUpdating}
              >
                <FiCheck className="mr-1 h-4 w-4" />
                {t('mark_as_delivered')}
              </Button>
            )}
            {['PENDING', 'CONFIRMED'].includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isUpdating}
              >
                <FiX className="mr-1 h-4 w-4" />
                {t('cancel_order')}
              </Button>
            )}
            <Dropdown
              button={
                <Button variant="ghost" size="sm">
                  <FiMoreVertical className="h-4 w-4" />
                </Button>
              }
              items={[
                {
                  label: t('copy_order_number'),
                  icon: React.createElement(FiCopy),
                  onClick: () => {
                    navigator.clipboard.writeText(order.orderNumber);
                    addToast({ title: t('order_number_copied'), type: 'success' });
                  },
                },
                {
                  label: t('view_customer'),
                  icon: React.createElement(FiUser),
                  onClick: () => {
                    // Navigate to customer if customerId exists
                    if (order.customerId) {
                      navigate(`/customers/${order.customerId}`);
                    }
                  },
                  disabled: !order.customerId,
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiPackage className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('order_items')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
                      {item.productImage && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                        {item.productSku && (
                          <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {item.quantity} × {order.currency} {formatAmount(item.unitPrice)}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {order.currency} {formatAmount(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('order_timeline')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{t('order_placed')}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {order.shippedDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{t('order_shipped')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.shippedDate).toLocaleString()}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500">
                            {t('tracking')}: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {order.deliveredDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{t('order_delivered')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.deliveredDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{t('order_cancelled')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.cancelledAt).toLocaleString()}
                        </p>
                        {order.cancelledReason && (
                          <p className="text-xs text-gray-500">{order.cancelledReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <FiDollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('orders.transactions.title', 'Payment transactions')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t('orders.transactions.subtitle', 'Financial records linked to this order')}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({orderTransactionsTotal})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowTransactionModal(true)}
                    disabled={!order?.customerId}
                    title={!order?.customerId ? t('orders.transactions.quick_action.missing_customer_message', 'This order is not linked to a customer, so revenue cannot be recorded.') : undefined}
                  >
                    <FiDollarSign className="mr-2 h-4 w-4" />
                    {t('orders.transactions.record_payment', 'Record payment')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchOrderTransactions()}
                    disabled={orderTransactionsLoading}
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    {t('orders.transactions.refresh', 'Refresh')}
                  </Button>
                  <Link
                    to={order?.orderNumber ? `/transactions?search=${encodeURIComponent(order.orderNumber)}` : '/transactions'}
                    className="inline-flex h-10 items-center gap-1 rounded-[var(--border-radius)] border border-primary-200 px-4 text-sm font-medium text-primary-600 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    {t('orders.transactions.view_all', 'Open Transactions')}
                    <FiExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {orderTransactionsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loading />
                  </div>
                ) : orderTransactions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                    {t('orders.transactions.empty', 'No transactions recorded for this order yet.')}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-3">{t('orders.transactions.code', 'Code')}</th>
                            <th className="px-4 py-3">{t('orders.transactions.type', 'Type')}</th>
                            <th className="px-4 py-3">{t('orders.transactions.amount', 'Amount')}</th>
                            <th className="px-4 py-3">{t('orders.transactions.status', 'Status')}</th>
                            <th className="px-4 py-3">{t('orders.transactions.date', 'Date')}</th>
                            <th className="px-4 py-3 text-right">{t('orders.transactions.actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                          {orderTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                #{transaction.transactionCode}
                              </td>
                              <td className="px-4 py-3">
                                {t(`transactions.types.${transaction.type}`, transaction.type)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`font-semibold ${
                                    transaction.impactDirection === 'debit'
                                      ? 'text-rose-600'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  {transaction.impactDirection === 'debit' ? '-' : '+'}
                                  {formatTransactionAmount(transaction)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={getTransactionStatusBadgeVariant(transaction.status)}>
                                  {t(`transactions.status.${transaction.status}`, transaction.status)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  to={`/transactions?search=${transaction.transactionCode}`}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                                >
                                  {t('orders.transactions.view_transaction', 'View transaction')}
                                  <FiExternalLink className="h-4 w-4" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500">
                        {orderTransactionsTotal === 0
                          ? t('orders.transactions.pagination_empty', 'No transactions to display.')
                          : t(
                              'orders.transactions.pagination_summary',
                              'Showing {{from}}-{{to}} of {{total}} transactions.',
                              {
                                from: orderTransactionsFrom,
                                to: orderTransactionsTo,
                                total: orderTransactionsTotal,
                              },
                            )}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTransactionsPage((prev) => Math.max(prev - 1, 1))}
                          disabled={transactionsPage <= 1 || orderTransactionsLoading}
                          className="min-w-[100px]"
                        >
                          <FiChevronLeft className="mr-1 h-4 w-4" />
                          {t('previous', 'Previous')}
                        </Button>
                        <span className="text-sm text-gray-500">
                          {t('orders.transactions.page_label', 'Page')} {orderTransactionsPageNumber} / {Math.max(orderTransactionsTotalPages, 1)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTransactionsPage((prev) => Math.min(prev + 1, Math.max(orderTransactionsTotalPages, 1)))}
                          disabled={transactionsPage >= orderTransactionsTotalPages || orderTransactionsTotalPages === 0 || orderTransactionsLoading}
                          className="min-w-[100px]"
                        >
                          {t('next', 'Next')}
                          <FiChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('order_summary')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="text-gray-900">{order.currency} {formatAmount(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('discount')}</span>
                    <span className="text-green-600">-{order.currency} {formatAmount(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tax')}</span>
                  <span className="text-gray-900">{order.currency} {formatAmount(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="text-gray-900">{order.currency} {formatAmount(order.shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('total')}</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {order.currency} {formatAmount(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('admin.customer_information')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            {(order.billingAddress || order.shippingAddress) && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('addresses')}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {order.billingAddress && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{t('billing_address')}</h3>
                      <div className="text-sm text-gray-600">
                        <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                        {order.billingAddress.company && <p>{order.billingAddress.company}</p>}
                        <p>{order.billingAddress.address1}</p>
                        {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                        {billingAddressLine && <p>{billingAddressLine}</p>}
                        <p>{order.billingAddress.country}</p>
                      </div>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{t('shipping_address')}</h3>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        {shippingAddressLine && <p>{shippingAddressLine}</p>}
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('payment_information')}</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {order.paymentMethod && (
                  <div>
                    <span className="text-gray-600">{t('payment_method')}: </span>
                    <span className="text-gray-900">{order.paymentMethod}</span>
                  </div>
                )}
                {order.paymentReference && (
                  <div>
                    <span className="text-gray-600">{t('payment_reference')}: </span>
                    <span className="text-gray-900">{order.paymentReference}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">{t('source')}: </span>
                  <span className="text-gray-900">{t(`orders.source_types.${order.source}`)}</span>
                </div>
              </div>
            </div>


            {/* Notes */}
            {(order.notes || order.customerNotes || order.internalNotes) && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('notes')}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {order.notes && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{t('order_notes')}</h3>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                  {order.customerNotes && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{t('customer_notes')}</h3>
                      <p className="text-sm text-gray-600">{order.customerNotes}</p>
                    </div>
                  )}
                  {order.internalNotes && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{t('internal_notes')}</h3>
                      <p className="text-sm text-gray-600">{order.internalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {order && (
        <OrderTransactionModal
          isOpen={showTransactionModal}
          order={{
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            currency: order.currency,
            totalAmount: order.totalAmount,
          }}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            refetchOrder();
            refetchOrderTransactions();
          }}
        />
      )}
    </BaseLayout>
  );
};

export default OrderDetailPage;

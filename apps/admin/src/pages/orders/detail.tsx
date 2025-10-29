import React, { useMemo, useState } from 'react';
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
  FiHome
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

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch order data
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = trpc.adminOrders.detail.useQuery(
    { id: id! },
    { enabled: !!id }
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
    if (!id) return;

    try {
      setIsUpdating(true);
      if (status === 'SHIPPED') {
        await shipOrderMutation.mutateAsync({ id });
      } else if (status === 'CANCELLED') {
        await cancelOrderMutation.mutateAsync({ id });
      } else {
        await updateStatusMutation.mutateAsync({ id, status: status as any });
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

  const orderNumber = (orderData as any)?.data?.orderNumber;

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('orders'),
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

  if (orderError || !orderData || !(orderData as any)?.data) {
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

  const order = (orderData as any).data;

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('order')} #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  {t('placed_on')} {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(order.status) as any}>
                {t(`orders.status_types.${order.status}`)}
              </Badge>
              <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any}>
                {t(`orders.payment_status_types.${order.paymentStatus}`)}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
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
                          {item.quantity} × {order.currency} {item.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {order.currency} {item.totalPrice.toFixed(2)}
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
                  <span className="text-gray-900">{order.currency} {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('discount')}</span>
                    <span className="text-green-600">-{order.currency} {order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tax')}</span>
                  <span className="text-gray-900">{order.currency} {order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="text-gray-900">{order.currency} {order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('total')}</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {order.currency} {order.totalAmount.toFixed(2)}
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
                        <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
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
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
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
    </BaseLayout>
  );
};

export default OrderDetailPage;

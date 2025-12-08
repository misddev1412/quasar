import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { UpdateOrderForm, UpdateOrderFormData } from '../../components/orders/UpdateOrderForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';

const EditOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['customer', 'status', 'payment', 'notes']
  });

  // Fetch order data
  const {
    data: orderData,
    isLoading,
    error,
    refetch: refetchOrder,
  } = trpc.adminOrders.detail.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const order = (orderData as any)?.data;

  const updateOrderMutation = trpc.adminOrders.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('order_updated_successfully'),
        description: t('order_updated_successfully_description'),
      });
      refetchOrder();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('failed_to_update_order'),
        description: error.message || t('update_order_error_description'),
      });
    },
  });

  const getInitialFormData = (): UpdateOrderFormData => {
    if (!order) {
      return {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: '',
        paymentReference: '',
        shippingMethod: '',
        trackingNumber: '',
        estimatedDeliveryDate: '',
        notes: '',
        customerNotes: '',
        internalNotes: '',
        isGift: false,
        giftMessage: '',
        discountCode: '',
        discountAmount: 0,
        cancelledReason: '',
        refundAmount: 0,
        refundReason: '',
      };
    }

    return {
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || '',
      paymentReference: order.paymentReference || '',
      shippingMethod: order.shippingMethod || '',
      trackingNumber: order.trackingNumber || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate ?
        new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      notes: order.notes || '',
      customerNotes: order.customerNotes || '',
      internalNotes: order.internalNotes || '',
      isGift: order.isGift || false,
      giftMessage: order.giftMessage || '',
      discountCode: order.discountCode || '',
      discountAmount: order.discountAmount || 0,
      cancelledReason: order.cancelledReason || '',
      refundAmount: order.refundAmount || 0,
      refundReason: order.refundReason || '',
    };
  };

  const handleSubmit = async (formData: UpdateOrderFormData) => {
    if (!id) return;

    try {
      await updateOrderMutation.mutateAsync({
        id,
        ...formData,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
      });
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  if (isLoading) {
    return (
      <CreatePageTemplate
        title={t('edit_order')}
        description={t('edit_order_description')}
        icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('order')}
        entityNamePlural={t('orders.title')}
        backUrl="/orders"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </CreatePageTemplate>
    );
  }

  if (error || !order) {
    return (
      <CreatePageTemplate
        title={t('edit_order')}
        description={t('edit_order_description')}
        icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('order')}
        entityNamePlural={t('orders.title')}
        backUrl="/orders"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
      >
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('error_loading_order')}</h3>
          <p className="text-gray-600">{error?.message || t('order_not_found')}</p>
        </div>
      </CreatePageTemplate>
    );
  }

  return (
    <CreatePageTemplate
      title={t('edit_order')}
      description={`${t('edit_order_description')} #${order.orderNumber}`}
      icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('order')}
      entityNamePlural={t('orders.title')}
      backUrl="/orders"
      onBack={handleCancel}
      isSubmitting={updateOrderMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        {
          label: t('navigation.home'),
          href: '/',
        },
        {
          label: t('orders.title'),
          onClick: handleCancel,
        },
        {
          label: `#${order.orderNumber}`,
          href: `/orders/${order.id}`,
        },
        {
          label: t('edit'),
        }
      ]}
    >
      <UpdateOrderForm
        initialData={getInitialFormData()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateOrderMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default EditOrderPage;

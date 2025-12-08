import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import {
  CreateFulfillmentForm,
  CreateFulfillmentPayload,
} from '../../../components/fulfillments/CreateFulfillmentForm';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';

const OrderFulfillmentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const initialOrderId = searchParams.get('orderId');

  const createFulfillmentMutation = (trpc as any).orderFulfillments?.create?.useMutation?.() ?? {
    mutateAsync: async () => {
      throw new Error('Fulfillment creation mutation is not available');
    },
    isPending: false,
  };

  const handleSuccessNavigation = (result: any) => {
    const fulfillment = result?.data ?? result;
    const fulfillmentId = fulfillment?.id;
    if (fulfillmentId) {
      navigate(`/orders/fulfillments/${fulfillmentId}`);
    } else {
      navigate('/orders/fulfillments');
    }
  };

  const handleSubmit = async (payload: CreateFulfillmentPayload) => {
    try {
      const response = await createFulfillmentMutation.mutateAsync({
        orderId: payload.orderId,
        priorityLevel: payload.priorityLevel,
        shippingProviderId: payload.shippingProviderId,
        packagingType: payload.packagingType,
        shippingAddress: payload.shippingAddress,
        pickupAddress: payload.pickupAddress,
        signatureRequired: payload.signatureRequired,
        deliveryInstructions: payload.deliveryInstructions,
        giftWrap: payload.giftWrap,
        giftMessage: payload.giftMessage,
        notes: payload.notes,
        internalNotes: payload.internalNotes,
        items: payload.items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          locationPickedFrom: item.locationPickedFrom,
          batchNumber: item.batchNumber,
          serialNumbers: item.serialNumbers,
          expiryDate: item.expiryDate,
          conditionNotes: item.conditionNotes,
          packagingNotes: item.packagingNotes,
          weight: item.weight,
          notes: item.notes,
        })),
      });

      addToast({
        type: 'success',
        title: t('fulfillments.create_success', 'Fulfillment created successfully'),
        description: t('fulfillments.create_success_description', 'You can now track shipment progress and add tracking details.'),
      });

      handleSuccessNavigation(response);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('fulfillments.create_failed', 'Unable to create fulfillment'),
        description: error?.message || t('common.unexpected_error', 'Something went wrong. Please try again.'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/orders/fulfillments');
  };

  const handleOrderSelect = (orderId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (orderId) {
      nextParams.set('orderId', orderId);
    } else {
      nextParams.delete('orderId');
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <CreatePageTemplate
      title={t('fulfillments.create_title', 'Create Fulfillment')}
      description={t(
        'fulfillments.create_description',
        'Prepare shipment details, shipping addresses, and items to fulfill an order.'
      )}
      icon={<FiPackage className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('fulfillments.fulfillment', 'Fulfillment')}
      entityNamePlural={t('fulfillments.title', 'Order Fulfillments')}
      backUrl="/orders/fulfillments"
      onBack={handleCancel}
      isSubmitting={createFulfillmentMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('orders.title', 'Orders'), href: '/orders' },
        { label: t('fulfillments.title', 'Order Fulfillments'), href: '/orders/fulfillments' },
        { label: t('fulfillments.create_title', 'Create Fulfillment') },
      ]}
    >
      <CreateFulfillmentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createFulfillmentMutation.isPending}
        initialOrderId={initialOrderId}
        onOrderSelect={handleOrderSelect}
      />
    </CreatePageTemplate>
  );
};

export default OrderFulfillmentCreatePage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiEdit,
  FiArrowLeft,
  FiPlus,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiBox,
  FiActivity,
} from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useToast } from '../../../context/ToastContext';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { Loading } from '../../../components/common/Loading';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { trpc } from '../../../utils/trpc';

interface FulfillmentDetails {
  id: string;
  fulfillmentNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  priorityLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  shippingProvider?: {
    name: string;
    code: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  shippedDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  packagingType?: string;
  packageWeight?: number;
  packageDimensions?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  signatureRequired: boolean;
  deliveryInstructions?: string;
  giftWrap: boolean;
  giftMessage?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  items: FulfillmentItem[];
  trackingHistory: TrackingEvent[];
}

interface FulfillmentItem {
  id: string;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  fulfilledQuantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string;
  locationPickedFrom?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  conditionNotes?: string;
  qualityCheck: boolean;
  qualityCheckAt?: string;
  qualityCheckBy?: string;
  notes?: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  location?: string;
  description?: string;
  eventDate: string;
  recipientName?: string;
  photoUrl?: string;
  notes?: string;
}

const FulfillmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'tracking'>('details');

  const { data: fulfillmentResponse, isLoading, error } = trpc.orderFulfillments.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const fulfillment = (fulfillmentResponse as any)?.data ?? fulfillmentResponse;

  const updateStatusMutation = trpc.orderFulfillments.updateStatus.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('fulfillments.status_updated'),
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message,
      });
    },
  });

  const updateTrackingMutation = trpc.orderFulfillments.updateTracking.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('fulfillments.tracking_updated'),
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message,
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'PACKED':
        return 'info';
      case 'SHIPPED':
        return 'success';
      case 'IN_TRANSIT':
        return 'success';
      case 'OUT_FOR_DELIVERY':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'RETURNED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'secondary';
      case 'NORMAL':
        return 'default';
      case 'HIGH':
        return 'warning';
      case 'URGENT':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleAddTrackingNumber = () => {
    const trackingNumber = prompt(t('fulfillments.enter_tracking_number'));
    if (trackingNumber && fulfillment) {
      updateTrackingMutation.mutate({
        id: fulfillment.id,
        trackingNumber,
      });
    }
  };

  const handleMarkAsDelivered = () => {
    if (fulfillment) {
      updateStatusMutation.mutate({
        id: fulfillment.id,
        status: 'DELIVERED',
      });
    }
  };

  if (isLoading) {
    return (
      <BaseLayout title={t('fulfillments.fulfillment_details')} fullWidth>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error || !fulfillment) {
    return (
      <BaseLayout title={t('fulfillments.fulfillment_details')} fullWidth>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error?.message || 'Fulfillment not found'}</p>
        </div>
      </BaseLayout>
    );
  }

  const breadcrumbItems = [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: t('orders.title'),
      href: '/orders',
    },
    {
      label: t('fulfillments.title'),
      href: '/orders/fulfillments',
    },
    {
      label: fulfillment.fulfillmentNumber,
    },
  ];

  return (
    <BaseLayout
      title={`${t('fulfillments.fulfillment')}: ${fulfillment.fulfillmentNumber}`}
      breadcrumbs={breadcrumbItems}
      fullWidth
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders/fulfillments')}
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddTrackingNumber} disabled={!!fulfillment.trackingNumber}>
              <FiTruck className="mr-2 h-4 w-4" />
              {fulfillment.trackingNumber ? t('fulfillments.tracking_added') : t('fulfillments.add_tracking')}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}/edit`)}>
              <FiEdit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </Button>
            <Button onClick={handleMarkAsDelivered} disabled={fulfillment.status === 'DELIVERED'}>
              <FiCheck className="mr-2 h-4 w-4" />
              {t('fulfillments.mark_delivered')}
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('fulfillments.fulfillment_number')}</h3>
              <p className="text-lg font-semibold">{fulfillment.fulfillmentNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('fulfillments.order')}</h3>
              <p className="text-lg font-semibold">{fulfillment.orderNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('fulfillments.status')}</h3>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(fulfillment.status) as any}>
                  {t(`fulfillments.status_types.${fulfillment.status}`)}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('fulfillments.priority')}</h3>
              <div className="mt-1">
                <Badge variant={getPriorityBadgeVariant(fulfillment.priorityLevel) as any}>
                  {t(`fulfillments.priority_types.${fulfillment.priorityLevel}`)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['details', 'items', 'tracking'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`fulfillments.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Customer & Order Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">{t('fulfillments.customer_info')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.customer')}</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{fulfillment.customerName}</p>
                    <p className="text-sm text-gray-600">{fulfillment.customerEmail}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.order')}</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{fulfillment.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {t('fulfillments.created')}: {new Date(fulfillment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">{t('fulfillments.shipping_info')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.shipping_address')}</h4>
                  {fulfillment.shippingAddress && (
                    <div className="space-y-1">
                      <p className="font-medium">
                        {fulfillment.shippingAddress.firstName} {fulfillment.shippingAddress.lastName}
                      </p>
                      {fulfillment.shippingAddress.company && (
                        <p className="text-sm text-gray-600">{fulfillment.shippingAddress.company}</p>
                      )}
                      <p className="text-sm">{fulfillment.shippingAddress.address1}</p>
                      {fulfillment.shippingAddress.address2 && (
                        <p className="text-sm">{fulfillment.shippingAddress.address2}</p>
                      )}
                      <p className="text-sm">
                        {fulfillment.shippingAddress.city}, {fulfillment.shippingAddress.state} {fulfillment.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm">{fulfillment.shippingAddress.country}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.shipping_details')}</h4>
                  <div className="space-y-2">
                    {fulfillment.shippingProvider && (
                      <div>
                        <span className="text-sm text-gray-600">{t('fulfillments.provider')}: </span>
                        <span className="font-medium">{fulfillment.shippingProvider.name}</span>
                      </div>
                    )}
                    {fulfillment.trackingNumber && (
                      <div>
                        <span className="text-sm text-gray-600">{t('fulfillments.tracking_number')}: </span>
                        <a
                          href={fulfillment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {fulfillment.trackingNumber}
                        </a>
                      </div>
                    )}
                    {fulfillment.packagingType && (
                      <div>
                        <span className="text-sm text-gray-600">{t('fulfillments.packaging')}: </span>
                        <span className="font-medium">{fulfillment.packagingType}</span>
                      </div>
                    )}
                    {fulfillment.packageWeight && (
                      <div>
                        <span className="text-sm text-gray-600">{t('fulfillments.weight')}: </span>
                        <span className="font-medium">{fulfillment.packageWeight} kg</span>
                      </div>
                    )}
                    {fulfillment.signatureRequired && (
                      <div className="flex items-center">
                        <FiCheck className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium">{t('fulfillments.signature_required')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {fulfillment.deliveryInstructions && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.delivery_instructions')}</h4>
                  <p className="text-sm">{fulfillment.deliveryInstructions}</p>
                </div>
              )}
            </div>

            {/* Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">{t('fulfillments.costs')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('fulfillments.shipping_cost')}</span>
                  <span className="font-medium">${fulfillment.shippingCost.toFixed(2)}</span>
                </div>
                {fulfillment.insuranceCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('fulfillments.insurance_cost')}</span>
                    <span className="font-medium">${fulfillment.insuranceCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>{t('fulfillments.total_cost')}</span>
                  <span>${fulfillment.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(fulfillment.notes || fulfillment.internalNotes) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">{t('fulfillments.notes')}</h3>
                {fulfillment.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.public_notes')}</h4>
                    <p className="text-sm">{fulfillment.notes}</p>
                  </div>
                )}
                {fulfillment.internalNotes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('fulfillments.internal_notes')}</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{fulfillment.internalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">{t('fulfillments.items')}</h3>
              <div className="space-y-4">
                {fulfillment.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">{t('fulfillments.quantity')}: </span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('fulfillments.fulfilled')}: </span>
                            <span className="font-medium">{item.fulfilledQuantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('fulfillments.unit_price')}: </span>
                            <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">{t('fulfillments.total')}: </span>
                            <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        {item.locationPickedFrom && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">{t('fulfillments.location')}: </span>
                            <span className="text-sm">{item.locationPickedFrom}</span>
                          </div>
                        )}
                        {item.batchNumber && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-600">{t('fulfillments.batch')}: </span>
                            <span className="text-sm">{item.batchNumber}</span>
                          </div>
                        )}
                        {item.qualityCheck && (
                          <div className="mt-2 flex items-center">
                            <FiCheck className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">
                              {t('fulfillments.quality_checked')}
                              {item.qualityCheckAt && (
                                <span className="text-gray-500">
                                  {' '}{new Date(item.qualityCheckAt).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {item.conditionNotes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{t('fulfillments.condition')}: </span>
                              {item.conditionNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">{t('fulfillments.tracking_history')}</h3>
              {fulfillment.trackingHistory.length > 0 ? (
                <div className="space-y-4">
                  {fulfillment.trackingHistory.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        {index < fulfillment.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-300 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{event.description}</p>
                            {event.location && (
                              <p className="text-sm text-gray-600">{event.location}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(event.eventDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(event.eventDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {event.recipientName && (
                          <p className="text-sm text-gray-600 mt-1">
                            {t('fulfillments.recipient')}: {event.recipientName}
                          </p>
                        )}
                        {event.photoUrl && (
                          <div className="mt-2">
                            <img
                              src={event.photoUrl}
                              alt="Delivery proof"
                              className="w-32 h-32 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('fulfillments.no_tracking_history')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default FulfillmentDetailsPage;

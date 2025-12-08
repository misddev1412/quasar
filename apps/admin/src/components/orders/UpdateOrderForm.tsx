import React from 'react';
import { FiUser, FiActivity, FiCreditCard, FiFileText, FiCheckCircle, FiGift } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { z } from 'zod';

export interface UpdateOrderFormData {
  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  // Order Status
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

  // Payment & Shipping
  paymentMethod?: string;
  paymentReference?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;

  // Addresses
  billingAddress?: {
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

  // Notes
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;

  // Gift Options
  isGift: boolean;
  giftMessage?: string;

  // Discount
  discountCode?: string;
  discountAmount?: number;

  // Cancellation/Refund
  cancelledReason?: string;
  refundAmount?: number;
  refundReason?: string;
}

interface UpdateOrderFormProps {
  initialData: UpdateOrderFormData;
  onSubmit: (data: UpdateOrderFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const UpdateOrderForm: React.FC<UpdateOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab = 0,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();

  const addressSchema = z.object({
    firstName: z.string().min(1, t('first_name_required')),
    lastName: z.string().min(1, t('last_name_required')),
    company: z.string().optional(),
    address1: z.string().min(1, t('address_required')),
    address2: z.string().optional(),
    city: z.string().min(1, t('city_required')),
    state: z.string().min(1, t('state_required')),
    postalCode: z.string().min(1, t('postal_code_required')),
    country: z.string().min(1, t('country_required')),
  });

  const formSchema = z.object({
    customerName: z.string().min(1, t('customer_name_required')),
    customerEmail: z.string().email(t('valid_email_required')),
    customerPhone: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']),
    paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    shippingMethod: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDeliveryDate: z.string().optional(),
    billingAddress: addressSchema.optional(),
    shippingAddress: addressSchema.optional(),
    notes: z.string().optional(),
    customerNotes: z.string().optional(),
    internalNotes: z.string().optional(),
    isGift: z.boolean(),
    giftMessage: z.string().optional(),
    discountCode: z.string().optional(),
    discountAmount: z.number().min(0).optional(),
    cancelledReason: z.string().optional(),
    refundAmount: z.number().min(0).optional(),
    refundReason: z.string().optional(),
  });

  const tabs: FormTabConfig[] = [
    {
      id: 'customer',
      label: t('admin.customer_information'),
      icon: <FiUser className="w-4 h-4" />,
      sections: [{
        title: t('admin.customer_information'),
        icon: <FiUser className="w-4 h-4" />,
        fields: [
          {
            name: 'customerName',
            label: t('customer_name'),
            type: 'text',
            required: true,
            placeholder: t('enter_customer_name'),
          },
          {
            name: 'customerEmail',
            label: t('customer_email'),
            type: 'email',
            required: true,
            placeholder: t('enter_customer_email'),
          },
          {
            name: 'customerPhone',
            label: t('customer_phone'),
            type: 'tel',
            placeholder: t('enter_customer_phone'),
          },
        ],
      }],
    },
    {
      id: 'status',
      label: t('order_status'),
      icon: <FiActivity className="w-4 h-4" />,
      sections: [{
        title: t('order_status'),
        icon: <FiCheckCircle className="w-4 h-4" />,
        fields: [
          {
            name: 'status',
            label: t('order_status'),
            type: 'select',
            required: true,
            options: [
              { value: 'PENDING', label: t('orders.status_types.PENDING') },
              { value: 'CONFIRMED', label: t('orders.status_types.CONFIRMED') },
              { value: 'PROCESSING', label: t('orders.status_types.PROCESSING') },
              { value: 'SHIPPED', label: t('orders.status_types.SHIPPED') },
              { value: 'DELIVERED', label: t('orders.status_types.DELIVERED') },
              { value: 'CANCELLED', label: t('orders.status_types.CANCELLED') },
              { value: 'RETURNED', label: t('orders.status_types.RETURNED') },
              { value: 'REFUNDED', label: t('orders.status_types.REFUNDED') },
            ],
          },
          {
            name: 'paymentStatus',
            label: t('payment_status'),
            type: 'select',
            required: true,
            options: [
              { value: 'PENDING', label: t('orders.payment_status_types.PENDING') },
              { value: 'PAID', label: t('orders.payment_status_types.PAID') },
              { value: 'PARTIALLY_PAID', label: t('orders.payment_status_types.PARTIALLY_PAID') },
              { value: 'FAILED', label: t('orders.payment_status_types.FAILED') },
              { value: 'REFUNDED', label: t('orders.payment_status_types.REFUNDED') },
              { value: 'CANCELLED', label: t('orders.payment_status_types.CANCELLED') },
            ],
          },
          {
            name: 'cancelledReason',
            label: t('cancellation_reason'),
            type: 'textarea',
            placeholder: t('enter_cancellation_reason'),
          },
          {
            name: 'refundAmount',
            label: t('refund_amount'),
            type: 'number',
            placeholder: t('enter_refund_amount'),
          },
          {
            name: 'refundReason',
            label: t('refund_reason'),
            type: 'textarea',
            placeholder: t('enter_refund_reason'),
          },
        ],
      }],
    },
    {
      id: 'payment',
      label: t('payment_shipping'),
      icon: <FiCreditCard className="w-4 h-4" />,
      sections: [{
        title: t('payment_shipping'),
        icon: <FiCreditCard className="w-4 h-4" />,
        fields: [
          {
            name: 'paymentMethod',
            label: t('payment_method'),
            type: 'text',
            placeholder: t('enter_payment_method'),
          },
          {
            name: 'paymentReference',
            label: t('payment_reference'),
            type: 'text',
            placeholder: t('enter_payment_reference'),
          },
          {
            name: 'shippingMethod',
            label: t('shipping_method'),
            type: 'text',
            placeholder: t('enter_shipping_method'),
          },
          {
            name: 'trackingNumber',
            label: t('tracking_number'),
            type: 'text',
            placeholder: t('enter_tracking_number'),
          },
          {
            name: 'estimatedDeliveryDate',
            label: t('estimated_delivery_date'),
            type: 'text',
          },
        ],
      }],
    },
    {
      id: 'notes',
      label: t('notes_gift'),
      icon: <FiFileText className="w-4 h-4" />,
      sections: [{
        title: t('notes_gift'),
        icon: <FiGift className="w-4 h-4" />,
        fields: [
          {
            name: 'notes',
            label: t('order_notes'),
            type: 'textarea',
            placeholder: t('enter_order_notes'),
          },
          {
            name: 'customerNotes',
            label: t('customer_notes'),
            type: 'textarea',
            placeholder: t('enter_customer_notes'),
          },
          {
            name: 'internalNotes',
            label: t('internal_notes'),
            type: 'textarea',
            placeholder: t('enter_internal_notes'),
          },
          {
            name: 'isGift',
            label: t('is_gift'),
            type: 'checkbox',
          },
          {
            name: 'giftMessage',
            label: t('gift_message'),
            type: 'textarea',
            placeholder: t('enter_gift_message'),
          },
          {
            name: 'discountCode',
            label: t('discount_code'),
            type: 'text',
            placeholder: t('enter_discount_code'),
          },
          {
            name: 'discountAmount',
            label: t('discount_amount'),
            type: 'number',
            placeholder: t('enter_discount_amount'),
          },
        ],
      }],
    },
  ];

  return (
    <EntityForm<UpdateOrderFormData>
      tabs={tabs}
      initialValues={initialData}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitButtonText={t('update_order')}
      cancelButtonText={t('cancel')}
      onCancel={onCancel}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};
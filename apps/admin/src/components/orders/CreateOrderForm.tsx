import React, { useState } from 'react';
import { FiUser, FiCreditCard, FiFileText, FiMapPin, FiShoppingCart, FiHome, FiTruck, FiGift, FiSearch } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { ProductSelectionSection, OrderItem } from './ProductSelectionSection';
import { CustomerSearchModal, Customer } from '../customers/CustomerSearchModal';
import { z } from 'zod';

export interface CreateOrderFormData {
  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerId?: string;

  // Order Details
  source: 'WEBSITE' | 'MOBILE_APP' | 'PHONE' | 'EMAIL' | 'IN_STORE' | 'SOCIAL_MEDIA' | 'MARKETPLACE';
  currency: string;
  paymentMethod?: string;
  shippingMethod?: string;

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

  // Order Items
  items: OrderItem[];
}

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

const getInitialFormData = (): CreateOrderFormData => ({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerId: '',
  source: 'WEBSITE',
  currency: 'USD',
  paymentMethod: '',
  shippingMethod: '',
  notes: '',
  customerNotes: '',
  internalNotes: '',
  isGift: false,
  giftMessage: '',
  discountCode: '',
  items: [],
});

export const CreateOrderForm: React.FC<CreateOrderFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab = 0,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const [formData, setFormData] = useState<CreateOrderFormData>(getInitialFormData());
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleItemsChange = (items: OrderItem[]) => {
    setFormData(prev => ({ ...prev, items }));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: `${customer.firstName || 'Unnamed'} ${customer.lastName || ''}`.trim(),
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      billingAddress: customer.defaultBillingAddress,
      shippingAddress: customer.defaultShippingAddress,
    }));
    setShowCustomerModal(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({
      ...prev,
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      billingAddress: undefined,
      shippingAddress: undefined,
    }));
  };

  const addressSchema = z.object({
    firstName: z.string().min(1, t('admin.first_name_required')),
    lastName: z.string().min(1, t('admin.last_name_required')),
    company: z.string().optional(),
    address1: z.string().min(1, t('admin.address_required')),
    address2: z.string().optional(),
    city: z.string().min(1, t('admin.city_required')),
    state: z.string().min(1, t('admin.state_required')),
    postalCode: z.string().min(1, t('admin.postal_code_required')),
    country: z.string().min(1, t('admin.country_required')),
  });

  const formSchema = z.object({
    customerName: z.string().min(1, t('admin.customer_name_required')),
    customerEmail: z.string().email(t('admin.valid_email_required')),
    customerPhone: z.string().optional(),
    customerId: z.string().optional(),
    source: z.enum(['WEBSITE', 'MOBILE_APP', 'PHONE', 'EMAIL', 'IN_STORE', 'SOCIAL_MEDIA', 'MARKETPLACE']),
    currency: z.string().min(1, t('admin.currency_required')),
    paymentMethod: z.string().optional(),
    shippingMethod: z.string().optional(),
    billingAddress: addressSchema.optional(),
    shippingAddress: addressSchema.optional(),
    notes: z.string().optional(),
    customerNotes: z.string().optional(),
    internalNotes: z.string().optional(),
    isGift: z.boolean(),
    giftMessage: z.string().optional(),
    discountCode: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().min(1),
      productVariantId: z.string().optional(),
      productName: z.string().optional(), // Made optional since it can be auto-filled
      productSku: z.string().optional(),
      variantName: z.string().optional(),
      variantSku: z.string().optional(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0).optional(), // Made optional - will be auto-retrieved
      discountAmount: z.number().optional(),
      taxAmount: z.number().optional(),
      productImage: z.string().optional(),
      productAttributes: z.record(z.string()).optional(),
      isDigital: z.boolean().optional(),
      weight: z.number().optional(),
      dimensions: z.string().optional(),
      requiresShipping: z.boolean().optional(),
      isGiftCard: z.boolean().optional(),
      giftCardCode: z.string().optional(),
      notes: z.string().optional(),
      sortOrder: z.number().optional(),
    })).min(1, t('admin.at_least_one_item_required')),
  });

  const tabs: FormTabConfig[] = [
    {
      id: 'customer',
      label: t('admin.customer_information'),
      icon: <FiUser className="w-4 h-4" />,
      customContent: (
        <div className="space-y-6">
          {/* Customer Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('admin.customer_selection')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search for existing customers or enter new customer details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <FiSearch className="w-4 h-4 mr-2" />
                {t('admin.search_customer')}
              </button>
            </div>

            {selectedCustomer ? (
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-700 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center ring-2 ring-primary-200 dark:ring-primary-700">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {selectedCustomer.firstName?.charAt(0) || '?'}{selectedCustomer.lastName?.charAt(0) || ''}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                          {selectedCustomer.firstName || 'Unnamed'} {selectedCustomer.lastName || ''}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Selected
                        </span>
                      </div>
                      {selectedCustomer.companyName && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <span className="font-medium">Company:</span> {selectedCustomer.companyName}
                        </p>
                      )}
                      <div className="space-y-1">
                        {selectedCustomer.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {selectedCustomer.email}
                          </p>
                        )}
                        {selectedCustomer.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {selectedCustomer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    title={t('admin.clear_customer')}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <FiUser className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500 mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">{t('admin.no_customer_selected')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('admin.search_existing_customer_or_enter_details')}</p>
              </div>
            )}
          </div>

          {/* Manual Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0">
                <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCustomer ? t('admin.customer_details') : t('admin.customer_information')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCustomer ? 'Review and modify customer details if needed' : 'Enter customer information manually'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.customer_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder={t('admin.enter_customer_name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.customer_email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder={t('admin.enter_customer_email')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.customer_phone')}
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder={t('admin.enter_customer_phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.customer_id')}
                </label>
                <input
                  type="text"
                  value={formData.customerId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className={`block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                    selectedCustomer
                      ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                  placeholder={t('admin.enter_customer_id')}
                  readOnly={!!selectedCustomer}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('admin.optional_existing_customer_id')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'addresses',
      label: t('admin.addresses'),
      icon: <FiMapPin className="w-4 h-4" />,
      sections: [
        {
          title: t('admin.billing_address'),
          icon: <FiHome className="w-4 h-4" />,
          fields: [
            {
              name: 'billingAddress.firstName',
              label: t('admin.first_name'),
              type: 'text',
            },
            {
              name: 'billingAddress.lastName',
              label: t('admin.last_name'),
              type: 'text',
            },
            {
              name: 'billingAddress.company',
              label: t('admin.company'),
              type: 'text',
            },
            {
              name: 'billingAddress.address1',
              label: t('admin.address_line_1'),
              type: 'text',
            },
            {
              name: 'billingAddress.address2',
              label: t('admin.address_line_2'),
              type: 'text',
            },
            {
              name: 'billingAddress.city',
              label: t('admin.city'),
              type: 'text',
            },
            {
              name: 'billingAddress.state',
              label: t('admin.state'),
              type: 'text',
            },
            {
              name: 'billingAddress.postalCode',
              label: t('admin.postal_code'),
              type: 'text',
            },
            {
              name: 'billingAddress.country',
              label: t('admin.country'),
              type: 'text',
            },
          ],
        },
        {
          title: t('admin.shipping_address'),
          icon: <FiTruck className="w-4 h-4" />,
          fields: [
            {
              name: 'shippingAddress.firstName',
              label: t('admin.first_name'),
              type: 'text',
            },
            {
              name: 'shippingAddress.lastName',
              label: t('admin.last_name'),
              type: 'text',
            },
            {
              name: 'shippingAddress.company',
              label: t('admin.company'),
              type: 'text',
            },
            {
              name: 'shippingAddress.address1',
              label: t('admin.address_line_1'),
              type: 'text',
            },
            {
              name: 'shippingAddress.address2',
              label: t('admin.address_line_2'),
              type: 'text',
            },
            {
              name: 'shippingAddress.city',
              label: t('admin.city'),
              type: 'text',
            },
            {
              name: 'shippingAddress.state',
              label: t('admin.state'),
              type: 'text',
            },
            {
              name: 'shippingAddress.postalCode',
              label: t('admin.postal_code'),
              type: 'text',
            },
            {
              name: 'shippingAddress.country',
              label: t('admin.country'),
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      id: 'payment',
      label: t('admin.payment_shipping'),
      icon: <FiCreditCard className="w-4 h-4" />,
      sections: [{
        title: t('admin.payment_shipping'),
        icon: <FiCreditCard className="w-4 h-4" />,
        fields: [
          {
            name: 'source',
            label: t('admin.order_source'),
            type: 'select',
            required: true,
            options: [
              { value: 'WEBSITE', label: t('orders.source_types.WEBSITE') },
              { value: 'MOBILE_APP', label: t('orders.source_types.MOBILE_APP') },
              { value: 'PHONE', label: t('orders.source_types.PHONE') },
              { value: 'EMAIL', label: t('orders.source_types.EMAIL') },
              { value: 'IN_STORE', label: t('orders.source_types.IN_STORE') },
              { value: 'SOCIAL_MEDIA', label: t('orders.source_types.SOCIAL_MEDIA') },
              { value: 'MARKETPLACE', label: t('orders.source_types.MARKETPLACE') },
            ],
          },
          {
            name: 'currency',
            label: t('admin.currency'),
            type: 'select',
            required: true,
            options: [
              { value: 'USD', label: t('admin.usd_us_dollar') },
              { value: 'EUR', label: t('admin.eur_euro') },
              { value: 'GBP', label: t('admin.gbp_british_pound') },
              { value: 'JPY', label: t('admin.jpy_japanese_yen') },
              { value: 'VND', label: t('admin.vnd_vietnamese_dong') },
            ],
          },
          {
            name: 'paymentMethod',
            label: t('admin.payment_method'),
            type: 'text',
            placeholder: t('admin.enter_payment_method'),
          },
          {
            name: 'shippingMethod',
            label: t('admin.shipping_method'),
            type: 'text',
            placeholder: t('admin.enter_shipping_method'),
          },
        ],
      }],
    },
    {
      id: 'products',
      label: t('admin.products'),
      icon: <FiShoppingCart className="w-4 h-4" />,
      customContent: (
        <ProductSelectionSection
          items={formData.items}
          onItemsChange={handleItemsChange}
        />
      ),
    },
    {
      id: 'notes',
      label: t('admin.notes_gift'),
      icon: <FiFileText className="w-4 h-4" />,
      sections: [{
        title: t('admin.notes_gift'),
        icon: <FiGift className="w-4 h-4" />,
        fields: [
          {
            name: 'notes',
            label: t('admin.order_notes'),
            type: 'textarea',
            placeholder: t('admin.enter_order_notes'),
          },
          {
            name: 'customerNotes',
            label: t('admin.customer_notes'),
            type: 'textarea',
            placeholder: t('admin.enter_customer_notes'),
          },
          {
            name: 'internalNotes',
            label: t('admin.internal_notes'),
            type: 'textarea',
            placeholder: t('admin.enter_internal_notes'),
          },
          {
            name: 'isGift',
            label: t('admin.is_gift'),
            type: 'checkbox',
          },
          {
            name: 'giftMessage',
            label: t('admin.gift_message'),
            type: 'textarea',
            placeholder: t('admin.enter_gift_message'),
          },
          {
            name: 'discountCode',
            label: t('admin.discount_code'),
            type: 'text',
            placeholder: t('admin.enter_discount_code'),
          },
        ],
      }],
    },
  ];

  const handleFormSubmit = async (data: CreateOrderFormData) => {
    // Merge form data with current items
    const submitData = { ...data, items: formData.items };
    await onSubmit(submitData);
  };

  return (
    <>
      <EntityForm<CreateOrderFormData>
        tabs={tabs}
        initialValues={formData}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitButtonText={t('admin.create_order')}
        cancelButtonText={t('cancel')}
        onCancel={onCancel}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <CustomerSearchModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </>
  );
};
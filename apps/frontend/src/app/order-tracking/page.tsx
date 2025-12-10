'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Helmet } from 'react-helmet-async';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import { trpc } from '../../utils/trpc';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  Calendar,
  CreditCard,
  Box,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productAttributes?: Record<string, string>;
}

interface Fulfillment {
  id: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryDate?: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  orderDate: Date;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod?: string;
  trackingNumber?: string;
  shippedDate?: Date;
  deliveredDate?: Date;
  estimatedDeliveryDate?: Date;
  items: OrderItem[];
  fulfillments: Fulfillment[];
}

const OrderTrackingPage: React.FC = () => {
  const t = useTranslations();
  const [orderNumber, setOrderNumber] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const lookupQuery = trpc.clientOrders.lookup.useQuery(
    { orderNumber, emailOrPhone },
    {
      enabled: searchSubmitted && !!orderNumber && !!emailOrPhone,
      retry: false,
    }
  );

  // Extract order data from query result
  const order: Order | null = React.useMemo(() => {
    if (!lookupQuery.data) return null;
    
    // Handle nested response structure: { data: { code, status, data: orderData } }
    const responseData = lookupQuery.data as any;
    if (responseData?.data) {
      return responseData.data as Order;
    }
    // Fallback: direct data
    return responseData as Order;
  }, [lookupQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim() && emailOrPhone.trim()) {
      setSearchSubmitted(true);
    }
  };

  const handleReset = () => {
    setOrderNumber('');
    setEmailOrPhone('');
    setSearchSubmitted(false);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getOrderStatusStep = (status: string): number => {
    const steps: Record<string, number> = {
      PENDING: 1,
      CONFIRMED: 2,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
      RETURNED: -1,
      REFUNDED: -1,
    };
    return steps[status] || 1;
  };

  const statusSteps = [
    { key: 'PENDING', label: t('pages.order_tracking.status_pending'), icon: Clock },
    { key: 'PROCESSING', label: t('pages.order_tracking.status_processing'), icon: Package },
    { key: 'SHIPPED', label: t('pages.order_tracking.status_shipped'), icon: Truck },
    { key: 'DELIVERED', label: t('pages.order_tracking.status_delivered'), icon: CheckCircle },
  ];

  return (
    <>
      <Helmet>
        <title>{t('pages.order_tracking.page_title')}</title>
        <meta name="description" content={t('pages.order_tracking.page_description')} />
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <section className="relative isolate -mt-8 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 py-16 sm:py-20">
          <div className="absolute inset-0 opacity-40" aria-hidden="true">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
            <div className="absolute bottom-0 left-24 h-64 w-64 rounded-full bg-purple-400/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100 shadow-sm">
              <Search className="w-3 h-3 mr-1.5" />
              {t('pages.order_tracking.badge')}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {t('pages.order_tracking.title')}
            </h1>
            <p className="mt-4 text-lg text-indigo-100 sm:text-xl">
              {t('pages.order_tracking.subtitle')}
            </p>
          </div>
        </section>

        <PageBreadcrumbs
          items={[
            { label: t('common.home'), href: '/' },
            { label: t('pages.order_tracking.breadcrumb'), isCurrent: true },
          ]}
          fullWidth
        />

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Search Form */}
            {!order && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('pages.order_tracking.form_title')}
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('pages.order_tracking.form_description')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="orderNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('pages.order_tracking.order_number_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="orderNumber"
                        value={orderNumber}
                        onChange={(e) => {
                          setOrderNumber(e.target.value.toUpperCase());
                          setSearchSubmitted(false);
                        }}
                        placeholder={t('pages.order_tracking.order_number_placeholder')}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="emailOrPhone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('pages.order_tracking.email_or_phone_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="emailOrPhone"
                        value={emailOrPhone}
                        onChange={(e) => {
                          setEmailOrPhone(e.target.value);
                          setSearchSubmitted(false);
                        }}
                        placeholder={t('pages.order_tracking.email_or_phone_placeholder')}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={lookupQuery.isLoading}
                    className="w-full flex items-center justify-center px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lookupQuery.isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t('pages.order_tracking.searching')}
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        {t('pages.order_tracking.search_button')}
                      </>
                    )}
                  </button>
                </form>

                {/* Error State */}
                {searchSubmitted && lookupQuery.isError && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {t('pages.order_tracking.not_found_title')}
                        </h3>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          {t('pages.order_tracking.not_found_description')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Details */}
            {order && (
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  {t('pages.order_tracking.search_another')}
                </button>

                {/* Order Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('pages.order_tracking.order_number_prefix')}
                        {order.orderNumber}
                      </h2>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {t('pages.order_tracking.placed_on')} {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <StatusBadge status={order.status} variant="order" />
                      <StatusBadge status={order.paymentStatus} variant="payment" />
                    </div>
                  </div>

                  {/* Order Progress */}
                  {getOrderStatusStep(order.status) > 0 && (
                    <div className="mt-8">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, index) => {
                            const currentStep = getOrderStatusStep(order.status);
                            const isCompleted = currentStep > index + 1;
                            const isCurrent = currentStep === index + 1;
                            const Icon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className="flex flex-col items-center flex-1"
                              >
                                <div
                                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                                    isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : isCurrent
                                      ? 'bg-indigo-500 border-indigo-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span
                                  className={`mt-2 text-xs font-medium text-center ${
                                    isCompleted || isCurrent
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 mx-12">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{
                              width: `${Math.max(0, (getOrderStatusStep(order.status) - 1) / 3) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                            {t('pages.order_tracking.tracking_number')}: {order.trackingNumber}
                          </p>
                          {order.estimatedDeliveryDate && (
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                              {t('pages.order_tracking.estimated_delivery')}: {formatDate(order.estimatedDeliveryDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Box className="w-5 h-5 mr-2" />
                      {t('pages.order_tracking.order_items')} ({order.items.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-6 flex items-start gap-4">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {item.productName}
                          </h4>
                          {item.variantName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.variantName}
                            </p>
                          )}
                          {item.productAttributes && Object.keys(item.productAttributes).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-2">
                              {Object.entries(item.productAttributes).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {t('pages.order_tracking.quantity')}: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.totalPrice, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Shipping */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('pages.order_tracking.order_summary')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('pages.order_tracking.subtotal')}</span>
                        <span>{formatCurrency(order.subtotal, order.currency)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>{t('pages.order_tracking.discount')}</span>
                          <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('pages.order_tracking.shipping')}</span>
                        <span>
                          {order.shippingCost > 0
                            ? formatCurrency(order.shippingCost, order.currency)
                            : t('pages.order_tracking.free_shipping')}
                        </span>
                      </div>
                      {order.taxAmount > 0 && (
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>{t('pages.order_tracking.tax')}</span>
                          <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                          <span>{t('pages.order_tracking.total')}</span>
                          <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        {t('pages.order_tracking.shipping_address')}
                      </h3>
                      <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && (
                          <p>{order.shippingAddress.address2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                      {order.shippingMethod && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{t('pages.order_tracking.shipping_method')}:</span>{' '}
                            {order.shippingMethod}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fulfillments */}
                {order.fulfillments && order.fulfillments.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Truck className="w-5 h-5 mr-2" />
                        {t('pages.order_tracking.shipments')}
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {order.fulfillments.map((fulfillment, index) => (
                        <div key={fulfillment.id} className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {t('pages.order_tracking.shipment')} #{index + 1}
                            </span>
                            <StatusBadge status={fulfillment.status} variant="order" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {fulfillment.trackingNumber && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t('pages.order_tracking.tracking')}:
                                </span>{' '}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {fulfillment.trackingNumber}
                                </span>
                              </div>
                            )}
                            {fulfillment.carrier && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t('pages.order_tracking.carrier')}:
                                </span>{' '}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {fulfillment.carrier}
                                </span>
                              </div>
                            )}
                            {fulfillment.shippedAt && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t('pages.order_tracking.shipped_at')}:
                                </span>{' '}
                                <span className="text-gray-900 dark:text-white">
                                  {formatDate(fulfillment.shippedAt)}
                                </span>
                              </div>
                            )}
                            {fulfillment.estimatedDeliveryDate && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t('pages.order_tracking.estimated')}:
                                </span>{' '}
                                <span className="text-gray-900 dark:text-white">
                                  {formatDate(fulfillment.estimatedDeliveryDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Help Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('pages.order_tracking.need_help')}{' '}
                    <a
                      href="/contact"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {t('pages.order_tracking.contact_support')}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default OrderTrackingPage;


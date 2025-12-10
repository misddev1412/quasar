import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiCreditCard, FiPackage, FiTag, FiFileText, FiArrowLeft, FiHome, FiPlus, FiCopy } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AddressBookModal } from '../../components/customers/AddressBookModal';
import { AddressBookList } from '../../components/customers/AddressBookList';
import { AddressBook } from '../../types/address-book';
import { useToast } from '../../context/ToastContext';

const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressBook | undefined>(undefined);

  if (!id) {
    navigate('/customers');
    return null;
  }

  const { data: customerData, isLoading } = trpc.adminCustomers.detail.useQuery({ id }, {
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const customer = (customerData as any)?.data || {
    id: id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    type: 'INDIVIDUAL' as const,
    status: 'ACTIVE' as const,
    companyName: '',
    jobTitle: '',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    languagePreference: 'en',
    currencyPreference: 'USD',
    timezone: 'America/New_York',
    defaultBillingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      company: '',
      address1: '123 Main St',
      address2: '',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    defaultShippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      company: '',
      address1: '123 Main St',
      address2: '',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    marketingConsent: true,
    newsletterSubscribed: false,
    customerTags: ['vip', 'regular'],
    notes: 'Loyal customer since 2023',
    referralSource: 'website',
    taxExempt: false,
    taxId: '',
    totalOrders: 15,
    totalSpent: 2450.75,
    averageOrderValue: 163.38,
    firstOrderDate: '2023-01-15',
    lastOrderDate: '2024-01-15',
    loyaltyPoints: 245,
    createdAt: '2023-01-01',
  };

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/customers');
  };

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addressBook: AddressBook) => {
    setEditingAddress(addressBook);
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(undefined);
  };

  const handleAddressSuccess = () => {
    // Address list will refetch automatically due to tRPC cache invalidation
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'BLOCKED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const isVipCustomer = () => {
    return customer.totalSpent >= 1000 || customer.totalOrders >= 10;
  };

  const fallbackCopy = (value: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  };

  const handleCopy = async (value?: string | null, label?: string) => {
    if (!value) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ok = fallbackCopy(value);
        if (!ok) {
          throw new Error('fallback failed');
        }
      }
      addToast({
        title: label ? t('admin.copied_field', { field: label }) : t('admin.copied_to_clipboard'),
        type: 'success',
      });
    } catch {
      addToast({
        title: t('admin.copy_failed'),
        type: 'error',
      });
    }
  };

  const renderCopyButton = (value?: string | null, label?: string) => {
    if (!value) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={() => handleCopy(value, label)}
        className="ml-1 p-1 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary-300 dark:hover:bg-gray-800"
        aria-label={label ? t('admin.copy_field', { field: label }) : t('admin.copy_to_clipboard')}
      >
        <FiCopy className="w-4 h-4" />
      </button>
    );
  };

  const customerTypeLabel = t(`admin.customer_type.${customer.type.toLowerCase()}`);
  const customerStatusLabel = t(`admin.customer_status.${customer.status.toLowerCase()}`);
  const formattedDateOfBirth = customer.dateOfBirth ? formatDate(customer.dateOfBirth) : '-';
  const formattedCreatedAt = customer.createdAt ? formatDate(customer.createdAt) : '-';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: t('navigation.home'), href: '/', icon: <FiHome className="h-4 w-4" /> },
    { label: t('admin.customers'), href: '/customers', icon: <FiUser className="h-4 w-4" /> },
    { label: `${customer.firstName} ${customer.lastName}`, icon: <FiFileText className="h-4 w-4" /> },
  ];

  return (
    <BaseLayout
      title={t('admin.customer_detail')}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
            >
              <FiArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                  {(customer.firstName || '').charAt(0)}{(customer.lastName || '').charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  {isVipCustomer() && (
                    <div title={t('admin.vip_customer')}>
                      <FiAward className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>
                {customer.companyName && (
                  <p className="text-gray-600 dark:text-gray-400">{customer.companyName}</p>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleEdit}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            {t('admin.edit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                <FiUser className="w-5 h-5 mr-2" />
                {t('admin.customer_information')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.email')}
                  </label>
                  <div className="flex items-center flex-wrap gap-2">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white break-all">{customer.email}</span>
                    {renderCopyButton(customer.email, t('admin.email'))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.phone')}
                  </label>
                  <div className="flex items-center flex-wrap gap-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{customer.phone || '-'}</span>
                    {renderCopyButton(customer.phone, t('admin.phone'))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.customer_type')}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">
                      {customerTypeLabel}
                    </span>
                    {renderCopyButton(customerTypeLabel, t('admin.customer_type'))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.status')}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customerStatusLabel}
                    </span>
                    {renderCopyButton(customerStatusLabel, t('admin.status'))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.date_of_birth')}
                  </label>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formattedDateOfBirth}
                    </span>
                    {customer.dateOfBirth && renderCopyButton(formattedDateOfBirth, t('admin.date_of_birth'))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.customer_since')}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{formattedCreatedAt}</span>
                    {customer.createdAt && renderCopyButton(formattedCreatedAt, t('admin.customer_since'))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Address Book */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2" />
                  {t('admin.address_book')}
                </h2>
                <Button
                  onClick={handleAddAddress}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  {t('admin.add_address')}
                </Button>
              </div>

              <AddressBookList
                customerId={id}
                onAddressEdit={handleEditAddress}
                onAddressDelete={() => {
                  // Deletion is handled within the component
                }}
                onSetDefault={() => {
                  // Setting default is handled within the component
                }}
              />
            </Card>

            {/* Notes */}
            {customer.notes && (
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                  <FiFileText className="w-5 h-5 mr-2" />
                  {t('admin.notes')}
                </h2>
                <p className="text-gray-900 dark:text-white">{customer.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Statistics */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                <FiPackage className="w-5 h-5 mr-2" />
                {t('admin.order_statistics')}
              </h2>
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.total_orders')}
                </label>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.totalOrders}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.total_spent')}
                </label>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.average_order_value')}
                </label>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(customer.averageOrderValue)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.last_order')}
                </label>
                <span className="text-gray-900 dark:text-white">
                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : t('admin.no_orders')}
                </span>
              </div>
              </div>
            </Card>

            {/* Loyalty Points */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                <FiCreditCard className="w-5 h-5 mr-2" />
                {t('admin.loyalty_points')}
              </h2>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {customer.loyaltyPoints}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('admin.points_available')}
                </p>
              </div>
            </Card>

            {/* Customer Tags */}
            {customer.customerTags && customer.customerTags.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                  <FiTag className="w-5 h-5 mr-2" />
                  {t('admin.customer_tags')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {customer.customerTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Address Book Modal */}
        <AddressBookModal
          isOpen={isAddressModalOpen}
          onClose={handleCloseAddressModal}
          customerId={id}
          addressBook={editingAddress}
          onSuccess={handleAddressSuccess}
        />
      </div>
    </BaseLayout>
  );
};

export default CustomerDetailPage;

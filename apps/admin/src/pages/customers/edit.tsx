import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiEdit2, FiArrowLeft, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { EditCustomerForm, EditCustomerFormData } from '../../components/customers/EditCustomerForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const EditCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const { id } = useParams<{ id: string }>();

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
  };

  const updateCustomerMutation = trpc.adminCustomers.update.useMutation({
    onSuccess: (data: any) => {
      addToast({
        type: 'success',
        title: t('admin.customer_updated_successfully'),
        description: t('admin.customer_updated_successfully_description'),
      });
      navigate(`/customers/${id}`);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('admin.failed_to_update_customer'),
        description: error?.message || t('admin.update_customer_error_description'),
      });
    },
  });

  const handleSubmit = async (formData: EditCustomerFormData) => {
    await updateCustomerMutation.mutateAsync({ id, ...formData });
  };

  const handleCancel = () => {
    navigate(`/customers/${id}`);
  };

  const handleBack = () => {
    navigate('/customers');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BaseLayout title={t('admin.edit_customer')}>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            { label: t('navigation.home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
            { label: t('admin.customers'), href: '/customers' },
            { label: `${customer.firstName} ${customer.lastName}`, href: `/customers/${id}` },
            { label: t('admin.edit') },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
            >
              <FiArrowLeft className="w-4 h-4" />
            </Button>
            <FiEdit2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.edit_customer')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {`${customer.firstName} ${customer.lastName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <EditCustomerForm
            initialData={customer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateCustomerMutation.isPending}
          />
        </Card>
      </div>
    </BaseLayout>
  );
};

export default EditCustomerPage;
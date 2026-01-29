import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiEdit2, FiHome } from 'react-icons/fi';
import { EditCustomerForm, EditCustomerFormData } from '@admin/components/customers';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { StandardFormPage } from '@admin/components/common';

const EditCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    navigate('/customers');
    return null;
  }

  const { data: customerData, isLoading, error } = trpc.adminCustomers.detail.useQuery({ id }, {
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

  const breadcrumbs = useMemo(() => ([
    { label: t('navigation.home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
    { label: t('admin.customers'), href: '/customers' },
    { label: `${customer.firstName} ${customer.lastName}`, href: `/customers/${id}` },
    { label: t('admin.edit') },
  ]), [customer.firstName, customer.lastName, id, t]);

  const formId = 'customer-edit-form';

  return (
    <StandardFormPage
      title={t('admin.edit_customer')}
      description={t('admin.edit_customer_description', 'Update customer information')}
      icon={<FiEdit2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('admin.customer')}
      entityNamePlural={t('admin.customers')}
      backUrl="/customers"
      onBack={handleBack}
      onCancel={handleCancel}
      isSubmitting={updateCustomerMutation.isPending}
      mode="update"
      isLoading={isLoading}
      error={error}
      entityData={customer}
      formId={formId}
      breadcrumbs={breadcrumbs}
    >
      <EditCustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateCustomerMutation.isPending}
        showActions={false}
        formId={formId}
      />
    </StandardFormPage>
  );
};

export default EditCustomerPage;

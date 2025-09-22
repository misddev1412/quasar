import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateCustomerForm, CreateCustomerFormData } from '../../components/customers/CreateCustomerForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['personal', 'business', 'addresses', 'additional'] // Maps to CreateCustomerForm tab IDs
  });

  const createCustomerMutation = trpc.adminCustomers.create.useMutation({
    onSuccess: (data: any) => {
      addToast({
        type: 'success',
        title: t('admin.customer_created_successfully', 'Customer created'),
        description: t('admin.customer_created_successfully_description', 'The customer has been created successfully.'),
      });
      navigate('/customers');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('admin.failed_to_create_customer', 'Failed to create customer'),
        description: error?.message || t('admin.create_customer_error_description', 'An error occurred. Please try again.'),
      });
    },
  });

  const handleSubmit = async (formData: CreateCustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Customer creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <CreatePageTemplate
      title={t('admin.create_new_customer')}
      description={t('admin.create_customer_description')}
      icon={<UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('admin.customer')}
      entityNamePlural={t('admin.customers')}
      backUrl="/customers"
      onBack={handleCancel}
      isSubmitting={createCustomerMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('admin.customers', 'Customers'),
          onClick: handleCancel,
        },
        {
          label: t('admin.create_customer', 'Create Customer'),
        }
      ]}
    >
      <CreateCustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createCustomerMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateCustomerPage;
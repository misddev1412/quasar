import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateOrderForm, CreateOrderFormData } from '../../components/orders/CreateOrderForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['customer', 'addresses', 'payment', 'products', 'notes']
  });

  const createOrderMutation = trpc.adminOrders.create.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('order_created_successfully'),
        description: t('order_created_successfully_description'),
      });
      navigate(`/orders/${(data as any).data.id}`);
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('failed_to_create_order'),
        description: error.message || t('create_order_error_description'),
      });
    },
  });

  const handleSubmit = async (formData: CreateOrderFormData) => {
    try {
      await createOrderMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Order creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  return (
    <CreatePageTemplate
      title={t('admin.create_new_order')}
      description={t('admin.create_order_description')}
      icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('order')}
      entityNamePlural={t('orders.title')}
      backUrl="/orders"
      onBack={handleCancel}
      isSubmitting={createOrderMutation.isPending}
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
          label: t('create_order'),
        }
      ]}
    >
      <CreateOrderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createOrderMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateOrderPage;

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiInfo, FiGrid } from 'react-icons/fi';
import { Alert, AlertDescription, AlertTitle, StandardFormPage } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

const WarehouseLocationEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslationWithBackend();

  const breadcrumbItems = [
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouse_locations.title', 'Warehouse Locations'), href: '/warehouses/locations' },
    { label: t('warehouse_locations.edit', 'Edit Location') },
  ];

  return (
    <StandardFormPage
      title={t('warehouse_locations.edit', 'Edit Location')}
      description={t('warehouse_locations.edit_description', 'Update metadata for a warehouse location once the backend endpoints are available.')}
      icon={<FiGrid className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('warehouse_locations.location', 'Location')}
      entityNamePlural={t('warehouse_locations.title', 'Warehouse Locations')}
      backUrl="/warehouses/locations"
      onBack={() => navigate('/warehouses/locations')}
      onCancel={() => navigate('/warehouses/locations')}
      isSubmitting={false}
      mode="update"
      showActions={false}
      breadcrumbs={breadcrumbItems}
    >
      <Alert>
        <FiInfo className="w-5 h-5 text-blue-500" />
        <AlertTitle>{t('warehouse_locations.pending', 'Feature under construction')}</AlertTitle>
        <AlertDescription>
          {t(
            'warehouse_locations.edit_placeholder',
            'Editing warehouse locations is not yet available. The page will surface full editing capabilities once the backend location endpoints are integrated. Location id: {id}',
            { id: id || '—' },
          )}
        </AlertDescription>
      </Alert>
    </StandardFormPage>
  );
};

export default WarehouseLocationEditPage;

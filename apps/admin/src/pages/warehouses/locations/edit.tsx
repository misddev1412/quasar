import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import BaseLayout from '../../../components/layout/BaseLayout';
import { Button } from '../../../components/common/Button';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';

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
    <BaseLayout
      title={t('warehouse_locations.edit', 'Edit Location')}
      description={t('warehouse_locations.edit_description', 'Update metadata for a warehouse location once the backend endpoints are available.')}
      fullWidth
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/warehouses/locations')} className="flex items-center space-x-2">
            <FiArrowLeft className="w-4 h-4" />
            <span>{t('common.back', 'Back')}</span>
          </Button>
        </div>

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
      </div>
    </BaseLayout>
  );
};

export default WarehouseLocationEditPage;

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiMapPin, FiGrid } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../contexts/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { Formik, Form, Field, type FieldProps } from 'formik';
import * as Yup from 'yup';

const WarehouseLocationSchema = Yup.object().shape({
  warehouseId: Yup.string().required('Warehouse is required'),
  name: Yup.string().required('Location name is required').max(255),
  code: Yup.string().required('Code is required').max(100),
  type: Yup.string().required('Type is required'),
  description: Yup.string().optional(),
  maxCapacity: Yup.number().min(0).nullable().optional(),
  currentCapacity: Yup.number().min(0).default(0).optional(),
  isActive: Yup.boolean().default(true),
});

interface FormValues {
  warehouseId: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  maxCapacity?: number | '';
  currentCapacity?: number;
  isActive: boolean;
}

const initialValues: FormValues = {
  warehouseId: '',
  name: '',
  code: '',
  type: 'ZONE',
  description: '',
  maxCapacity: '',
  currentCapacity: 0,
  isActive: true,
};

const WarehouseLocationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const {
    data: warehousesResponse,
    isLoading: isLoadingWarehouses,
    error: warehousesError,
  } = trpc.adminWarehouses.getAll.useQuery(undefined, {
    retry: 1,
  });

  const warehouseOptions = useMemo(() => {
    const data = (warehousesResponse as { data?: unknown } | undefined)?.data;
    if (!Array.isArray(data)) {
      return [] as Array<{ id: string; name: string; code: string }>;
    }
    return (data as Array<{ id: string; name: string; code: string }>).map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
    }));
  }, [warehousesResponse]);

  const breadcrumbItems = useMemo(() => ([
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouse_locations.title', 'Warehouse Locations'), href: '/warehouses/locations' },
    { label: t('warehouse_locations.create', 'Create Location') },
  ]), [t]);

  if (isLoadingWarehouses) {
    return (
      <BaseLayout
        title={t('warehouse_locations.create', 'Create Location')}
        description={t('warehouse_locations.createDescription', 'Define a new logical location within a warehouse')}
        fullWidth
        breadcrumbs={breadcrumbItems}
      >
        <div className="flex justify-center items-center h-64">
          <Loading size="large" />
        </div>
      </BaseLayout>
    );
  }

  if (warehousesError) {
    return (
      <BaseLayout
        title={t('warehouse_locations.create', 'Create Location')}
        description={t('warehouse_locations.createDescription', 'Define a new logical location within a warehouse')}
        fullWidth
        breadcrumbs={breadcrumbItems}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{warehousesError.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const handleSubmit = (values: FormValues) => {
    addToast({
      type: 'info',
      title: t('warehouse_locations.coming_soon', 'Coming soon'),
      description: t('warehouse_locations.create_placeholder', 'Warehouse location management will be enabled once the backend endpoints are available.'),
    });
    navigate('/warehouses/locations');
  };

  return (
    <BaseLayout
      title={t('warehouse_locations.create', 'Create Location')}
      description={t('warehouse_locations.createDescription', 'Define a new logical location within a warehouse')}
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

        <Card>
          <div className="p-6">
            <Formik<FormValues>
              initialValues={initialValues}
              validationSchema={WarehouseLocationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('common.basic_information', 'Basic Information')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.warehouse', 'Warehouse')} *
                        </label>
                        <Field name="warehouseId">
                          {({ field }: FieldProps<string>) => (
                            <select
                              {...field}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.warehouseId && touched.warehouseId ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">
                                {t('warehouse_locations.select_warehouse', 'Select a warehouse')}
                              </option>
                              {warehouseOptions.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name} ({warehouse.code})
                                </option>
                              ))}
                            </select>
                          )}
                        </Field>
                        {errors.warehouseId && touched.warehouseId && (
                          <p className="mt-1 text-sm text-red-600">{errors.warehouseId}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.type', 'Location Type')} *
                        </label>
                        <Field name="type">
                          {({ field }: FieldProps<string>) => (
                            <select
                              {...field}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.type && touched.type ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="ZONE">{t('warehouse_locations.types.ZONE', 'Zone')}</option>
                              <option value="AISLE">{t('warehouse_locations.types.AISLE', 'Aisle')}</option>
                              <option value="SHELF">{t('warehouse_locations.types.SHELF', 'Shelf')}</option>
                              <option value="BIN">{t('warehouse_locations.types.BIN', 'Bin')}</option>
                            </select>
                          )}
                        </Field>
                        {errors.type && touched.type && (
                          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.name', 'Location Name')} *
                        </label>
                        <Field name="name">
                          {({ field }: FieldProps<string>) => (
                            <div className="relative">
                              <FiMapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="text"
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                            </div>
                          )}
                        </Field>
                        {errors.name && touched.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.code', 'Location Code')} *
                        </label>
                        <Field name="code">
                          {({ field }: FieldProps<string>) => (
                            <input
                              {...field}
                              type="text"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.code && touched.code ? 'border-red-500' : 'border-gray-300'
                              }`}
                              style={{ textTransform: 'uppercase' }}
                            />
                          )}
                        </Field>
                        {errors.code && touched.code && (
                          <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('warehouse_locations.capacity_settings', 'Capacity Settings')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.max_capacity', 'Maximum Capacity')}
                        </label>
                        <Field name="maxCapacity">
                          {({ field }: FieldProps<number | ''>) => (
                            <input
                              {...field}
                              type="number"
                              min={0}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.maxCapacity && touched.maxCapacity ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                          )}
                        </Field>
                        {errors.maxCapacity && touched.maxCapacity && (
                          <p className="mt-1 text-sm text-red-600">{errors.maxCapacity}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouse_locations.current_capacity', 'Current Capacity')}
                        </label>
                        <Field name="currentCapacity">
                          {({ field }: FieldProps<number | undefined>) => (
                            <input
                              {...field}
                              type="number"
                              min={0}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.currentCapacity && touched.currentCapacity ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                          )}
                        </Field>
                        {errors.currentCapacity && touched.currentCapacity && (
                          <p className="mt-1 text-sm text-red-600">{errors.currentCapacity}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Field name="isActive">
                      {({ field, form }: FieldProps<boolean>) => (
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={field.name}
                            checked={Boolean(field.value)}
                            onChange={() => form.setFieldValue(field.name, !field.value)}
                            className="h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {t('warehouse_locations.is_active', 'Active')}
                          </span>
                        </label>
                      )}
                    </Field>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/warehouses/locations')}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" startIcon={<FiSave className="w-4 h-4" />} disabled={isSubmitting}>
                      {t('common.save', 'Save')}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default WarehouseLocationCreatePage;

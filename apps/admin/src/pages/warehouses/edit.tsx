import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiHome, FiMapPin, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import type { Warehouse } from '../../types/warehouse';

// Form validation schema
const WarehouseSchema = Yup.object().shape({
  name: Yup.string()
    .required(() => ({
      key: 'warehouses.validation.nameRequired',
      fallback: 'Warehouse name is required',
    }))
    .max(255, 'Name must be less than 255 characters'),
  code: Yup.string()
    .required(() => ({
      key: 'warehouses.validation.codeRequired',
      fallback: 'Warehouse code is required',
    }))
    .max(100, 'Code must be less than 100 characters')
    .matches(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, underscores, and hyphens'),
  description: Yup.string().optional(),
  address: Yup.string().optional(),
  city: Yup.string().optional(),
  country: Yup.string().optional(),
  postalCode: Yup.string().optional(),
  phone: Yup.string().optional(),
  email: Yup.string().email('Invalid email address').optional(),
  managerName: Yup.string().optional(),
  isActive: Yup.boolean().default(true),
  isDefault: Yup.boolean().default(false),
  sortOrder: Yup.number().default(0),
});

interface WarehouseFormValues {
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

const WarehouseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // State
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitBehaviorRef = useRef<'redirect' | 'stay'>('redirect');
  const lastSubmitBehaviorRef = useRef<'redirect' | 'stay'>('redirect');

  const getErrorMessage = (fieldError: unknown) => {
    if (!fieldError) {
      return '';
    }

    if (typeof fieldError === 'string') {
      return fieldError;
    }

    if (typeof fieldError === 'object' && fieldError !== null) {
      const candidate = fieldError as { key?: unknown; fallback?: unknown };
      if (typeof candidate.key === 'string') {
        return t(
          candidate.key,
          typeof candidate.fallback === 'string' ? candidate.fallback : undefined
        );
      }
    }

    return String(fieldError);
  };

  // Get warehouse by ID
  const {
    data: warehouseResponse,
    isLoading: isLoadingWarehouse,
    error: warehouseError,
  } = trpc.adminWarehouses.getById.useQuery(
    { id: id! },
    {
      enabled: !!id,
    }
  );

  useEffect(() => {
    const payload = (warehouseResponse as { data?: Warehouse } | undefined)?.data;
    if (payload) {
      setWarehouse(payload);
      setLoading(false);
    }
  }, [warehouseResponse]);

  useEffect(() => {
    if (warehouseError) {
      setError(warehouseError.message);
      setLoading(false);
    }
  }, [warehouseError]);

  // Update warehouse mutation
  const updateWarehouseMutation = trpc.adminWarehouses.update.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('warehouses.updateSuccess', 'Warehouse updated successfully'),
        description: t('warehouses.updateSuccessDescription', 'The warehouse has been updated.'),
      });
      if (lastSubmitBehaviorRef.current === 'stay') {
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      navigate('/warehouses');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('warehouses.updateError', 'Failed to update warehouse'),
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const handleSubmit = async (values: WarehouseFormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    lastSubmitBehaviorRef.current = submitBehaviorRef.current;
    try {
      await updateWarehouseMutation.mutateAsync({ id, ...values });
    } catch (error) {
      setIsSubmitting(false);
    } finally {
      submitBehaviorRef.current = 'redirect';
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouses.title', 'Warehouses'), href: '/warehouses' },
    { label: t('warehouses.edit', 'Edit Warehouse') },
  ];

  if (loading) {
    return (
      <BaseLayout
        title={t('warehouses.editWarehouse', 'Edit Warehouse')}
        description={t('warehouses.editWarehouseDescription', 'Update warehouse information')}
      >
        <div className="flex justify-center items-center h-64">
          <Loading size="large" />
        </div>
      </BaseLayout>
    );
  }

  if (error || !warehouse) {
    return (
      <BaseLayout
        title={t('warehouses.editWarehouse', 'Edit Warehouse')}
        description={t('warehouses.editWarehouseDescription', 'Update warehouse information')}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{error || t('warehouses.notFound', 'Warehouse not found')}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  // Initial form values
  const initialValues: WarehouseFormValues = {
    name: warehouse.name,
    code: warehouse.code,
    description: warehouse.description || '',
    address: warehouse.address || '',
    city: warehouse.city || '',
    country: warehouse.country || '',
    postalCode: warehouse.postalCode || '',
    phone: warehouse.phone || '',
    email: warehouse.email || '',
    managerName: warehouse.managerName || '',
    isActive: warehouse.isActive,
    isDefault: warehouse.isDefault,
    sortOrder: warehouse.sortOrder,
  };

  return (
    <BaseLayout
      title={t('warehouses.editWarehouse', 'Edit Warehouse')}
      description={t('warehouses.editWarehouseDescription', 'Update warehouse information')}
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('warehouses.edit', 'Edit Warehouse')}: {warehouse.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('warehouses.editDescription', 'Update warehouse information and settings')}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/warehouses')}
              className="flex items-center space-x-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>{t('common.back', 'Back')}</span>
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={WarehouseSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, handleBlur }) => (
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('common.basic_information', 'Basic Information')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.name', 'Warehouse Name')} *
                        </label>
                        <Field name="name">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <FiHome className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="text"
                                placeholder={t('warehouses.namePlaceholder', 'e.g., Main Warehouse')}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.name && touched.name
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                          )}
                        </Field>
                        {errors.name && touched.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {getErrorMessage(errors.name)}
                          </p>
                        )}
                      </div>

                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.code', 'Warehouse Code')} *
                        </label>
                        <Field name="code">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <input
                                {...field}
                                type="text"
                                placeholder={t('warehouses.codePlaceholder', 'e.g., WH001')}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.code && touched.code
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }`}
                                style={{ textTransform: 'uppercase' }}
                              />
                            </div>
                          )}
                        </Field>
                        {errors.code && touched.code && (
                          <p className="mt-1 text-sm text-red-600">
                            {getErrorMessage(errors.code)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.description', 'Description')}
                        </label>
                        <Field name="description">
                          {({ field }: FieldProps) => (
                            <textarea
                              {...field}
                              rows={3}
                              placeholder={t('warehouses.descriptionPlaceholder', 'Brief description...')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('warehouses.location_information', 'Location Information')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.address', 'Address')}
                        </label>
                        <Field name="address">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <FiMapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="text"
                                placeholder="123 Warehouse Street"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.city', 'City')}
                        </label>
                        <Field name="city">
                          {({ field }: FieldProps) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="New York"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </Field>
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.country', 'Country')}
                        </label>
                        <Field name="country">
                          {({ field }: FieldProps) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="United States"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </Field>
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.postal_code', 'Postal Code')}
                        </label>
                        <Field name="postalCode">
                          {({ field }: FieldProps) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="10001"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </Field>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.phone', 'Phone')}
                        </label>
                        <Field name="phone">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <FiPhone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.email', 'Email')}
                        </label>
                        <Field name="email">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <FiMail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="email"
                                placeholder="warehouse@example.com"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </Field>
                        {errors.email && touched.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      {/* Manager Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.manager_name', 'Manager Name')}
                        </label>
                        <Field name="managerName">
                          {({ field }: FieldProps) => (
                            <div className="relative">
                              <FiUser className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="text"
                                placeholder="John Smith"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('common.settings', 'Settings')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sort Order */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.sort_order', 'Sort Order')}
                        </label>
                        <Field name="sortOrder">
                          {({ field }: FieldProps) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </Field>
                      </div>

                      {/* Active */}
                      <div>
                        <div className="flex items-center h-full">
                          <Field name="isActive">
                            {({ field }: FieldProps) => (
                              <label className="flex items-center space-x-3">
                                <input
                                  {...field}
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {t('warehouses.is_active', 'Active')}
                                </span>
                              </label>
                            )}
                          </Field>
                        </div>
                      </div>

                      {/* Default */}
                      <div>
                        <div className="flex items-center h-full">
                          <Field name="isDefault">
                            {({ field }: FieldProps) => (
                              <label className="flex items-center space-x-3">
                                <input
                                  {...field}
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {t('warehouses.is_default', 'Default Warehouse')}
                                </span>
                              </label>
                            )}
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/warehouses')}
                      disabled={isSubmitting}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                      onClick={() => {
                        submitBehaviorRef.current = 'stay';
                      }}
                    >
                      {isSubmitting && lastSubmitBehaviorRef.current === 'stay' ? (
                        <>
                          <Loading size="small" />
                          <span>{t('common.saving', 'Saving...')}</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>{t('common.save_and_continue', 'Save and Continue')}</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                      onClick={() => {
                        submitBehaviorRef.current = 'redirect';
                      }}
                    >
                      {isSubmitting && lastSubmitBehaviorRef.current !== 'stay' ? (
                        <>
                          <Loading size="small" />
                          <span>{t('common.saving', 'Saving...')}</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>{t('common.save', 'Save')}</span>
                        </>
                      )}
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

export default WarehouseEditPage;

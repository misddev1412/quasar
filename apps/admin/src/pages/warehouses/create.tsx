import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiHome, FiMapPin, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import clsx from 'clsx';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Formik, Form } from 'formik';
import { CountrySelector } from '../../components/common/CountrySelector';
import { InputWithIcon } from '../../components/common/InputWithIcon';
import * as Yup from 'yup';

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

const WarehouseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (!error) {
      return '';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const candidate = error as { key?: unknown; fallback?: unknown };
      if (typeof candidate.key === 'string') {
        return t(
          candidate.key,
          typeof candidate.fallback === 'string' ? candidate.fallback : undefined
        );
      }
    }

    return String(error);
  };

  // Create warehouse mutation
  const createWarehouseMutation = trpc.adminWarehouses.create.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('warehouses.createSuccess', 'Warehouse created successfully'),
        description: t('warehouses.createSuccessDescription', 'The warehouse has been created.'),
      });
      navigate('/warehouses');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('warehouses.createError', 'Failed to create warehouse'),
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  // Initial form values
  const initialValues: WarehouseFormValues = {
    name: '',
    code: '',
    description: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    managerName: '',
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  };

  const [selectedCountryCode, setSelectedCountryCode] = useState(initialValues.country);

  const countriesQuery = trpc.adminAddressBook.getCountries.useQuery(undefined, {
    staleTime: 1000 * 60 * 60,
  });

  const countries = countriesQuery.data ?? [];

  const selectedCountry = useMemo(() => {
    if (!selectedCountryCode) {
      return undefined;
    }

    return countries.find((country) => {
      const iso2 = typeof country.iso2 === 'string' ? country.iso2 : '';
      const code = typeof country.code === 'string' ? country.code : '';
      return iso2 === selectedCountryCode || code === selectedCountryCode;
    });
  }, [countries, selectedCountryCode]);

  const selectedCountryId = selectedCountry?.id ?? '';

  const provincesQuery = trpc.adminAddressBook.getAdministrativeDivisions.useQuery(
    selectedCountryId ? { countryId: selectedCountryId } : undefined,
    { enabled: Boolean(selectedCountryId) }
  );

  const provinces = (provincesQuery.data ?? []).filter((division) => division.type === 'PROVINCE');
  const isLoadingProvinces = provincesQuery.isLoading;

  const shouldUseAdministrativeDivisions = Boolean(selectedCountryId) && (isLoadingProvinces || provinces.length > 0);

  useEffect(() => {
    if (countriesQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('warehouses.countryLoadError', 'Unable to load countries right now.'),
      });
    }
  }, [countriesQuery.error, addToast, t]);

  useEffect(() => {
    if (provincesQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('warehouses.provinceLoadError', 'Unable to load administrative divisions for the selected country.'),
      });
    }
  }, [provincesQuery.error, addToast, t]);

  // Handle form submission
  const handleSubmit = async (values: WarehouseFormValues) => {
    setIsSubmitting(true);
    try {
      await createWarehouseMutation.mutateAsync(values);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouses.title', 'Warehouses'), href: '/warehouses' },
    { label: t('warehouses.create', 'Create Warehouse') },
  ];

  return (
    <BaseLayout
      title={t('warehouses.createWarehouse', 'Create Warehouse')}
      description={t('warehouses.createWarehouseDescription', 'Add a new warehouse to your system')}
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('warehouses.create', 'Create Warehouse')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('warehouses.createDescription', 'Add a new warehouse to your system')}
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
            >
              {({ errors, touched, values, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
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
                        <InputWithIcon
                          name="name"
                          value={values.name}
                          onChange={(event) => setFieldValue('name', event.target.value)}
                          onBlur={() => setFieldTouched('name', true)}
                          placeholder={t('warehouses.namePlaceholder', 'e.g., Main Warehouse')}
                          leftIcon={<FiHome className="h-4 w-4 text-gray-400" />}
                          className={clsx(
                            'h-11',
                            errors.name && touched.name
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300'
                          )}
                          aria-describedby={errors.name && touched.name ? 'warehouse-name-error' : undefined}
                        />
                        {errors.name && touched.name && (
                          <p id="warehouse-name-error" className="mt-1 text-sm text-red-600">
                            {getErrorMessage(errors.name)}
                          </p>
                        )}
                      </div>

                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.code', 'Warehouse Code')} *
                        </label>
                        <InputWithIcon
                          name="code"
                          value={values.code}
                          onChange={(event) => setFieldValue('code', event.target.value.toUpperCase())}
                          onBlur={() => setFieldTouched('code', true)}
                          placeholder={t('warehouses.codePlaceholder', 'e.g., WH001')}
                          className={clsx(
                            'h-11',
                            'uppercase',
                            errors.code && touched.code
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300'
                          )}
                          aria-describedby={errors.code && touched.code ? 'warehouse-code-error' : undefined}
                        />
                        {errors.code && touched.code && (
                          <p id="warehouse-code-error" className="mt-1 text-sm text-red-600">
                            {getErrorMessage(errors.code)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.description', 'Description')}
                        </label>
                        <textarea
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows={3}
                          placeholder={t('warehouses.descriptionPlaceholder', 'Brief description...')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                        <InputWithIcon
                          name="address"
                          value={values.address}
                          onChange={(event) => setFieldValue('address', event.target.value)}
                          onBlur={() => setFieldTouched('address', true)}
                          placeholder="123 Warehouse Street"
                          leftIcon={<FiMapPin className="h-4 w-4 text-gray-400" />}
                          className="h-11 border-gray-300"
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.country', 'Country')}
                        </label>
                        <CountrySelector
                          value={selectedCountryCode || undefined}
                          onChange={(code) => {
                            const nextCode = code || '';
                            setSelectedCountryCode(nextCode);
                            setFieldValue('country', nextCode);
                            setFieldValue('city', '');
                            setFieldTouched('country', true, false);
                          }}
                          className="w-full h-11"
                          size="md"
                          error={Boolean(errors.country && touched.country)}
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.city', 'City')}
                        </label>
                        {shouldUseAdministrativeDivisions ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <select
                                name="city"
                                value={values.city}
                                onChange={(event) => setFieldValue('city', event.target.value)}
                                onBlur={() => setFieldTouched('city', true)}
                                disabled={isLoadingProvinces}
                                className={clsx(
                                  'w-full px-3 h-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                  errors.city && touched.city
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300'
                                )}
                              >
                                <option value="">
                                  {t('warehouses.selectAdministrativeDivision', 'Select administrative division')}
                                </option>
                                {provinces.map((province) => (
                                  <option key={province.id} value={province.name}>
                                    {province.name}
                                  </option>
                                ))}
                              </select>
                              {isLoadingProvinces && <Loading size="small" />}
                            </div>
                          </div>
                        ) : (
                          <InputWithIcon
                            name="city"
                            value={values.city}
                            onChange={(event) => setFieldValue('city', event.target.value)}
                            onBlur={() => setFieldTouched('city', true)}
                            placeholder="New York"
                            className="h-11 border-gray-300"
                          />
                        )}
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.postal_code', 'Postal Code')}
                        </label>
                        <InputWithIcon
                          name="postalCode"
                          value={values.postalCode}
                          onChange={(event) => setFieldValue('postalCode', event.target.value)}
                          onBlur={() => setFieldTouched('postalCode', true)}
                          placeholder="10001"
                          className="h-11 border-gray-300"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.phone', 'Phone')}
                        </label>
                        <InputWithIcon
                          name="phone"
                          type="tel"
                          value={values.phone}
                          onChange={(event) => setFieldValue('phone', event.target.value)}
                          onBlur={() => setFieldTouched('phone', true)}
                          placeholder="+1 (555) 123-4567"
                          leftIcon={<FiPhone className="h-4 w-4 text-gray-400" />}
                          className="h-11 border-gray-300"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.email', 'Email')}
                        </label>
                        <InputWithIcon
                          name="email"
                          type="email"
                          value={values.email}
                          onChange={(event) => setFieldValue('email', event.target.value)}
                          onBlur={() => setFieldTouched('email', true)}
                          placeholder="warehouse@example.com"
                          leftIcon={<FiMail className="h-4 w-4 text-gray-400" />}
                          className={clsx(
                            'h-11',
                            errors.email && touched.email
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300'
                          )}
                          aria-describedby={errors.email && touched.email ? 'warehouse-email-error' : undefined}
                        />
                        {errors.email && touched.email && (
                          <p id="warehouse-email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      {/* Manager Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('warehouses.manager_name', 'Manager Name')}
                        </label>
                        <InputWithIcon
                          name="managerName"
                          value={values.managerName}
                          onChange={(event) => setFieldValue('managerName', event.target.value)}
                          onBlur={() => setFieldTouched('managerName', true)}
                          placeholder="John Smith"
                          leftIcon={<FiUser className="h-4 w-4 text-gray-400" />}
                          className="h-11 border-gray-300"
                        />
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
                        <InputWithIcon
                          name="sortOrder"
                          type="number"
                          min={0}
                          value={values.sortOrder}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            const parsed = nextValue === '' ? 0 : Number(nextValue);
                            setFieldValue('sortOrder', Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          onBlur={() => setFieldTouched('sortOrder', true)}
                          className="h-11 border-gray-300"
                        />
                      </div>

                      {/* Active */}
                      <div>
                        <div className="flex items-center h-full">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="isActive"
                              checked={values.isActive}
                              onChange={(event) => setFieldValue('isActive', event.target.checked)}
                              onBlur={() => setFieldTouched('isActive', true)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t('warehouses.is_active', 'Active')}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Default */}
                      <div>
                        <div className="flex items-center h-full">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="isDefault"
                              checked={values.isDefault}
                              onChange={(event) => setFieldValue('isDefault', event.target.checked)}
                              onBlur={() => setFieldTouched('isDefault', true)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t('warehouses.is_default', 'Default Warehouse')}
                            </span>
                          </label>
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
                    >
                      {isSubmitting ? (
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

export default WarehouseCreatePage;

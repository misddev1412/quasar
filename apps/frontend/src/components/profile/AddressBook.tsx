'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/react';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { useTranslations } from 'next-intl';
import { trpc } from '../../utils/trpc';
import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Globe,
  Home,
  Building,
  Star,
  Phone,
  Mail,
  User,
  Building2,
  MessageSquare
} from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
  iso2?: string;
  iso3?: string;
  phoneCode?: string;
}

interface AdministrativeDivision {
  id: string;
  name: string;
  code?: string;
  type: 'PROVINCE' | 'WARD';
}

interface Address {
  id: string;
  customerId: string;
  countryId: string;
  provinceId?: string;
  wardId?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  addressType: 'BILLING' | 'SHIPPING' | 'BOTH';
  isDefault: boolean;
  label?: string;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  formattedAddress: string;
  displayLabel: string;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  countryId: string;
  provinceId: string;
  wardId: string;
  addressType: 'BILLING' | 'SHIPPING' | 'BOTH';
  isDefault: boolean;
  label: string;
  deliveryInstructions: string;
}

export const AddressBook: React.FC = () => {
  const { showToast } = useToast();
  const t = useTranslations();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<AdministrativeDivision[]>([]);
  const [wards, setWards] = useState<AdministrativeDivision[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    countryId: '',
    provinceId: '',
    wardId: '',
    addressType: 'BOTH',
    isDefault: false,
    label: '',
    deliveryInstructions: ''
  });

  // tRPC queries and mutations
  const getAddressesQuery = trpc.clientAddressBook.getAddresses.useQuery();
  const getCountriesQuery = trpc.clientAddressBook.getCountries.useQuery();
  const createAddressMutation = trpc.clientAddressBook.createAddress.useMutation();
  const updateAddressMutation = trpc.clientAddressBook.updateAddress.useMutation();
  const deleteAddressMutation = trpc.clientAddressBook.deleteAddress.useMutation();
  const setDefaultAddressMutation = trpc.clientAddressBook.setDefaultAddress.useMutation();
  const getAdministrativeDivisionsQuery = trpc.clientAddressBook.getAdministrativeDivisions.useQuery(
    { countryId: formData.countryId, type: 'PROVINCE' },
    { enabled: !!formData.countryId }
  );

  const getAdministrativeDivisionsByParentIdQuery = trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: formData.provinceId },
    { enabled: !!formData.provinceId }
  );

  // Check if Vietnam is selected (VN is the country code for Vietnam)
  const isVietnamSelected = formData.countryId === '239';

  useEffect(() => {
    if (getAddressesQuery.data) {
      setAddresses(getAddressesQuery.data);
    }
  }, [getAddressesQuery.data]);

  useEffect(() => {
    if (getCountriesQuery.data) {
      setCountries(getCountriesQuery.data);
    }
  }, [getCountriesQuery.data]);

  // Load provinces when country changes - handled automatically by query
  // Load wards when province changes - handled automatically by new query

  useEffect(() => {
    if (getAdministrativeDivisionsQuery.data) {
      const filtered = getAdministrativeDivisionsQuery.data.filter(
        (div: AdministrativeDivision) => div.type === 'PROVINCE'
      );
      setProvinces(filtered);
    }
  }, [getAdministrativeDivisionsQuery.data]);

  useEffect(() => {
    if (getAdministrativeDivisionsByParentIdQuery.data) {
      setWards(getAdministrativeDivisionsByParentIdQuery.data);
    }
  }, [getAdministrativeDivisionsByParentIdQuery.data]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      companyName: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      countryId: '',
      provinceId: '',
      wardId: '',
      addressType: 'BOTH',
      isDefault: false,
      label: '',
      deliveryInstructions: ''
    });
    setIsAdding(false);
    setEditingId(null);
    setProvinces([]);
    setWards([]);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset dependent fields
    if (field === 'countryId') {
      const isVietnam = value === '239';
      setFormData(prev => ({
        ...prev,
        countryId: value as string,
        provinceId: '',
        wardId: '',
        // Clear Vietnam-specific hidden fields when switching to Vietnam
        ...(isVietnam && {
          companyName: '',
          addressLine2: '',
          postalCode: ''
        })
      }));
    } else if (field === 'provinceId') {
      setFormData(prev => ({
        ...prev,
        provinceId: value as string,
        wardId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        addressLine1: formData.addressLine1.trim(),
        ...(formData.companyName && { companyName: formData.companyName.trim() }),
        ...(formData.addressLine2 && { addressLine2: formData.addressLine2.trim() }),
        ...(formData.postalCode && { postalCode: formData.postalCode.trim() }),
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber.trim() }),
        ...(formData.email && { email: formData.email.trim() }),
        ...(formData.label && { label: formData.label.trim() }),
        ...(formData.deliveryInstructions && { deliveryInstructions: formData.deliveryInstructions.trim() }),
      };

      if (editingId) {
        await updateAddressMutation.mutateAsync({
          id: editingId,
          data: submitData
        });
        showToast({
          type: 'success',
          title: t('pages.profile.addresses.update_success'),
          description: t('pages.profile.addresses.update_success_desc')
        });
      } else {
        await createAddressMutation.mutateAsync(submitData);
        showToast({
          type: 'success',
          title: t('pages.profile.addresses.added_success'),
          description: t('pages.profile.addresses.added_success_desc')
        });
      }

      await getAddressesQuery.refetch();
      resetForm();
    } catch (error) {
      showToast({
        type: 'error',
        title: t('common.error'),
        description: (error as Error).message || t('pages.profile.addresses.save_error')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      companyName: address.companyName || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      postalCode: address.postalCode || '',
      phoneNumber: address.phoneNumber || '',
      email: address.email || '',
      countryId: address.countryId,
      provinceId: address.provinceId || '',
      wardId: address.wardId || '',
      addressType: address.addressType,
      isDefault: address.isDefault,
      label: address.label || '',
      deliveryInstructions: address.deliveryInstructions || ''
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('pages.profile.addresses.confirm_delete'))) return;

    try {
      await deleteAddressMutation.mutateAsync({ id });
      showToast({
        type: 'success',
        title: t('pages.profile.addresses.removed_success'),
        description: t('pages.profile.addresses.removed_success_desc')
      });
      await getAddressesQuery.refetch();
    } catch (error) {
      showToast({
        type: 'error',
        title: t('common.error'),
        description: (error as Error).message || t('pages.profile.addresses.delete_error')
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressMutation.mutateAsync({ id });
      showToast({
        type: 'success',
        title: t('pages.profile.addresses.default_set'),
        description: t('pages.profile.addresses.default_set_desc')
      });
      await getAddressesQuery.refetch();
    } catch (error) {
      showToast({
        type: 'error',
        title: t('common.error'),
        description: (error as Error).message || t('pages.profile.addresses.set_default_error')
      });
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'BILLING':
        return <Building className="w-3 h-3" />;
      case 'SHIPPING':
        return <Home className="w-3 h-3" />;
      case 'BOTH':
        return <Globe className="w-3 h-3" />;
      default:
        return <MapPin className="w-3 h-3" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'BILLING':
        return t('pages.profile.addresses.type_billing');
      case 'SHIPPING':
        return t('pages.profile.addresses.type_shipping');
      case 'BOTH':
        return t('pages.profile.addresses.type_both');
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {t('pages.profile.addresses.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('pages.profile.addresses.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          color="primary"
          icon={<Plus className="w-4 h-4" />}
          className="px-3 py-2 text-sm"
        >
          {t('pages.profile.addresses.add_address')}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-0 shadow-sm">
          <CardBody className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  {editingId ? t('pages.profile.addresses.edit_address') : t('pages.profile.addresses.add_new_address')}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  icon={<X className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.first_name')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.last_name')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.phone_number')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {!isVietnamSelected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pages.profile.addresses.company_name')}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.address_type')}
                  </label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => handleInputChange('addressType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  >
                    <option value="BILLING">{t('pages.profile.addresses.type_billing')}</option>
                    <option value="SHIPPING">{t('pages.profile.addresses.type_shipping')}</option>
                    <option value="BOTH">{t('pages.profile.addresses.type_both')}</option>
                  </select>
                </div>

                
                {!isVietnamSelected && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pages.profile.addresses.address_line_2')}
                    </label>
                    <textarea
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.country')} *
                  </label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => handleInputChange('countryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    required
                  >
                    <option value="">{t('pages.profile.addresses.select_country')}</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.province')}
                  </label>
                  <select
                    value={formData.provinceId}
                    onChange={(e) => handleInputChange('provinceId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  >
                    <option value="">{t('pages.profile.addresses.select_province')}</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.ward')}
                  </label>
                  <select
                    value={formData.wardId}
                    onChange={(e) => handleInputChange('wardId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  >
                    <option value="">{t('pages.profile.addresses.select_ward')}</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.address_line_1')} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                {!isVietnamSelected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pages.profile.addresses.postal_code')}
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.label')}
                  </label>
                  <select
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  >
                    <option value="">{t('pages.profile.addresses.select_label')}</option>
                    <option value="Home">{t('pages.profile.addresses.label_home')}</option>
                    <option value="Company">{t('pages.profile.addresses.label_company')}</option>
                    <option value="Apartment">{t('pages.profile.addresses.label_apartment')}</option>
                    <option value="Office">{t('pages.profile.addresses.label_office')}</option>
                    <option value="Parents">{t('pages.profile.addresses.label_parents')}</option>
                    <option value="Other">{t('pages.profile.addresses.label_other')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pages.profile.addresses.delivery_instructions')}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
                      placeholder={t('pages.profile.addresses.delivery_instructions_placeholder')}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('pages.profile.addresses.set_as_default')}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  loading={loading}
                  icon={<Check className="w-4 h-4" />}
                >
                  {editingId ? t('common.update') : t('common.save')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {getAddressesQuery.isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.loading')}
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardBody className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                {t('pages.profile.addresses.no_addresses')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('pages.profile.addresses.no_addresses_desc')}
              </p>
              <Button
                onClick={() => setIsAdding(true)}
                color="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                {t('pages.profile.addresses.add_first_address')}
              </Button>
            </CardBody>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAddressTypeIcon(address.addressType)}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getAddressTypeLabel(address.addressType)}
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          {t('pages.profile.addresses.default')}
                        </span>
                      )}
                      {address.label && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {address.label}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {address.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.addressLine1}
                      </p>
                      {address.addressLine2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {address.addressLine2}
                        </p>
                      )}
                      {address.companyName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {address.companyName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.formattedAddress}
                      </p>
                      {address.phoneNumber && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📞 {address.phoneNumber}
                        </p>
                      )}
                      {address.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ✉️ {address.email}
                        </p>
                      )}
                      {address.deliveryInstructions && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>{t('pages.profile.addresses.delivery_instructions')}:</strong> {address.deliveryInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!address.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(address.id)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(address)}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(address.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
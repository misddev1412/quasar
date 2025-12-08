import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { AddressBook, CreateAddressBookFormData, Country, AdministrativeDivision } from '../../types/address-book';

const addressBookSchema = z.object({
  customerId: z.string().min(1),
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().optional(),
  wardId: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line is required'),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  addressType: z.enum(['BILLING', 'SHIPPING', 'BOTH']),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  addressBook?: AddressBook;
  onSuccess?: (addressBook: AddressBook) => void;
}

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  customerId,
  addressBook,
  onSuccess
}) => {
  const { t } = useTranslationWithBackend();
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<AdministrativeDivision[]>([]);
  const [wards, setWards] = useState<AdministrativeDivision[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof addressBookSchema>>({
    resolver: zodResolver(addressBookSchema),
    defaultValues: {
      customerId,
      countryId: '',
      provinceId: '',
      wardId: '',
      firstName: '',
      lastName: '',
      companyName: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      addressType: 'BOTH',
      isDefault: false,
      label: '',
      deliveryInstructions: '',
    }
  });

  const countryId = watch('countryId');
  const provinceId = watch('provinceId');

  const createAddressBookMutation = trpc.adminAddressBook.create.useMutation();
  const updateAddressBookMutation = trpc.adminAddressBook.update.useMutation();

  // Fetch countries (you might want to implement this endpoint or use existing data)
  useEffect(() => {
    // For now, use mock data - you should implement actual countries fetch
    const mockCountries: Country[] = [
      { id: 'VN', name: 'Vietnam', code: 'VN', iso2: 'VN', createdAt: new Date(), updatedAt: new Date() },
      { id: 'US', name: 'United States', code: 'US', iso2: 'US', createdAt: new Date(), updatedAt: new Date() },
    ];
    setCountries(mockCountries);
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (countryId) {
      setSelectedCountryId(countryId);
      // Fetch provinces for selected country
      // For now using mock data
      const mockProvinces: AdministrativeDivision[] = [
        {
          id: 'HCM',
          name: 'Ho Chi Minh City',
          type: 'PROVINCE' as const,
          i18nKey: 'hcm',
          countryId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'HN',
          name: 'Hanoi',
          type: 'PROVINCE' as const,
          i18nKey: 'hanoi',
          countryId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];
      setProvinces(mockProvinces);
      setWards([]);
      setValue('provinceId', '');
      setValue('wardId', '');
    }
  }, [countryId, setValue]);

  // Fetch wards when province changes
  useEffect(() => {
    if (provinceId) {
      setSelectedProvinceId(provinceId);
      // Fetch wards for selected province
      const mockWards: AdministrativeDivision[] = [
        {
          id: 'D1',
          name: 'District 1',
          type: 'WARD' as const,
          i18nKey: 'd1',
          parentId: provinceId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'D2',
          name: 'District 2',
          type: 'WARD' as const,
          i18nKey: 'd2',
          parentId: provinceId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];
      setWards(mockWards);
      setValue('wardId', '');
    }
  }, [provinceId, setValue]);

  // Reset form when modal opens/closes or addressBook changes
  useEffect(() => {
    if (isOpen) {
      if (addressBook) {
        reset({
          customerId: addressBook.customerId,
          countryId: addressBook.countryId,
          provinceId: addressBook.provinceId || '',
          wardId: addressBook.wardId || '',
          firstName: addressBook.firstName,
          lastName: addressBook.lastName,
          companyName: addressBook.companyName || '',
          addressLine1: addressBook.addressLine1,
          addressLine2: addressBook.addressLine2 || '',
          postalCode: addressBook.postalCode || '',
          phoneNumber: addressBook.phoneNumber || '',
          email: addressBook.email || '',
          addressType: addressBook.addressType,
          isDefault: addressBook.isDefault,
          label: addressBook.label || '',
          deliveryInstructions: addressBook.deliveryInstructions || '',
        });
      } else {
        reset({
          customerId,
          countryId: '',
          provinceId: '',
          wardId: '',
          firstName: '',
          lastName: '',
          companyName: '',
          addressLine1: '',
          addressLine2: '',
          postalCode: '',
          phoneNumber: '',
          email: '',
          addressType: 'BOTH',
          isDefault: false,
          label: '',
          deliveryInstructions: '',
        });
      }
    }
  }, [isOpen, addressBook, customerId, reset]);

  const onSubmit = async (data: z.infer<typeof addressBookSchema>) => {
    try {
      if (addressBook) {
        const result = await updateAddressBookMutation.mutateAsync({
          id: addressBook.id,
          ...data
        });
        onSuccess?.((result as any)?.data);
      } else {
        const result = await createAddressBookMutation.mutateAsync(data);
        onSuccess?.((result as any)?.data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving address book:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">
          {addressBook ? t('address_book.edit_address') : t('address_book.add_address')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                id="firstName"
                type="text"
                label={t('address_book.first_name')}
                placeholder={t('address_book.first_name_placeholder')}
                error={errors.firstName?.message}
                required
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                id="lastName"
                type="text"
                label={t('address_book.last_name')}
                placeholder={t('address_book.last_name_placeholder')}
                error={errors.lastName?.message}
                required
              />
            )}
          />
        </div>

        <Controller
          name="companyName"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="companyName"
              type="text"
              label={t('address_book.company_name')}
              placeholder={t('address_book.company_name_placeholder')}
              error={errors.companyName?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="countryId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address_book.country')} *
                </label>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('address_book.select_country')}</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.countryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.countryId.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="provinceId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address_book.province')}
                </label>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!countryId}
                >
                  <option value="">{t('address_book.select_province')}</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          <Controller
            name="wardId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address_book.ward')}
                </label>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!provinceId}
                >
                  <option value="">{t('address_book.select_ward')}</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>

        <Controller
          name="addressLine1"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="addressLine1"
              type="text"
              label={t('address_book.address_line_1')}
              placeholder={t('address_book.address_line_1_placeholder')}
              error={errors.addressLine1?.message}
              required
            />
          )}
        />

        <Controller
          name="addressLine2"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="addressLine2"
              type="text"
              label={t('address_book.address_line_2')}
              placeholder={t('address_book.address_line_2_placeholder')}
              error={errors.addressLine2?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                id="postalCode"
                type="text"
                label={t('address_book.postal_code')}
                placeholder={t('address_book.postal_code_placeholder')}
                error={errors.postalCode?.message}
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                id="phoneNumber"
                type="tel"
                label={t('address_book.phone_number')}
                placeholder={t('address_book.phone_number_placeholder')}
                error={errors.phoneNumber?.message}
              />
            )}
          />
        </div>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="email"
              type="email"
              label={t('address_book.email')}
              placeholder={t('address_book.email_placeholder')}
              error={errors.email?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="addressType"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address_book.address_type')} *
                </label>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BILLING">{t('address_book.billing_address')}</option>
                  <option value="SHIPPING">{t('address_book.shipping_address')}</option>
                  <option value="BOTH">{t('address_book.both_address')}</option>
                </select>
              </div>
            )}
          />

          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                id="label"
                type="text"
                label={t('address_book.label')}
                placeholder={t('address_book.label_placeholder')}
                error={errors.label?.message}
              />
            )}
          />
        </div>

        <Controller
          name="deliveryInstructions"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('address_book.delivery_instructions')}
              </label>
              <textarea
                {...field}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('address_book.delivery_instructions_placeholder')}
              />
            </div>
          )}
        />

        <Controller
          name="isDefault"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={onChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                {t('address_book.set_as_default')}
              </label>
            </div>
          )}
        />

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting
              ? t('common.saving')
              : addressBook
                ? t('common.update')
                : t('common.create')
            }
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
};
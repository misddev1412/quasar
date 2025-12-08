import React, { useMemo } from 'react';
import { Input } from '@heroui/react';
import SelectField, { SelectOption } from '../common/SelectField';
import PhoneInputField, { PhoneInputCountryOption } from '../common/PhoneInputField';
import { useTranslations } from 'next-intl';

export interface AddressData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CountryOption {
  id: string;
  name: string;
  code?: string;
}

export interface AdministrativeDivisionOption {
  id: string;
  name: string;
  code?: string;
  type?: 'PROVINCE' | 'WARD';
}

interface AddressFormProps {
  address: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Record<string, string>;
  prefix?: string;
  className?: string;
  showCompany?: boolean;
  showPhone?: boolean;
  showAddress2?: boolean;
  requiredFields?: (keyof AddressData)[];
  countries?: CountryOption[];
  phoneCountryOptions?: PhoneInputCountryOption[];
  provinces?: AdministrativeDivisionOption[];
  wards?: AdministrativeDivisionOption[];
  loading?: {
    provinces?: boolean;
    wards?: boolean;
  };
  onCountryChange?: (countryId: string) => void;
  onProvinceChange?: (provinceId: string) => void;
  onWardChange?: (wardId: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onChange,
  errors = {},
  prefix = '',
  className = '',
  showCompany = true,
  showPhone = true,
  showAddress2 = true,
  requiredFields = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country'],
  countries: countryOptions = [],
  phoneCountryOptions,
  provinces: provinceOptions = [],
  wards: wardOptions = [],
  loading = {},
  onCountryChange,
  onProvinceChange,
  onWardChange,
}) => {
  const t = useTranslations('ecommerce.checkout.form.address');
  const getFieldError = (field: keyof AddressData) => errors[`${prefix}.${field}`] || '';
  const isFieldRequired = (field: keyof AddressData) => requiredFields.includes(field);

  const isCountrySelected = Boolean(address.country);
  const isProvinceSelected = Boolean(address.state);
  const hasProvinceOptions = provinceOptions.length > 0;
  const hasWardOptions = wardOptions.length > 0;

  const canSelectProvince = isCountrySelected;
  const canSelectWard = isProvinceSelected;
  const canEditCity = hasProvinceOptions ? isProvinceSelected : isCountrySelected;

  const handleCountrySelect = (value: string | null) => {
    const nextAddress = {
      ...address,
      country: value || '',
      state: '',
      city: '',
    };
    onChange(nextAddress);
    onCountryChange?.(nextAddress.country);
  };

  const handleProvinceSelect = (value: string | null) => {
    const nextAddress = {
      ...address,
      state: value || '',
      city: '',
    };
    onChange(nextAddress);
    if (value) {
      onProvinceChange?.(value);
    }
  };

  const handleWardSelect = (value: string | null) => {
    const nextAddress = {
      ...address,
      city: value || '',
    };
    onChange(nextAddress);
    if (value) {
      onWardChange?.(value);
    }
  };

  const updateField = (field: keyof AddressData, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const countrySelectOptions = useMemo<SelectOption[]>(
    () =>
      countryOptions.map((country) => ({
        value: country.id,
        label: country.name,
      })),
    [countryOptions]
  );

  const phoneSelectOptions = useMemo<PhoneInputCountryOption[]>(() => {
    if (phoneCountryOptions && phoneCountryOptions.length > 0) {
      return phoneCountryOptions;
    }

    return countryOptions
      .map((country) => ({
        code: country.code ? String(country.code).toUpperCase() : '',
        name: country.name,
      }))
      .filter((option) => option.code) as PhoneInputCountryOption[];
  }, [countryOptions, phoneCountryOptions]);

  const countryCodeById = useMemo(() => {
    const map = new Map<string, string>();
    countryOptions.forEach((country) => {
      if (country.id && country.code) {
        map.set(country.id, String(country.code).toUpperCase());
      }
    });
    return map;
  }, [countryOptions]);

  const defaultPhoneCountry = useMemo(() => {
    if (!address.country) {
      return undefined;
    }
    return countryCodeById.get(address.country);
  }, [address.country, countryCodeById]);

  const provinceSelectOptions = useMemo<SelectOption[]>(
    () =>
      provinceOptions.map((province) => ({
        value: province.id,
        label: province.name,
      })),
    [provinceOptions]
  );

  const wardSelectOptions = useMemo<SelectOption[]>(
    () =>
      wardOptions.map((ward) => ({
        value: ward.id,
        label: ward.name,
      })),
    [wardOptions]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <SelectField
        label={t('labels.country')}
        required={isFieldRequired('country')}
        error={getFieldError('country')}
        inputId={`${prefix || 'address'}-country`}
        options={countrySelectOptions}
        value={address.country || null}
        placeholder={
          countryOptions.length
            ? t('placeholders.country')
            : t('placeholders.noCountries')
        }
        isDisabled={countryOptions.length === 0}
        onChange={handleCountrySelect}
        onBlur={() => {
          if (!address.country) {
            handleCountrySelect('');
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('labels.firstName')}
          placeholder={t('placeholders.firstName')}
          value={address.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('firstName')}
          errorMessage={getFieldError('firstName')}
          isRequired={isFieldRequired('firstName')}
          fullWidth
        />

        <Input
          label={t('labels.lastName')}
          placeholder={t('placeholders.lastName')}
          value={address.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('lastName')}
          errorMessage={getFieldError('lastName')}
          isRequired={isFieldRequired('lastName')}
          fullWidth
        />
      </div>

      {showCompany && (
        <Input
          label={t('labels.company')}
          placeholder={t('placeholders.company')}
          value={address.company || ''}
          onChange={(e) => updateField('company', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('company')}
          errorMessage={getFieldError('company')}
          fullWidth
        />
      )}

      <Input
        label={t('labels.address1')}
        placeholder={t('placeholders.address1')}
        value={address.address1}
        onChange={(e) => updateField('address1', e.target.value)}
        variant="bordered"
        isInvalid={!!getFieldError('address1')}
        errorMessage={getFieldError('address1')}
        isRequired={isFieldRequired('address1')}
        fullWidth
      />

      {showAddress2 && (
        <Input
          label={t('labels.address2')}
          placeholder={t('placeholders.address2')}
          value={address.address2 || ''}
          onChange={(e) => updateField('address2', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('address2')}
          errorMessage={getFieldError('address2')}
          fullWidth
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasProvinceOptions ? (
          <SelectField
            label={t('labels.state')}
            required={isFieldRequired('state')}
            error={getFieldError('state')}
            options={provinceSelectOptions}
            value={address.state || null}
            isDisabled={!canSelectProvince || loading.provinces}
            isLoading={loading.provinces}
            placeholder={t('placeholders.province')}
            helperText={!canSelectProvince ? t('helpers.selectCountryFirst') : undefined}
            onChange={handleProvinceSelect}
          />
        ) : (
          <Input
            label={t('labels.state')}
            placeholder={t('placeholders.state')}
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
            variant="bordered"
            isInvalid={!!getFieldError('state')}
            errorMessage={getFieldError('state')}
            isRequired={isFieldRequired('state')}
            fullWidth
            isDisabled={!isCountrySelected}
          />
        )}

        {hasWardOptions ? (
          <SelectField
            label={t('labels.citySelect')}
            required={isFieldRequired('city')}
            error={getFieldError('city')}
            options={wardSelectOptions}
            value={address.city || null}
            isDisabled={!canSelectWard || loading.wards}
            isLoading={loading.wards}
            placeholder={t('placeholders.citySelect')}
            helperText={
              !isCountrySelected
                ? t('helpers.selectCountryFirst')
                : !isProvinceSelected
                ? t('helpers.selectProvinceFirst')
                : undefined
            }
            onChange={handleWardSelect}
          />
        ) : (
          <Input
            label={t('labels.city')}
            placeholder={t('placeholders.city')}
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            variant="bordered"
            isInvalid={!!getFieldError('city')}
            errorMessage={getFieldError('city')}
            isRequired={isFieldRequired('city')}
            fullWidth
            isDisabled={!canEditCity}
          />
        )}

        <Input
          label={t('labels.postalCode')}
          placeholder={t('placeholders.postalCode')}
          value={address.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('postalCode')}
          errorMessage={getFieldError('postalCode')}
          isRequired={isFieldRequired('postalCode')}
          fullWidth
        />
      </div>

      {showPhone && (
        <PhoneInputField
          id={`${prefix || 'address'}-phone`}
          label={t('labels.phone')}
          placeholder={t('placeholders.phone')}
          value={address.phone}
          onChange={(value) => updateField('phone', value || '')}
          error={getFieldError('phone')}
          countryOptions={phoneSelectOptions}
          defaultCountry={defaultPhoneCountry}
          className="w-full"
        />
      )}
    </div>
  );
};

export default AddressForm;

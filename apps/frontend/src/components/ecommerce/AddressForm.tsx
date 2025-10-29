import React from 'react';
import { Input, Select, SelectItem } from '@heroui/react';

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
  provinces: provinceOptions = [],
  wards: wardOptions = [],
  loading = {},
  onCountryChange,
  onProvinceChange,
  onWardChange,
}) => {
  const getFieldError = (field: keyof AddressData) => {
    return errors[`${prefix}.${field}`] || '';
  };

  const isFieldRequired = (field: keyof AddressData) => {
    return requiredFields.includes(field);
  };

  const isCountrySelected = Boolean(address.country);
  const isProvinceSelected = Boolean(address.state);
  const hasProvinceOptions = provinceOptions.length > 0;
  const hasWardOptions = wardOptions.length > 0;

  const canSelectProvince = isCountrySelected;
  const canSelectWard = isProvinceSelected;
  const canEditCity = hasProvinceOptions ? isProvinceSelected : isCountrySelected;

  const handleCountrySelect = (value: string) => {
    const nextAddress = {
      ...address,
      country: value,
      state: '',
      city: '',
    };
    onChange(nextAddress);
    onCountryChange?.(value);
  };

  const handleProvinceSelect = (value: string) => {
    const nextAddress = {
      ...address,
      state: value,
      city: '',
    };
    onChange(nextAddress);
    onProvinceChange?.(value);
  };

  const handleWardSelect = (value: string) => {
    const nextAddress = {
      ...address,
      city: value,
    };
    onChange(nextAddress);
    onWardChange?.(value);
  };

  const updateField = (field: keyof AddressData, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const selectedCountryKey = address.country ? new Set([address.country]) : new Set<string>();
  const selectedProvinceKey = address.state ? new Set([address.state]) : new Set<string>();
  const selectedWardKey = address.city ? new Set([address.city]) : new Set<string>();

  return (
    <div className={`space-y-4 ${className}`}>
      <Select
        label="Country"
        selectedKeys={selectedCountryKey}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;
          handleCountrySelect(selectedKey ?? '');
        }}
        variant="bordered"
        isInvalid={!!getFieldError('country')}
        errorMessage={getFieldError('country')}
        isRequired={isFieldRequired('country')}
        fullWidth
        isDisabled={countryOptions.length === 0}
        placeholder={countryOptions.length ? 'Select country' : 'No countries available'}
      >
        {countryOptions.map((country) => (
          <SelectItem key={country.id} value={country.id}>
            {country.name}
          </SelectItem>
        ))}
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          value={address.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('firstName')}
          errorMessage={getFieldError('firstName')}
          isRequired={isFieldRequired('firstName')}
          fullWidth
        />

        <Input
          label="Last Name"
          placeholder="Doe"
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
          label="Company (Optional)"
          placeholder="Acme Inc."
          value={address.company || ''}
          onChange={(e) => updateField('company', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('company')}
          errorMessage={getFieldError('company')}
          fullWidth
        />
      )}

      <Input
        label="Address"
        placeholder="123 Main St"
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
          label="Apartment, suite, etc. (Optional)"
          placeholder="Apt 4B"
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
          <Select
            label="State/Province"
            selectedKeys={selectedProvinceKey}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string | undefined;
              handleProvinceSelect(selectedKey ?? '');
            }}
            variant="bordered"
            isInvalid={!!getFieldError('state')}
            errorMessage={getFieldError('state')}
            isRequired={isFieldRequired('state')}
            fullWidth
            isLoading={loading.provinces}
            isDisabled={!canSelectProvince || loading.provinces}
            placeholder={canSelectProvince ? 'Select province' : 'Select country first'}
          >
            {provinceOptions.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </Select>
        ) : (
          <Input
            label="State/Province"
            placeholder="State or Province"
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
          <Select
            label="District/Ward"
            selectedKeys={selectedWardKey}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string | undefined;
              handleWardSelect(selectedKey ?? '');
            }}
            variant="bordered"
            isInvalid={!!getFieldError('city')}
            errorMessage={getFieldError('city')}
            isRequired={isFieldRequired('city')}
            fullWidth
            isLoading={loading.wards}
            isDisabled={!canSelectWard || loading.wards}
            placeholder={!isCountrySelected
              ? 'Select country first'
              : !isProvinceSelected
              ? 'Select province first'
              : 'Select district/ward'
            }
          >
            {wardOptions.map((ward) => (
              <SelectItem key={ward.id} value={ward.id}>
                {ward.name}
              </SelectItem>
            ))}
          </Select>
        ) : (
          <Input
            label="City"
            placeholder="City"
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
          label="Postal Code"
          placeholder="10001"
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
        <Input
          label="Phone (Optional)"
          placeholder="(555) 123-4567"
          value={address.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('phone')}
          errorMessage={getFieldError('phone')}
          fullWidth
        />
      )}
    </div>
  );
};

export default AddressForm;

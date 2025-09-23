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
}) => {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
  ];

  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ];

  const caProvinces = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'YT', name: 'Yukon' },
  ];

  const getFieldError = (field: keyof AddressData) => {
    return errors[`${prefix}.${field}`] || '';
  };

  const isFieldRequired = (field: keyof AddressData) => {
    return requiredFields.includes(field);
  };

  const updateField = (field: keyof AddressData, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const getStateProvinces = () => {
    if (address.country === 'CA') {
      return caProvinces;
    }
    return usStates;
  };

  return (
    <div className={`space-y-4 ${className}`}>
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
        <Input
          label="City"
          placeholder="New York"
          value={address.city}
          onChange={(e) => updateField('city', e.target.value)}
          variant="bordered"
          isInvalid={!!getFieldError('city')}
          errorMessage={getFieldError('city')}
          isRequired={isFieldRequired('city')}
          fullWidth
        />
        
        <Select
          label="State/Province"
          selectedKeys={[address.state]}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            updateField('state', selectedKey);
          }}
          variant="bordered"
          isInvalid={!!getFieldError('state')}
          errorMessage={getFieldError('state')}
          isRequired={isFieldRequired('state')}
          fullWidth
        >
          {getStateProvinces().map((state) => (
            <SelectItem key={state.code}>
              {state.name}
            </SelectItem>
          ))}
        </Select>
        
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
      
      <Select
        label="Country"
        selectedKeys={[address.country]}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          updateField('country', selectedKey);
          // Reset state when country changes
          updateField('state', '');
        }}
        variant="bordered"
        isInvalid={!!getFieldError('country')}
        errorMessage={getFieldError('country')}
        isRequired={isFieldRequired('country')}
        fullWidth
      >
        {countries.map((country) => (
          <SelectItem key={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </Select>
      
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
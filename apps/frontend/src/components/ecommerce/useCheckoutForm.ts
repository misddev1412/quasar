import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdministrativeDivisionOption, CountryOption } from './AddressForm';
import type { PhoneInputCountryOption } from '../common/PhoneInputField';
import { trpc } from '../../utils/trpc';
import type {
  CheckoutCountry,
  CheckoutFormData,
  DeliveryMethodOption,
  SavedAddress,
} from './CheckoutForm.types';

const OPTIONAL_POSTAL_CODE_COUNTRY_CODES = new Set<string>([
  'AE',
  'AG',
  'AI',
  'AO',
  'AW',
  'BF',
  'BI',
  'BJ',
  'BO',
  'BS',
  'BZ',
  'CD',
  'CF',
  'CG',
  'CI',
  'CK',
  'CM',
  'CO',
  'DJ',
  'DM',
  'DO',
  'ER',
  'FJ',
  'GD',
  'GH',
  'GM',
  'GQ',
  'GY',
  'HK',
  'IE',
  'JM',
  'KE',
  'KI',
  'KN',
  'KP',
  'LC',
  'ML',
  'MO',
  'MR',
  'MS',
  'MU',
  'MW',
  'NA',
  'NR',
  'NU',
  'PA',
  'QA',
  'RW',
  'SB',
  'SC',
  'SL',
  'SR',
  'ST',
  'SY',
  'TD',
  'TF',
  'TG',
  'TK',
  'TL',
  'TO',
  'TT',
  'TV',
  'TZ',
  'UG',
  'UY',
  'VC',
  'VE',
  'VN',
  'VU',
  'WS',
  'ZA',
  'ZW',
  'BHS',
  'BRB',
  'ATG',
  'VNM',
]);

interface UseCheckoutFormParams {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  onSubmit: (data: CheckoutFormData) => void;
  savedAddresses?: SavedAddress[];
  countries?: CheckoutCountry[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  defaultEmail?: string;
  initialData?: Partial<CheckoutFormData>;
  onFormDataChange?: (data: CheckoutFormData) => void;
  defaultCountryId?: string;
}

interface UseCheckoutFormResult {
  formData: CheckoutFormData;
  errors: Record<string, string>;
  countryOptions: CountryOption[];
  phoneCountryOptions: PhoneInputCountryOption[];
  shippingProvinceOptions: AdministrativeDivisionOption[];
  shippingWardOptions: AdministrativeDivisionOption[];
  billingAddressValue: NonNullable<CheckoutFormData['billingAddress']>;
  billingProvinceOptions: AdministrativeDivisionOption[];
  billingWardOptions: AdministrativeDivisionOption[];
  shippingRequiredFields: (keyof CheckoutFormData['shippingAddress'])[];
  billingRequiredFields: (keyof NonNullable<CheckoutFormData['billingAddress']>)[];
  shippingProvincesQuery: ReturnType<typeof trpc.clientAddressBook.getAdministrativeDivisions.useQuery>;
  shippingWardsQuery: ReturnType<typeof trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery>;
  billingProvincesQuery: ReturnType<typeof trpc.clientAddressBook.getAdministrativeDivisions.useQuery>;
  billingWardsQuery: ReturnType<typeof trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery>;
  selectedSavedAddressId: string | null;
  handleSavedAddressSelect: (address: SavedAddress) => void;
  handleManualShippingChange: (address: CheckoutFormData['shippingAddress']) => void;
  handleBillingAddressChange: (address: CheckoutFormData['billingAddress']) => void;
  handleBillingSameAsShippingChange: (value: boolean) => void;
  clearSavedAddressSelection: () => void;
  markSavedAddressModified: () => void;
  updateFormData: (path: string, value: any) => void;
  handleSubmit: (event: React.FormEvent) => void;
  activeStep: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  goToStep: (step: number) => void;
  deliveryMethods: DeliveryMethodOption[];
  deliveryMethodsQuery: ReturnType<typeof trpc.clientDeliveryMethods.list.useQuery>;
  selectedShippingMethod: DeliveryMethodOption | undefined;
  adjustedShippingCost: number;
  discountAmount: number;
  adjustedTotal: number;
}

export const useCheckoutForm = ({
  subtotal,
  shippingCost,
  tax,
  total,
  onSubmit,
  savedAddresses = [],
  countries = [],
  initialStep = 1,
  onStepChange,
  defaultEmail,
  initialData,
  onFormDataChange,
  defaultCountryId,
}: UseCheckoutFormParams): UseCheckoutFormResult => {
  const clampStep = useCallback((value: number) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 1;
    }
    return Math.min(3, Math.max(1, Math.trunc(numericValue)));
  }, []);

  const initialFormState = useMemo<CheckoutFormData>(() => {
    const base: CheckoutFormData = {
      email: defaultEmail ?? '',
      shippingAddress: {
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
      },
      billingAddressSameAsShipping: true,
      shippingMethod: '',
      paymentMethod: {
        type: 'credit_card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      },
      orderNotes: '',
      agreeToTerms: false,
      agreeToMarketing: false,
    };

    if (initialData) {
      if (typeof initialData.email === 'string' && initialData.email.trim().length > 0) {
        base.email = initialData.email.trim();
      }

      if (typeof initialData.billingAddressSameAsShipping === 'boolean') {
        base.billingAddressSameAsShipping = initialData.billingAddressSameAsShipping;
      }

      if (typeof initialData.shippingMethod === 'string') {
        base.shippingMethod = initialData.shippingMethod;
      }

      if (typeof initialData.orderNotes === 'string') {
        base.orderNotes = initialData.orderNotes;
      }

      if (typeof initialData.agreeToTerms === 'boolean') {
        base.agreeToTerms = initialData.agreeToTerms;
      }

      if (typeof initialData.agreeToMarketing === 'boolean') {
        base.agreeToMarketing = initialData.agreeToMarketing;
      }

      if (initialData.shippingAddress) {
        base.shippingAddress = {
          ...base.shippingAddress,
          ...initialData.shippingAddress,
        };
      }

      if (!base.billingAddressSameAsShipping && initialData.billingAddress) {
        base.billingAddress = {
          firstName: initialData.billingAddress.firstName ?? '',
          lastName: initialData.billingAddress.lastName ?? '',
          company: initialData.billingAddress.company ?? '',
          address1: initialData.billingAddress.address1 ?? '',
          address2: initialData.billingAddress.address2 ?? '',
          city: initialData.billingAddress.city ?? '',
          state: initialData.billingAddress.state ?? '',
          postalCode: initialData.billingAddress.postalCode ?? '',
          country: initialData.billingAddress.country ?? '',
          phone: initialData.billingAddress.phone ?? '',
        };
      }

      if (initialData.paymentMethod) {
        base.paymentMethod = {
          ...base.paymentMethod,
          type: initialData.paymentMethod.type ?? base.paymentMethod.type,
          paypalEmail: initialData.paymentMethod.paypalEmail,
        };
      }
    }

    return base;
  }, [defaultEmail, initialData]);

  const [formData, setFormData] = useState<CheckoutFormData>(initialFormState);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [hasClearedSavedAddress, setHasClearedSavedAddress] = useState(false);
  const [activeStep, setActiveStep] = useState(() => clampStep(initialStep));

  const countryOptions = useMemo<CountryOption[]>(() => {
    if (!countries.length) {
      return [];
    }
    return countries.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
    }));
  }, [countries]);

  const phoneCountryOptions = useMemo<PhoneInputCountryOption[]>(() => {
    if (!countries.length) {
      return [];
    }

    return countries
      .map((country) => {
        const candidateCode = country.iso2 || country.code || country.iso3;
        if (!candidateCode) {
          return null;
        }

        const normalizedCode = String(candidateCode).toUpperCase();
        const rawPhoneCode = country.phoneCode ? String(country.phoneCode) : undefined;
        const normalizedPhoneCode = rawPhoneCode
          ? rawPhoneCode.startsWith('+')
            ? rawPhoneCode
            : `+${rawPhoneCode}`
          : undefined;

        return {
          code: normalizedCode,
          name: country.name,
          phoneCode: normalizedPhoneCode,
        } as PhoneInputCountryOption;
      })
      .filter((option): option is PhoneInputCountryOption => Boolean(option?.code));
  }, [countries]);

  const normalizedDefaultCountryId = useMemo(
    () => (defaultCountryId || '').trim(),
    [defaultCountryId]
  );

  const resolveDefaultCountryId = useCallback(() => {
    if (!normalizedDefaultCountryId) {
      return null;
    }

    const directMatch = countryOptions.find(
      (country) => country.id === normalizedDefaultCountryId
    );
    if (directMatch) {
      return directMatch.id;
    }

    const normalizedCode = normalizedDefaultCountryId.toUpperCase();
    const matchByCode = countries.find((country) =>
      [country.code, country.iso2, country.iso3]
        .filter(Boolean)
        .map((value) => String(value).toUpperCase())
        .includes(normalizedCode)
    );

    return matchByCode?.id ?? null;
  }, [countries, countryOptions, normalizedDefaultCountryId]);

  const countriesById = useMemo(() => {
    const map = new Map<string, CheckoutCountry>();
    countries.forEach((country) => {
      if (country?.id) {
        map.set(country.id, country);
      }
    });
    return map;
  }, [countries]);

  const isPostalCodeRequiredForCountry = useCallback(
    (countryId?: string | null) => {
      if (!countryId) {
        return true;
      }

      const country = countriesById.get(countryId);
      const potentialCodes = [country?.code, country?.iso2, country?.iso3]
        .filter(Boolean)
        .map((value) => String(value).toUpperCase());

      if (potentialCodes.length === 0) {
        return true;
      }

      return !potentialCodes.some((code) => OPTIONAL_POSTAL_CODE_COUNTRY_CODES.has(code));
    },
    [countriesById]
  );

  const shippingCountryId = formData.shippingAddress.country;
  const shippingProvinceId = formData.shippingAddress.state;

  const shippingProvincesQuery = trpc.clientAddressBook.getAdministrativeDivisions.useQuery(
    { countryId: shippingCountryId, type: 'PROVINCE' },
    { enabled: Boolean(shippingCountryId) }
  );

  const shippingWardsQuery = trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: shippingProvinceId },
    { enabled: Boolean(shippingProvinceId) }
  );

  const shippingProvinceOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (shippingProvincesQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [shippingProvincesQuery.data]);

  const shippingWardOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (shippingWardsQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [shippingWardsQuery.data]);

  const shippingPostalCodeRequired = useMemo(
    () => isPostalCodeRequiredForCountry(shippingCountryId),
    [isPostalCodeRequiredForCountry, shippingCountryId]
  );

  const billingCountryId = formData.billingAddressSameAsShipping
    ? shippingCountryId
    : formData.billingAddress?.country ?? '';
  const billingProvinceId = formData.billingAddressSameAsShipping
    ? shippingProvinceId
    : formData.billingAddress?.state ?? '';

  const billingProvincesQuery = trpc.clientAddressBook.getAdministrativeDivisions.useQuery(
    { countryId: billingCountryId, type: 'PROVINCE' },
    { enabled: Boolean(billingCountryId) && !formData.billingAddressSameAsShipping }
  );

  const billingWardsQuery = trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: billingProvinceId },
    { enabled: Boolean(billingProvinceId) && !formData.billingAddressSameAsShipping }
  );

  const billingProvinceOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (billingProvincesQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [billingProvincesQuery.data]);

  const billingWardOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (billingWardsQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [billingWardsQuery.data]);

  const billingAddressValue = formData.billingAddress ?? {
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: billingCountryId,
    phone: '',
  };

  const billingPostalCodeRequired = useMemo(
    () => isPostalCodeRequiredForCountry(billingCountryId),
    [billingCountryId, isPostalCodeRequiredForCountry]
  );

  const shippingRequiredFields = useMemo<(keyof CheckoutFormData['shippingAddress'])[]>(
    () =>
      shippingPostalCodeRequired
        ? ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country']
        : ['firstName', 'lastName', 'address1', 'city', 'state', 'country'],
    [shippingPostalCodeRequired]
  );

  const billingRequiredFields = useMemo<(keyof NonNullable<CheckoutFormData['billingAddress']>)[]>(
    () =>
      billingPostalCodeRequired
        ? ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country']
        : ['firstName', 'lastName', 'address1', 'city', 'state', 'country'],
    [billingPostalCodeRequired]
  );

  const coverageArea = useMemo(() => {
    const provinceName =
      shippingProvinceOptions.find((province) => province.id === shippingProvinceId)?.name ||
      formData.shippingAddress.state;
    const wardName =
      shippingWardOptions.find((ward) => ward.id === formData.shippingAddress.city)?.name ||
      formData.shippingAddress.city;
    return [wardName, provinceName].filter(Boolean).join(', ') || undefined;
  }, [
    shippingProvinceOptions,
    shippingWardOptions,
    shippingProvinceId,
    formData.shippingAddress.city,
    formData.shippingAddress.state,
  ]);

  const deliveryMethodInput = useMemo(
    () => ({
      orderAmount: subtotal,
      coverageArea,
    }),
    [subtotal, coverageArea]
  );

  const deliveryMethodsQuery = trpc.clientDeliveryMethods.list.useQuery(deliveryMethodInput, {
    keepPreviousData: true,
  });

  const deliveryMethods = useMemo<DeliveryMethodOption[]>(() => {
    const raw = deliveryMethodsQuery.data as
      | { items?: DeliveryMethodOption[] }
      | { data?: { items?: DeliveryMethodOption[] } }
      | undefined;

    const items = raw?.items ?? (raw && typeof raw === 'object' ? (raw as any).data?.items : undefined);

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      ...item,
      deliveryCost: Number(item.deliveryCost ?? 0),
    }));
  }, [deliveryMethodsQuery.data]);

  const selectedShippingMethod = useMemo(
    () => deliveryMethods.find((method) => method.id === formData.shippingMethod),
    [deliveryMethods, formData.shippingMethod]
  );

  const updateFormData = useCallback(
    (path: string, value: any) => {
      setFormData((prev) => {
        const newData: any = { ...prev };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        if (current[lastKey] === value) {
          return prev;
        }

        current[lastKey] = value;
        onFormDataChange?.(newData);
        return newData;
      });

      if (errors[path]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[path];
          return newErrors;
        });
      }
    },
    [errors, onFormDataChange]
  );

  useEffect(() => {
    if (!defaultEmail) {
      return;
    }

    if (formData.email) {
      return;
    }

    updateFormData('email', defaultEmail);
  }, [defaultEmail, formData.email, updateFormData]);

  const applySavedAddress = useCallback(
    (address: SavedAddress, { autoSelect = false }: { autoSelect?: boolean } = {}) => {
      setHasClearedSavedAddress(false);
      setSelectedSavedAddressId(address.id);

      const newShippingAddress = {
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        company: address.companyName || '',
        address1: address.addressLine1 || '',
        address2: address.addressLine2 || '',
        city: address.wardId || '',
        state: address.provinceId || '',
        postalCode: address.postalCode || '',
        country: address.countryId || '',
        phone: address.phoneNumber || '',
      };

      updateFormData('shippingAddress', newShippingAddress);

      if (!formData.email && address.email) {
        updateFormData('email', address.email);
      }
    },
    [formData.email, updateFormData]
  );

  const handleManualShippingChange = useCallback(
    (address: CheckoutFormData['shippingAddress']) => {
      setHasClearedSavedAddress(true);
      setSelectedSavedAddressId(null);
      updateFormData('shippingAddress', address);
    },
    [updateFormData]
  );

  const handleBillingAddressChange = useCallback(
    (address: CheckoutFormData['billingAddress']) => {
      updateFormData('billingAddress', address);
    },
    [updateFormData]
  );

  const handleSavedAddressSelect = useCallback(
    (address: SavedAddress) => {
      applySavedAddress(address);
    },
    [applySavedAddress]
  );

  const clearSavedAddressSelection = useCallback(() => {
    setSelectedSavedAddressId(null);
    setHasClearedSavedAddress(true);
  }, []);

  const markSavedAddressModified = useCallback(() => {
    setHasClearedSavedAddress(true);
    setSelectedSavedAddressId(null);
  }, []);

  const handleBillingSameAsShippingChange = useCallback(
    (value: boolean) => {
      updateFormData('billingAddressSameAsShipping', value);
      if (value) {
        updateFormData('billingAddress', undefined);
      }
    },
    [updateFormData]
  );

  useEffect(() => {
    if (formData.shippingAddress.country) {
      return;
    }
    if (countryOptions.length === 0) {
      return;
    }

    const resolved = resolveDefaultCountryId();
    const fallbackCountryId = resolved || countryOptions[0].id;

    if (fallbackCountryId) {
      updateFormData('shippingAddress.country', fallbackCountryId);
    }
  }, [
    countryOptions,
    formData.shippingAddress.country,
    resolveDefaultCountryId,
    updateFormData,
  ]);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      return;
    }

    const selected = savedAddresses.find((address) => address.id === selectedSavedAddressId);

    if (selectedSavedAddressId && !selected) {
      setSelectedSavedAddressId(null);
    }

    if (!selectedSavedAddressId && !hasClearedSavedAddress) {
      const defaultShippingAddress =
        savedAddresses.find((address) => address.isDefault && address.isShippingAddress) ??
        savedAddresses.find((address) => address.isShippingAddress) ??
        savedAddresses[0];

      if (defaultShippingAddress) {
        applySavedAddress(defaultShippingAddress, { autoSelect: true });
      }
    }
  }, [savedAddresses, selectedSavedAddressId, hasClearedSavedAddress, applySavedAddress]);

  useEffect(() => {
    if (!deliveryMethodsQuery.isSuccess) {
      return;
    }

    if (deliveryMethods.length === 0) {
      if (formData.shippingMethod) {
        updateFormData('shippingMethod', '');
      }
      return;
    }

    const selected = deliveryMethods.find((method) => method.id === formData.shippingMethod);
    if (selected && selected.isAvailable) {
      return;
    }

    const available = deliveryMethods.filter((method) => method.isAvailable);
    const preferred =
      available.find((method) => method.isDefault) ?? available[0] ?? deliveryMethods[0];

    if (preferred && preferred.id !== formData.shippingMethod) {
      updateFormData('shippingMethod', preferred.id);
    }
  }, [
    deliveryMethods,
    deliveryMethodsQuery.isSuccess,
    formData.shippingMethod,
    updateFormData,
  ]);

  const validateStep = useCallback(
    (step: number) => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }

        if (!formData.shippingAddress.firstName.trim()) {
          newErrors['shippingAddress.firstName'] = 'First name is required';
        }
        if (!formData.shippingAddress.lastName.trim()) {
          newErrors['shippingAddress.lastName'] = 'Last name is required';
        }
        if (!formData.shippingAddress.address1.trim()) {
          newErrors['shippingAddress.address1'] = 'Address is required';
        }
        if (!formData.shippingAddress.city.trim()) {
          newErrors['shippingAddress.city'] = 'City is required';
        }
        if (!formData.shippingAddress.state.trim()) {
          newErrors['shippingAddress.state'] = 'State is required';
        }
        if (shippingPostalCodeRequired && !formData.shippingAddress.postalCode.trim()) {
          newErrors['shippingAddress.postalCode'] = 'Postal code is required';
        }
        if (!formData.shippingAddress.country.trim()) {
          newErrors['shippingAddress.country'] = 'Country is required';
        }

        if (!formData.billingAddressSameAsShipping) {
          if (!formData.billingAddress?.firstName.trim()) {
            newErrors['billingAddress.firstName'] = 'First name is required';
          }
          if (!formData.billingAddress?.lastName.trim()) {
            newErrors['billingAddress.lastName'] = 'Last name is required';
          }
          if (!formData.billingAddress?.address1.trim()) {
            newErrors['billingAddress.address1'] = 'Address is required';
          }
          if (!formData.billingAddress?.city.trim()) {
            newErrors['billingAddress.city'] = 'City is required';
          }
          if (!formData.billingAddress?.state.trim()) {
            newErrors['billingAddress.state'] = 'State is required';
          }
          if (billingPostalCodeRequired && !formData.billingAddress?.postalCode.trim()) {
            newErrors['billingAddress.postalCode'] = 'Postal code is required';
          }
          if (!formData.billingAddress?.country.trim()) {
            newErrors['billingAddress.country'] = 'Country is required';
          }
        }
      }

      if (step === 2) {
        if (!formData.shippingMethod) {
          newErrors.shippingMethod = 'Please select a shipping method';
        } else {
          const method = deliveryMethods.find((option) => option.id === formData.shippingMethod);
          if (!method) {
            newErrors.shippingMethod = 'Selected delivery method is invalid';
          } else if (!method.isAvailable) {
            newErrors.shippingMethod = method.unavailableReason || 'Delivery method is not available';
          }
        }
      }

      if (step === 3) {
        if (formData.paymentMethod.type === 'credit_card') {
          if (!formData.paymentMethod.cardNumber?.trim()) {
            newErrors['paymentMethod.cardNumber'] = 'Card number is required';
          }
          if (!formData.paymentMethod.expiryDate?.trim()) {
            newErrors['paymentMethod.expiryDate'] = 'Expiry date is required';
          }
          if (!formData.paymentMethod.cvv?.trim()) {
            newErrors['paymentMethod.cvv'] = 'CVV is required';
          }
          if (!formData.paymentMethod.cardholderName?.trim()) {
            newErrors['paymentMethod.cardholderName'] = 'Cardholder name is required';
          }
        }

        if (formData.paymentMethod.type === 'paypal') {
          if (!formData.paymentMethod.paypalEmail?.trim()) {
            newErrors['paymentMethod.paypalEmail'] = 'PayPal email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.paymentMethod.paypalEmail)) {
            newErrors['paymentMethod.paypalEmail'] = 'PayPal email is invalid';
          }
        }

        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [
      billingPostalCodeRequired,
      deliveryMethods,
      formData.agreeToTerms,
      formData.billingAddress,
      formData.billingAddressSameAsShipping,
      formData.email,
      formData.paymentMethod,
      formData.shippingAddress,
      formData.shippingMethod,
      shippingPostalCodeRequired,
    ]);

  const handleNextStep = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => {
        const next = clampStep(prev + 1);
        if (next === prev) {
          return prev;
        }
        onStepChange?.(next);
        return next;
      });
    }
  }, [activeStep, clampStep, onStepChange, validateStep]);

  const handlePrevStep = useCallback(() => {
    setActiveStep((prev) => {
      const next = clampStep(prev - 1);
      if (next === prev) {
        return prev;
      }
      onStepChange?.(next);
      return next;
    });
  }, [clampStep, onStepChange]);

  const goToStep = useCallback(
    (step: number) => {
      setActiveStep((prev) => {
        const next = clampStep(step);
        if (next === prev) {
          return prev;
        }
        onStepChange?.(next);
        return next;
      });
    },
    [clampStep, onStepChange]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (validateStep(activeStep)) {
        onSubmit(formData);
      }
    },
    [activeStep, formData, onSubmit, validateStep]
  );

  const adjustedShippingCost = selectedShippingMethod
    ? selectedShippingMethod.deliveryCost
    : shippingCost;
  const discountAmountRaw = subtotal + shippingCost + tax - total;
  const discountAmount = Number.isFinite(discountAmountRaw)
    ? Math.max(0, discountAmountRaw)
    : 0;
  const adjustedTotal = Math.max(0, subtotal + adjustedShippingCost + tax - discountAmount);

  return {
    formData,
    errors,
    countryOptions,
    phoneCountryOptions,
    shippingProvinceOptions,
    shippingWardOptions,
    billingAddressValue: billingAddressValue as NonNullable<CheckoutFormData['billingAddress']>,
    billingProvinceOptions,
    billingWardOptions,
    shippingRequiredFields,
    billingRequiredFields,
    shippingProvincesQuery,
    shippingWardsQuery,
    billingProvincesQuery,
    billingWardsQuery,
    selectedSavedAddressId,
    handleSavedAddressSelect,
    handleManualShippingChange,
    handleBillingAddressChange,
    handleBillingSameAsShippingChange,
    clearSavedAddressSelection,
    markSavedAddressModified,
    updateFormData,
    handleSubmit,
    activeStep,
    handleNextStep,
    handlePrevStep,
    goToStep,
    deliveryMethods,
    deliveryMethodsQuery,
    selectedShippingMethod,
    adjustedShippingCost,
    discountAmount,
    adjustedTotal,
  };
};

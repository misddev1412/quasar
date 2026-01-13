import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import type { Resolver, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FiSearch,
  FiPackage,
  FiCheck,
  FiTrash2,
  FiMapPin,
  FiSettings,
  FiInfo,
  FiImage,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import type { AdministrativeDivisionType } from '../../../../backend/src/modules/products/entities/administrative-division.entity';

interface AddressFormValue {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  status?: string;
  totalAmount?: number;
  currency?: string;
  orderDate?: string;
}

interface OrderItemDetail {
  id: string;
  productName: string;
  variantName?: string;
  productSku?: string;
  quantity: number;
  fulfilledQuantity?: number;
}

interface OrderDetail extends OrderListItem {
  items: OrderItemDetail[];
  shippingAddress?: AddressFormValue | null;
}

interface ShippingProviderOption {
  id: string;
  name: string;
  code?: string;
}

interface OrderFulfillmentEligibility {
  orderId: string;
  canCreateFulfillment: boolean;
  reasons?: string[];
  message?: string | null;
  status?: {
    isPaid?: boolean;
    isCancelled?: boolean;
    isRefunded?: boolean;
    isFullyFulfilled?: boolean;
  } | null;
}

export interface FulfillmentItemFormValue {
  orderItemId: string;
  quantity: number;
  locationPickedFrom?: string;
  batchNumber?: string;
  serialNumbers?: string;
  expiryDate?: string;
  conditionNotes?: string;
  packagingNotes?: string;
  weight?: string;
  notes?: string;
}

export interface CreateFulfillmentFormValues {
  orderId: string;
  priorityLevel?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  shippingProviderId?: string;
  packagingType?: 'ENVELOPE' | 'BOX' | 'CRATE' | 'PALLET' | 'CUSTOM';
  signatureRequired: boolean;
  deliveryInstructions?: string;
  giftWrap: boolean;
  giftMessage?: string;
  notes?: string;
  internalNotes?: string;
  includeShippingAddress: boolean;
  includePickupAddress: boolean;
  shippingAddress?: AddressFormValue;
  pickupAddress?: AddressFormValue;
  items: FulfillmentItemFormValue[];
}

export interface FulfillmentItemPayload {
  orderItemId: string;
  quantity: number;
  locationPickedFrom?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  conditionNotes?: string;
  packagingNotes?: string;
  weight?: number;
  notes?: string;
}

export interface CreateFulfillmentPayload {
  orderId: string;
  priorityLevel?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  shippingProviderId?: string;
  packagingType?: 'ENVELOPE' | 'BOX' | 'CRATE' | 'PALLET' | 'CUSTOM';
  signatureRequired: boolean;
  deliveryInstructions?: string;
  giftWrap: boolean;
  giftMessage?: string;
  notes?: string;
  internalNotes?: string;
  shippingAddress?: AddressFormValue;
  pickupAddress?: AddressFormValue;
  items: FulfillmentItemPayload[];
}

interface CreateFulfillmentFormProps {
  onSubmit: (payload: CreateFulfillmentPayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialOrderId?: string | null;
  onOrderSelect?: (orderId: string) => void;
}

const PRIORITY_LEVELS: Array<{ value: CreateFulfillmentFormValues['priorityLevel']; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const PACKAGING_TYPES: Array<{ value: CreateFulfillmentFormValues['packagingType']; label: string }> = [
  { value: 'ENVELOPE', label: 'Envelope' },
  { value: 'BOX', label: 'Box' },
  { value: 'CRATE', label: 'Crate' },
  { value: 'PALLET', label: 'Pallet' },
  { value: 'CUSTOM', label: 'Custom' },
];

const getOptionalAddressSchema = (
  t: ReturnType<typeof useTranslationWithBackend>['t'],
) =>
  z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      company: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .partial();

const DEFAULT_ADDRESS: AddressFormValue = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

const extractOrderItems = (order: unknown): any[] => {
  if (!order || typeof order !== 'object') return [];

  if (Array.isArray((order as any).items)) {
    return (order as any).items as any[];
  }

  if (Array.isArray((order as any)?.data?.items)) {
    return (order as any).data.items as any[];
  }

  return [];
};

const resolveItemImage = (item: any): string | null => {
  if (!item || typeof item !== 'object') return null;

  const candidates: Array<string | null | undefined> = [
    item.productImage,
    item.image,
    item.thumbnail,
    item?.product?.primaryImage,
    item?.product?.image,
    Array.isArray(item?.product?.images) ? item.product.images[0] : null,
    item?.productVariant?.image,
    Array.isArray(item?.productVariant?.images) ? item.productVariant.images[0] : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
};

const getPrimaryProductImage = (order: unknown): string | null => {
  const items = extractOrderItems(order);
  for (const item of items) {
    const image = resolveItemImage(item);
    if (image) return image;
  }
  return null;
};

export const CreateFulfillmentForm: React.FC<CreateFulfillmentFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialOrderId = null,
  onOrderSelect,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => initialOrderId);
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const orderSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const dropdownCloseTimeoutRef = useRef<number | null>(null);
  const orderSearchDebounceRef = useRef<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const ordersQuery = trpc.adminOrders.list.useQuery(
    {
      page: 1,
      limit: 10,
      search: orderSearchQuery || undefined,
    },
    {
      enabled: isOrderDropdownOpen,
      refetchOnWindowFocus: false,
    }
  );

  const orderDetailQuery = trpc.adminOrders.detail.useQuery(
    { id: selectedOrderId ?? '' },
    { enabled: !!selectedOrderId }
  );

  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  useEffect(() => {
    return () => {
      if (dropdownCloseTimeoutRef.current) {
        window.clearTimeout(dropdownCloseTimeoutRef.current);
        dropdownCloseTimeoutRef.current = null;
      }
      if (orderSearchDebounceRef.current) {
        window.clearTimeout(orderSearchDebounceRef.current);
        orderSearchDebounceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOrderDropdownOpen) return;

    if (orderSearchDebounceRef.current) {
      window.clearTimeout(orderSearchDebounceRef.current);
      orderSearchDebounceRef.current = null;
    }

    orderSearchDebounceRef.current = window.setTimeout(() => {
      const trimmed = orderSearchTerm.trim();
      setOrderSearchQuery((previous) => (previous === trimmed ? previous : trimmed));
    }, 250);

    return () => {
      if (orderSearchDebounceRef.current) {
        window.clearTimeout(orderSearchDebounceRef.current);
        orderSearchDebounceRef.current = null;
      }
    };
  }, [orderSearchTerm, isOrderDropdownOpen]);

  useEffect(() => {
    if (isOrderDropdownOpen) {
      const trimmed = orderSearchTerm.trim();
      setOrderSearchQuery((previous) => (previous === trimmed ? previous : trimmed));
    }
  }, [isOrderDropdownOpen, orderSearchTerm]);

  useEffect(() => {
    if (!isOrderDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        orderSearchContainerRef.current &&
        !orderSearchContainerRef.current.contains(event.target as Node)
      ) {
        if (dropdownCloseTimeoutRef.current) {
          window.clearTimeout(dropdownCloseTimeoutRef.current);
          dropdownCloseTimeoutRef.current = null;
        }
        setIsOrderDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (dropdownCloseTimeoutRef.current) {
          window.clearTimeout(dropdownCloseTimeoutRef.current);
          dropdownCloseTimeoutRef.current = null;
        }
        setIsOrderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOrderDropdownOpen]);

  const shippingProvidersQuery = (trpc as any)?.adminShippingProviders?.list?.useQuery
    ? (trpc as any).adminShippingProviders.list.useQuery({ page: 1, limit: 100, isActive: true })
    : { data: undefined, isLoading: false };

  const orders: OrderListItem[] = useMemo(() => {
    const raw = ordersQuery.data as any;
    if (!raw) return [];
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw?.data?.items)) return raw.data.items;
    return [];
  }, [ordersQuery.data]);

  const orderIds = useMemo(() => {
    const ids = orders.map((order) => order.id).filter(Boolean);
    return Array.from(new Set(ids));
  }, [orders]);

  const orderEligibilityQuery: {
    data: unknown;
    isLoading?: boolean;
    isFetching?: boolean;
    error?: unknown;
  } =
    (trpc as any).orderFulfillments?.checkEligibility?.useQuery?.(
      { orderIds },
      {
        enabled: isOrderDropdownOpen && orderIds.length > 0,
        staleTime: 1000 * 30,
      }
    ) ?? {
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: null,
    };

  const eligibilityItems: OrderFulfillmentEligibility[] = useMemo(() => {
    if (orderIds.length === 0) return [];
    const raw = orderEligibilityQuery.data as any;
    let items: OrderFulfillmentEligibility[] = [];

    if (raw) {
      if (Array.isArray(raw.eligibilities)) {
        items = raw.eligibilities as OrderFulfillmentEligibility[];
      } else if (Array.isArray(raw?.data?.eligibilities)) {
        items = raw.data.eligibilities as OrderFulfillmentEligibility[];
      }
    }

    if (!items.length) return [];
    const allowedIds = new Set(orderIds);
    return items.filter((item) => allowedIds.has(item.orderId));
  }, [orderEligibilityQuery.data, orderIds]);

  const eligibilityMap = useMemo(() => {
    const map = new Map<string, OrderFulfillmentEligibility>();
    eligibilityItems.forEach((item) => {
      if (item?.orderId) {
        map.set(item.orderId, item);
      }
    });
    return map;
  }, [eligibilityItems]);

  useEffect(() => {
    if (!orderEligibilityQuery.error) return;
    const errorMessage =
      (orderEligibilityQuery.error as { message?: string })?.message ||
      t('common.unexpected_error', 'Something went wrong. Please try again.');
    addToast({
      type: 'error',
      title: t('fulfillments.eligibility_check_failed', 'Không thể kiểm tra điều kiện fulfillment'),
      description: errorMessage,
    });
  }, [orderEligibilityQuery.error, addToast, t]);

  const selectedOrder: OrderDetail | null = useMemo(() => {
    const raw = orderDetailQuery.data as any;
    if (!raw) return null;
    if (raw?.data) return raw.data as OrderDetail;
    return raw as OrderDetail;
  }, [orderDetailQuery.data]);

  const selectedOrderEligibility = useMemo(() => {
    if (!selectedOrder?.id) return null;
    return eligibilityMap.get(selectedOrder.id) ?? null;
  }, [eligibilityMap, selectedOrder]);

  const orderDateDisplay = useMemo(() => {
    if (!selectedOrder?.orderDate) return null;
    const date = new Date(selectedOrder.orderDate);
    if (Number.isNaN(date.getTime())) {
      return selectedOrder.orderDate;
    }
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [selectedOrder]);

  const orderTotalDisplay = useMemo(() => {
    if (!selectedOrder) return null;
    const totalAmountValue =
      typeof selectedOrder.totalAmount === 'number'
        ? selectedOrder.totalAmount
        : selectedOrder.totalAmount !== undefined
        ? Number(selectedOrder.totalAmount)
        : null;
    if (totalAmountValue === null || Number.isNaN(totalAmountValue)) return null;
    if (!selectedOrder.currency) {
      return totalAmountValue.toLocaleString();
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: selectedOrder.currency,
    }).format(totalAmountValue);
  }, [selectedOrder]);

  const orderItemsMeta = useMemo(() => {
    if (!selectedOrder?.items) return new Map<string, { ordered: number; fulfilled: number }>();
    return new Map(
      selectedOrder.items.map((item) => [
        item.id,
        {
          ordered: item.quantity,
          fulfilled: item.fulfilledQuantity ?? 0,
        },
      ])
    );
  }, [selectedOrder]);

  const orderItemsMap = useMemo(() => {
    if (!selectedOrder?.items) return new Map<string, OrderItemDetail>();
    return new Map(selectedOrder.items.map((item) => [item.id, item]));
  }, [selectedOrder]);

  const itemSchema = useMemo(() => {
    return z.object({
      orderItemId: z.string().min(1, t('fulfillments.validation.order_item', 'Select an item')), 
      quantity: z
        .number({ invalid_type_error: t('fulfillments.validation.quantity_required', 'Quantity is required') })
        .min(1, t('fulfillments.validation.quantity_positive', 'Quantity must be at least 1')),
      locationPickedFrom: z.string().optional(),
      batchNumber: z.string().optional(),
      serialNumbers: z.string().optional(),
      expiryDate: z.string().optional(),
      conditionNotes: z.string().optional(),
      packagingNotes: z.string().optional(),
      weight: z.string().optional(),
      notes: z.string().optional(),
    });
  }, [t]);

  const formSchema = useMemo(() => {
    const optionalAddressSchema = getOptionalAddressSchema(t);
    return z
      .object({
        orderId: z.string().min(1, t('fulfillments.validation.order_required', 'Order selection is required')),
        priorityLevel: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
        shippingProviderId: z.string().uuid().optional(),
        packagingType: z.enum(['ENVELOPE', 'BOX', 'CRATE', 'PALLET', 'CUSTOM']).optional(),
        signatureRequired: z.boolean().default(false),
        deliveryInstructions: z.string().optional(),
        giftWrap: z.boolean().default(false),
        giftMessage: z.string().optional(),
        notes: z.string().optional(),
        internalNotes: z.string().optional(),
        includeShippingAddress: z.boolean(),
        includePickupAddress: z.boolean(),
        shippingAddress: optionalAddressSchema.optional(),
        pickupAddress: optionalAddressSchema.optional(),
        items: z.array(itemSchema).min(1, t('fulfillments.validation.items_required', 'Select at least one item to fulfill')),
      })
      .superRefine((data, ctx) => {
        const addressFieldLabels: Record<keyof AddressFormValue, string> = {
          firstName: t('common.first_name', 'First name'),
          lastName: t('common.last_name', 'Last name'),
          company: t('common.company', 'Company'),
          address1: t('common.address_line1', 'Address line 1'),
          address2: t('common.address_line2', 'Address line 2'),
          city: t('common.city', 'City'),
          state: t('common.state', 'State / Province'),
          postalCode: t('common.postal_code', 'Postal code'),
          country: t('common.country', 'Country'),
        };

        if (data.includeShippingAddress) {
          const address = data.shippingAddress;
          const requiredFields: Array<keyof AddressFormValue> = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country'];
          requiredFields.forEach((field) => {
            const value = (address as any)?.[field];
            if (!value || (typeof value === 'string' && !value.trim())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fulfillments.validation.address_field_required', { field: addressFieldLabels[field] || field }),
                path: ['shippingAddress', field],
              });
            }
          });
        }

        if (data.includePickupAddress) {
          const address = data.pickupAddress;
          const requiredFields: Array<keyof AddressFormValue> = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country'];
          requiredFields.forEach((field) => {
            const value = (address as any)?.[field];
            if (!value || (typeof value === 'string' && !value.trim())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fulfillments.validation.address_field_required', { field: addressFieldLabels[field] || field }),
                path: ['pickupAddress', field],
              });
            }
          });
        }

        data.items.forEach((item, index) => {
          const meta = orderItemsMeta.get(item.orderItemId);
          if (!meta) return;
          const remaining = Math.max(meta.ordered - meta.fulfilled, 0);
          if (remaining > 0 && item.quantity > remaining) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('fulfillments.validation.quantity_exceeds', 'Cannot fulfill more items than available'),
              path: ['items', index, 'quantity'],
            });
          }
        });
      });
  }, [itemSchema, orderItemsMeta, t]);

  const resolver = useMemo(() => zodResolver(formSchema) as Resolver<CreateFulfillmentFormValues>, [formSchema]);

  const methods = useForm<CreateFulfillmentFormValues>({
    resolver,
    defaultValues: {
      orderId: '',
      priorityLevel: 'NORMAL',
      shippingProviderId: undefined,
      packagingType: undefined,
      signatureRequired: false,
      deliveryInstructions: '',
      giftWrap: false,
      giftMessage: '',
      notes: '',
      internalNotes: '',
      includeShippingAddress: false,
      includePickupAddress: false,
      shippingAddress: undefined,
      pickupAddress: undefined,
      items: [],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = methods;

  const { fields, replace, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    setExpandedItems((previous) => {
      const next: Record<string, boolean> = {};
      fields.forEach((field) => {
        if (previous[field.id]) {
          next[field.id] = previous[field.id];
        }
      });
      const previousKeys = Object.keys(previous);
      const nextKeys = Object.keys(next);
      if (previousKeys.length === nextKeys.length && previousKeys.every((key) => previous[key] === next[key])) {
        return previous;
      }
      return next;
    });
  }, [fields]);

  const includeShippingAddress = watch('includeShippingAddress');
  const includePickupAddress = watch('includePickupAddress');
  const giftWrap = watch('giftWrap');
  const signatureRequired = watch('signatureRequired');
  const prioritySelection = watch('priorityLevel');
  const shippingProviderSelection = watch('shippingProviderId');
  const packagingSelection = watch('packagingType');
  const watchedItems = watch('items');
  const watchedShippingCountry = watch('shippingAddress.country');
  const watchedShippingProvince = watch('shippingAddress.state');
  const watchedShippingWard = watch('shippingAddress.city');
  const watchedPickupCountry = watch('pickupAddress.country');
  const watchedPickupProvince = watch('pickupAddress.state');
  const watchedPickupWard = watch('pickupAddress.city');

  const totalItemsSelected = useMemo(() => (Array.isArray(watchedItems) ? watchedItems.length : 0), [watchedItems]);
  const totalUnitsSelected = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((total, item) => total + (Number((item as any)?.quantity) || 0), 0);
  }, [watchedItems]);

  const selectedPriorityLevel = useMemo(
    () => PRIORITY_LEVELS.find((level) => level.value === prioritySelection) ?? null,
    [prioritySelection]
  );

  const selectedPackagingType = useMemo(
    () => PACKAGING_TYPES.find((type) => type.value === packagingSelection) ?? null,
    [packagingSelection]
  );

  const shippingCountryId =
    watchedShippingCountry ?? selectedOrder?.shippingAddress?.country ?? undefined;
  const shippingProvinceId =
    watchedShippingProvince ?? selectedOrder?.shippingAddress?.state ?? undefined;
  const shippingWardId =
    watchedShippingWard ?? selectedOrder?.shippingAddress?.city ?? undefined;

  const pickupCountryId = watchedPickupCountry;
  const pickupProvinceId = watchedPickupProvince;
  const pickupWardId = watchedPickupWard;

  const countriesQuery = trpc.adminAddressBook.getCountries.useQuery(undefined, {
    staleTime: 1000 * 60 * 60,
  });

  const shippingProvincesQuery = trpc.adminAddressBook.getAdministrativeDivisions.useQuery(
    {
      countryId: shippingCountryId ?? '',
      type: 'PROVINCE' as AdministrativeDivisionType,
    },
    {
      enabled: Boolean(shippingCountryId),
    }
  );

  const shippingWardsQuery = trpc.adminAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: shippingProvinceId ?? '' },
    { enabled: Boolean(shippingProvinceId) }
  );

  const pickupProvincesQuery = trpc.adminAddressBook.getAdministrativeDivisions.useQuery(
    {
      countryId: pickupCountryId ?? '',
      type: 'PROVINCE' as AdministrativeDivisionType,
    },
    {
      enabled: Boolean(pickupCountryId),
    }
  );

  const pickupWardsQuery = trpc.adminAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: pickupProvinceId ?? '' },
    { enabled: Boolean(pickupProvinceId) }
  );

  const refetchShippingProvinces = shippingProvincesQuery?.refetch;
  const refetchShippingWards = shippingWardsQuery?.refetch;
interface CountryOption {
  id: string;
  name: string;
  code?: string | null;
  iso2?: string | null;
  iso3?: string | null;
}

interface AdministrativeOption {
  id: string;
  name: string;
  code?: string | null;
}

const countryOptions = useMemo<CountryOption[]>(() => {
    const raw =
      (countriesQuery.data as Array<{ id: string; name: string; code?: string; iso2?: string | null; iso3?: string | null }> | undefined) ??
      [];
    return raw.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
      iso2: country.iso2,
      iso3: country.iso3,
    }));
  }, [countriesQuery.data]);

const shippingProvinceOptions = useMemo<AdministrativeOption[]>(() => {
  const raw =
    (shippingProvincesQuery.data as Array<{ id: string; name: string; code?: string | null }> | undefined) ?? [];
  return raw.map((division) => ({
    id: division.id,
    name: division.name,
    code: division.code ?? null,
  }));
}, [shippingProvincesQuery.data]);

const shippingWardOptions = useMemo<AdministrativeOption[]>(() => {
  const raw =
    (shippingWardsQuery.data as Array<{ id: string; name: string; code?: string | null }> | undefined) ?? [];
  return raw.map((division) => ({
    id: division.id,
    name: division.name,
    code: division.code ?? null,
  }));
}, [shippingWardsQuery.data]);

const pickupProvinceOptions = useMemo<AdministrativeOption[]>(() => {
  const raw =
    (pickupProvincesQuery.data as Array<{ id: string; name: string; code?: string | null }> | undefined) ?? [];
  return raw.map((division) => ({
    id: division.id,
    name: division.name,
    code: division.code ?? null,
  }));
}, [pickupProvincesQuery.data]);

const pickupWardOptions = useMemo<AdministrativeOption[]>(() => {
  const raw =
    (pickupWardsQuery.data as Array<{ id: string; name: string; code?: string | null }> | undefined) ?? [];
  return raw.map((division) => ({
    id: division.id,
    name: division.name,
    code: division.code ?? null,
  }));
}, [pickupWardsQuery.data]);

  const previousShippingCountryRef = useRef<string | undefined>(undefined);
  const previousShippingProvinceRef = useRef<string | undefined>(undefined);
  const previousShippingWardRef = useRef<string | undefined>(undefined);
  const previousPickupCountryRef = useRef<string | undefined>(undefined);
  const previousPickupProvinceRef = useRef<string | undefined>(undefined);
  const previousPickupWardRef = useRef<string | undefined>(undefined);
  const previousSelectedOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (countriesQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('fulfillments.countries_load_error', 'Unable to load countries right now.'),
      });
    }
  }, [countriesQuery.error, addToast, t]);

  useEffect(() => {
    if (shippingProvincesQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('fulfillments.province_load_error', 'Unable to load provinces for the selected country.'),
      });
    }
  }, [shippingProvincesQuery.error, addToast, t]);

  useEffect(() => {
    if (shippingWardsQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('fulfillments.ward_load_error', 'Unable to load districts for the selected province.'),
      });
    }
  }, [shippingWardsQuery.error, addToast, t]);

  useEffect(() => {
    if (pickupProvincesQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('fulfillments.pickup_province_error', 'Unable to load pickup provinces for the selected country.'),
      });
    }
  }, [pickupProvincesQuery.error, addToast, t]);

  useEffect(() => {
    if (pickupWardsQuery.error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('fulfillments.pickup_ward_error', 'Unable to load pickup districts for the selected province.'),
      });
    }
  }, [pickupWardsQuery.error, addToast, t]);

  useEffect(() => {
    if (!selectedOrder) {
      previousSelectedOrderIdRef.current = null;
      return;
    }

    if (previousSelectedOrderIdRef.current === selectedOrder.id) {
      return;
    }

    previousSelectedOrderIdRef.current = selectedOrder.id;

    if (selectedOrder.shippingAddress) {
      setValue('includeShippingAddress', true, { shouldDirty: false, shouldTouch: false });
      setValue('shippingAddress.country', selectedOrder.shippingAddress.country ?? '', {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue('shippingAddress.state', selectedOrder.shippingAddress.state ?? '', {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue('shippingAddress.city', selectedOrder.shippingAddress.city ?? '', {
        shouldDirty: false,
        shouldTouch: false,
      });
      if (typeof refetchShippingProvinces === 'function') {
        refetchShippingProvinces();
      }
      if (typeof refetchShippingWards === 'function') {
        refetchShippingWards();
      }
    } else {
      setValue('includeShippingAddress', false, { shouldDirty: false, shouldTouch: false });
      setValue('shippingAddress', undefined, { shouldDirty: false, shouldTouch: false });
    }
  }, [selectedOrder, setValue, refetchShippingProvinces, refetchShippingWards]);

  useEffect(() => {
    if (!includeShippingAddress) {
      previousShippingCountryRef.current = shippingCountryId ?? '';
      previousShippingProvinceRef.current = shippingProvinceId ?? '';
      previousShippingWardRef.current = shippingWardId ?? '';
      return;
    }

    const currentCountry = shippingCountryId ?? '';
    if (previousShippingCountryRef.current && previousShippingCountryRef.current !== currentCountry) {
      setValue('shippingAddress.state', '');
      setValue('shippingAddress.city', '');
    }
    previousShippingCountryRef.current = currentCountry;
  }, [includeShippingAddress, setValue, shippingCountryId, shippingProvinceId, shippingWardId]);

  useEffect(() => {
    if (!includeShippingAddress) {
      previousShippingProvinceRef.current = shippingProvinceId ?? '';
      previousShippingWardRef.current = shippingWardId ?? '';
      return;
    }

    const currentProvince = shippingProvinceId ?? '';
    if (previousShippingProvinceRef.current && previousShippingProvinceRef.current !== currentProvince) {
      setValue('shippingAddress.city', '');
    }
    previousShippingProvinceRef.current = currentProvince;
  }, [includeShippingAddress, setValue, shippingProvinceId, shippingWardId]);

  useEffect(() => {
    if (!includePickupAddress) {
      previousPickupCountryRef.current = pickupCountryId ?? '';
      previousPickupProvinceRef.current = pickupProvinceId ?? '';
      previousPickupWardRef.current = pickupWardId ?? '';
      return;
    }

    const currentCountry = pickupCountryId ?? '';
    if (previousPickupCountryRef.current && previousPickupCountryRef.current !== currentCountry) {
      setValue('pickupAddress.state', '');
      setValue('pickupAddress.city', '');
    }
    previousPickupCountryRef.current = currentCountry;
  }, [includePickupAddress, pickupCountryId, pickupProvinceId, pickupWardId, setValue]);

  useEffect(() => {
    if (!includePickupAddress) {
      previousPickupProvinceRef.current = pickupProvinceId ?? '';
      previousPickupWardRef.current = pickupWardId ?? '';
      return;
    }

    const currentProvince = pickupProvinceId ?? '';
    if (previousPickupProvinceRef.current && previousPickupProvinceRef.current !== currentProvince) {
      setValue('pickupAddress.city', '');
    }
    previousPickupProvinceRef.current = currentProvince;
  }, [includePickupAddress, pickupProvinceId, pickupWardId, setValue]);

  useEffect(() => {
    if (!includeShippingAddress) return;
    if (!shippingCountryId) return;
    if (typeof refetchShippingProvinces === 'function') {
      refetchShippingProvinces();
    }
  }, [includeShippingAddress, shippingCountryId, refetchShippingProvinces]);

  useEffect(() => {
    if (!includeShippingAddress) return;
    if (!shippingProvinceId) return;
    if (typeof refetchShippingWards === 'function') {
      refetchShippingWards();
    }
  }, [includeShippingAddress, shippingProvinceId, refetchShippingWards]);

  const normalizeString = (value?: string | null) => value?.toLowerCase().trim();

  useEffect(() => {
    if (!includeShippingAddress) return;
    if (!countryOptions.length) return;
    const address = getValues('shippingAddress');
    const candidate = address?.country;
    if (!candidate) return;

    const normalized = normalizeString(candidate);
    const match = countryOptions.find((option) => {
      const values = [
        option.id,
        option.code,
        option.iso2,
        option.iso3,
        option.name,
      ]
        .filter(Boolean)
        .map((value) => normalizeString(String(value)));
      return values.includes(normalized);
    });

    if (match) {
      setValue('shippingAddress.country', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includeShippingAddress, countryOptions, getValues, setValue]);

  useEffect(() => {
    if (!includePickupAddress) return;
    if (!countryOptions.length) return;
    const address = getValues('pickupAddress');
    const candidate = address?.country;
    if (!candidate) return;

    const normalized = normalizeString(candidate);
    const match = countryOptions.find((option) => {
      const values = [
        option.id,
        option.code,
        option.iso2,
        option.iso3,
        option.name,
      ]
        .filter(Boolean)
        .map((value) => normalizeString(String(value)));
      return values.includes(normalized);
    });

    if (match && match.id !== candidate) {
      setValue('pickupAddress.country', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includePickupAddress, countryOptions, getValues, setValue]);

  useEffect(() => {
    if (!includeShippingAddress) return;
    if (!shippingProvinceOptions.length) return;
    const current = getValues('shippingAddress.state');
    if (!current) return;

    const normalized = normalizeString(current);
    const match = shippingProvinceOptions.find((option) => {
      const values = [option.id, option.name, option.code];
      return values
        .filter(Boolean)
        .map((value) => normalizeString(String(value)))
        .includes(normalized);
    });

    if (match) {
      setValue('shippingAddress.state', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includeShippingAddress, shippingProvinceOptions, getValues, setValue]);

  useEffect(() => {
    if (!includeShippingAddress) return;
    if (!shippingWardOptions.length) return;
    const current = getValues('shippingAddress.city');
    if (!current) return;

    const normalized = normalizeString(current);
    const match = shippingWardOptions.find((option) => {
      const values = [option.id, option.name, option.code];
      return values
        .filter(Boolean)
        .map((value) => normalizeString(String(value)))
        .includes(normalized);
    });

    if (match) {
      setValue('shippingAddress.city', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includeShippingAddress, shippingWardOptions, getValues, setValue]);

  useEffect(() => {
    if (!includePickupAddress) return;
    if (!pickupProvinceOptions.length) return;
    const current = getValues('pickupAddress.state');
    if (!current) return;

    const normalized = normalizeString(current);
    const match = pickupProvinceOptions.find((option) => {
      const values = [option.id, option.name, option.code];
      return values
        .filter(Boolean)
        .map((value) => normalizeString(String(value)))
        .includes(normalized);
    });

    if (match) {
      setValue('pickupAddress.state', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includePickupAddress, pickupProvinceOptions, getValues, setValue]);

  useEffect(() => {
    if (!includePickupAddress) return;
    if (!pickupWardOptions.length) return;
    const current = getValues('pickupAddress.city');
    if (!current) return;

    const normalized = normalizeString(current);
    const match = pickupWardOptions.find((option) => {
      const values = [option.id, option.name, option.code];
      return values
        .filter(Boolean)
        .map((value) => normalizeString(String(value)))
        .includes(normalized);
    });

    if (match) {
      setValue('pickupAddress.city', match.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [includePickupAddress, pickupWardOptions, getValues, setValue]);

  useEffect(() => {
    if (!selectedOrder) return;

    const initialItems = selectedOrder.items?.map((item) => ({
      orderItemId: item.id,
      quantity: Math.max(item.quantity - (item.fulfilledQuantity ?? 0), 1),
      locationPickedFrom: '',
      batchNumber: '',
      serialNumbers: '',
      expiryDate: '',
      conditionNotes: '',
      packagingNotes: '',
      weight: '',
      notes: '',
    })) || [];

    reset({
      orderId: selectedOrder.id,
      priorityLevel: 'NORMAL',
      shippingProviderId: undefined,
      packagingType: undefined,
      signatureRequired: false,
      deliveryInstructions: '',
      giftWrap: false,
      giftMessage: '',
      notes: '',
      internalNotes: '',
      includeShippingAddress: !!selectedOrder.shippingAddress,
      includePickupAddress: false,
      shippingAddress: selectedOrder.shippingAddress || undefined,
      pickupAddress: undefined,
      items: initialItems,
    });
    replace(initialItems);
    setExpandedItems({});
  }, [selectedOrder, reset, replace]);

  useEffect(() => {
    if (!includeShippingAddress) {
      setValue('shippingAddress', undefined);
    } else {
      const current = getValues('shippingAddress');
      if (!current) {
        setValue('shippingAddress', selectedOrder?.shippingAddress || { ...DEFAULT_ADDRESS });
      }
    }
  }, [includeShippingAddress, getValues, selectedOrder, setValue]);

  useEffect(() => {
    if (!includePickupAddress) {
      setValue('pickupAddress', undefined);
    } else {
      const current = getValues('pickupAddress');
      if (!current) {
        setValue('pickupAddress', { ...DEFAULT_ADDRESS });
      }
    }
  }, [includePickupAddress, getValues, setValue]);

  const shippingProviders: ShippingProviderOption[] = useMemo(() => {
    const raw = shippingProvidersQuery?.data as any;
    if (!raw) return [];
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw?.data?.items)) return raw.data.items;
    return [];
  }, [shippingProvidersQuery?.data]);

  const selectedShippingProvider = useMemo(() => {
    if (!shippingProviderSelection) return null;
    return shippingProviders.find((provider) => provider.id === shippingProviderSelection) ?? null;
  }, [shippingProviderSelection, shippingProviders]);

  const handleSelectOrder = (order: OrderListItem) => {
    if (dropdownCloseTimeoutRef.current) {
      window.clearTimeout(dropdownCloseTimeoutRef.current);
      dropdownCloseTimeoutRef.current = null;
    }
    if (orderSearchDebounceRef.current) {
      window.clearTimeout(orderSearchDebounceRef.current);
      orderSearchDebounceRef.current = null;
    }
    setSelectedOrderId(order.id);
    setOrderSearchTerm(order.orderNumber || '');
    setIsOrderDropdownOpen(false);
    onOrderSelect?.(order.id);
    addToast({
      type: 'info',
      title: t('fulfillments.order_selected', 'Order selected'),
      description: t('fulfillments.order_selected_description', 'Loading order details...'),
    });
  };

  const mapSerialNumbers = (value?: string) => {
    if (!value) return undefined;
    const parts = value
      .split(/\r?\n|,+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length ? parts : undefined;
  };

  const onSubmitInternal: SubmitHandler<CreateFulfillmentFormValues> = (values) => {
    if (!selectedOrder) {
      addToast({
        type: 'error',
        title: t('fulfillments.validation.order_required', 'Order selection is required'),
      });
      return;
    }

    const payload: CreateFulfillmentPayload = {
      orderId: selectedOrder.id,
      priorityLevel: values.priorityLevel,
      shippingProviderId: values.shippingProviderId || undefined,
      packagingType: values.packagingType || undefined,
      signatureRequired: values.signatureRequired,
      deliveryInstructions: values.deliveryInstructions?.trim() || undefined,
      giftWrap: values.giftWrap,
      giftMessage: values.giftWrap ? values.giftMessage?.trim() || undefined : undefined,
      notes: values.notes?.trim() || undefined,
      internalNotes: values.internalNotes?.trim() || undefined,
      shippingAddress: values.includeShippingAddress
        ? {
            ...values.shippingAddress,
            firstName: values.shippingAddress?.firstName?.trim() || '',
            lastName: values.shippingAddress?.lastName?.trim() || '',
            company: values.shippingAddress?.company?.trim() || undefined,
            address1: values.shippingAddress?.address1?.trim() || '',
            address2: values.shippingAddress?.address2?.trim() || undefined,
            city: values.shippingAddress?.city?.trim() || '',
            state: values.shippingAddress?.state?.trim() || '',
            postalCode: values.shippingAddress?.postalCode?.trim() || '',
            country: values.shippingAddress?.country?.trim() || '',
          }
        : undefined,
      pickupAddress: values.includePickupAddress
        ? {
            ...values.pickupAddress,
            firstName: values.pickupAddress?.firstName?.trim() || '',
            lastName: values.pickupAddress?.lastName?.trim() || '',
            company: values.pickupAddress?.company?.trim() || undefined,
            address1: values.pickupAddress?.address1?.trim() || '',
            address2: values.pickupAddress?.address2?.trim() || undefined,
            city: values.pickupAddress?.city?.trim() || '',
            state: values.pickupAddress?.state?.trim() || '',
            postalCode: values.pickupAddress?.postalCode?.trim() || '',
            country: values.pickupAddress?.country?.trim() || '',
          }
        : undefined,
      items: values.items.map((item) => ({
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        locationPickedFrom: item.locationPickedFrom?.trim() || undefined,
        batchNumber: item.batchNumber?.trim() || undefined,
        serialNumbers: mapSerialNumbers(item.serialNumbers),
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
        conditionNotes: item.conditionNotes?.trim() || undefined,
        packagingNotes: item.packagingNotes?.trim() || undefined,
        weight: item.weight ? Number(item.weight) : undefined,
        notes: item.notes?.trim() || undefined,
      })),
    };

    onSubmit(payload);
  };

  const handleRemoveItem = (fieldId: string, index: number) => {
    setExpandedItems((previous) => {
      if (!previous[fieldId]) return previous;
      const next = { ...previous };
      delete next[fieldId];
      return next;
    });
    remove(index);
  };

  const toggleAdvancedFields = (fieldId: string) => {
    setExpandedItems((previous) => ({
      ...previous,
      [fieldId]: !previous[fieldId],
    }));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-10">
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-visible">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <FiSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('fulfillments.select_order', 'Select an order to fulfill')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('fulfillments.select_order_description', 'Search for an order and choose the items to include in this fulfillment.')}
              </p>
            </div>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1" ref={orderSearchContainerRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fulfillments.order_search', 'Search orders')}
                </label>
                <div className="relative z-40">
                  <input
                    type="text"
                    value={orderSearchTerm}
                    onChange={(event) => {
                      setOrderSearchTerm(event.target.value);
                      if (!isOrderDropdownOpen) {
                        setIsOrderDropdownOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (dropdownCloseTimeoutRef.current) {
                        window.clearTimeout(dropdownCloseTimeoutRef.current);
                        dropdownCloseTimeoutRef.current = null;
                      }
                      setIsOrderDropdownOpen(true);
                    }}
                    onBlur={() => {
                      if (dropdownCloseTimeoutRef.current) {
                        window.clearTimeout(dropdownCloseTimeoutRef.current);
                      }
                      dropdownCloseTimeoutRef.current = window.setTimeout(() => {
                        setIsOrderDropdownOpen(false);
                        dropdownCloseTimeoutRef.current = null;
                      }, 150);
                    }}
                    placeholder={t('fulfillments.order_search_placeholder', 'Search by order number, customer, or email')}
                    autoComplete="off"
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                  {isOrderDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                      {ordersQuery.isLoading ? (
                        <div className="flex items-center justify-center py-5">
                          <Loading />
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {t('fulfillments.no_orders_found', 'No orders found. Try adjusting your search keywords.')}
                        </div>
                      ) : (
                        <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                          {orders.map((order) => {
                            const isSelected = selectedOrderId === order.id;
                            const eligibility = eligibilityMap.get(order.id);
                            const primaryImage = getPrimaryProductImage(order) || null;
                            const totalAmountValue =
                              typeof order.totalAmount === 'number'
                                ? order.totalAmount
                                : order.totalAmount !== undefined
                                ? Number(order.totalAmount)
                                : undefined;
                            return (
                              <li
                                key={order.id}
                                onClick={() => handleSelectOrder(order)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleSelectOrder(order);
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-selected={isSelected}
                                className={`w-full cursor-pointer py-2.5 text-left transition hover:bg-primary-50/70 dark:hover:bg-primary-900/25 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 ${
                                  isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-white dark:bg-gray-900'
                                }`}
                              >
                                <div className="flex items-start gap-2 px-2.5">
                                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                    {primaryImage ? (
                                      <img
                                        src={primaryImage}
                                        alt={order.orderNumber}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <FiImage className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex flex-1 flex-col text-left">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {order.orderNumber}
                                          </span>
                                          {isSelected && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-0.5 text-[11px] font-medium text-primary-600 dark:bg-primary-700/40 dark:text-primary-200">
                                              <FiCheck className="h-3 w-3" />
                                              {t('fulfillments.selected', 'Selected')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                          {order.customerName && (
                                            <span className="truncate max-w-[160px]">{order.customerName}</span>
                                          )}
                                          {order.orderDate && (
                                            <span>{new Date(order.orderDate).toLocaleString()}</span>
                                          )}
                                          {totalAmountValue !== undefined && !Number.isNaN(totalAmountValue) && order.currency && (
                                            <span>
                                              {new Intl.NumberFormat(undefined, {
                                                style: 'currency',
                                                currency: order.currency,
                                              }).format(totalAmountValue)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {eligibility && (
                                        <div className="flex flex-col items-start gap-1 text-left sm:min-w-[200px] sm:items-end sm:text-right">
                                          <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                              eligibility.canCreateFulfillment
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                                            }`}
                                          >
                                            {eligibility.canCreateFulfillment
                                              ? t('fulfillments.eligibility_passed', 'Đủ điều kiện tạo fulfillment')
                                              : t('fulfillments.eligibility_failed', 'Không đủ điều kiện tạo fulfillment')}
                                          </span>
                                          {!eligibility.canCreateFulfillment &&
                                            (eligibility.reasons?.length || eligibility.message) && (
                                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                                {eligibility.reasons?.length ? eligibility.reasons.join(', ') : eligibility.message}
                                              </p>
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedOrder && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('fulfillments.current_selection', 'Currently selected')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    #{selectedOrder.orderNumber || selectedOrder.id}
                  </span>
                  {selectedOrder.customerName && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.customerName}</span>
                  )}
                  {selectedOrder.customerEmail && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{selectedOrder.customerEmail}</span>
                  )}
                  {orderDateDisplay && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('orders.order_date', 'Order date')}: {orderDateDisplay}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {orderDetailQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        )}

        {selectedOrder && !orderDetailQuery.isLoading && (
          <section className="space-y-8">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <FiPackage className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('fulfillments.items_section_title', 'Items to fulfill')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('fulfillments.items_section_description', 'Adjust quantities for each item to include in this fulfillment. Remove items that will ship later.')}
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                {errors.items?.root && (
                  <p className="text-sm text-red-600">{errors.items?.root?.message}</p>
                )}
                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-10 text-center">
                    <FiInfo className="mx-auto h-6 w-6 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {t('fulfillments.no_items_selected', 'No items selected. Add at least one item to create this fulfillment.')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800/40">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('fulfillments.items_section_title', 'Items to fulfill')}
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('fulfillments.quantity_to_fulfill', 'Quantity to fulfill')}
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('fulfillments.location_picked_from', 'Location picked from')}
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('common.actions', 'Actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {fields.map((field, index) => {
                          const meta = orderItemsMeta.get(field.orderItemId || '');
                          const remaining = meta ? Math.max(meta.ordered - meta.fulfilled, 0) : undefined;
                          const orderItem = orderItemsMap.get(field.orderItemId || '');
                          const productImage = orderItem ? resolveItemImage(orderItem) : null;
                          const isExpanded = Boolean(expandedItems[field.id]);
                          const itemErrors = errors.items?.[index];
                          return (
                            <React.Fragment key={field.id}>
                              <tr className="bg-white dark:bg-gray-900">
                                <td className="px-4 py-4 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                      {productImage ? (
                                        <img src={productImage} alt={orderItem?.productName || ''} className="h-full w-full object-cover" />
                                      ) : (
                                        <FiImage className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {orderItem?.productName || t('fulfillments.unknown_product', 'Product')}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {orderItem?.variantName || orderItem?.productSku || ''}
                                      </p>
                                      {remaining !== undefined && (
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                          {t('fulfillments.remaining_quantity', 'Ordered: {{ordered}}, Already fulfilled: {{fulfilled}}', {
                                            ordered: meta?.ordered ?? '-',
                                            fulfilled: meta?.fulfilled ?? 0,
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <input
                                    type="number"
                                    min={1}
                                    max={remaining && remaining > 0 ? remaining : undefined}
                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                  />
                                  {itemErrors?.quantity && (
                                    <p className="mt-1 text-xs text-red-600">{itemErrors.quantity.message}</p>
                                  )}
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <input
                                    type="text"
                                    {...register(`items.${index}.locationPickedFrom`)}
                                    placeholder={t('fulfillments.location_placeholder', 'Warehouse location, rack, or bin')}
                                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                  />
                                  {itemErrors?.locationPickedFrom && (
                                    <p className="mt-1 text-xs text-red-600">{itemErrors.locationPickedFrom.message}</p>
                                  )}
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleAdvancedFields(field.id)}
                                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary-100/70 bg-primary-50/40 px-3 py-1 text-sm font-medium text-primary-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200 dark:hover:border-primary-400/60 dark:hover:bg-primary-400/15"
                                      aria-expanded={isExpanded}
                                    >
                                      {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                                      <span className="inline-flex items-center gap-1">
                                        <FiInfo className="h-3.5 w-3.5" />
                                        {isExpanded
                                          ? t('fulfillments.hide_item_details', 'Hide tracking details')
                                          : t('fulfillments.show_item_details', 'Add tracking details')}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(field.id, index)}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-100 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-300 dark:hover:text-red-300"
                                      aria-label={t('common.remove', 'Remove')}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                  <td colSpan={5} className="px-4 py-4">
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t(
                                          'fulfillments.item_details_hint',
                                          'Batch numbers, serial numbers, expiry dates, weight, condition notes, and packaging notes.'
                                        )}
                                      </p>
                                      <div className="mt-4 space-y-4">
                                        <div className="grid gap-4 md:grid-cols-12">
                                          <div className="md:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.batch_number', 'Batch / Lot number')}
                                            </label>
                                            <input
                                              type="text"
                                              {...register(`items.${index}.batchNumber`)}
                                              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.batchNumber && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.batchNumber.message}</p>
                                            )}
                                          </div>
                                          <div className="md:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.expiry_date', 'Expiry date (optional)')}
                                            </label>
                                            <input
                                              type="date"
                                              {...register(`items.${index}.expiryDate`)}
                                              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.expiryDate && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.expiryDate.message}</p>
                                            )}
                                          </div>
                                          <div className="md:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.package_weight', 'Package weight (kg)')}
                                            </label>
                                            <input
                                              type="number"
                                              step="0.01"
                                              min={0}
                                              {...register(`items.${index}.weight`)}
                                              className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.weight && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.weight.message}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-12">
                                          <div className="md:col-span-12">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.serial_numbers', 'Serial numbers')}
                                            </label>
                                            <textarea
                                              rows={3}
                                              {...register(`items.${index}.serialNumbers`)}
                                              placeholder={t('fulfillments.serial_numbers_placeholder', 'Enter one per line or separate with commas')}
                                              className="min-h-[96px] w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.serialNumbers && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.serialNumbers.message}</p>
                                            )}
                                          </div>
                                          <div className="md:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.condition_notes', 'Condition notes')}
                                            </label>
                                            <textarea
                                              rows={3}
                                              {...register(`items.${index}.conditionNotes`)}
                                              className="min-h-[96px] w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.conditionNotes && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.conditionNotes.message}</p>
                                            )}
                                          </div>
                                          <div className="md:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.packaging_notes', 'Packaging notes')}
                                            </label>
                                            <textarea
                                              rows={3}
                                              {...register(`items.${index}.packagingNotes`)}
                                              className="min-h-[96px] w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.packagingNotes && (
                                              <p className="mt-1 text-xs text-red-600">{itemErrors.packagingNotes.message}</p>
                                            )}
                                          </div>
                                          <div className="md:col-span-12">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                              {t('fulfillments.item_notes', 'Item notes (optional)')}
                                            </label>
                                            <textarea
                                              rows={3}
                                              {...register(`items.${index}.notes`)}
                                              className="min-h-[96px] w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            />
                                            {itemErrors?.notes && <p className="mt-1 text-xs text-red-600">{itemErrors.notes.message}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <FiSettings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('fulfillments.shipping_options', 'Fulfillment options')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('fulfillments.shipping_options_description', 'Select shipping preferences, priority, and packaging details.')}
                  </p>
                </div>
              </div>
                <div className="px-6 py-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('fulfillments.priority_level', 'Priority level')}
                      </label>
                    <select
                      {...register('priorityLevel')}
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      {PRIORITY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value ?? ''}>
                          {t(`fulfillments.priority_types.${level.value}`, level.label)}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('fulfillments.shipping_provider', 'Shipping provider')}
                      </label>
                    <select
                      {...register('shippingProviderId')}
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="">{t('fulfillments.choose_provider', 'Select a provider (optional)')}</option>
                      {shippingProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} {provider.code ? `(${provider.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('fulfillments.packaging_type', 'Packaging type')}
                      </label>
                    <select
                      {...register('packagingType')}
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="">{t('fulfillments.choose_packaging', 'Select packaging (optional)')}</option>
                      {PACKAGING_TYPES.map((type) => (
                        <option key={type.value} value={type.value ?? ''}>
                          {t(`fulfillments.packaging_types.${type.value}`, type.label)}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div className="md:col-span-12">
                      <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <input
                          type="checkbox"
                        {...register('signatureRequired')}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('fulfillments.signature_required', 'Signature required on delivery')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('fulfillments.signature_required_description', 'Recipient must sign to confirm delivery.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('fulfillments.delivery_instructions', 'Delivery instructions (optional)')}
                    </label>
                    <textarea
                      rows={3}
                      {...register('deliveryInstructions')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>

                  <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <input
                      type="checkbox"
                      {...register('giftWrap')}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('fulfillments.gift_wrap', 'Gift wrap this shipment')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('fulfillments.gift_wrap_description', 'Include special packaging and optional gift message.')}
                      </p>
                    </div>
                  </div>

                  {giftWrap && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('fulfillments.gift_message', 'Gift message (optional)')}
                      </label>
                      <textarea
                        rows={2}
                        {...register('giftMessage')}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('fulfillments.shipping_details', 'Shipping details')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('fulfillments.shipping_details_description', 'Confirm where this fulfillment will ship from and deliver to.')}
                  </p>
                </div>
              </div>
                <div className="px-6 py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('fulfillments.include_shipping_address', 'Include shipping address')}
                    </label>
                    <input
                      type="checkbox"
                      {...register('includeShippingAddress')}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                {includeShippingAddress && (
                  <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.first_name', 'First name')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.firstName')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.shippingAddress?.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.firstName.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.last_name', 'Last name')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.lastName')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.shippingAddress?.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.lastName.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-12">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.company', 'Company (optional)')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.company')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                    <div className="md:col-span-12">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.address_line1', 'Address line 1')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.address1')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.shippingAddress?.address1 && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.address1.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-12">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.address_line2', 'Address line 2')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.address2')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.state', 'State / Province')}
                      </label>
                        <select
                          {...register('shippingAddress.state')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={!shippingCountryId || shippingProvincesQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_province', 'Select province / city')}</option>
                          {shippingProvinceOptions.map((province) => (
                            <option key={province.id} value={province.id}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                        {shippingProvincesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {shippingCountryId && shippingProvinceOptions.length === 0 && !shippingProvincesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_province_results', 'No provinces available for the selected country.')}
                          </p>
                        )}
                        {errors.shippingAddress?.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.city', 'City')}
                      </label>
                        <select
                          {...register('shippingAddress.city')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={!shippingProvinceId || shippingWardsQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_ward', 'Select district / ward')}</option>
                          {shippingWardOptions.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                        {shippingProvinceId && shippingWardsQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {shippingProvinceId && shippingWardOptions.length === 0 && !shippingWardsQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_ward_results', 'No districts available for the selected province.')}
                          </p>
                        )}
                        {errors.shippingAddress?.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.postal_code', 'Postal code')}
                      </label>
                        <input
                          type="text"
                          {...register('shippingAddress.postalCode')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.shippingAddress?.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
                        )}
                      </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.country', 'Country')}
                      </label>
                        <select
                          {...register('shippingAddress.country')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={countriesQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_country', 'Select country')}</option>
                          {countryOptions.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {countriesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {!countriesQuery.isLoading && countryOptions.length === 0 && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_country_results', 'No countries available.')}
                          </p>
                        )}
                        {errors.shippingAddress?.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('fulfillments.include_pickup_address', 'Use alternative pickup address')}
                    </label>
                    <input
                      type="checkbox"
                      {...register('includePickupAddress')}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  {includePickupAddress && (
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.first_name', 'First name')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.firstName')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.pickupAddress?.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.firstName.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.last_name', 'Last name')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.lastName')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.pickupAddress?.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.lastName.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.company', 'Company (optional)')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.company')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.address_line1', 'Address line 1')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.address1')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.pickupAddress?.address1 && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.address1.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.address_line2', 'Address line 2')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.address2')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.state', 'State / Province')}
                        </label>
                        <select
                          {...register('pickupAddress.state')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={!pickupCountryId || pickupProvincesQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_province', 'Select province / city')}</option>
                          {pickupProvinceOptions.map((province) => (
                            <option key={province.id} value={province.id}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                        {pickupCountryId && pickupProvincesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {pickupCountryId && pickupProvinceOptions.length === 0 && !pickupProvincesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_province_results', 'No provinces available for the selected country.')}
                          </p>
                        )}
                        {errors.pickupAddress?.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.state.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.city', 'City')}
                        </label>
                        <select
                          {...register('pickupAddress.city')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={!pickupProvinceId || pickupWardsQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_ward', 'Select district / ward')}</option>
                          {pickupWardOptions.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                        {pickupProvinceId && pickupWardsQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {pickupProvinceId && pickupWardOptions.length === 0 && !pickupWardsQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_ward_results', 'No districts available for the selected province.')}
                          </p>
                        )}
                        {errors.pickupAddress?.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.city.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.postal_code', 'Postal code')}
                        </label>
                        <input
                          type="text"
                          {...register('pickupAddress.postalCode')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.pickupAddress?.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.postalCode.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('common.country', 'Country')}
                        </label>
                        <select
                          {...register('pickupAddress.country')}
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          disabled={countriesQuery.isLoading}
                        >
                          <option value="">{t('fulfillments.select_country', 'Select country')}</option>
                          {countryOptions.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {countriesQuery.isLoading && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.loading', 'Loading...')}
                          </p>
                        )}
                        {!countriesQuery.isLoading && countryOptions.length === 0 && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('fulfillments.no_country_results', 'No countries available.')}
                          </p>
                        )}
                        {errors.pickupAddress?.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.country.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <FiInfo className="h-5 w-5" />
                  </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('fulfillments.notes_section', 'Additional notes')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('fulfillments.notes_section_description', 'Include internal notes for your team or instructions for the customer.')}
                  </p>
                </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('fulfillments.notes_for_customer', 'Notes for customer (optional)')}
                    </label>
                    <textarea
                      rows={3}
                      {...register('notes')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('fulfillments.internal_notes', 'Internal notes (optional)')}
                    </label>
                    <textarea
                      rows={3}
                      {...register('internalNotes')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                </div>
              </div>

              </div>
              <div className="space-y-6 lg:sticky lg:top-6 self-start">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {t('fulfillments.order_overview', 'Order overview')}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        #{selectedOrder.orderNumber || selectedOrder.id}
                      </h3>
                    </div>
                    {selectedOrder.status && (
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">
                        {selectedOrder.status}
                      </span>
                    )}
                  </div>
                  <div className="px-6 py-6 space-y-5">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedOrder.customerName || selectedOrder.customerEmail || t('fulfillments.no_customer_info', 'No customer info')}
                      </p>
                      {selectedOrder.customerEmail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedOrder.customerEmail}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {orderDateDisplay && (
                        <span>
                          {t('orders.order_date', 'Order date')}: {orderDateDisplay}
                        </span>
                      )}
                      {orderTotalDisplay && (
                        <span>
                          {t('fulfillments.summary_order_value', 'Order value')}: {orderTotalDisplay}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
                        <p className="text-xs font-medium uppercase tracking-wide">
                          {t('fulfillments.summary_items_selected', 'Items selected')}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalItemsSelected}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-gray-700 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
                        <p className="text-xs font-medium uppercase tracking-wide">
                          {t('fulfillments.summary_units_selected', 'Units shipping')}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalUnitsSelected}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between gap-3">
                        <span>{t('fulfillments.priority_level', 'Priority level')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {selectedPriorityLevel
                            ? t(`fulfillments.priority_types.${selectedPriorityLevel.value}`, selectedPriorityLevel.label)
                            : t('common.not_set', 'Not set')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{t('fulfillments.shipping_provider', 'Shipping provider')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {selectedShippingProvider?.name || t('common.not_set', 'Not set')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{t('fulfillments.packaging_type', 'Packaging type')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {selectedPackagingType
                            ? t(`fulfillments.packaging_types.${selectedPackagingType.value}`, selectedPackagingType.label)
                            : t('common.not_set', 'Not set')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{t('fulfillments.signature_required', 'Signature required')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {signatureRequired ? t('common.yes', 'Yes') : t('common.no', 'No')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{t('fulfillments.gift_wrap', 'Gift wrap')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {giftWrap ? t('common.yes', 'Yes') : t('common.no', 'No')}
                        </span>
                      </div>
                    </div>
                    {selectedOrderEligibility && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          selectedOrderEligibility.canCreateFulfillment
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                            : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                        }`}
                      >
                        <p className="font-semibold">
                          {selectedOrderEligibility.canCreateFulfillment
                            ? t('fulfillments.eligibility_passed', 'Đủ điều kiện tạo fulfillment')
                            : t('fulfillments.eligibility_failed', 'Không đủ điều kiện tạo fulfillment')}
                        </p>
                        {!selectedOrderEligibility.canCreateFulfillment &&
                          (selectedOrderEligibility.reasons?.length || selectedOrderEligibility.message) && (
                            <p className="mt-1 text-xs">
                              {selectedOrderEligibility.reasons?.length
                                ? selectedOrderEligibility.reasons.join(', ')
                                : selectedOrderEligibility.message}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            {t('fulfillments.create_fulfillment', 'Create fulfillment')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateFulfillmentForm;

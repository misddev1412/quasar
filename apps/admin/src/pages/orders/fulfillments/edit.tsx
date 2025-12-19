import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiPackage } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { Button } from '../../../components/common/Button';
import { Loading } from '../../../components/common/Loading';
import { FormSection } from '../../../components/common/FormSection';
import { Badge } from '../../../components/common/Badge';
import { useToast } from '../../../context/ToastContext';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { trpc } from '../../../utils/trpc';
import { Input } from '../../../components/common/Input';

const FULFILLMENT_STATUS_OPTIONS = [
  'PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

const PRIORITY_LEVELS = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
const PACKAGING_TYPES = ['ENVELOPE', 'BOX', 'CRATE', 'PALLET', 'CUSTOM'] as const;

const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const editFulfillmentSchema = z.object({
  status: z.enum(FULFILLMENT_STATUS_OPTIONS),
  priorityLevel: z.enum(PRIORITY_LEVELS),
  shippingProviderId: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  shippingCost: z.string().optional(),
  insuranceCost: z.string().optional(),
  packagingType: z.enum(PACKAGING_TYPES).or(z.literal('')).optional(),
  packageWeight: z.string().optional(),
  packageDimensions: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  includeShippingAddress: z.boolean().default(false),
  shippingAddress: addressSchema.optional(),
});

type EditFulfillmentFormValues = z.infer<typeof editFulfillmentSchema>;

type AddressFormValue = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

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

const selectClass =
  'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3.5 h-11 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-0 appearance-none pr-10';
const textareaClass =
  'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-0 resize-none min-h-[120px]';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PROCESSING':
    case 'PACKED':
      return 'info';
    case 'SHIPPED':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'destructive';
    case 'RETURNED':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return 'secondary';
    case 'NORMAL':
      return 'default';
    case 'HIGH':
      return 'warning';
    case 'URGENT':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const fulfillmentIcon = <FiPackage className="w-5 h-5 text-primary-600 dark:text-primary-400" />;

const OrderFulfillmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const adminOrderFulfillments = (trpc as any)['adminOrderFulfillments'];
  const adminShippingProviders = (trpc as any)['adminShippingProviders'];

  const fulfillmentQuery = trpc.orderFulfillments.getById.useQuery(
    { id: id as string },
    { enabled: Boolean(id) }
  );

  const shippingProvidersQuery =
    adminShippingProviders?.list?.useQuery?.({ page: 1, limit: 100 }) ?? {
      data: null,
      isLoading: false,
    };

  const updateFulfillmentMutation =
    adminOrderFulfillments?.update?.useMutation?.({
      onSuccess: () => {
        addToast({
          type: 'success',
          title: t('fulfillments.update_success', 'Fulfillment updated successfully'),
          description: t('fulfillments.update_success_description', 'Your changes have been saved.'),
        });
        fulfillmentQuery.refetch();
        if (id) navigate(`/orders/fulfillments/${id}`);
      },
      onError: (error: any) => {
        addToast({
          type: 'error',
          title: t('fulfillments.update_failed', 'Unable to update fulfillment'),
          description: error?.message || t('common.unexpected_error', 'Something went wrong. Please try again.'),
        });
      },
    }) ?? {
      mutateAsync: async () => {
        throw new Error(t('fulfillments.api_unavailable', 'Fulfillment API is unavailable'));
      },
      isPending: false,
    };

  const fulfillment = (fulfillmentQuery.data as any)?.data ?? fulfillmentQuery.data;

  const shippingProviders = useMemo(() => {
    const raw = shippingProvidersQuery.data as any;
    if (!raw) return [];
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data?.items)) return raw.data.items;
    return [];
  }, [shippingProvidersQuery.data]);

  const form = useForm<EditFulfillmentFormValues>({
    resolver: zodResolver(editFulfillmentSchema),
    defaultValues: {
      status: 'PENDING',
      priorityLevel: 'NORMAL',
      shippingProviderId: '',
      trackingNumber: '',
      estimatedDeliveryDate: '',
      shippingCost: '',
      insuranceCost: '',
      packagingType: undefined,
      packageWeight: '',
      packageDimensions: '',
      deliveryInstructions: '',
      notes: '',
      internalNotes: '',
      includeShippingAddress: false,
      shippingAddress: { ...DEFAULT_ADDRESS },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
    setValue,
    getValues,
  } = form;

  const includeShippingAddress = watch('includeShippingAddress');

  useEffect(() => {
    if (!fulfillment) return;

    reset({
      status: fulfillment.status ?? 'PENDING',
      priorityLevel: fulfillment.priorityLevel ?? 'NORMAL',
      shippingProviderId: fulfillment.shippingProvider?.id ?? fulfillment.shippingProviderId ?? '',
      trackingNumber: fulfillment.trackingNumber ?? '',
      estimatedDeliveryDate: fulfillment.estimatedDeliveryDate
        ? new Date(fulfillment.estimatedDeliveryDate).toISOString().split('T')[0]
        : '',
      shippingCost: fulfillment.shippingCost != null ? String(fulfillment.shippingCost) : '',
      insuranceCost: fulfillment.insuranceCost != null ? String(fulfillment.insuranceCost) : '',
      packagingType: fulfillment.packagingType ?? undefined,
      packageWeight: fulfillment.packageWeight != null ? String(fulfillment.packageWeight) : '',
      packageDimensions: fulfillment.packageDimensions ?? '',
      deliveryInstructions: fulfillment.deliveryInstructions ?? '',
      notes: fulfillment.notes ?? '',
      internalNotes: fulfillment.internalNotes ?? '',
      includeShippingAddress: Boolean(fulfillment.shippingAddress),
      shippingAddress: fulfillment.shippingAddress
        ? {
            firstName: fulfillment.shippingAddress.firstName ?? '',
            lastName: fulfillment.shippingAddress.lastName ?? '',
            company: fulfillment.shippingAddress.company ?? '',
            address1: fulfillment.shippingAddress.address1 ?? '',
            address2: fulfillment.shippingAddress.address2 ?? '',
            city: fulfillment.shippingAddress.city ?? '',
            state: fulfillment.shippingAddress.state ?? '',
            postalCode: fulfillment.shippingAddress.postalCode ?? '',
            country: fulfillment.shippingAddress.country ?? '',
          }
        : { ...DEFAULT_ADDRESS },
    });
  }, [fulfillment, reset]);

  useEffect(() => {
    if (includeShippingAddress && !getValues('shippingAddress')) {
      setValue('shippingAddress', { ...DEFAULT_ADDRESS });
    }
  }, [includeShippingAddress, getValues, setValue]);

  const parseNumber = (value?: string) => {
    if (!value && value !== '0') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const onSubmit = async (values: EditFulfillmentFormValues) => {
    if (!id) return;

    const payload: Record<string, unknown> = {
      status: values.status,
      priorityLevel: values.priorityLevel,
      shippingProviderId: values.shippingProviderId?.trim() || undefined,
      trackingNumber: values.trackingNumber?.trim() || undefined,
      estimatedDeliveryDate: values.estimatedDeliveryDate
        ? new Date(values.estimatedDeliveryDate).toISOString()
        : undefined,
      shippingCost: parseNumber(values.shippingCost),
      insuranceCost: parseNumber(values.insuranceCost),
      packagingType: values.packagingType || undefined,
      packageWeight: parseNumber(values.packageWeight),
      packageDimensions: values.packageDimensions?.trim() || undefined,
      deliveryInstructions: values.deliveryInstructions?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      internalNotes: values.internalNotes?.trim() || undefined,
    };

    if (values.includeShippingAddress && values.shippingAddress) {
      payload.shippingAddress = {
        firstName: values.shippingAddress.firstName?.trim() || '',
        lastName: values.shippingAddress.lastName?.trim() || '',
        company: values.shippingAddress.company?.trim() || '',
        address1: values.shippingAddress.address1?.trim() || '',
        address2: values.shippingAddress.address2?.trim() || '',
        city: values.shippingAddress.city?.trim() || '',
        state: values.shippingAddress.state?.trim() || '',
        postalCode: values.shippingAddress.postalCode?.trim() || '',
        country: values.shippingAddress.country?.trim() || '',
      };
    }

    try {
      await updateFulfillmentMutation.mutateAsync({
        id,
        data: payload,
      });
    } catch (error) {
      // Toast is handled inside the mutation options; swallow to avoid unhandled rejection
      console.error('Failed to update fulfillment', error);
    }
  };

  if (fulfillmentQuery.isLoading) {
    return (
      <CreatePageTemplate
        title={t('fulfillments.edit_fulfillment', 'Edit Fulfillment')}
        description={t('fulfillments.edit_description', 'Adjust shipping details, tracking, and notes for this fulfillment.')}
        icon={fulfillmentIcon}
        entityName={t('fulfillments.fulfillment', 'Fulfillment')}
        entityNamePlural={t('fulfillments.title', 'Order Fulfillments')}
        backUrl={`/orders/fulfillments/${id}`}
        onBack={() => navigate(`/orders/fulfillments/${id ?? ''}`)}
        maxWidth="full"
        mode="update"
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </CreatePageTemplate>
    );
  }

  if (fulfillmentQuery.error || !fulfillment) {
    return (
      <CreatePageTemplate
        title={t('fulfillments.edit_fulfillment', 'Edit Fulfillment')}
        description={t('fulfillments.edit_description', 'Adjust shipping details, tracking, and notes for this fulfillment.')}
        icon={fulfillmentIcon}
        entityName={t('fulfillments.fulfillment', 'Fulfillment')}
        entityNamePlural={t('fulfillments.title', 'Order Fulfillments')}
        backUrl="/orders/fulfillments"
        onBack={() => navigate('/orders/fulfillments')}
        maxWidth="full"
        mode="update"
      >
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-4">
          {fulfillmentQuery.error?.message || t('fulfillments.not_found', 'Fulfillment not found')}
        </div>
      </CreatePageTemplate>
    );
  }

  const breadcrumbItems = [
    { label: t('navigation.home', 'Home'), href: '/' },
    { label: t('orders.title', 'Orders'), href: '/orders' },
    { label: t('fulfillments.title', 'Order Fulfillments'), href: '/orders/fulfillments' },
    { label: fulfillment.fulfillmentNumber, href: `/orders/fulfillments/${fulfillment.id}` },
    { label: t('common.edit', 'Edit') },
  ];

  return (
    <CreatePageTemplate
      title={t('fulfillments.edit_fulfillment', 'Edit Fulfillment')}
      description={t('fulfillments.edit_description', 'Adjust shipping details, tracking, and notes for this fulfillment.')}
      icon={fulfillmentIcon}
      entityName={t('fulfillments.fulfillment', 'Fulfillment')}
      entityNamePlural={t('fulfillments.title', 'Order Fulfillments')}
      backUrl={`/orders/fulfillments/${id}`}
      onBack={() => navigate(`/orders/fulfillments/${id}`)}
      isSubmitting={updateFulfillmentMutation.isPending || isSubmitting}
      maxWidth="full"
      mode="update"
      breadcrumbs={breadcrumbItems}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('fulfillments.fulfillment_number')}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{fulfillment.fulfillmentNumber}</p>
          <p className="text-sm text-gray-500">{new Date(fulfillment.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('fulfillments.order')}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{fulfillment.orderNumber}</p>
          <p className="text-sm text-gray-500">{fulfillment.customerName}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('fulfillments.status')}</p>
          <div className="mt-2">
            <Badge variant={getStatusBadgeVariant(fulfillment.status) as any}>
              {t(`fulfillments.status_types.${fulfillment.status}`)}
            </Badge>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">{t('fulfillments.priority')}</p>
          <div className="mt-2">
            <Badge variant={getPriorityBadgeVariant(fulfillment.priorityLevel) as any}>
              {t(`fulfillments.priority_types.${fulfillment.priorityLevel}`)}
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('fulfillments.shipping_provider')}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {fulfillment.shippingProvider?.name || t('fulfillments.not_assigned', 'Not assigned')}
          </p>
          <p className="text-sm text-gray-500">
            {fulfillment.trackingNumber
              ? `${t('fulfillments.tracking_number')}: ${fulfillment.trackingNumber}`
              : t('fulfillments.no_tracking', 'No tracking')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('fulfillments.basic_information', 'Basic Information')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('fulfillments.basic_information_description', 'Update the fulfillment status and priority to keep everyone aligned.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.status')}</label>
              <div className="relative">
                <select {...register('status')} className={selectClass}>
                  {FULFILLMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {t(`fulfillments.status_types.${status}`)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.priority')}</label>
              <div className="relative">
                <select {...register('priorityLevel')} className={selectClass}>
                  {PRIORITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {t(`fulfillments.priority_types.${level}`)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('fulfillments.shipping_details', 'Shipping Details')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('fulfillments.shipping_details_description', 'Manage carrier, tracking, and packaging information for this fulfillment.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.shipping_provider')}</label>
              <div className="relative">
                <select {...register('shippingProviderId')} className={selectClass}>
                  <option value="">{t('fulfillments.select_shipping_provider', 'Select shipping provider')}</option>
                  {shippingProviders.map((provider: any) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.tracking_number')}</label>
              <Input
                type="text"
                {...register('trackingNumber')}
                className="mt-1" inputSize="md"
                placeholder="TRK-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.estimated_delivery')}</label>
              <Input
                type="date"
                {...register('estimatedDeliveryDate')}
                className="mt-1" inputSize="md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.packaging_type')}</label>
              <div className="relative">
                <select {...register('packagingType')} className={selectClass}>
                  <option value="">{t('fulfillments.select_packaging', 'Select packaging')}</option>
                  {PACKAGING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`fulfillments.packaging_types.${type}`, type)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.package_weight')}</label>
              <Input
                type="number"
                step="0.01"
                {...register('packageWeight')}
                className="mt-1" inputSize="md"
                placeholder="1.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.package_dimensions')}</label>
              <Input
                type="text"
                {...register('packageDimensions')}
                className="mt-1" inputSize="md"
                placeholder="30x20x10 cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.shipping_cost')}</label>
              <Input
                type="number"
                step="0.01"
                {...register('shippingCost')}
                className="mt-1" inputSize="md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.insurance_cost')}</label>
              <Input
                type="number"
                step="0.01"
                {...register('insuranceCost')}
                className="mt-1" inputSize="md"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('fulfillments.shipping_address', 'Shipping Address')}</h3>
            <label className="flex items-center text-sm text-gray-600">
              <Input type="checkbox" className="mr-2" {...register('includeShippingAddress')} />
              {t('fulfillments.include_shipping_address', 'Update shipping address')}
            </label>
          </div>
          <p className="text-sm text-gray-500">{t('fulfillments.shipping_address_description', 'Override the destination address if the shipment needs rerouting.')}</p>
          {includeShippingAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.first_name', 'First name')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.firstName')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.last_name', 'Last name')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.lastName')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.company', 'Company')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.company')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.country', 'Country')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.country')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.address_line1', 'Address line 1')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.address1')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.address_line2', 'Address line 2')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.address2')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.city', 'City')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.city')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.state', 'State')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.state')}
                  className="mt-1" inputSize="md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.postal_code', 'Postal code')}</label>
                <Input
                  type="text"
                  {...register('shippingAddress.postalCode')}
                  className="mt-1" inputSize="md"
                />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('fulfillments.additional_information', 'Additional Information')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('fulfillments.additional_information_description', 'Leave delivery instructions or internal notes for the team.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.delivery_instructions')}</label>
              <textarea
                rows={3}
                {...register('deliveryInstructions')}
                className={textareaClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.notes')}</label>
              <textarea
                rows={3}
                {...register('notes')}
                className={textareaClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('fulfillments.internal_notes')}</label>
              <textarea
                rows={3}
                {...register('internalNotes')}
                className={textareaClass}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/orders/fulfillments/${id}`)}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={updateFulfillmentMutation.isPending || isSubmitting} disabled={updateFulfillmentMutation.isPending || isSubmitting}>{t('common.save_changes', 'Save changes')}</Button>
        </div>
      </form>
    </CreatePageTemplate>
  );
};

export default OrderFulfillmentEditPage;

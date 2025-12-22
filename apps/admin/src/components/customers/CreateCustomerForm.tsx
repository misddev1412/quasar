import React, { useState } from 'react';
import { FiUser, FiMail, FiMapPin, FiSettings, FiTag } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { z } from 'zod';

export interface CreateCustomerFormData {
  // Personal Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;

  // Business Information
  type: 'INDIVIDUAL' | 'BUSINESS';
  companyName?: string;
  jobTitle?: string;

  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

  // Addresses
  defaultBillingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  defaultShippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Marketing and Customer Data
  marketingConsent: boolean;
  newsletterSubscribed: boolean;
  customerTags?: string[];
  notes?: string;
  referralSource?: string;
  taxExempt: boolean;
  taxId?: string;
}

interface CreateCustomerFormProps {
  onSubmit: (data: CreateCustomerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

const getInitialFormData = (): CreateCustomerFormData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  type: 'INDIVIDUAL',
  companyName: '',
  jobTitle: '',
  status: 'ACTIVE',
  marketingConsent: false,
  newsletterSubscribed: false,
  customerTags: [],
  notes: '',
  referralSource: '',
  taxExempt: false,
  taxId: '',
});

export const CreateCustomerForm: React.FC<CreateCustomerFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const [formData, setFormData] = useState<CreateCustomerFormData>(getInitialFormData());

  const addressSchema = z.object({
    firstName: z.string().min(1, t('admin.first_name_required')),
    lastName: z.string().min(1, t('admin.last_name_required')),
    company: z.string().optional(),
    address1: z.string().min(1, t('admin.address_required')),
    address2: z.string().optional(),
    city: z.string().min(1, t('admin.city_required')),
    state: z.string().min(1, t('admin.state_required')),
    postalCode: z.string().min(1, t('admin.postal_code_required')),
    country: z.string().min(1, t('admin.country_required')),
  });

  const formSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    type: z.enum(['INDIVIDUAL', 'BUSINESS']),
    companyName: z.string().optional(),
    jobTitle: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']),
    defaultBillingAddress: addressSchema.optional(),
    defaultShippingAddress: addressSchema.optional(),
    marketingConsent: z.boolean(),
    newsletterSubscribed: z.boolean(),
    customerTags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    referralSource: z.string().optional(),
    taxExempt: z.boolean(),
    taxId: z.string().optional(),
  });

  const tabs: FormTabConfig[] = [
    {
      id: 'personal',
      label: t('admin.personal_information'),
      icon: <FiUser className="w-4 h-4" />,
      sections: [{
        title: t('admin.personal_information'),
        icon: <FiUser className="w-4 h-4" />,
        fields: [
          {
            name: 'firstName',
            label: t('admin.first_name'),
            type: 'text',
            placeholder: t('admin.enter_first_name'),
          },
          {
            name: 'lastName',
            label: t('admin.last_name'),
            type: 'text',
            placeholder: t('admin.enter_last_name'),
          },
          {
            name: 'email',
            label: t('admin.email'),
            type: 'email',
            placeholder: t('admin.enter_email'),
          },
          {
            name: 'phone',
            label: t('admin.phone'),
            type: 'tel',
            placeholder: t('admin.enter_phone'),
          },
          {
            name: 'dateOfBirth',
            label: t('admin.date_of_birth'),
            type: 'date',
          },
          {
            name: 'gender',
            label: t('admin.gender'),
            type: 'select',
            options: [
              { value: '', label: t('admin.select_gender') },
              { value: 'male', label: t('admin.male') },
              { value: 'female', label: t('admin.female') },
              { value: 'other', label: t('admin.other') },
            ],
          },
        ],
      }],
    },
    {
      id: 'business',
      label: t('admin.business_information'),
      icon: <FiMail className="w-4 h-4" />,
      sections: [{
        title: t('admin.business_information'),
        icon: <FiMail className="w-4 h-4" />,
        fields: [
          {
            name: 'type',
            label: t('admin.customer_type'),
            type: 'select',
            required: true,
            options: [
              { value: 'INDIVIDUAL', label: t('admin.customer_type.individual') },
              { value: 'BUSINESS', label: t('admin.customer_type.business') },
            ],
          },
          {
            name: 'companyName',
            label: t('admin.company_name'),
            type: 'text',
            placeholder: t('admin.enter_company_name'),
          },
          {
            name: 'jobTitle',
            label: t('admin.job_title'),
            type: 'text',
            placeholder: t('admin.enter_job_title'),
          },
          {
            name: 'status',
            label: t('admin.status'),
            type: 'select',
            required: true,
            options: [
              { value: 'ACTIVE', label: t('admin.customer_status.active') },
              { value: 'INACTIVE', label: t('admin.customer_status.inactive') },
              { value: 'BLOCKED', label: t('admin.customer_status.blocked') },
              { value: 'PENDING', label: t('admin.customer_status.pending') },
            ],
          },
          {
            name: 'marketingConsent',
            label: t('admin.marketing_consent'),
            type: 'checkbox',
            description: t('admin.marketing_consent_description'),
          },
          {
            name: 'newsletterSubscribed',
            label: t('admin.newsletter_subscribed'),
            type: 'checkbox',
            description: t('admin.newsletter_subscription_description'),
          },
        ],
      }],
    },
    {
      id: 'addresses',
      label: t('admin.addresses'),
      icon: <FiMapPin className="w-4 h-4" />,
      sections: [
        {
          title: t('admin.billing_address'),
          icon: <FiMapPin className="w-4 h-4" />,
          fields: [
            {
              name: 'defaultBillingAddress.firstName',
              label: t('admin.first_name'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.lastName',
              label: t('admin.last_name'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.company',
              label: t('admin.company'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.address1',
              label: t('admin.address_line_1'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.address2',
              label: t('admin.address_line_2'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.city',
              label: t('admin.city'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.state',
              label: t('admin.state'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.postalCode',
              label: t('admin.postal_code'),
              type: 'text',
            },
            {
              name: 'defaultBillingAddress.country',
              label: t('admin.country'),
              type: 'text',
            },
          ],
        },
        {
          title: t('admin.shipping_address'),
          icon: <FiMapPin className="w-4 h-4" />,
          fields: [
            {
              name: 'defaultShippingAddress.firstName',
              label: t('admin.first_name'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.lastName',
              label: t('admin.last_name'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.company',
              label: t('admin.company'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.address1',
              label: t('admin.address_line_1'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.address2',
              label: t('admin.address_line_2'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.city',
              label: t('admin.city'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.state',
              label: t('admin.state'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.postalCode',
              label: t('admin.postal_code'),
              type: 'text',
            },
            {
              name: 'defaultShippingAddress.country',
              label: t('admin.country'),
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      id: 'additional',
      label: t('admin.additional_info'),
      icon: <FiTag className="w-4 h-4" />,
      sections: [{
        title: t('admin.additional_info'),
        icon: <FiTag className="w-4 h-4" />,
        fields: [
          {
            name: 'notes',
            label: t('admin.notes'),
            type: 'textarea',
            placeholder: t('admin.enter_customer_notes'),
          },
          {
            name: 'referralSource',
            label: t('admin.referral_source'),
            type: 'text',
            placeholder: t('admin.enter_referral_source'),
          },
          {
            name: 'taxExempt',
            label: t('admin.tax_exempt'),
            type: 'checkbox',
            description: t('admin.tax_exempt_description'),
          },
          {
            name: 'taxId',
            label: t('admin.tax_id'),
            type: 'text',
            placeholder: t('admin.enter_tax_id'),
          },
        ],
      }],
    },
  ];

  const handleSubmit = async (data: CreateCustomerFormData) => {
    // Clean up the data before sending to backend
    const cleanedData = {
      // Only include fields if they have values (all fields are now optional)
      ...(data.firstName && data.firstName.trim() && { firstName: data.firstName.trim() }),
      ...(data.lastName && data.lastName.trim() && { lastName: data.lastName.trim() }),
      ...(data.email && data.email.trim() && { email: data.email.trim() }),
      ...(data.phone && data.phone.trim() && { phone: data.phone.trim() }),
      ...(data.dateOfBirth && data.dateOfBirth.trim() && { dateOfBirth: data.dateOfBirth.trim() }),
      ...(data.gender && data.gender.trim() && { gender: data.gender.trim() }),
      ...(data.companyName && data.companyName.trim() && { companyName: data.companyName.trim() }),
      ...(data.jobTitle && data.jobTitle.trim() && { jobTitle: data.jobTitle.trim() }),
      ...(data.notes && data.notes.trim() && { notes: data.notes.trim() }),
      ...(data.referralSource && data.referralSource.trim() && { referralSource: data.referralSource.trim() }),
      ...(data.taxId && data.taxId.trim() && { taxId: data.taxId.trim() }),
      // Include other required fields with defaults
      type: data.type || 'INDIVIDUAL',
      status: data.status || 'ACTIVE',
      marketingConsent: data.marketingConsent || false,
      newsletterSubscribed: data.newsletterSubscribed || false,
      taxExempt: data.taxExempt || false,
      // Only include address objects if they have all required fields
      ...(data.defaultBillingAddress &&
        data.defaultBillingAddress.firstName &&
        data.defaultBillingAddress.lastName &&
        data.defaultBillingAddress.address1 &&
        data.defaultBillingAddress.city &&
        data.defaultBillingAddress.state &&
        data.defaultBillingAddress.postalCode &&
        data.defaultBillingAddress.country && {
        defaultBillingAddress: data.defaultBillingAddress
      }),
      ...(data.defaultShippingAddress &&
        data.defaultShippingAddress.firstName &&
        data.defaultShippingAddress.lastName &&
        data.defaultShippingAddress.address1 &&
        data.defaultShippingAddress.city &&
        data.defaultShippingAddress.state &&
        data.defaultShippingAddress.postalCode &&
        data.defaultShippingAddress.country && {
        defaultShippingAddress: data.defaultShippingAddress
      }),
    };

    await onSubmit(cleanedData);
  };

  return (
    <EntityForm<CreateCustomerFormData>
      tabs={tabs}
      initialValues={formData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText={t('admin.create_customer')}
      cancelButtonText={t('cancel')}
      onCancel={onCancel}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};

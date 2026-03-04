'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Image, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { parsePhoneNumber } from 'react-phone-number-input';
import Button from '../common/Button';
import PhoneInputField, { PhoneInputCountryOption } from '../common/PhoneInputField';
import type { Product } from '../../types/product';
import { trpc } from '../../utils/trpc';

interface ContactPriceModalLabels {
  contactPrice: string;
  contactPriceLabel: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  cancel: string;
  submit: string;
  requiredError: string;
  nameRequiredError: string;
  phoneRequiredError: string;
  invalidPhoneError: string;
  emailRequiredError: string;
  invalidEmailError: string;
  submitSuccess: string;
  submitError: string;
  sku: string;
  variants: string;
  category: string;
}

interface ContactPriceModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  labels?: Partial<ContactPriceModalLabels>;
}

const defaultLabels: ContactPriceModalLabels = {
  contactPrice: 'Contact Price',
  contactPriceLabel: 'Contact Price',
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  message: 'Message',
  cancel: 'Cancel',
  submit: 'Submit',
  requiredError: 'Please fill in all required fields',
  nameRequiredError: 'Please enter your name',
  phoneRequiredError: 'Please enter your phone number',
  invalidPhoneError: 'Please enter a valid phone number for the selected country',
  emailRequiredError: 'Please enter your email',
  invalidEmailError: 'Please enter a valid email address',
  submitSuccess: 'Your inquiry has been submitted successfully',
  submitError: 'An error occurred while submitting your inquiry',
  sku: 'SKU',
  variants: 'Variants',
  category: 'Category',
};

const ContactPriceModal: React.FC<ContactPriceModalProps> = ({
  product,
  isOpen,
  onClose,
  labels,
}) => {
  const mergedLabels = { ...defaultLabels, ...labels };
  const pathname = usePathname();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPhone, setContactPhone] = useState<string | undefined>(undefined);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>('VN');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const submitInquiry = trpc.inquiry.submit.useMutation();
  const contactCountriesQuery = trpc.clientAddressBook.getCountries.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 10 * 60 * 1000,
  });

  const displayName = useMemo(() => (product.name || '').replace(/\s+/g, ' ').trim(), [product.name]);
  const variantCountValue = Array.isArray(product.variants) ? product.variants.length : 0;
  const categoryNames = useMemo(() => {
    if (!Array.isArray(product.categories)) {
      return '';
    }
    return product.categories
      .map((category: any) => category?.name)
      .filter((value: string | undefined) => Boolean(value))
      .join(', ');
  }, [product.categories]);

  const primaryImage = useMemo(() => {
    const media = product.media ?? [];
    const primaryMedia = media.find((item) => item.isPrimary && item.url);
    if (primaryMedia?.url) {
      return primaryMedia.url;
    }
    const firstImage = media.find((item) => item.isImage && item.url);
    if (firstImage?.url) {
      return firstImage.url;
    }
    if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    return '/placeholder-product.png';
  }, [product.images, product.media]);

  const phoneCountryOptions = useMemo<PhoneInputCountryOption[]>(() => {
    const raw = contactCountriesQuery.data;
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((country: any) => {
        const code = country?.code ? String(country.code).toUpperCase() : '';
        const phoneCode = country?.phoneCode ? String(country.phoneCode) : null;
        if (!code) {
          return null;
        }
        return {
          code,
          name: country?.name || code,
          phoneCode,
        } as PhoneInputCountryOption;
      })
      .filter((option): option is PhoneInputCountryOption => option !== null && Boolean(option.code));
  }, [contactCountriesQuery.data]);

  const defaultPhoneCountry = useMemo(() => {
    if (!phoneCountryOptions.length) {
      return undefined;
    }
    const vietnam = phoneCountryOptions.find((option) => option.code === 'VN');
    return vietnam?.code ?? phoneCountryOptions[0]?.code;
  }, [phoneCountryOptions]);

  useEffect(() => {
    if (defaultPhoneCountry) {
      setSelectedPhoneCountry(defaultPhoneCountry);
    }
  }, [defaultPhoneCountry]);

  const resetForm = useCallback(() => {
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setContactPhone(undefined);
    setFieldErrors({});
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleInquirySubmit = useCallback(async () => {
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const nextErrors: { name?: string; phone?: string; email?: string } = {};

    if (!trimmedName) {
      nextErrors.name = mergedLabels.nameRequiredError;
    }
    if (!contactPhone) {
      nextErrors.phone = mergedLabels.phoneRequiredError;
    } else {
      try {
        const parsed = parsePhoneNumber(contactPhone);
        const isValid = parsed?.isValid?.() ?? false;
        const normalizedSelectedCountry = selectedPhoneCountry.toUpperCase();
        const phoneCountry = parsed?.country ? String(parsed.country).toUpperCase() : '';
        const countryMatches = !normalizedSelectedCountry || !phoneCountry || phoneCountry === normalizedSelectedCountry;

        if (!isValid || !countryMatches) {
          nextErrors.phone = mergedLabels.invalidPhoneError;
        }
      } catch {
        nextErrors.phone = mergedLabels.invalidPhoneError;
      }
    }
    if (!trimmedEmail) {
      nextErrors.email = mergedLabels.emailRequiredError;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        nextErrors.email = mergedLabels.invalidEmailError;
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0] || mergedLabels.requiredError;
      toast.error(firstError);
      return;
    }

    try {
      await submitInquiry.mutateAsync({
        name: trimmedName,
        email: trimmedEmail,
        phone: contactPhone,
        message: contactMessage,
        productId: product.id,
        url: typeof window !== 'undefined' ? window.location.href : pathname,
        subject: `Inquiry for ${displayName || product.id}`,
      });

      toast.success(mergedLabels.submitSuccess);
      onClose();
      resetForm();
    } catch (error: any) {
      const fieldViolations = error?.data?.errors?.[0]?.fieldViolations;
      const hasEmailViolation = Array.isArray(fieldViolations)
        && fieldViolations.some((violation: any) => violation?.field === 'email');
      if (hasEmailViolation) {
        setFieldErrors((prev) => ({ ...prev, email: mergedLabels.invalidEmailError }));
        toast.error(mergedLabels.invalidEmailError);
        return;
      }
      toast.error(error?.message || mergedLabels.submitError);
    }
  }, [
    contactEmail,
    contactMessage,
    contactName,
    contactPhone,
    displayName,
    mergedLabels.emailRequiredError,
    mergedLabels.invalidEmailError,
    mergedLabels.invalidPhoneError,
    mergedLabels.nameRequiredError,
    mergedLabels.phoneRequiredError,
    mergedLabels.requiredError,
    mergedLabels.submitError,
    mergedLabels.submitSuccess,
    onClose,
    pathname,
    product.id,
    resetForm,
    selectedPhoneCountry,
    submitInquiry,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      backdrop="blur"
      className="dark:bg-gray-900"
    >
      <ModalContent className="overflow-hidden">
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              {mergedLabels.contactPrice}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {displayName || product.id}
            </h2>
          </div>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-5 text-sm text-emerald-900 shadow-sm backdrop-blur dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14">
                  <Image
                    src={primaryImage}
                    alt={displayName || product.id}
                    className="h-full w-full rounded-xl object-cover"
                    removeWrapper
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/70 mb-0">
                    {mergedLabels.contactPriceLabel}
                  </p>
                  <p className="text-base font-semibold leading-tight">
                    {product.contactPriceLabel || mergedLabels.contactPrice}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 text-xs text-emerald-800/80 dark:text-emerald-100/80">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/40">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/70">
                    {mergedLabels.sku}
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    {product.sku || '-'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/40">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/70">
                      {mergedLabels.variants}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {variantCountValue}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/40">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/70">
                      {mergedLabels.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {categoryNames || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4">
                <label className="flex flex-col text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">{mergedLabels.name}</span>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    className="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                  />
                  {fieldErrors.name ? (
                    <span className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</span>
                  ) : null}
                </label>
                <PhoneInputField
                  id={`contact-phone-${product.id}`}
                  label={mergedLabels.phone}
                  value={contactPhone}
                  onChange={(value) => {
                    setContactPhone(value);
                    if (fieldErrors.phone) {
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  onCountryChange={setSelectedPhoneCountry}
                  countryOptions={phoneCountryOptions}
                  defaultCountry={defaultPhoneCountry}
                />
                {fieldErrors.phone ? (
                  <span className="-mt-2 text-xs text-red-600 dark:text-red-400">{fieldErrors.phone}</span>
                ) : null}
              </div>
              <label className="flex flex-col text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium">{mergedLabels.email}</span>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                />
                {fieldErrors.email ? (
                  <span className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</span>
                ) : null}
              </label>
              <label className="flex flex-col text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium">{mergedLabels.message}</span>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="mt-2 min-h-[120px] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="light"
                  className="rounded-full"
                  onPress={handleClose}
                >
                  {mergedLabels.cancel}
                </Button>
                <Button
                  className="rounded-full bg-gray-900 text-white hover:bg-gray-800"
                  onPress={handleInquirySubmit}
                  isLoading={submitInquiry.isPending}
                >
                  {mergedLabels.submit}
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ContactPriceModal;

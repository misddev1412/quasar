import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiImage, FiGlobe, FiMail, FiPhone, FiUser, FiMapPin } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { InputWithIcon } from '../common/InputWithIcon';
import { Checkbox } from '../common/Checkbox';
import { Card } from '../common/Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { TranslationTabs } from '../common/TranslationTabs';
import { MediaManager } from '../common/MediaManager';
import { trpc } from '../../utils/trpc';
import { Supplier, SupplierTranslation } from '../../types/product';

// Define response types based on backend schema
interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  data?: T;
  errors?: Array<{
    '@type': string;
    reason: string;
    domain: string;
    metadata?: Record<string, string>;
  }>;
  timestamp: string;
}

interface EditSupplierModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  supplier,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    contactPerson: '',
    isActive: true,
    sortOrder: 0,
  });

  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: {},
    vi: {},
  });
  const [initialTranslations, setInitialTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load supplier translations
  const { data: translationsData } = trpc.adminProductSuppliers.getSupplierTranslations.useQuery(
    { supplierId: supplier?.id },
    { enabled: !!supplier?.id }
  );

  // Initialize form data when supplier changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        description: supplier.description || '',
        website: supplier.website || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
        postalCode: supplier.postalCode || '',
        contactPerson: supplier.contactPerson || '',
        isActive: supplier.isActive,
        sortOrder: supplier.sortOrder || 0,
      });
      setSelectedLogo(supplier.logo || '');
    }
  }, [supplier]);

  // Initialize translations when data is loaded
  useEffect(() => {
    const response = translationsData as ApiResponse<SupplierTranslation[]>;
    const translations = response?.data || [];
    if (Array.isArray(translations)) {
      const translationsByLocale: Record<string, Record<string, string>> = {
        en: {},
        vi: {},
      };
      translations.forEach((translation: SupplierTranslation) => {
        if (translation.locale && translationsByLocale[translation.locale]) {
          translationsByLocale[translation.locale] = {
            name: translation.name || '',
            description: translation.description || '',
            address: translation.address || '',
            city: translation.city || '',
            country: translation.country || '',
            contactPerson: translation.contactPerson || '',
          };
        }
      });

      setTranslations(translationsByLocale);
      setInitialTranslations(JSON.parse(JSON.stringify(translationsByLocale)));
    }
  }, [translationsData]);

  const updateMutation = trpc.adminProductSuppliers.update.useMutation({
    onSuccess: async (result: any) => {
      if (!supplier?.id) return;

      // Handle translation updates
      for (const [locale, translationData] of Object.entries(translations)) {
        const initialData = initialTranslations[locale] || {};
        const hasChanges = Object.keys(translationData).some(
          key => translationData[key] !== initialData[key]
        );

        if (hasChanges) {
          const hasContent = Object.values(translationData).some(value => value.trim() !== '');

          if (hasContent) {
            try {
              // Check if translation exists
              const response = translationsData as ApiResponse<SupplierTranslation[]>;
              const existingTranslation = response?.data?.find(
                (t: SupplierTranslation) => t.locale === locale
              );

              if (existingTranslation) {
                // Update existing translation
                await updateTranslationMutation.mutateAsync({
                  supplierId: supplier.id,
                  locale,
                  ...translationData,
                });
              } else {
                // Create new translation
                await createTranslationMutation.mutateAsync({
                  supplierId: supplier.id,
                  locale,
                  ...translationData,
                });
              }
            } catch (error) {
              console.warn('Failed to update supplier translation:', error);
            }
          }
        }
      }

      addToast({
        title: t('suppliers.updateSuccess', 'Supplier updated successfully'),
        type: 'success',
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error',
      });
    },
  });

  const createTranslationMutation = trpc.adminProductSuppliers.createSupplierTranslation.useMutation();
  const updateTranslationMutation = trpc.adminProductSuppliers.updateSupplierTranslation.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier?.id) return;

    // Validation
    if (!formData.name.trim()) {
      addToast({
        title: t('common.error', 'Error'),
        description: t('suppliers.validation.nameRequired', 'Supplier name is required'),
        type: 'error',
      });
      return;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      addToast({
        title: t('common.error', 'Error'),
        description: t('suppliers.validation.invalidEmail', 'Please enter a valid email address'),
        type: 'error',
      });
      return;
    }

    updateMutation.mutate({
      id: supplier.id,
      ...formData,
      logo: selectedLogo || undefined,
      website: formData.website || undefined,
      description: formData.description || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      postalCode: formData.postalCode || undefined,
      contactPerson: formData.contactPerson || undefined,
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoSelect = (file: any) => {
    if (file && file.url) {
      setSelectedLogo(file.url);
      setIsMediaManagerOpen(false);
    }
  };

  const isLoading = updateMutation.isPending;

  if (!supplier) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        modalId="edit-supplier-modal"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between pr-8">
            <h2 className="text-xl font-semibold">
              {t('suppliers.edit', 'Edit Supplier')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.name', 'Name')} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('suppliers.namePlaceholder', 'e.g., ABC Trading Co., XYZ Suppliers')}
                required
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.contact_person', 'Contact Person')}
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.email', 'Email')}
              </label>
              <InputWithIcon
                type="email"
                leftIcon={<FiMail className="h-4 w-4" />}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@supplier.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.phone', 'Phone')}
              </label>
              <InputWithIcon
                leftIcon={<FiPhone className="h-4 w-4" />}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.website', 'Website')}
              </label>
              <InputWithIcon
                leftIcon={<FiGlobe className="h-4 w-4" />}
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://supplier.com"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.sort_order', 'Sort Order')}
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('suppliers.description', 'Description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('suppliers.descriptionPlaceholder', 'Enter supplier description (optional)')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
            />
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium flex items-center">
              <FiMapPin className="w-4 h-4 mr-2" />
              {t('suppliers.address', 'Address Information')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('suppliers.city', 'City')}
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('suppliers.country', 'Country')}
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="United States"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('suppliers.postal_code', 'Postal Code')}
                </label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('suppliers.address', 'Street Address')}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business Street, Suite 100"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <label className="text-sm font-medium">
              {t('suppliers.logo', 'Supplier Logo')}
            </label>
            <Card className="p-4">
              <div className="flex items-start space-x-4">
                {/* Logo Preview */}
                <div className="relative group">
                  {selectedLogo ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md transition-shadow">
                      <img
                        src={selectedLogo}
                        alt="Supplier logo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setSelectedLogo('')}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all transform hover:scale-110 shadow-sm"
                        title="Remove logo"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                         onClick={() => setIsMediaManagerOpen(true)}>
                      <FiImage className="w-6 h-6 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaManagerOpen(true)}
                  >
                    <FiImage className="h-4 w-4 mr-2" />
                    {selectedLogo ? t('suppliers.changeLogo', 'Change Logo') : t('suppliers.uploadLogo', 'Upload Logo')}
                  </Button>

                  {selectedLogo && (
                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      {t('suppliers.logoSelected', 'Logo selected')}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <p>{t('suppliers.logoRecommendation', 'Recommended: Square format (1:1 ratio)')}</p>
                    <p>{t('suppliers.logoSizeLimit', 'Max size: 10MB • PNG, JPG, SVG')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <label className="text-sm">{t('suppliers.isActive', 'Active')}</label>
          </div>

          {/* Translations */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-4">
                {t('suppliers.translations', 'Translations')}
              </h3>
              <TranslationTabs
                translations={translations}
                onTranslationsChange={setTranslations}
                entityName={formData.name || supplier.name}
                fields={[
                  {
                    name: 'name',
                    label: t('suppliers.name', 'Name'),
                    value: translations.en?.name || '',
                    onChange: () => {},
                    type: 'text',
                    placeholder: t('suppliers.namePlaceholder', 'e.g., ABC Trading Co., XYZ Suppliers'),
                  },
                  {
                    name: 'description',
                    label: t('suppliers.description', 'Description'),
                    value: translations.en?.description || '',
                    onChange: () => {},
                    type: 'textarea',
                    placeholder: t('suppliers.descriptionPlaceholder', 'Enter supplier description (optional)'),
                  },
                  {
                    name: 'address',
                    label: t('suppliers.address', 'Address'),
                    value: translations.en?.address || '',
                    onChange: () => {},
                    type: 'textarea',
                    placeholder: '123 Business Street, Suite 100',
                  },
                  {
                    name: 'city',
                    label: t('suppliers.city', 'City'),
                    value: translations.en?.city || '',
                    onChange: () => {},
                    type: 'text',
                    placeholder: 'New York',
                  },
                  {
                    name: 'country',
                    label: t('suppliers.country', 'Country'),
                    value: translations.en?.country || '',
                    onChange: () => {},
                    type: 'text',
                    placeholder: 'United States',
                  },
                  {
                    name: 'contactPerson',
                    label: t('suppliers.contact_person', 'Contact Person'),
                    value: translations.en?.contactPerson || '',
                    onChange: () => {},
                    type: 'text',
                    placeholder: 'John Doe',
                  },
                ]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                t('common.updating', 'Updating...')
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  {t('suppliers.edit', 'Update Supplier')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={handleLogoSelect}
        multiple={false}
        accept="image/*"
        title={t('suppliers.selectLogo', 'Select Supplier Logo')}
      />
    </>
  );
};
import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiImage, FiGlobe } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Checkbox } from '../common/Checkbox';
import { Card } from '../common/Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { TranslationTabs } from '../common/TranslationTabs';
import { MediaManager } from '../common/MediaManager';
import { trpc } from '../../utils/trpc';

interface EditBrandModalProps {
  isOpen: boolean;
  brand: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditBrandModal: React.FC<EditBrandModalProps> = ({
  isOpen,
  brand,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    isActive: true,
  });
  
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: {},
    vi: {},
  });
  const [initialTranslations, setInitialTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load brand translations
  const { data: translationsData } = trpc.adminProductBrands.getBrandTranslations.useQuery(
    { brandId: brand?.id },
    { enabled: !!brand?.id }
  );

  const updateMutation = trpc.adminProductBrands.update.useMutation({
    onSuccess: async () => {
      // Handle translation changes if the API supports it
      await handleTranslationChanges();
      
      addToast({
        title: t('brands.updateSuccess', 'Brand updated successfully'),
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

  const createTranslationMutation = trpc.adminProductBrands.createBrandTranslation.useMutation();
  const updateTranslationMutation = trpc.adminProductBrands.updateBrandTranslation.useMutation();
  const deleteTranslationMutation = trpc.adminProductBrands.deleteBrandTranslation.useMutation();

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        website: brand.website || '',
        isActive: brand.isActive ?? true,
      });
      setSelectedLogo(brand.logo || '');
    }
  }, [brand]);

  useEffect(() => {
    const translations = (translationsData as any)?.data || [];
    if (Array.isArray(translations)) {
      const translationsByLocale: Record<string, Record<string, string>> = {
        en: {},
        vi: {},
      };
      
      translations.forEach((translation: any) => {
        translationsByLocale[translation.locale] = {
          name: translation.name || '',
          description: translation.description || '',
        };
      });
      
      setTranslations(translationsByLocale);
      setInitialTranslations(JSON.parse(JSON.stringify(translationsByLocale)));
    }
  }, [translationsData]);

  const handleTranslationChanges = async () => {
    try {
      for (const [locale, translationData] of Object.entries(translations)) {
        const initialTranslation = initialTranslations[locale];
        const currentTranslation = translationData;

        // Check if translation exists and has content
        const hasInitialTranslation = initialTranslation && (initialTranslation.name || initialTranslation.description);
        const hasCurrentTranslation = currentTranslation && (currentTranslation.name || currentTranslation.description);

        if (!hasInitialTranslation && hasCurrentTranslation) {
          // Create new translation
          try {
            await createTranslationMutation.mutateAsync({
              brandId: brand.id,
              locale,
              name: currentTranslation.name,
              description: currentTranslation.description,
            });
          } catch (error) {
            console.warn('Failed to create brand translation:', error);
          }
        } else if (hasInitialTranslation && hasCurrentTranslation) {
          // Update existing translation if changed
          if (initialTranslation.name !== currentTranslation.name || 
              initialTranslation.description !== currentTranslation.description) {
            try {
              await updateTranslationMutation.mutateAsync({
                brandId: brand.id,
                locale,
                name: currentTranslation.name,
                description: currentTranslation.description,
              });
            } catch (error) {
              console.warn('Failed to update brand translation:', error);
            }
          }
        } else if (hasInitialTranslation && !hasCurrentTranslation) {
          // Delete translation if it was removed
          try {
            await deleteTranslationMutation.mutateAsync({
              brandId: brand.id,
              locale,
            });
          } catch (error) {
            console.warn('Failed to delete brand translation:', error);
          }
        }
      }
    } catch (error) {
      console.warn('Error handling translation changes:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      addToast({
        title: t('common.error', 'Error'),
        description: t('brands.validation.nameRequired', 'Brand name is required'),
        type: 'error',
      });
      return;
    }

    updateMutation.mutate({
      id: brand.id,
      ...formData,
      logo: selectedLogo || undefined,
      website: formData.website || undefined,
      description: formData.description || undefined,
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        modalId="edit-brand-modal"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between pr-8">
            <h2 className="text-xl font-semibold">
              {t('brands.edit', 'Edit Brand')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('brands.name', 'Name')} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('brands.namePlaceholder', 'e.g., Apple, Nike, Samsung')}
                required
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('brands.website', 'Website')}
              </label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('brands.description', 'Description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('brands.descriptionPlaceholder', 'Enter brand description (optional)')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
            />
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <label className="text-sm font-medium">
              {t('brands.logo', 'Brand Logo')}
            </label>
            <Card className="p-4">
              <div className="flex items-start space-x-4">
                {/* Logo Preview */}
                <div className="relative group">
                  {selectedLogo ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md transition-shadow">
                      <img
                        src={selectedLogo}
                        alt="Brand logo"
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
                    {selectedLogo ? t('brands.changeLogo', 'Change Logo') : t('brands.uploadLogo', 'Upload Logo')}
                  </Button>
                  
                  {selectedLogo && (
                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      {t('brands.logoSelected', 'Logo selected')}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <p>{t('brands.logoRecommendation', 'Recommended: Square format (1:1 ratio)')}</p>
                    <p>{t('brands.logoSizeLimit', 'Max size: 10MB • PNG, JPG, SVG')}</p>
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
            <label className="text-sm">{t('brands.isActive', 'Active')}</label>
          </div>

          {/* Translations */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-4">
                {t('brands.translations', 'Translations')}
              </h3>
              <TranslationTabs
                translations={translations}
                onTranslationsChange={setTranslations}
                entityName={formData.name || t('brands.edit', 'Edit Brand')}
                fields={[
                  {
                    name: 'name',
                    label: t('brands.name', 'Name'),
                    value: translations.en?.name || '',
                    onChange: () => {},
                    type: 'text',
                    placeholder: t('brands.namePlaceholder', 'e.g., Apple, Nike, Samsung'),
                  },
                  {
                    name: 'description',
                    label: t('brands.description', 'Description'),
                    value: translations.en?.description || '',
                    onChange: () => {},
                    type: 'textarea',
                    placeholder: t('brands.descriptionPlaceholder', 'Enter brand description (optional)'),
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
                  {t('brands.update', 'Update Brand')}
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
        title={t('brands.selectLogo', 'Select Brand Logo')}
      />
    </>
  );
};
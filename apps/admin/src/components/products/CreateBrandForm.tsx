import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave, FiX, FiImage, FiGlobe } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateBrandFormData } from '../../types/product';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import { InputWithIcon } from '../common/InputWithIcon';
import { MediaManager } from '../common/MediaManager';

const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

interface CreateBrandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateBrandForm: React.FC<CreateBrandFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = React.useState(false);
  const [selectedLogo, setSelectedLogo] = React.useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(createBrandSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      logo: selectedLogo,
      website: '',
      isActive: true,
    },
  });

  const createMutation = trpc.adminProductBrands.create.useMutation({
    onSuccess: () => {
      addToast({ 
        title: t('brands.createSuccess', 'Brand created successfully'), 
        type: 'success' 
      });
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      addToast({ 
        title: t('common.error', 'Error'), 
        description: error.message, 
        type: 'error' 
      });
    },
  });

  const onSubmit = (data: CreateBrandFormData) => {
    createMutation.mutate({
      ...data,
      logo: selectedLogo || undefined,
      website: data.website || undefined,
      description: data.description || undefined,
    });
  };

  const handleLogoSelect = (file: any) => {
    if (file && file.url) {
      setSelectedLogo(file.url);
      setIsMediaManagerOpen(false);
    }
  };

  return (<>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Brand Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('brands.name', 'Brand Name')} *
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="name"
              autoFocus
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('form.placeholders.enter_brand_name', 'Enter brand name')}
            />
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('brands.description', 'Description')}
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="description"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('form.placeholders.enter_description', 'Enter description (optional)')}
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Logo and Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('brands.logo', 'Brand Logo')}
          </label>
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
              <button
                type="button"
                onClick={() => setIsMediaManagerOpen(true)}
                className="inline-flex items-center px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow"
              >
                <FiImage className="w-4 h-4 mr-2" />
                {selectedLogo ? 'Change Logo' : 'Upload Logo'}
              </button>
              
              {selectedLogo && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                  Logo selected
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                <p>Recommended: Square format (1:1 ratio)</p>
                <p>Max size: 10MB • PNG, JPG, SVG</p>
              </div>
            </div>
          </div>
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('brands.website', 'Website')}
          </label>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <InputWithIcon
                {...field}
                type="url"
                id="website"
                placeholder="https://example.com"
                leftIcon={<FiGlobe className="h-5 w-5" />}
                iconSpacing="standard"
                className={errors.website ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
            )}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.website.message}
            </p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <Toggle
                checked={field.value}
                onChange={field.onChange}
                id="isActive"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('brands.isActive', 'Active')}
              </label>
            </div>
          )}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>{t('common.cancel', 'Cancel')}</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || createMutation.isPending}
          className="flex items-center space-x-2"
        >
          <FiSave className="w-4 h-4" />
          <span>
            {isSubmitting || createMutation.isPending
              ? t('common.saving', 'Saving...')
              : t('common.save', 'Save')
            }
          </span>
        </Button>
      </div>
    </form>

    <MediaManager
      isOpen={isMediaManagerOpen}
      onClose={() => setIsMediaManagerOpen(false)}
      onSelect={handleLogoSelect}
      multiple={false}
      accept="image/*"
      title="Select Brand Logo"
    />
  </>
  );
};
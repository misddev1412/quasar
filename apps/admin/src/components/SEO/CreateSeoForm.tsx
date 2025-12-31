import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSeoDto } from '@backend/modules/seo/dto/seo.dto';
import { useSeoManager } from '../../hooks/useSeoManager';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { Toggle } from '../common/Toggle';
import { MediaManager } from '../common/MediaManager';
import { useState } from 'react';
import { OG_META_FIELDS } from './ogMetaFields';
import { Button } from '../common/Button';
import { FiImage } from 'react-icons/fi';
import { ImageActionButtons } from '../common/ImageActionButtons';

interface CreateSeoFormProps {
  onClose: () => void;
}

export const CreateSeoForm: React.FC<CreateSeoFormProps> = ({ onClose }) => {
  const { createSeo, isCreating } = useSeoManager();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [ogMetaFields, setOgMetaFields] = useState<Record<string, string>>({});
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSeoDto>({
    resolver: zodResolver(CreateSeoDto),
    defaultValues: {
      title: '',
      description: '',
      keywords: '',
      path: '',
      group: 'general',
      active: true,
      image: '',
    },
  });

  const handleOgFieldChange = (metaKey: string, value: string) => {
    setOgMetaFields(prev => {
      const next = { ...prev };
      if (!value.trim()) {
        delete next[metaKey];
      } else {
        next[metaKey] = value;
      }
      return next;
    });
  };

  const onSubmit: SubmitHandler<CreateSeoDto> = async (data) => {
    try {
      const finalData = {
        ...data,
        additionalMetaTags: ogMetaFields,
      };
      await createSeo(finalData);
      addToast({
        type: 'success',
        title: t('seo.create_success_title', '创建成功'),
        description: t('seo.create_success_desc', '新的SEO规则已添加。'),
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to create SEO rule:', error);
      addToast({
        type: 'error',
        title: t('seo.create_failed_title', '创建失败'),
        description: error.message || t('seo.create_failed_desc', '无法创建SEO规则，请检查您的输入。'),
      });
    }
  };

  const formFields: (keyof CreateSeoDto)[] = [
    'title',
    'path',
    'description',
    'keywords',
    'group',
    'image',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formFields.map((fieldName) => (
        <div key={fieldName}>
          <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
            {t(`seo.fields.${fieldName}`, fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
          </label>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) =>
              fieldName === 'image' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`flex h-24 w-24 items-center justify-center rounded-xl border-2 ${
                          field.value ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50'
                        } overflow-hidden`}
                      >
                        {field.value ? (
                          <img src={field.value as string} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 text-xs">
                            <FiImage className="h-6 w-6 mb-1" />
                            <span>{t('common.no_image', 'No image')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ImageActionButtons
                      className="flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                      hasImage={Boolean(field.value)}
                      selectLabel={t('common.select_image', 'Select Image')}
                      changeLabel={t('common.change_image', 'Change Image')}
                      removeLabel={t('common.remove', 'Remove')}
                      onSelect={() => setIsMediaManagerOpen(true)}
                      onRemove={() => field.onChange('')}
                    />
                  </div>
                  <input type="hidden" {...field} value={field.value as string || ''} />
                </div>
              ) : (
                <input
                  {...field}
                  id={fieldName}
                  type="text"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={field.value as string}
                />
              )
            }
          />
          {errors[fieldName] && (
            <p className="mt-1 text-sm text-red-600">{errors[fieldName]?.message as string}</p>
          )}
        </div>
      ))}

      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-gray-900">
            {t('seo.sections.open_graph', 'Open Graph Tags')}
          </h3>
          <p className="text-xs text-gray-500">
            {t(
              'seo.placeholders.og_hint',
              'Control how links preview when shared to social platforms.',
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {OG_META_FIELDS.map(({ metaKey, labelKey, fallbackLabel }) => (
            <div key={metaKey}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(`seo.fields.${labelKey}`, fallbackLabel)}
              </label>
              <input
                type="text"
                value={ogMetaFields[metaKey] || ''}
                onChange={(event) => handleOgFieldChange(metaKey, event.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={
                  metaKey === 'og:type'
                    ? t('seo.placeholders.og_type', 'e.g. website, article')
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-1">
          {t('seo.fields.active', 'Active')}
        </label>
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          disabled={isCreating}
        >
          {t('common.cancel', '取消')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          disabled={isCreating}
        >
          {isCreating ? t('common.creating', '创建中...') : t('common.create', '创建')}
        </button>
      </div>
      {(isMediaManagerOpen as boolean) && (
        <MediaManager
          isOpen={isMediaManagerOpen}
          onClose={() => setIsMediaManagerOpen(false)}
          onSelect={(files) => {
            const file = Array.isArray(files) ? files[0] : files;
            if (file) {
              setValue('image', file.url);
              setIsMediaManagerOpen(false);
            }
          }}
        />
      )}
    </form>
  );
}; 

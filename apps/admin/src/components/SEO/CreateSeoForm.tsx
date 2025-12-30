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

interface CreateSeoFormProps {
  onClose: () => void;
}

export const CreateSeoForm: React.FC<CreateSeoFormProps> = ({ onClose }) => {
  const { createSeo, isCreating } = useSeoManager();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
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
      additionalMetaTags: {},
      image: '',
    },
  });

  const onSubmit: SubmitHandler<CreateSeoDto> = async (data) => {
    try {
      // The additionalMetaTags from textarea is a string, so we need to parse it
      const finalData = {
        ...data,
        additionalMetaTags: data.additionalMetaTags ? JSON.parse(data.additionalMetaTags as any) : {},
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
    'additionalMetaTags',
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
              fieldName === 'additionalMetaTags' ? (
                <textarea
                  {...field}
                  id={fieldName}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t('seo.placeholders.json_format', '请输入JSON格式的字符串')}
                  // Since we expect a string, but the type is Record, we need to stringify it.
                  value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value?.toString() ?? ''}
                />
              ) : fieldName === 'image' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {field.value && (
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                        <img src={field.value as string} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsMediaManagerOpen(true)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      {field.value ? t('common.change_image', 'Change Image') : t('common.select_image', 'Select Image')}
                    </button>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t('common.remove', 'Remove')}
                      </button>
                    )}
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
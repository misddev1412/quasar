import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { SectionHeader } from '../common/SectionHeader';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { 
  PERMISSION_RESOURCES, 
  PERMISSION_ACTIONS, 
  PERMISSION_SCOPES,
  CreatePermissionFormData
} from '../../types/permission';

const createPermissionSchema = z.object({
  name: z.string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(100, 'Permission name cannot exceed 100 characters'),
  resource: z.string()
    .min(1, 'Resource is required'),
  action: z.string()
    .min(1, 'Action is required'),
  scope: z.string()
    .min(1, 'Scope is required'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
});

interface CreatePermissionFormProps {
  onSubmit: (data: CreatePermissionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreatePermissionForm: React.FC<CreatePermissionFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslationWithBackend();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema) as any,
    defaultValues: {
      isActive: true,
    },
  });

  const watchedResource = watch('resource');
  const watchedAction = watch('action');
  const watchedScope = watch('scope');

  // Auto-generate permission name based on resource, action, and scope
  React.useEffect(() => {
    if (watchedResource && watchedAction && watchedScope) {
      const generatedName = `${watchedAction}_${watchedResource}_${watchedScope}`;
      setValue('name', generatedName);
    }
  }, [watchedResource, watchedAction, watchedScope, setValue]);

  const resourceOptions = Object.entries(PERMISSION_RESOURCES).map(([key, value]) => ({
    value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
  }));

  const actionOptions = Object.entries(PERMISSION_ACTIONS).map(([key, value]) => ({
    value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
  }));

  const scopeOptions = Object.entries(PERMISSION_SCOPES).map(([key, value]) => ({
    value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <SectionHeader
          icon={<Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
          title={t('form.sections.basic_information', 'Basic Information')}
          description={t('permissions.permission_information_description', 'Define the permission details and access level')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="resource"
            control={control}
            render={({ field }) => (
              <Select
                label={t('permission.resource', 'Resource')}
                placeholder={t('form.placeholders.select_resource', 'Select resource')}
                options={resourceOptions}
                error={errors.resource?.message}
                required
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="action"
            control={control}
            render={({ field }) => (
              <Select
                label={t('permission.action', 'Action')}
                placeholder={t('form.placeholders.select_action', 'Select action')}
                options={actionOptions}
                error={errors.action?.message}
                required
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="scope"
            control={control}
            render={({ field }) => (
              <Select
                label={t('permission.scope', 'Scope')}
                placeholder={t('form.placeholders.select_scope', 'Select scope')}
                options={scopeOptions}
                error={errors.scope?.message}
                required
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <FormInput
          {...register('name')}
          id="name"
          type="text"
          label={t('permission.name', 'Permission Name')}
          placeholder={t('form.placeholders.enter_permission_name', 'Permission name (auto-generated)')}
          error={errors.name?.message}
          required
          description={t('form.descriptions.permission_name', 'Unique identifier for this permission')}
        />

        <FormInput
          {...register('description')}
          id="description"
          type="text"
          label={t('permission.description', 'Description')}
          placeholder={t('form.placeholders.enter_permission_description', 'Enter permission description (optional)')}
          error={errors.description?.message}
          multiline
          rows={3}
          description={t('form.descriptions.permission_description', 'Brief description of what this permission allows')}
        />
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <SectionHeader
          icon={<Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
          title={t('form.sections.settings', 'Settings')}
          description={t('form.descriptions.permission_settings', 'Configure permission status and availability')}
        />
        
        <div className="flex items-start space-x-3">
          <Checkbox
            {...register('isActive')}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('permission.is_active', 'Active')}
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('form.descriptions.permission_is_active', 'Whether this permission is active and can be used')}
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('permissions.create_permission', 'Create Permission')}
        </Button>
      </div>
    </form>
  );
};
import React, { useMemo, useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateRoleFormData, updateRoleSchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { PermissionCheckboxGrid } from './PermissionCheckboxGrid';
import { SectionHeader } from '../common/SectionHeader';
import Tabs from '../common/Tabs';

interface UpdateRoleFormProps {
  onSubmit: (data: UpdateRoleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialValues?: Partial<UpdateRoleFormData>;
  isDefaultRole?: boolean;
  // Optional external tab control (for URL persistence)
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const UpdateRoleForm: React.FC<UpdateRoleFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialValues = {},
  isDefaultRole = false,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  
  // Use external tab control if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const handleTabChange = externalOnTabChange || setInternalActiveTab;

  // Form state management
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      isActive: true,
      isDefault: false,
      permissionIds: '',
      ...initialValues,
    },
  });

  // Reset form with initial values when they change
  useEffect(() => {
    if (initialValues) {
      reset({
        isActive: true,
        isDefault: false,
        permissionIds: '',
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  // Watch permission IDs to convert between string and array formats
  const permissionIdsString = watch('permissionIds');
  
  // Convert string to array for the grid component
  const selectedPermissionIds = useMemo(() => {
    if (!permissionIdsString) return [];
    return permissionIdsString.split(',').map(id => id.trim()).filter(Boolean);
  }, [permissionIdsString]);

  // Handle permission changes from the grid
  const handlePermissionChange = (permissionIds: string[]) => {
    setValue('permissionIds', permissionIds.join(','));
  };

  const handleFormSubmit = (data: UpdateRoleFormData) => {
    onSubmit(data);
  };

  // Define tabs for the standardized Tabs component
  const tabs = [
    {
      label: t('form.tabs.general_information', 'General Information'),
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
              title={t('form.sections.basic_information', 'Basic Information')}
              description={t('form.sections.role_basic_information_description')}
            />
            
            <FormInput
              {...register('name')}
              id="name"
              type="text"
              label={t('role.name')}
              placeholder={t('form.placeholders.enter_role_name', 'Enter role name')}
              error={errors.name?.message}
              required
              description={t('form.descriptions.role_name_requirements', 'Role name can contain letters, numbers, spaces, hyphens, and underscores')}
            />

            <FormInput
              {...register('description')}
              id="description"
              type="text"
              label={t('role.description')}
              placeholder={t('form.placeholders.enter_role_description', 'Enter role description (optional)')}
              error={errors.description?.message}
              multiline
              rows={3}
              description={t('form.descriptions.role_description', 'Brief description of the role and its purpose')}
            />
          </div>

          {/* Role Settings */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
              title={t('form.sections.role_settings')}
              description={t('form.sections.role_settings_description')}
            />
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-9 h-5 cursor-pointer" 
                     style={{ backgroundColor: watch('isActive') ? '#2563eb' : '#d1d5db' }}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={watch('isActive') || false}
                    onClick={() => setValue('isActive', !watch('isActive'))}
                    className="w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">{t('role.is_active')}</span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out w-3.5 h-3.5 top-[2px] left-[2px]"
                      style={{
                        transform: watch('isActive') ? 'translate(18px, 0)' : 'translate(2px, 0)'
                      }}
                    />
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('role.is_active')}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('form.descriptions.role_is_active', 'Whether this role is active and can be assigned to users')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-9 h-5 ${
                  isDefaultRole ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`} style={{ backgroundColor: watch('isDefault') ? '#2563eb' : '#d1d5db' }}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={watch('isDefault') || false}
                    onClick={() => !isDefaultRole && setValue('isDefault', !watch('isDefault'))}
                    disabled={isDefaultRole}
                    className="w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">{t('role.is_default')}</span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out w-3.5 h-3.5 top-[2px] left-[2px]"
                      style={{
                        transform: watch('isDefault') ? 'translate(18px, 0)' : 'translate(2px, 0)'
                      }}
                    />
                  </button>
                </div>
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${isDefaultRole ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {t('role.is_default')}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isDefaultRole 
                      ? t('form.descriptions.role_is_default_locked', 'Default role status cannot be changed for existing default roles')
                      : t('form.descriptions.role_is_default', 'Whether this role is assigned to new users by default')
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: t('form.tabs.permissions'),
      icon: <Lock className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <SectionHeader
            icon={<Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
            title={t('form.sections.role_permissions')}
            description={t('form.sections.role_permissions_description')}
            className="mb-4"
          />
          
          <PermissionCheckboxGrid
            selectedPermissionIds={selectedPermissionIds}
            onPermissionChange={handlePermissionChange}
            disabled={isSubmitting}
          />

          {/* Hidden field to store selected permission IDs */}
          <input
            {...register('permissionIds')}
            type="hidden"
          />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Use the standardized Tabs component with URL persistence */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('common.update')}
        </Button>
      </div>
    </form>
  );
};

export default UpdateRoleForm;

import React, { useState, useMemo } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRoleFormData, createRoleSchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { PermissionCheckboxGrid } from './PermissionCheckboxGrid';
import { SectionHeader } from '../common/SectionHeader';
import Tabs from '../common/Tabs';

interface CreateRoleFormProps {
  onSubmit: (data: CreateRoleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  // Optional external tab control (for URL persistence)
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
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
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      isActive: true,
      isDefault: false,
      permissionIds: '',
    },
  });

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

  const handleFormSubmit = (data: CreateRoleFormData) => {
    onSubmit(data);
  };

  // Define tabs for the standardized Tabs component
  const tabs = [
    {
      label: t('form.tabs.general_information'),
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
              title={t('form.sections.basic_information')}
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
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
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
                <input
                  {...register('isDefault')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('role.is_default')}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('form.descriptions.role_is_default', 'Whether this role is assigned to new users by default')}
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
          {t('roles.create_role')}
        </Button>
      </div>
    </form>
  );
};

export default CreateRoleForm;

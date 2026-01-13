import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreatePermissionForm } from '../../components/permission/CreatePermissionForm';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreatePermissionFormData } from '../../types/permission';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

const PermissionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // TODO: Replace with actual permission creation endpoint when available
  // For now, we'll use a mock implementation
  const createPermissionMutation = {
    mutateAsync: async (data: CreatePermissionFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    isPending: false,
  };

  const handleSubmit = async (formData: CreatePermissionFormData) => {
    try {
      // Transform form data to match API expectations
      const permissionData = {
        name: formData.name,
        resource: formData.resource,
        action: formData.action,
        scope: formData.scope,
        description: formData.description || undefined,
        isActive: formData.isActive ?? true,
      };

      await createPermissionMutation.mutateAsync(permissionData);
      
      addToast({
        type: 'success',
        title: t('messages.permission_created_successfully', 'Permission Created'),
        description: t('messages.permission_created_successfully_description', 'The permission has been created successfully'),
      });
      
      navigate('/permissions');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('messages.failed_to_create_permission', 'Failed to Create Permission'),
        description: error.message || t('messages.create_permission_error_description', 'An error occurred while creating the permission'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/permissions');
  };

  return (
    <CreatePageTemplate
      title={t('permissions.create_new_permission', 'Create New Permission')}
      description={t('permissions.create_permission_description', 'Define a new system permission for access control')}
      icon={<Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.permission', 'Permission')}
      entityNamePlural={t('common.permissions', 'Permissions')}
      backUrl="/permissions"
      onBack={handleCancel}
      isSubmitting={createPermissionMutation.isPending}
      maxWidth="full"
    >
      <CreatePermissionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createPermissionMutation.isPending}
      />
    </CreatePageTemplate>
  );
};

export default PermissionCreatePage;

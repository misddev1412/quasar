import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateRoleForm } from '../../components/role/CreateRoleForm';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateRoleFormData } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';

const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'permissions'] // Maps to CreateRoleForm tab IDs
  });

  // tRPC mutation for creating role
  const createRoleMutation = trpc.adminRole.createRole.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('messages.role_created_successfully'),
        description: t('messages.role_created_successfully_description'),
      });
      navigate('/roles');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('messages.failed_to_create_role'),
        description: error.message || t('messages.create_role_error_description'),
      });
    },
  });

  const handleSubmit = async (formData: CreateRoleFormData) => {
    try {
      // Transform form data to match API expectations
      const roleData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        permissionIds: formData.permissionIds ?
          formData.permissionIds.split(',').map(id => id.trim()).filter(Boolean) :
          undefined,
      };

      await createRoleMutation.mutateAsync(roleData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Role creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  return (
    <CreatePageTemplate
      title={t('admin.create_new_role', 'Create New Role')}
      description={t('admin.create_role_description', 'Define a new user role with specific permissions')}
      icon={<Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.role', 'Role')}
      entityNamePlural={t('common.roles', 'Roles')}
      backUrl="/roles"
      onBack={handleCancel}
      isSubmitting={createRoleMutation.isPending}
      maxWidth="full"
    >
      <CreateRoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createRoleMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default RoleCreatePage;

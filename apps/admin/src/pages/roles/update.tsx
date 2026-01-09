import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Trash2, Home } from 'lucide-react';
import { UpdatePageTemplate } from '../../components/common/CreatePageTemplate';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { UpdateRoleForm } from '../../components/role/UpdateRoleForm';
import { UpdateRoleFormData } from '../../utils/validation';

const RoleUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const trpcContext = trpc.useContext();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'permissions'] // Maps to UpdateRoleForm tab IDs
  });

  const {
    data: roleResponse,
    isLoading,
    error,
  } = trpc.adminRole.getRoleById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const updateRoleMutation = trpc.adminRole.updateRole.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('common.success'),
        description: t('messages.role_updated_successfully', 'Role updated successfully'),
      });
      
      // Invalidate and refetch
      trpcContext.adminRole.getAllRoles.invalidate();
      trpcContext.adminRole.getRoleById.invalidate({ id: id as string });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: err.message || t('messages.operation_failed'),
      });
    },
  });

  const deleteRoleMutation = trpc.adminRole.deleteRole.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('common.success'),
        description: t('messages.role_deleted_successfully', 'Role deleted successfully'),
      });
      
      // Invalidate and refetch
      trpcContext.adminRole.getAllRoles.invalidate();
      
      // Navigate back to roles list
      navigate('/roles');
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: err.message || t('messages.operation_failed'),
      });
    },
  });

  const handleSubmit = async (formData: UpdateRoleFormData) => {
    if (!id) return;

    try {
      // Transform form data to match API expectations
      const roleData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        permissionIds: formData.permissionIds ?
          formData.permissionIds.split(',').map(id => id.trim()).filter(Boolean) :
          undefined,
      };

      await updateRoleMutation.mutateAsync({
        id,
        data: roleData,
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to update role:', error);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  const handleDelete = async () => {
    if (!id || !(roleResponse as any)?.data) return;
    
    // TODO: Add confirmation dialog
    const confirmed = window.confirm(
      t('messages.confirm_delete_role', 'Are you sure you want to delete this role? This action cannot be undone.')
    );
    
    if (confirmed) {
      try {
        await deleteRoleMutation.mutateAsync({ id });
      } catch (error) {
        // Error is handled by the mutation's onError callback
        console.error('Failed to delete role:', error);
      }
    }
  };

  // Prepare initial values from the role data
  const initialValues: Partial<UpdateRoleFormData> = useMemo(() => {
    if (!(roleResponse as any)?.data) return {};

    const role = (roleResponse as any).data;
    return {
      name: role.name,
      code: role.code,
      description: role.description || '',
      isActive: role.isActive,
      isDefault: role.isDefault,
      permissionIds: role.permissions?.map((p: any) => p.id).join(',') || '',
    };
  }, [roleResponse]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('common.dashboard', 'Home'),
      href: '/',
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: t('common.roles', 'Roles'),
      href: '/roles',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: t('roles.edit_role', 'Edit Role'),
      icon: <Shield className="w-4 h-4" />,
    },
  ]), [t]);

  const customActions = useMemo(() => {
    const actions = [];

    // Add delete action if role is not default
    if ((roleResponse as any)?.data && !(roleResponse as any).data.isDefault) {
      actions.push({
        label: t('common.delete', 'Delete'),
        onClick: handleDelete,
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'outline' as const,
      });
    }

    return actions;
  }, [roleResponse, t, handleDelete]);

  return (
    <UpdatePageTemplate
      title={t('roles.edit_role', 'Edit Role')}
      description={t('roles.edit_role_description', 'Update role information and permissions')}
      icon={<Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.role', 'Role')}
      entityNamePlural={t('common.roles', 'Roles')}
      backUrl="/roles"
      onBack={handleCancel}
      isSubmitting={updateRoleMutation.isPending}
      maxWidth="full"
      mode="update"
      isLoading={isLoading}
      error={error}
      entityData={(roleResponse as any)?.data}
      customActions={customActions}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <UpdateRoleForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateRoleMutation.isPending}
        isDefaultRole={(roleResponse as any)?.data?.isDefault}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      </div>
    </UpdatePageTemplate>
  );
};

export default RoleUpdatePage;

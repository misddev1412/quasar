import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, Shield, Settings, Trash2, Home } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { z } from 'zod';
import { 
  UpdatePermissionFormData, 
  PERMISSION_RESOURCES, 
  PERMISSION_ACTIONS, 
  PERMISSION_SCOPES 
} from '../../types/permission';

const updatePermissionSchema = z.object({
  name: z.string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(100, 'Permission name cannot exceed 100 characters')
    .optional(),
  resource: z.string()
    .min(1, 'Resource is required')
    .optional(),
  action: z.string()
    .min(1, 'Action is required')
    .optional(),
  scope: z.string()
    .min(1, 'Scope is required')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
});

const PermissionUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'settings'] // Maps to tab IDs
  });

  // TODO: Replace with actual permission API endpoints when available
  // Mock permission data for now
  const mockPermissionData = {
    data: {
      id: id || '1',
      name: 'read_user_global',
      resource: 'user',
      action: 'read',
      scope: 'global',
      description: 'Permission to read all user data globally',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  const {
    data: permissionResponse = mockPermissionData,
    isLoading = false,
    error = null,
  } = { data: mockPermissionData, isLoading: false, error: null };

  // Mock mutations
  const updatePermissionMutation = {
    mutateAsync: async (data: { id: string; data: UpdatePermissionFormData }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    isPending: false,
  };

  const deletePermissionMutation = {
    mutateAsync: async (data: { id: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    isPending: false,
  };

  const handleSubmit = async (formData: UpdatePermissionFormData) => {
    if (!id) return;

    try {
      // Transform form data to match API expectations
      const permissionData = {
        name: formData.name,
        resource: formData.resource,
        action: formData.action,
        scope: formData.scope,
        description: formData.description,
        isActive: formData.isActive,
      };

      await updatePermissionMutation.mutateAsync({
        id,
        data: permissionData,
      });

      addToast({
        type: 'success',
        title: t('common.success'),
        description: t('messages.permission_updated_successfully', 'Permission updated successfully'),
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: error.message || t('messages.operation_failed'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/permissions');
  };

  const handleDelete = async () => {
    if (!id || !permissionResponse?.data) return;
    
    // TODO: Add confirmation dialog
    const confirmed = window.confirm(
      t('messages.confirm_delete_permission', 'Are you sure you want to delete this permission? This action cannot be undone.')
    );
    
    if (confirmed) {
      try {
        await deletePermissionMutation.mutateAsync({ id });
        
        addToast({
          type: 'success',
          title: t('common.success'),
          description: t('messages.permission_deleted_successfully', 'Permission deleted successfully'),
        });
        
        navigate('/permissions');
      } catch (error: any) {
        addToast({
          type: 'error',
          title: t('common.error'),
          description: error.message || t('messages.operation_failed'),
        });
      }
    }
  };

  // Generate dropdown options
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

  // Prepare initial values from the permission data
  const initialValues: Partial<UpdatePermissionFormData> = useMemo(() => {
    if (!permissionResponse?.data) return {};

    const permission = permissionResponse.data;
    return {
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      description: permission.description || '',
      isActive: permission.isActive,
    };
  }, [permissionResponse]);

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information'),
      icon: <Lock className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information'),
          description: t('form.sections.permission_basic_information_description', 'Define the basic permission information'),
          icon: <Lock className="w-4 h-4" />,
          fields: [
            {
              name: 'name',
              label: t('permission.name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_permission_name', 'Enter permission name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-_]+$/,
              },
              description: t('form.descriptions.permission_name_requirements', 'Permission name can contain letters, numbers, spaces, hyphens, and underscores'),
            },
            {
              name: 'description',
              label: t('permission.description'),
              type: 'textarea',
              placeholder: t('form.placeholders.enter_permission_description', 'Enter permission description (optional)'),
              required: false,
              validation: {
                maxLength: 500,
              },
              description: t('form.descriptions.permission_description', 'Brief description of what this permission allows'),
            },
          ],
        },
        {
          title: t('form.sections.permission_details'),
          description: t('form.sections.permission_details_description', 'Configure permission resource, action, and scope'),
          icon: <Shield className="w-4 h-4" />,
          fields: [
            {
              name: 'resource',
              label: t('permission.resource'),
              type: 'select',
              placeholder: t('form.placeholders.select_resource', 'Select resource'),
              required: true,
              options: resourceOptions,
              description: t('form.descriptions.permission_resource', 'The resource this permission applies to'),
            },
            {
              name: 'action',
              label: t('permission.action'),
              type: 'select',
              placeholder: t('form.placeholders.select_action', 'Select action'),
              required: true,
              options: actionOptions,
              description: t('form.descriptions.permission_action', 'The action that can be performed'),
            },
            {
              name: 'scope',
              label: t('permission.scope'),
              type: 'select',
              placeholder: t('form.placeholders.select_scope', 'Select scope'),
              required: true,
              options: scopeOptions,
              description: t('form.descriptions.permission_scope', 'The scope of the permission'),
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: t('form.tabs.settings'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.permission_settings'),
          description: t('form.sections.permission_settings_description', 'Configure permission status and settings'),
          icon: <Settings className="w-4 h-4" />,
          fields: [
            {
              name: 'isActive',
              label: t('permission.is_active'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.permission_is_active', 'Whether this permission is active and can be used'),
            },
          ],
        },
      ],
    },
  ];

  const pageActions = useMemo(() => {
    const actions = [
      {
        label: t('permissions.back_to_permissions', 'Back to Permissions'),
        onClick: handleCancel,
        icon: <ArrowLeft className="w-4 h-4" />,
      },
    ];

    // Add delete action
    actions.push({
      label: t('common.delete', 'Delete'),
      onClick: handleDelete,
      icon: <Trash2 className="w-4 h-4" />,
    });

    return actions;
  }, [t, handleCancel, handleDelete]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 md:p-8 text-red-500">
          {t('common.error')}: {(error as any)?.message || 'Failed to load permission'}
        </div>
      );
    }

    return (
      <EntityForm<UpdatePermissionFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updatePermissionMutation.isPending}
        validationSchema={updatePermissionSchema as any}
        submitButtonText={t('common.update')}
        cancelButtonText={t('common.cancel')}
        showCancelButton={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  };

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: t('permissions.title', 'Permissions'),
      href: '/permissions',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: t('permissions.edit_permission', 'Edit Permission'),
      icon: <Lock className="h-4 w-4" />,
    },
  ]), [t]);

  return (
    <BaseLayout
      title={t('permissions.edit_permission', 'Edit Permission')}
      description={t('permissions.edit_permission_description', 'Update permission information and settings')}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">

        <div className="max-w-4xl mx-auto">
          <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {permissionResponse?.data?.name || t('permissions.edit_permission', 'Edit Permission')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('permissions.edit_permission_subtitle', 'Update permission details and settings')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
        </div>
      </div>
    </BaseLayout>
  );
};

export default PermissionUpdatePage;

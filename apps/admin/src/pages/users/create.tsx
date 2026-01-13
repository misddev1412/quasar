import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateUserForm } from '../../components/user/CreateUserForm';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateUserFormData } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'preferences'] // Maps to CreateUserForm tab IDs
  });

  // tRPC mutation for creating user
  const createUserMutation = trpc.adminUser.createUser.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('messages.user_created_successfully'),
        description: t('messages.user_created_successfully_description'),
      });
      navigate('/users');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('messages.failed_to_create_user'),
        description: error.message || t('messages.create_user_error_description'),
      });
    },
  });

  const handleSubmit = async (formData: CreateUserFormData) => {
    try {
      // Transform form data to match API expectations
      const userData = {
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
        role: formData.role ? formData.role.toString() as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER" | "GUEST" : undefined,
        isActive: formData.isActive ?? true,
      };

      await createUserMutation.mutateAsync(userData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('User creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <CreatePageTemplate
      title={t('admin.create_new_user', 'Create New User')}
      description={t('admin.create_user_description', 'Add a new user to the system')}
      icon={<UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.user', 'User')}
      entityNamePlural={t('common.users', 'Users')}
      backUrl="/users"
      onBack={handleCancel}
      isSubmitting={createUserMutation.isPending}
      maxWidth="full"
    >
      <CreateUserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createUserMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default UserCreatePage;

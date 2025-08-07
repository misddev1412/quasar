import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { CreateUserForm } from '../../components/user/CreateUserForm';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateUserFormData } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // tRPC mutation for creating user
  const createUserMutation = trpc.adminUser.createUser.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('messages.user_created_successfully', 'User Created Successfully'),
        description: t('messages.user_created_successfully_description', 'User has been created successfully.'),
      });
      navigate('/users');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('messages.failed_to_create_user', 'Failed to Create User'),
        description: error.message || t('messages.create_user_error_description', 'An unexpected error occurred while creating the user.'),
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

  // Page actions
  const actions = [
    {
      label: t('admin.back_to_users', 'Back to Users'),
      onClick: handleCancel,
      icon: <ArrowLeft className="w-4 h-4" />,
    },
  ];

  return (
    <BaseLayout
      title={t('admin.create_new_user', 'Create New User')}
      description={t('admin.create_user_description', 'Add a new user to the system with their basic information and preferences.')}
      actions={actions}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('admin.user_information', 'User Information')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.user_information_description', 'Fill in the details below to create a new user account.')}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CreateUserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createUserMutation.isPending}
          />
        </CardContent>
      </Card>
    </BaseLayout>
  );
};

export default UserCreatePage;

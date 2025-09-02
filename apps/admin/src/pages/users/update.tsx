import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Lock, Mail, Phone, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { z } from 'zod';
import { commonValidation } from '../../utils/validation';
import { UserRole } from '../../types/user';
import { useAuth } from '../../context/AuthContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';

// Form data type for update (extended to include profile and password fields)
type UpdateUserFormData = {
  // General Information
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phoneNumber?: string;
  // Settings
  role?: UserRole;
  isActive?: boolean;
  // Password update (no current password verification on this page)
  newPassword?: string;
  confirmPassword?: string;
  // Preferences (kept for UI consistency; not sent to API)
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
};

// Validation schema for update
const updateUserSchema = z.object({
  email: commonValidation.email,
  username: commonValidation.username,
  firstName: commonValidation.firstName.optional(),
  lastName: commonValidation.lastName.optional(),
  phoneNumber: commonValidation.phoneNumber.optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  newPassword: commonValidation.password.optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If any password field is provided, only require new/confirm to match
  const anyPw = !!(data.newPassword || data.confirmPassword);
  if (!anyPw) return true;
  // If either new or confirm provided, they must both exist and match
  return !!(data.newPassword && data.confirmPassword && data.newPassword === data.confirmPassword);
}, {
  message: 'Passwords must be provided and match',
  path: ['confirmPassword'],
});

const UserUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const trpcContext = trpc.useContext();
  const { user: authUser } = useAuth();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'preferences'] // Maps to tab IDs
  });

  const {
    data: userResponse,
    isLoading,
    error,
  } = trpc.adminUser.getUserById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const updateUserMutation = trpc.adminUser.updateUser.useMutation({
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: err.message || t('messages.operation_failed'),
      });
    },
  });

  // Mutation for updating any user's profile by ID (admin-only)
  const updateProfileByIdMutation = (trpc as any).adminUser.updateUserProfileById.useMutation({
    onError: (err) => {
      addToast({ type: 'error', title: t('common.error'), description: err.message || t('messages.operation_failed') });
    },
  });
  const updatePasswordMutation = trpc.adminUser.updatePassword.useMutation({
    onError: (err) => {
      addToast({ type: 'error', title: t('common.error'), description: err.message || t('messages.operation_failed') });
    },
  });

  const initialValues: Partial<UpdateUserFormData> = useMemo(() => {
    const data = (userResponse as any)?.data;
    if (!data) return {};
    return {
      firstName: data.profile?.firstName || '',
      lastName: data.profile?.lastName || '',
      username: data.username || '',
      email: data.email || '',
      phoneNumber: data.profile?.phoneNumber || '',
      role: (data.role as UserRole) || undefined,
      isActive: data.isActive ?? true,
      // Preferences defaults
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    } as Partial<UpdateUserFormData>;
  }, [userResponse]);

  const handleSubmit = async (formData: UpdateUserFormData) => {
    if (!id) return;

    try {
      // 1) Update account fields
      await updateUserMutation.mutateAsync({
        id,
        email: formData.email,
        username: formData.username,
        isActive: formData.isActive,
        role: formData.role ? (formData.role.toString() as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'GUEST') : undefined,
      } as any);

      // 2) Update profile fields — now allowed for any user by admin
      if (formData.firstName || formData.lastName || formData.phoneNumber) {
        await updateProfileByIdMutation.mutateAsync({
          id,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
        } as any);
      }

      const isEditingSelf = authUser?.id === id;


      // 3) Update password — remove current password verification on this page
      if (formData.newPassword) {
        if (isEditingSelf) {
          await updatePasswordMutation.mutateAsync({
            newPassword: formData.newPassword as string,
          } as any);
        } else {
          // TODO: When backend adds admin endpoint to set another user's password by id, call it here
          addToast({
            type: 'info',
            title: t('common.info', 'Info'),
            description: t('messages.password_update_admin_limit', 'Admins can update other users\' passwords without current password once backend supports it. Currently not available.')
          });
        }
      }

      // Invalidate queries to refresh data
      trpcContext.adminUser.getAllUsers.invalidate();
      if (id) trpcContext.adminUser.getUserById.invalidate({ id });

      // Show success toast and stay on current page
      addToast({
        type: 'success',
        title: t('messages.update_success', 'Updated successfully'),
        description: t('messages.user_updated_successfully', 'User has been updated successfully.'),
      });

      // Do not navigate away - stay on the current page
    } catch (err) {
      // Errors are handled per-mutation; this catch is a safeguard
      console.error(err);
    }
  };

  const handleCancel = () => navigate('/users');

  // Tabs configuration (enable profile editing and add password fields)
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information'),
      icon: <UserIcon className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information'),
          description: t('form.sections.basic_information_description'),
          icon: <UserIcon className="w-4 h-4" />,
          fields: [
            {
              name: 'firstName',
              label: t('user.first_name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_first_name'),
              required: false,
            },
            {
              name: 'lastName',
              label: t('user.last_name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_last_name'),
              required: false,
            },
            {
              name: 'username',
              label: t('user.username'),
              type: 'text',
              placeholder: t('form.placeholders.enter_username'),
              required: true,
            },
            {
              name: 'email',
              label: t('user.email_address'),
              type: 'email',
              placeholder: t('form.placeholders.enter_email_address'),
              required: true,
              icon: <Mail className="w-4 h-4" />,
            },
            {
              name: 'phoneNumber',
              label: t('user.phone'),
              type: 'phone',
              placeholder: t('form.placeholders.enter_phone_number_optional'),
              required: false,
              icon: <Phone className="w-4 h-4" />,
            },
          ],
        },
        {
          title: t('form.sections.security'),
          description: t('form.sections.security_description'),
          icon: <Lock className="w-4 h-4" />,
          fields: [

            {
              name: 'newPassword',
              label: t('user.new_password'),
              type: 'password',
              placeholder: t('form.placeholders.enter_new_password', 'Enter new password'),
              required: false,
            },
            {
              name: 'confirmPassword',
              label: t('user.confirm_new_password'),
              type: 'password',
              placeholder: t('form.placeholders.confirm_new_password', 'Confirm new password'),
              required: false,
            },
            {
              name: 'role',
              label: t('user.user_role'),
              type: 'select',
              placeholder: t('form.placeholders.select_user_role'),
              required: false,
              options: [
                { value: UserRole.USER, label: t('user.roles.user') },
                { value: UserRole.MANAGER, label: t('user.roles.manager') },
                { value: UserRole.ADMIN, label: t('user.roles.admin') },
                { value: UserRole.SUPER_ADMIN, label: t('user.roles.super_admin') },
              ],
            },
            {
              name: 'isActive',
              label: t('user.account_active'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.account_active_description'),
            },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      label: t('form.tabs.preferences'),
      icon: <SettingsIcon className="w-4 h-4" />,
      sections: [
            {
              title: t('form.sections.notification_settings'),
              description: t('form.sections.notification_settings_description'),
              icon: <SettingsIcon className="w-4 h-4" />,
              fields: [
                {
                  name: 'emailNotifications',
                  label: t('user.email_notifications'),
                  type: 'checkbox',
                  required: false,
                  description: t('form.descriptions.email_notifications_description'),
                },
                {
                  name: 'smsNotifications',
                  label: t('user.sms_notifications'),
                  type: 'checkbox',
                  required: false,
                  description: t('form.descriptions.sms_notifications_description'),
                },
                {
                  name: 'marketingEmails',
                  label: t('user.marketing_emails'),
                  type: 'checkbox',
                  required: false,
                  description: t('form.descriptions.marketing_emails_description'),
                },
              ],
            },
          ],
        },
      ];

  const actions = [
    {
      label: t('admin.back_to_users'),
      onClick: handleCancel,
      icon: <ArrowLeft className="w-4 h-4" />,
    },
  ];

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
          {t('common.error')}: {(error as any)?.message || 'Failed to load user'}
        </div>
      );
    }

    return (
      <EntityForm<UpdateUserFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateUserMutation.isPending}
        validationSchema={updateUserSchema as any}
        submitButtonText={t('common.update')}
        cancelButtonText={t('common.cancel')}
        showCancelButton={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  };

  return (
    <BaseLayout
      title={t('admin.update_user', 'Update User')}
      description={t('admin.user_information_description')}
      actions={actions}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('admin.user_information')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.user_information_description')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">{renderContent()}</CardContent>
      </Card>
    </BaseLayout>
  );
};

export default UserUpdatePage;


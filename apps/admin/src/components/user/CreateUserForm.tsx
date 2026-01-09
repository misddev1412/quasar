import React from 'react';
import { User, Settings, Mail, Phone, Lock, Shield } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { CreateUserFormData, createUserSchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { UserRole } from '../../types/user';
import type { Role as AdminRole } from '../../types/role';
import { trpc } from '../../utils/trpc';

type RolesListResponse = {
  data?: {
    items?: AdminRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  // Optional external tab control (for URL persistence)
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();

  // Load available roles directly from backend (Role entity)
  const { data: rolesResponse, isLoading: rolesLoading } = trpc.adminRole.getAllRoles.useQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const roleOptions = React.useMemo(() => {
    const roles = (rolesResponse as RolesListResponse | undefined)?.data?.items || [];
    if (!roles.length) {
      return [];
    }

    return roles
      .filter(role => role.isActive)
      .map(role => ({
        value: role.code || UserRole.USER,
        label: role.name || t(`user.roles.${role.code || UserRole.USER}`, role.code || UserRole.USER),
        disabled: !role.isActive,
      }));
  }, [rolesResponse, t]);

  const roleFieldDescription = React.useMemo(() => {
    if (rolesLoading) {
      return t('form.descriptions.loading_roles', 'Loading available roles...');
    }
    if (roleOptions.length === 0) {
      return t(
        'form.descriptions.user_role_missing',
        'No active roles available. Please create a role before assigning it to users.'
      );
    }
    return t('form.descriptions.user_role_description', 'Assign the default permission set for this user.');
  }, [roleOptions, rolesLoading, t]);

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information', 'General Information'),
      icon: <User className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('form.sections.basic_information_description', 'Key account identifiers and contact info.'),
          icon: <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'firstName',
              label: t('user.first_name', 'First name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_first_name', 'Enter first name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              name: 'lastName',
              label: t('user.last_name', 'Last name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_last_name', 'Enter last name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              name: 'username',
              label: t('user.username', 'Username'),
              type: 'text',
              placeholder: t('form.placeholders.enter_username', 'Enter username'),
              required: true,
              validation: {
                minLength: 3,
                maxLength: 50,
                pattern: /^[a-zA-Z0-9_-]+$/,
              },
              description: t('form.descriptions.username_requirements', 'Use letters, numbers, hyphen, or underscore.'),
            },
            {
              name: 'email',
              label: t('user.email_address', 'Email address'),
              type: 'email',
              placeholder: t('form.placeholders.enter_email_address', 'Enter email address'),
              required: true,
              icon: <Mail className="w-4 h-4" />,
            },
            {
              name: 'phoneNumber',
              label: t('user.phone', 'Phone'),
              type: 'phone',
              placeholder: t('form.placeholders.enter_phone_number_optional', 'Enter phone number (optional)'),
              required: false,
              icon: <Phone className="w-4 h-4" />,
            },
          ],
        },
        {
          title: t('form.sections.security', 'Security'),
          description: t('form.sections.security_description', 'Manage password and access controls.'),
          icon: <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'password',
              label: t('user.password', 'Password'),
              type: 'password',
              placeholder: t('form.placeholders.enter_password', 'Enter password'),
              required: true,
              icon: <Lock className="w-4 h-4" />,
              description: t('form.descriptions.password_requirements', 'Use a strong password with at least 8 characters.'),
            },
            {
              name: 'role',
              label: t('user.user_role', 'User role'),
              type: 'select',
              placeholder: t('form.placeholders.select_user_role', 'Select user role'),
              required: false,
              options: roleOptions,
              disabled: rolesLoading || roleOptions.length === 0,
              icon: <Shield className="w-4 h-4" />,
              description: roleFieldDescription,
            },
            {
              name: 'isActive',
              label: t('user.account_active', 'Account active'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.account_active_description', 'Disable access if the account should not log in yet.'),
            },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      label: t('form.tabs.preferences', 'Preferences'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.notification_settings', 'Notification settings'),
          description: t('form.sections.notification_settings_description', 'Choose which updates this user receives.'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'emailNotifications',
              label: t('user.email_notifications', 'Email notifications'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.email_notifications_description', 'Allow transactional or system emails.'),
            },
            {
              name: 'smsNotifications',
              label: t('user.sms_notifications', 'SMS notifications'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.sms_notifications_description', 'Allow SMS alerts if a valid phone number exists.'),
            },
            {
              name: 'marketingEmails',
              label: t('user.marketing_emails', 'Marketing emails'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.marketing_emails_description', 'Subscribe the user to marketing updates.'),
            },
          ],
        },
      ],
    },
  ];

  // Default values for the form
  const defaultValues: Partial<CreateUserFormData> = {
    isActive: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  };

  return (
    <EntityForm<CreateUserFormData>
      tabs={tabs}
      initialValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={createUserSchema}
      submitButtonText={t('admin.create_user', 'Create user')}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};

export default CreateUserForm;

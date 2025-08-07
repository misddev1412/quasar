import React from 'react';
import { User, Settings, Mail, Phone, Lock, Shield } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { CreateUserFormData, createUserSchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { UserRole } from '../../types/user';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();

  // Generate user role options with translations
  const userRoleOptions = [
    { value: UserRole.USER, label: t('user.roles.user', 'User') },
    { value: UserRole.MANAGER, label: t('user.roles.manager', 'Manager') },
    { value: UserRole.ADMIN, label: t('user.roles.admin', 'Admin') },
    { value: UserRole.SUPER_ADMIN, label: t('user.roles.super_admin', 'Super Admin') },
  ];

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information', 'General Information'),
      icon: <User className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('form.sections.basic_information_description', 'Enter the user\'s basic details and contact information.'),
          icon: <User className="w-4 h-4" />,
          fields: [
            {
              name: 'firstName',
              label: t('user.first_name', 'First Name'),
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
              label: t('user.last_name', 'Last Name'),
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
              description: t('form.descriptions.username_requirements', 'Username can only contain letters, numbers, underscores, and hyphens.'),
            },
            {
              name: 'email',
              label: t('user.email_address', 'Email Address'),
              type: 'email',
              placeholder: t('form.placeholders.enter_email_address', 'Enter email address'),
              required: true,
              icon: <Mail className="w-4 h-4" />,
            },
            {
              name: 'phoneNumber',
              label: t('user.phone', 'Phone Number'),
              type: 'phone',
              placeholder: t('form.placeholders.enter_phone_number_optional', 'Enter phone number (optional)'),
              required: false,
              icon: <Phone className="w-4 h-4" />,
              defaultCountry: 'US',
            },
          ],
        },
        {
          title: t('form.sections.security', 'Security'),
          description: t('form.sections.security_description', 'Set up the user\'s login credentials and access level.'),
          icon: <Lock className="w-4 h-4" />,
          fields: [
            {
              name: 'password',
              label: t('user.password', 'Password'),
              type: 'password',
              placeholder: t('form.placeholders.enter_password', 'Enter password'),
              required: true,
              icon: <Lock className="w-4 h-4" />,
              description: t('form.descriptions.password_requirements', 'Password must be at least 8 characters with uppercase, lowercase, and numbers.'),
            },
            {
              name: 'role',
              label: t('user.user_role', 'User Role'),
              type: 'select',
              placeholder: t('form.placeholders.select_user_role', 'Select user role'),
              required: false,
              options: userRoleOptions,
              icon: <Shield className="w-4 h-4" />,
              description: t('form.descriptions.user_role_description', 'Determines the user\'s access level and permissions.'),
            },
            {
              name: 'isActive',
              label: t('user.account_active', 'Account Active'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.account_active_description', 'Whether the user account is active and can log in.'),
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
          title: t('form.sections.notification_settings', 'Notification Settings'),
          description: t('form.sections.notification_settings_description', 'Configure how the user receives notifications.'),
          icon: <Settings className="w-4 h-4" />,
          fields: [
            {
              name: 'emailNotifications',
              label: t('user.email_notifications', 'Email Notifications'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.email_notifications_description', 'Receive notifications via email.'),
            },
            {
              name: 'smsNotifications',
              label: t('user.sms_notifications', 'SMS Notifications'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.sms_notifications_description', 'Receive notifications via SMS (requires phone number).'),
            },
            {
              name: 'marketingEmails',
              label: t('user.marketing_emails', 'Marketing Emails'),
              type: 'checkbox',
              required: false,
              description: t('form.descriptions.marketing_emails_description', 'Receive marketing and promotional emails.'),
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
      submitButtonText={t('admin.create_user', 'Create User')}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
    />
  );
};

export default CreateUserForm;

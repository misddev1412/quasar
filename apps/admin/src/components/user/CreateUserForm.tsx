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

  // Generate user role options with translations
  const userRoleOptions = [
    { value: UserRole.USER, label: t('user.roles.user') },
    { value: UserRole.MANAGER, label: t('user.roles.manager') },
    { value: UserRole.ADMIN, label: t('user.roles.admin') },
    { value: UserRole.SUPER_ADMIN, label: t('user.roles.super_admin') },
  ];

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information'),
      icon: <User className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information'),
          description: t('form.sections.basic_information_description'),
          icon: <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'firstName',
              label: t('user.first_name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_first_name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              name: 'lastName',
              label: t('user.last_name'),
              type: 'text',
              placeholder: t('form.placeholders.enter_last_name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              name: 'username',
              label: t('user.username'),
              type: 'text',
              placeholder: t('form.placeholders.enter_username'),
              required: true,
              validation: {
                minLength: 3,
                maxLength: 50,
                pattern: /^[a-zA-Z0-9_-]+$/,
              },
              description: t('form.descriptions.username_requirements'),
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
          icon: <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'password',
              label: t('user.password'),
              type: 'password',
              placeholder: t('form.placeholders.enter_password'),
              required: true,
              icon: <Lock className="w-4 h-4" />,
              description: t('form.descriptions.password_requirements'),
            },
            {
              name: 'role',
              label: t('user.user_role'),
              type: 'select',
              placeholder: t('form.placeholders.select_user_role'),
              required: false,
              options: userRoleOptions,
              icon: <Shield className="w-4 h-4" />,
              description: t('form.descriptions.user_role_description'),
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
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.notification_settings'),
          description: t('form.sections.notification_settings_description'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
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
      submitButtonText={t('admin.create_user')}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};

export default CreateUserForm;

import React from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { AdminUpdateUserProfileDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';
import { User, Phone, Calendar, Home, Building, MapPin, Hash, FileText } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { z } from 'zod';
import { FormTabConfig } from '../../types/forms';

interface ProfileFormProps {
  initialData?: AdminUpdateUserProfileDto;
  onSubmit: (data: AdminUpdateUserProfileDto) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
  isLoading?: boolean;
}

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {},
  onSubmit,

  isSubmitting = false,
  error,
  isLoading = false,
}) => {
  const { t } = useTranslationWithBackend();

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('profile.general_info', 'General Info'),
      icon: <User className="w-4 h-4" />,
      sections: [
        {
          title: t('profile.personal_information', 'Personal Information'),
          icon: <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'firstName',
              label: t('profile.first_name'),
              type: 'text',
              placeholder: t('profile.first_name_placeholder'),
              icon: <User className="w-5 h-5 text-gray-400" />,
              required: false,
            },
            {
              name: 'lastName',
              label: t('profile.last_name'),
              type: 'text',
              placeholder: t('profile.last_name_placeholder'),
              icon: <User className="w-5 h-5 text-gray-400" />,
              required: false,
            },
            {
              name: 'phoneNumber',
              label: t('profile.phone_number'),
              type: 'tel',
              placeholder: t('profile.phone_number_placeholder'),
              icon: <Phone className="w-5 h-5 text-gray-400" />,
            },
            {
              name: 'dateOfBirth',
              label: t('profile.date_of_birth'),
              type: 'date',
              placeholder: '',
              icon: <Calendar className="w-5 h-5 text-gray-400" />,
            },
            {
              name: 'bio',
              label: t('profile.bio'),
              type: 'textarea',
              placeholder: t('profile.bio_placeholder'),
              icon: <FileText className="w-5 h-5 text-gray-400" />,
            },
          ],
        },
        {
          title: t('profile.avatar', 'Avatar'),
          icon: <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'avatar',
              label: t('profile.avatar_url'),
              type: 'media-upload',
              accept: 'image/*',
              multiple: false,
              maxSize: 5,
            },
          ],
        },
      ],
    },
    {
      id: 'address',
      label: t('profile.address_information', 'Address Info'),
      icon: <MapPin className="w-4 h-4" />,
      sections: [
        {
          title: t('profile.address_details', 'Address Details'),
          icon: <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'address',
              label: t('profile.address'),
              type: 'text',
              placeholder: t('profile.address_placeholder'),
              icon: <Home className="w-5 h-5 text-gray-400" />,
              fullWidth: true,
            },
            {
              name: 'city',
              label: t('profile.city'),
              type: 'text',
              placeholder: t('profile.city_placeholder'),
              icon: <Building className="w-5 h-5 text-gray-400" />,
            },
            {
              name: 'country',
              label: t('profile.country'),
              type: 'text',
              placeholder: t('profile.country_placeholder'),
              icon: <MapPin className="w-5 h-5 text-gray-400" />,
            },
            {
              name: 'postalCode',
              label: t('profile.postal_code'),
              type: 'text',
              placeholder: t('profile.postal_code_placeholder'),
              icon: <Hash className="w-5 h-5 text-gray-400" />,
            },
          ],
        },
      ],
    },
  ];

  return (
    <EntityForm
      tabs={tabs}
      initialValues={initialData}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      validationSchema={profileSchema}
      submitButtonText={t('profile.save_changes')}
      showCancelButton={false}
      actionsAlignment="end"
      showSaveAndStay={false}
    />
  );
};

export default ProfileForm;
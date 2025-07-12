import React, { useState } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { AdminUpdateUserProfileDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';
import { User, Phone, Calendar, Image, Home, Building, MapPin, Hash, FileText } from 'lucide-react';
import TextareaInput from '../common/TextareaInput';

interface ProfileFormUIProps {
  formData: AdminUpdateUserProfileDto;
  isSubmitting: boolean;
  error?: string;
  onFieldChange: (fieldName: keyof AdminUpdateUserProfileDto, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ProfileFormUI: React.FC<ProfileFormUIProps> = ({
  formData,
  isSubmitting,
  error,
  onFieldChange,
  onSubmit,
}) => {
  const { t } = useTranslationWithBackend();
  const createChangeHandler = (fieldName: keyof AdminUpdateUserProfileDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFieldChange(fieldName, e.target.value);
  };
  const iconProps = {
    className: "w-5 h-5 text-gray-400",
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="firstName"
            type="text"
            label={t('profile.first_name')}
            placeholder={t('profile.first_name_placeholder')}
            value={formData.firstName || ''}
            onChange={createChangeHandler('firstName')}
            icon={<User {...iconProps} />}
          />
          <FormInput
            id="lastName"
            type="text"
            label={t('profile.last_name')}
            placeholder={t('profile.last_name_placeholder')}
            value={formData.lastName || ''}
            onChange={createChangeHandler('lastName')}
            icon={<User {...iconProps} />}
          />
        </div>

        <FormInput
          id="phoneNumber"
          type="tel"
          label={t('profile.phone_number')}
          placeholder={t('profile.phone_number_placeholder')}
          value={formData.phoneNumber || ''}
          onChange={createChangeHandler('phoneNumber')}
          icon={<Phone {...iconProps} />}
        />

        <FormInput
          id="dateOfBirth"
          type="date"
          label={t('profile.date_of_birth')}
          placeholder=""
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
          onChange={createChangeHandler('dateOfBirth')}
          icon={<Calendar {...iconProps} />}
        />
        
        <FormInput
          id="avatar"
          type="text"
          label={t('profile.avatar_url')}
          placeholder={t('profile.avatar_url_placeholder')}
          value={formData.avatar || ''}
          onChange={createChangeHandler('avatar')}
          icon={<Image {...iconProps} />}
        />

        <TextareaInput
          id="bio"
          label={t('profile.bio')}
          value={formData.bio || ''}
          onChange={createChangeHandler('bio')}
          placeholder={t('profile.bio_placeholder')}
          disabled={isSubmitting}
          icon={<FileText {...iconProps} />}
        />

        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-t pt-6">{t('profile.address_information')}</h3>
        
        <FormInput
          id="address"
          type="text"
          label={t('profile.address')}
          placeholder={t('profile.address_placeholder')}
          value={formData.address || ''}
          onChange={createChangeHandler('address')}
          icon={<Home {...iconProps} />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="city"
            type="text"
            label={t('profile.city')}
            placeholder={t('profile.city_placeholder')}
            value={formData.city || ''}
            onChange={createChangeHandler('city')}
            icon={<Building {...iconProps} />}
          />
          <FormInput
            id="country"
            type="text"
            label={t('profile.country')}
            placeholder={t('profile.country_placeholder')}
            value={formData.country || ''}
            onChange={createChangeHandler('country')}
            icon={<MapPin {...iconProps} />}
          />
        </div>
        
        <FormInput
            id="postalCode"
            type="text"
            label={t('profile.postal_code')}
            placeholder={t('profile.postal_code_placeholder')}
            value={formData.postalCode || ''}
            onChange={createChangeHandler('postalCode')}
            icon={<Hash {...iconProps} />}
          />

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {t('profile.save_changes')}
          </Button>
        </div>
      </form>
    </div>
  );
};

interface ProfileFormProps {
  initialData?: AdminUpdateUserProfileDto;
  onSubmit: (data: AdminUpdateUserProfileDto) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  error,
}) => {
  const [formData, setFormData] = useState<AdminUpdateUserProfileDto>(initialData);

  const handleFieldChange = (fieldName: keyof AdminUpdateUserProfileDto, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <ProfileFormUI
      formData={formData}
      isSubmitting={isSubmitting}
      error={error}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
    />
  );
};

export default ProfileForm; 
import React, { useState } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { AdminUpdateUserProfileDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';

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

  return (
    <div className="w-full max-w-2xl mx-auto">
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
          />
          <FormInput
            id="lastName"
            type="text"
            label={t('profile.last_name')}
            placeholder={t('profile.last_name_placeholder')}
            value={formData.lastName || ''}
            onChange={createChangeHandler('lastName')}
          />
        </div>

        <FormInput
          id="phoneNumber"
          type="tel"
          label={t('profile.phone_number')}
          placeholder={t('profile.phone_number_placeholder')}
          value={formData.phoneNumber || ''}
          onChange={createChangeHandler('phoneNumber')}
        />

        <FormInput
          id="dateOfBirth"
          type="date"
          label={t('profile.date_of_birth')}
          placeholder=""
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
          onChange={createChangeHandler('dateOfBirth')}
        />
        
        <FormInput
          id="avatar"
          type="text"
          label={t('profile.avatar_url')}
          placeholder={t('profile.avatar_url_placeholder')}
          value={formData.avatar || ''}
          onChange={createChangeHandler('avatar')}
        />

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('profile.bio')}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={formData.bio || ''}
            onChange={createChangeHandler('bio')}
          />
        </div>

        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-t pt-6">{t('profile.address_information')}</h3>
        
        <FormInput
          id="address"
          type="text"
          label={t('profile.address')}
          placeholder={t('profile.address_placeholder')}
          value={formData.address || ''}
          onChange={createChangeHandler('address')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="city"
            type="text"
            label={t('profile.city')}
            placeholder={t('profile.city_placeholder')}
            value={formData.city || ''}
            onChange={createChangeHandler('city')}
          />
          <FormInput
            id="country"
            type="text"
            label={t('profile.country')}
            placeholder={t('profile.country_placeholder')}
            value={formData.country || ''}
            onChange={createChangeHandler('country')}
          />
        </div>
        
        <FormInput
            id="postalCode"
            type="text"
            label={t('profile.postal_code')}
            placeholder={t('profile.postal_code_placeholder')}
            value={formData.postalCode || ''}
            onChange={createChangeHandler('postalCode')}
          />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {t('common.save_changes')}
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
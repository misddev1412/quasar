import React, { useState, useEffect } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { AdminUpdateUserProfileDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';
import { User, Phone, Calendar, Image, Home, Building, MapPin, Hash, FileText, Upload } from 'lucide-react';
import TextareaInput from '../common/TextareaInput';
import { MediaManager } from '../common/MediaManager';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number | string;
  folder: string;
  provider: string;
  alt?: string;
  caption?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormUIProps {
  formData: AdminUpdateUserProfileDto;
  isSubmitting: boolean;
  error?: string;
  onFieldChange: (fieldName: keyof AdminUpdateUserProfileDto, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onAvatarSelect?: (file: MediaFile) => void;
}

export const ProfileFormUI: React.FC<ProfileFormUIProps> = ({
  formData,
  isSubmitting,
  error,
  onFieldChange,
  onSubmit,
  onAvatarSelect,
}) => {
  const { t } = useTranslationWithBackend();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const createChangeHandler = (fieldName: keyof AdminUpdateUserProfileDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFieldChange(fieldName, e.target.value);
  };

  const handleAvatarSelect = (file: MediaFile) => {
    if (onAvatarSelect) {
      onAvatarSelect(file);
    }
    setIsMediaManagerOpen(false);
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
          value={formData.dateOfBirth || ''}
          onChange={createChangeHandler('dateOfBirth')}
          icon={<Calendar {...iconProps} />}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('profile.avatar_url')}
          </label>
          <div className="flex items-center space-x-4">
            {/* Avatar Preview */}
            <div className="flex-shrink-0">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Avatar Actions */}
            <div className="flex-1 space-y-2">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsMediaManagerOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Avatar</span>
                </Button>
                {formData.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onFieldChange('avatar', '')}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {formData.avatar && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {formData.avatar}
                </div>
              )}
            </div>
          </div>
        </div>

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

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={handleAvatarSelect}
        multiple={false}
        accept="image/*"
        maxSize={5}
        title="Choose Avatar"
      />
    </div>
  );
};

interface ProfileFormProps {
  initialData?: AdminUpdateUserProfileDto;
  onSubmit: (data: AdminUpdateUserProfileDto) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
  isLoading?: boolean;
  onAvatarSelect?: (file: MediaFile) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  error,
  isLoading = false,
  onAvatarSelect,
}) => {
  const [formData, setFormData] = useState<AdminUpdateUserProfileDto>({});

  // Sync form data when initialData changes
  useEffect(() => {
    // Only update if initialData has actual data (not empty object)
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFieldChange = (fieldName: keyof AdminUpdateUserProfileDto, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ProfileFormUI
      formData={formData}
      isSubmitting={isSubmitting}
      error={error}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      onAvatarSelect={onAvatarSelect}
    />
  );
};

export default ProfileForm; 
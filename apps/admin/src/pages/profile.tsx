import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileForm from '../components/user/ProfileForm';
import { AdminUpdatePasswordDto, AdminUpdateUserProfileDto, AdminUserResponseDto } from '../../../backend/src/modules/user/dto/admin/admin-user.dto';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { trpc } from '../utils/trpc';
import { useToast } from '../context/ToastContext';
import BaseLayout from '../components/layout/BaseLayout';
import Tabs from '../components/common/Tabs';
import UpdatePasswordForm from '../components/user/UpdatePasswordForm';
import PreferenceSettings from '../components/user/PreferenceSettings';
import { User, Lock, Settings } from 'lucide-react';

const UserProfilePage = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const trpcContext = trpc.useContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = parseInt(searchParams.get('tab') || '0', 10);
  const handleTabChange = (index: number) => {
    setSearchParams({ tab: String(index) });
  };

  const { data: profileData, isLoading, error } = trpc.adminUser.getProfile.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfileMutation = trpc.adminUser.updateProfile.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('profile.profile_updated_successfully'),
        description: t('profile.your_profile_has_been_updated'),
      });
      trpcContext.adminUser.getProfile.invalidate();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: error.message || t('profile.failed_to_update_profile'),
      });
    },
  });
  
  const updatePasswordMutation = trpc.adminUser.updatePassword.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('profile.password_updated_successfully'),
        description: t('profile.your_password_has_been_updated'),
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: error.message || t('profile.failed_to_update_password'),
      });
    },
  });

  const handleProfileSubmit = async (data: AdminUpdateUserProfileDto) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handlePasswordSubmit = async (data: AdminUpdatePasswordDto) => {
    await updatePasswordMutation.mutateAsync(data);
  }

  const initialData = (profileData as AdminUserResponseDto)?.profile || {};

  const tabs = [
    {
      label: t('profile.update_profile'),
      icon: <User />,
      content: (
        <ProfileForm 
          initialData={initialData} 
          onSubmit={handleProfileSubmit}
          isSubmitting={updateProfileMutation.isPending}
          error={updateProfileMutation.error?.message}
        />
      ),
    },
    {
      label: t('profile.update_password'),
      icon: <Lock />,
      content: (
        <UpdatePasswordForm
          onSubmit={handlePasswordSubmit}
          isSubmitting={updatePasswordMutation.isPending}
          error={updatePasswordMutation.error?.message}
        />
      ),
    },
    {
      label: t('profile.preference_settings'),
      icon: <Settings />,
      content: <PreferenceSettings />,
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
          {t('common.error')}: {error.message}
        </div>
      );
    }
    
    return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />;
  }

  return (
    <BaseLayout 
      title={t('profile.user_profile')}
      description={t('profile.manage_your_profile_information')}
    >
      {renderContent()}
    </BaseLayout>
  );
};

export default UserProfilePage; 
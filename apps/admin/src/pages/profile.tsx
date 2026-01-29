import React, { useMemo } from 'react';
import { FiHome, FiUser } from 'react-icons/fi';
import { ProfileForm, UpdatePasswordForm } from '@admin/components/user';
import { AdminUpdatePasswordDto, AdminUpdateUserProfileDto, AdminUserResponseDto } from '@backend/modules/user/dto/admin/admin-user.dto';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useUrlTabs } from '@admin/hooks/useUrlTabs';
import { trpc } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { BaseLayout } from '@admin/components/layout';
import { Breadcrumb, Tabs } from '@admin/components/common';
import { User, Lock, Settings } from 'lucide-react';
import { useAdminSeo } from '@admin/hooks/useAdminSeo';

const UserProfilePage = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  // Set SEO for profile page
  useAdminSeo({
    path: '/profile',
    defaultSeo: {
      title: t('profile.user_profile', 'My Profile') + ' | Quasar Admin',
      description: t('profile.manage_your_profile_information', 'Manage your profile information, including your name, email, and password'),
      keywords: 'profile, user settings, account, admin'
    }
  });


  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['profile', 'password'] // Maps to tab content
  });

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
      utils.adminUser.getProfile.invalidate();
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



  // Memoize initialData to prevent unnecessary re-renders
  const initialData = useMemo(() => {
    if (!profileData) return {};

    // The API response is wrapped in a standardized response structure
    // profileData.data contains the actual user data
    const userData = (profileData as any)?.data;
    if (!userData) return {};

    const profile = userData.profile;
    if (!profile) return {};

    // Ensure all fields are properly mapped and handle date formatting
    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      avatar: profile.avatar || '',
      bio: profile.bio || '',
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || '',
      postalCode: profile.postalCode || '',
    };
  }, [profileData]);

  // Memoize tabs to prevent unnecessary re-renders
  const tabs = useMemo(() => [
    {
      label: t('profile.update_profile'),
      icon: <User />,
      content: (
        <ProfileForm
          initialData={initialData}
          onSubmit={handleProfileSubmit}
          isSubmitting={updateProfileMutation.isPending}
          error={updateProfileMutation.error?.message}
          isLoading={isLoading}

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
  ], [
    t,
    initialData,
    handleProfileSubmit,
    updateProfileMutation.isPending,
    updateProfileMutation.error?.message,
    handlePasswordSubmit,
    updatePasswordMutation.isPending,
    updatePasswordMutation.error?.message,
    isLoading,
  ]);

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
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: t('navigation.home'),
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('profile.user_profile'),
              icon: <FiUser className="w-4 h-4" />
            }
          ]}
        />

        {renderContent()}
      </div>
    </BaseLayout>
  );
};

export default UserProfilePage; 
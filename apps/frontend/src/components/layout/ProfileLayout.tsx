import React from 'react';
import { ProfileSidebar } from '../profile/ProfileSidebar';
import { Container } from '../common/Container';
import { LucideIcon } from 'lucide-react';

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  sectionHeader?: {
    title: string;
    description?: string;
    icon: LucideIcon;
    actionButtons?: React.ReactNode;
  };
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  activeSection,
  sectionHeader
}) => {

  return (
    <>
      <Container className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    My Profile
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0 max-w-xl">
                    Manage your account settings, preferences, and personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated recently</span>
            </div>
          </div>
        </div>

        {/* Main Layout with 2-Column Structure */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <ProfileSidebar activeSection={activeSection} />
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Section Header */}
              {sectionHeader && (
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                        <sectionHeader.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {sectionHeader.title}
                        </h2>
                        {sectionHeader.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sectionHeader.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {sectionHeader.actionButtons && (
                      <div className="flex items-center space-x-2">
                        {sectionHeader.actionButtons}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="p-6 space-y-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ProfileLayout;
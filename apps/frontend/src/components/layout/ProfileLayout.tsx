import React from 'react';
import { ProfileSidebar } from '../profile/ProfileSidebar';
import { Container } from '../common/Container';

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, activeSection }) => {

  return (
    <>
      <Container className="py-4 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Page Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-0">
                    My Profile
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 max-w-lg mb-0">
                    Manage your account settings, preferences, and personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated recently</span>
            </div>
          </div>
        </div>

        {/* Main Layout with 2-Column Structure */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-20">
              <ProfileSidebar activeSection={activeSection} />
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ProfileLayout;
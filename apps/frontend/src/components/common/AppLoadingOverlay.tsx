'use client';

import React from 'react';
import { Progress } from '@heroui/react';
import { useSettings } from '../../hooks/useSettings';

interface AppLoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export const AppLoadingOverlay: React.FC<AppLoadingOverlayProps> = ({
  isLoading,
  progress = 0,
  message = 'Loading...'
}) => {
  const { getSetting } = useSettings();
  const fallbackSiteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Quasar Store';
  const configuredSiteName = (getSetting('site.name', '') || '').trim();
  const legacySiteName = (getSetting('site_name', '') || '').trim();
  const siteName = configuredSiteName || legacySiteName || fallbackSiteName;

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Application loading"
    >
      <div className="relative">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-indigo-200 dark:border-indigo-900"></div>
                <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 dark:border-t-indigo-400 animate-spin animation-delay-150"></div>
                <div className="absolute inset-4 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                <div className="absolute inset-4 rounded-full border-4 border-t-purple-500 dark:border-t-purple-400 animate-spin animation-delay-300"></div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {siteName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                  {message}
                </p>
              </div>

              {progress > 0 && (
                <Progress
                  value={progress}
                  size="sm"
                  color="primary"
                  className="w-full"
                  classNames={{
                    track: "bg-gray-200 dark:bg-gray-700",
                    indicator: "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }}
                />
              )}
            </div>

            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-0"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-150"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-300"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1.5s linear infinite;
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-0 {
          animation-delay: 0ms;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AppLoadingOverlay;

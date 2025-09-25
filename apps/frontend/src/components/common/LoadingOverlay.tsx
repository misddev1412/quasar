'use client';

import React from 'react';
import { Spinner } from '@heroui/react';

interface LoadingOverlayProps {
  isLoading: boolean;
  fullScreen?: boolean;
  message?: string;
  backdrop?: 'blur' | 'opaque' | 'transparent';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  fullScreen = true,
  message = 'Loading...',
  backdrop = 'blur'
}) => {
  if (!isLoading) return null;

  const backdropClasses = {
    blur: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
    opaque: 'bg-white dark:bg-gray-900',
    transparent: 'bg-transparent'
  };

  return (
    <div
      className={`
        ${fullScreen ? 'fixed' : 'absolute'}
        inset-0
        z-[9999]
        flex
        flex-col
        items-center
        justify-center
        ${backdropClasses[backdrop]}
        transition-all
        duration-300
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner
          size="lg"
          color="primary"
          classNames={{
            circle1: "border-b-blue-500",
            circle2: "border-b-blue-400"
          }}
        />
        {message && (
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
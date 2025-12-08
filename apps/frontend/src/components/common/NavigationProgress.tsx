'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const NavigationProgress: React.FC = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;

    const startProgress = () => {
      setIsNavigating(true);
      setProgress(10);

      let currentProgress = 10;
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 90) {
          currentProgress = 90;
        }
        setProgress(currentProgress);
      }, 200);
    };

    const completeProgress = () => {
      clearInterval(progressInterval);
      setProgress(100);

      completeTimeout = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
    };

    startProgress();
    const loadTimeout = setTimeout(completeProgress, 100);

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(completeTimeout);
      clearInterval(progressInterval);
    };
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-blue-500/50 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
        }}
      >
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30 animate-shimmer" />
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NavigationProgress;
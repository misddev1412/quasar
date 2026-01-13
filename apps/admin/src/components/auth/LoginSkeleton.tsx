import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const LoginSkeleton: React.FC = () => {
    const { isDarkMode } = useTheme();

    // Replicate AuthCard styling logic
    useEffect(() => {
        document.body.classList.add('auth-page');

        if (isDarkMode) {
            document.body.classList.add('login-dark-mode');
            document.body.classList.remove('login-light-mode');
            document.documentElement.style.setProperty('--login-primary-color', '#60a5fa');
            document.documentElement.style.setProperty('--login-secondary-color', '#38bdf8');
            document.documentElement.style.setProperty('--login-text-color', '#f9fafb');
        } else {
            document.body.classList.add('login-light-mode');
            document.body.classList.remove('login-dark-mode');
            document.documentElement.style.setProperty('--login-primary-color', '#2563eb');
            document.documentElement.style.setProperty('--login-secondary-color', '#0284c7');
            document.documentElement.style.setProperty('--login-text-color', '#0f172a');
        }

        return () => {
            document.body.classList.remove('auth-page', 'login-light-mode', 'login-dark-mode');
            document.documentElement.style.removeProperty('--login-primary-color');
            document.documentElement.style.removeProperty('--login-secondary-color');
            document.documentElement.style.removeProperty('--login-text-color');
        };
    }, [isDarkMode]);

    const getBgStyles = () => {
        if (isDarkMode) {
            return "bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950";
        }
        return "bg-gradient-to-br from-blue-100 via-white to-indigo-100";
    };

    const getLeftPanelBgStyles = () => {
        if (isDarkMode) {
            return "bg-gradient-to-br from-primary-700 to-primary-900";
        }
        return "bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200";
    };

    const skeletonColor = isDarkMode ? "bg-gray-700" : "bg-gray-200";
    const leftPanelSkeletonColor = isDarkMode ? "bg-white/10" : "bg-gray-300";

    return (
        <div className={`min-h-screen w-full ${getBgStyles()} flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
            <div className="w-full max-w-5xl overflow-hidden bg-theme-surface rounded-2xl shadow-2xl flex flex-col md:flex-row transition-all duration-500 animate-pulse">

                {/* Left Panel Skeleton */}
                <div className={`w-full md:w-5/12 ${getLeftPanelBgStyles()} p-6 sm:p-8 md:p-12 flex flex-col justify-between relative`}>
                    <div className="relative z-10 w-full">
                        {/* Logo Skeleton */}
                        <div className={`h-10 sm:h-12 w-24 sm:w-32 ${leftPanelSkeletonColor} rounded mb-6 sm:mb-10`}></div>

                        {/* Title Skeleton */}
                        <div className={`h-8 sm:h-10 md:h-12 w-3/4 ${leftPanelSkeletonColor} rounded mb-3 md:mb-6`}></div>

                        {/* Description Skeleton */}
                        <div className={`h-5 sm:h-6 w-1/2 ${leftPanelSkeletonColor} rounded mb-4 md:mb-8`}></div>

                        {/* Main Image Skeleton - Hidden on mobile */}
                        <div className="hidden md:flex justify-center mb-8">
                            <div className={`w-full h-64 ${leftPanelSkeletonColor} rounded-lg`}></div>
                        </div>

                        {/* Feature Items Skeleton - Compact on mobile */}
                        <div className="space-y-2 md:space-y-4 mt-4 md:mt-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2 md:gap-3">
                                    <div className={`h-5 w-5 md:h-6 md:w-6 ${leftPanelSkeletonColor} rounded-full`}></div>
                                    <div className={`h-3 md:h-4 w-36 sm:w-48 ${leftPanelSkeletonColor} rounded`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel Skeleton */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-theme-surface">
                    {/* Header Controls (Language + Theme) */}
                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full mb-4 sm:mb-6">
                        <div className={`h-9 sm:h-10 w-32 sm:w-36 ${skeletonColor} rounded-lg`}></div>
                        <div className={`h-9 sm:h-10 w-9 sm:w-10 ${skeletonColor} rounded-lg`}></div>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        {/* Form Header Skeleton */}
                        <div className="mb-6 sm:mb-8 text-center flex flex-col items-center">
                            <div className={`h-7 sm:h-8 w-40 sm:w-48 ${skeletonColor} rounded mb-3 sm:mb-4`}></div>
                            <div className={`h-3 sm:h-4 w-48 sm:w-64 ${skeletonColor} rounded`}></div>
                        </div>

                        {/* Form Fields Skeleton */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <div className={`h-3 sm:h-4 w-12 sm:w-16 ${skeletonColor} rounded`}></div>
                                <div className={`h-11 sm:h-12 w-full ${skeletonColor} rounded-lg`}></div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className={`h-3 sm:h-4 w-12 sm:w-16 ${skeletonColor} rounded`}></div>
                                <div className={`h-11 sm:h-12 w-full ${skeletonColor} rounded-lg`}></div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`h-5 w-9 ${skeletonColor} rounded-full`}></div>
                                <div className={`h-3 sm:h-4 w-20 sm:w-24 ${skeletonColor} rounded`}></div>
                            </div>

                            {/* Submit Button */}
                            <div className={`h-10 sm:h-11 w-full ${skeletonColor} rounded-lg mt-6 sm:mt-8`}></div>
                        </div>

                        {/* Footer Text */}
                        <div className="mt-6 sm:mt-8 flex justify-center">
                            <div className={`h-3 sm:h-4 w-40 sm:w-48 ${skeletonColor} rounded`}></div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-10 mx-auto">
                        <div className={`h-3 w-28 sm:w-32 ${skeletonColor} rounded`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSkeleton;

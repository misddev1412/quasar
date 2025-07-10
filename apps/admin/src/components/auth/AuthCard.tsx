import React from 'react';
import { FeatureItem } from '../common/FeatureItem';
import { ShieldIcon, BoltIcon, ChartIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  children
}) => {
  const { t } = useTranslationWithBackend();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 flex flex-col items-center justify-center p-4">
      {/* Auth Container */}
      <div className="w-full max-w-5xl overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col md:flex-row">
        
        {/* Brand Panel - Left Side */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 flex flex-col justify-between relative">
          {/* Abstract background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -left-40 -top-40 w-80 h-80 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-blue-300 blur-3xl"></div>
          </div>
          
          {/* Logo and Header */}
          <div className="relative z-10">
            <div className="mb-6 flex items-center">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-white text-2xl font-bold">Q</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{title || t('auth.admin_platform')}</h1>
            <p className="text-blue-100 text-lg mb-8">{t('auth.enter_credentials')}</p>
          </div>
          
          {/* Feature List */}
          <div className="space-y-6 relative z-10">
            <FeatureItem 
              icon={<ShieldIcon className="h-6 w-6 text-blue-100" />} 
              text={t('features.enterprise_security')} 
            />
            <FeatureItem 
              icon={<BoltIcon className="h-6 w-6 text-blue-100" />} 
              text={t('features.efficient_management')} 
            />
            <FeatureItem 
              icon={<ChartIcon className="h-6 w-6 text-blue-100" />} 
              text={t('features.data_analysis')} 
            />
          </div>
        </div>
        
        {/* Content - Right Side */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          {children}
          
          {/* Footer */}
          <footer className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
            {t('common.copyright', { year: currentYear })}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthCard; 